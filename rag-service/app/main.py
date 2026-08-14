from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from bson import ObjectId

from app.db import chunks_collection
from app.services.embedding import embed_text
from app.services.topic_matching import match_or_create_topic
from app.services.llm import generate_summary
from app.services.segmentation import segment_chunk_entries
from app.services.retrieval import retrieve_relevant_chunks, build_prompt
from app.auth import verify_internal_token

app = FastAPI()


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

        insert_result = await chunks_collection.insert_one({
            "entries": segment_entries,
            "embeddingText": embedding_text,
            "embedding": embedding,
            "participants": chunk["participants"],
            "conversationKey": chunk["conversationKey"],
            "status": "closed",
            "topicId": None
        })
        segment_chunk_id = insert_result.inserted_id

        segment_chunk = {
            "_id": segment_chunk_id,
            "entries": segment_entries,
            "embeddingText": embedding_text,
            "embedding": embedding,
            "participants": chunk["participants"],
            "conversationKey": chunk["conversationKey"],
        }

        topic_id = await match_or_create_topic(segment_chunk)

        await chunks_collection.update_one(
            {"_id": segment_chunk_id},
            {"$set": {"topicId": topic_id}}
        )

        split_chunk_ids.append(segment_chunk_id)

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

    qualifying_topics, top_chunks = await retrieve_relevant_chunks(
        payload.conversationKey, payload.question
    )

    if not qualifying_topics:
        return {"answer": "I don't have any relevant conversation history to answer that."}

    prompt = build_prompt(qualifying_topics, top_chunks, payload.question)
    answer = await generate_summary(prompt)

    return {"answer": answer}
