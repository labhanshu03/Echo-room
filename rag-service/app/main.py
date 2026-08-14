from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from bson import ObjectId

from app.db import chunks_collection, topics_collection
from app.services.embedding import embed_text
from app.services.topic_matching import cosine_similarity, match_or_create_topic
from app.services.llm import generate_summary
from app.services.segmentation import segment_chunk_entries
from app.auth import verify_internal_token

app = FastAPI()

CANDIDATE_TOPICS_LIMIT = 10
TOPIC_SIMILARITY_THRESHOLD = 0.5
TOP_CHUNKS = 5


@app.get("/health")
def health_check():
    return {"status": "ok"}


class ProcessChunkRequest(BaseModel):
    chunkId: str


@app.post("/process-chunk")
async def process_chunk(payload: ProcessChunkRequest):
    chunk = await chunks_collection.find_one({"_id": ObjectId(payload.chunkId)})

    if chunk["status"] == "closed":
        return {
            "chunkId": payload.chunkId,
            "topicId": str(chunk["topicId"]),
            "status": "already-closed"
        }

    sorted_entries = sorted(chunk["entries"], key=lambda e: e["timestamp"])
    segments = await segment_chunk_entries(sorted_entries)

    if len(segments) == 1:
        embedding_text = "\n".join(
            f"[{entry['senderId']}]: {entry['text']}" for entry in segments[0]
        )
        embedding = embed_text(embedding_text)

        chunk["embedding"] = embedding
        chunk["embeddingText"] = embedding_text

        topic_id = await match_or_create_topic(chunk)

        await chunks_collection.update_one(
            {"_id": ObjectId(payload.chunkId)},
            {"$set": {
                "embeddingText": embedding_text,
                "embedding": embedding,
                "status": "closed",
                "topicId": topic_id
            }}
        )

        return {"chunkId": payload.chunkId, "topicId": str(topic_id), "status": "closed"}

    split_chunk_ids = []
    for segment_entries in segments:
        embedding_text = "\n".join(
            f"[{entry['senderId']}]: {entry['text']}" for entry in segment_entries
        )
        embedding = embed_text(embedding_text)

        segment_chunk = {
            "entries": segment_entries,
            "embeddingText": embedding_text,
            "embedding": embedding,
            "participants": chunk["participants"],
            "conversationKey": chunk["conversationKey"],
        }

        topic_id = await match_or_create_topic(segment_chunk)
        segment_chunk["topicId"] = topic_id
        segment_chunk["status"] = "closed"

        insert_result = await chunks_collection.insert_one(segment_chunk)
        split_chunk_ids.append(insert_result.inserted_id)

    await chunks_collection.update_one(
        {"_id": ObjectId(payload.chunkId)},
        {"$set": {
            "status": "closed",
            "splitInto": split_chunk_ids
        }}
    )

    return {
        "chunkId": payload.chunkId,
        "status": "split",
        "splitInto": [str(cid) for cid in split_chunk_ids]
    }


class QueryRequest(BaseModel):
    question: str
    internalToken: str
    conversationKey: str


@app.post("/query")
async def query(payload: QueryRequest):
    try:
        user_id = verify_internal_token(payload.internalToken)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    authorized_chunk = await chunks_collection.find_one({
        "conversationKey": payload.conversationKey,
        "participants": ObjectId(user_id)
    })
    if authorized_chunk is None:
        raise HTTPException(status_code=403, detail="Not authorized for this conversation")

    query_embedding = embed_text(payload.question)

    pipeline = [
        {
            "$vectorSearch": {
                "index": "topics_vector_index",
                "path": "centroidEmbedding",
                "queryVector": query_embedding,
                "filter": {"conversationKey": payload.conversationKey},
                "numCandidates": 50,
                "limit": CANDIDATE_TOPICS_LIMIT
            }
        },
        {
            "$addFields": {
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    candidate_topics = await topics_collection.aggregate(pipeline).to_list(length=None)

    qualifying_topics = [t for t in candidate_topics if t["score"] >= TOPIC_SIMILARITY_THRESHOLD]

    if not qualifying_topics:
        return {"answer": "I don't have any relevant conversation history to answer that."}

    pooled_chunk_ids = {}
    for topic in qualifying_topics:
        for chunk_id in topic["chunkRefs"]:
            pooled_chunk_ids[str(chunk_id)] = chunk_id

    candidate_chunks = await chunks_collection.find(
        {"_id": {"$in": list(pooled_chunk_ids.values())}}
    ).to_list(length=None)

    scored_chunks = [
        (cosine_similarity(query_embedding, chunk["embedding"]), chunk)
        for chunk in candidate_chunks
    ]
    scored_chunks.sort(key=lambda pair: pair[0], reverse=True)
    top_chunks = [chunk for _, chunk in scored_chunks[:TOP_CHUNKS]]
    top_chunks.sort(key=lambda chunk: chunk["entries"][0]["timestamp"])

    contributing_topic_ids = {chunk["topicId"] for chunk in top_chunks}
    summary_sections = [
        f"Topic: {topic['summary']}"
        for topic in qualifying_topics
        if topic["_id"] in contributing_topic_ids
    ]
    summary_text = "\n\n".join(summary_sections)

    context_lines = []
    for chunk in top_chunks:
        sorted_entries = sorted(chunk["entries"], key=lambda e: e["timestamp"])
        for entry in sorted_entries:
            context_lines.append(f"[{entry['timestamp']}] [{entry['senderId']}]: {entry['text']}")
    context_text = "\n".join(context_lines)

    prompt = f"""You are answering a question about a real conversation history between the user and other people. Use ONLY the conversation excerpts provided below.

Rules:
- If later messages update, correct, or reverse something said earlier, treat the most recent one as the current/true state.
- If the conversation touches multiple related subjects, use whichever parts are actually relevant to the question.
- If the provided context does not contain enough information to answer, say so clearly instead of guessing.

--- Summaries (older history, may span multiple related topics) ---
{summary_text}

--- Relevant messages (chronological) ---
{context_text}

--- Question ---
{payload.question}
"""

    answer = await generate_summary(prompt)

    return {"answer": answer}
