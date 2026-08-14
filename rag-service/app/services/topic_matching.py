from datetime import datetime, timezone
import numpy as np
from app.db import topics_collection
from app.services.llm import generate_summary

SIMILARITY_THRESHOLD = 0.75


def cosine_similarity(vec_a, vec_b):
    a = np.array(vec_a)
    b = np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


async def match_or_create_topic(chunk):
    participants = chunk["participants"]

    candidates = await topics_collection.find({
        "participants": {"$all": participants, "$size": len(participants)}
    }).to_list(length=None)

    best_topic = None
    best_score = -1

    for topic in candidates:
        score = cosine_similarity(chunk["embedding"], topic["centroidEmbedding"])
        if score > best_score:
            best_score = score
            best_topic = topic

    if best_topic is not None and best_score >= SIMILARITY_THRESHOLD:
        await merge_into_topic(best_topic, chunk)
        return best_topic["_id"]
    else:
        return await create_topic(chunk)


async def merge_into_topic(topic, chunk):
    n = len(topic["chunkRefs"])
    old_centroid = np.array(topic["centroidEmbedding"])
    new_embedding = np.array(chunk["embedding"])
    new_centroid = ((old_centroid * n) + new_embedding) / (n + 1)

    summary_prompt = (
        f"Current summary: {topic['summary']}\n\n"
        f"New message just added to this conversation:\n{chunk['embeddingText']}\n\n"
        f"Update the summary to incorporate this new message, noting any changes or new decisions."
    )
    new_summary = await generate_summary(summary_prompt)

    await topics_collection.update_one(
        {"_id": topic["_id"]},
        {
            "$set": {
                "centroidEmbedding": new_centroid.tolist(),
                "summary": new_summary,
                "lastUpdated": datetime.now(timezone.utc)
            },
            "$push": {"chunkRefs": chunk["_id"]}
        }
    )


async def create_topic(chunk):
    summary_prompt = f"Summarize what this conversation excerpt is about, in one or two sentences:\n{chunk['embeddingText']}"
    summary = await generate_summary(summary_prompt)

    now = datetime.now(timezone.utc)
    result = await topics_collection.insert_one({
        "summary": summary,
        "centroidEmbedding": chunk["embedding"],
        "participants": chunk["participants"],
        "conversationKey": chunk["conversationKey"],
        "chunkRefs": [chunk["_id"]],
        "lastUpdated": now,
        "createdAt": now
    })
    return result.inserted_id
