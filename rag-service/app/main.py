from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from bson import ObjectId

from app.db import chunks_collection, topics_collection
from app.services.embedding import embed_text
from app.services.topic_matching import cosine_similarity, match_or_create_topic
from app.services.llm import generate_summary
from app.auth import verify_internal_token

app = FastAPI()

TOP_TOPICS = 3
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
    embedding_text = "\n".join(
        f"[{entry['senderId']}]: {entry['text']}" for entry in sorted_entries
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
                "limit": TOP_TOPICS
            }
        }
    ]
    matched_topics = await topics_collection.aggregate(pipeline).to_list(length=None)

    if not matched_topics:
        return {"answer": "I don't have any relevant conversation history to answer that."}

    top_topic = matched_topics[0]

    chunk_ids = top_topic["chunkRefs"]
    candidate_chunks = await chunks_collection.find({"_id": {"$in": chunk_ids}}).to_list(length=None)

    scored_chunks = [
        (cosine_similarity(query_embedding, chunk["embedding"]), chunk)
        for chunk in candidate_chunks
    ]
    scored_chunks.sort(key=lambda pair: pair[0], reverse=True)
    top_chunks = [chunk for _, chunk in scored_chunks[:TOP_CHUNKS]]
    top_chunks.sort(key=lambda chunk: chunk["entries"][0]["timestamp"])

    context_lines = []
    for chunk in top_chunks:
        sorted_entries = sorted(chunk["entries"], key=lambda e: e["timestamp"])
        for entry in sorted_entries:
            context_lines.append(f"[{entry['timestamp']}] [{entry['senderId']}]: {entry['text']}")
    context_text = "\n".join(context_lines)

    prompt = f"""You are answering a question about a real conversation history between the user and other people. Use ONLY the conversation excerpts provided below.

Rules:
- If later messages update, correct, or reverse something said earlier, treat the most recent one as the current/true state.
- If the provided context does not contain enough information to answer, say so clearly instead of guessing.

--- Summary (older history) ---
{top_topic['summary']}

--- Relevant messages (chronological) ---
{context_text}

--- Question ---
{payload.question}
"""

    answer = await generate_summary(prompt)

    return {"answer": answer}
