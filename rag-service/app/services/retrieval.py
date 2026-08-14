from app.db import chunks_collection, topics_collection
from app.services.embedding import embed_text
from app.services.topic_matching import cosine_similarity

# Calibrated against eval/test_cases.json — see eval/run_eval.py results.
# Local all-MiniLM-L6-v2 embeddings on short casual chat text show weak
# separation between genuinely relevant and merely similarly-styled topics;
# 0.6 was chosen as the best balance found, not a value that passes 100%
# of test cases. Known tradeoff: some weak-scoring true matches may be
# excluded alongside irrelevant ones. See rag-architecture.html limitations.
CANDIDATE_TOPICS_LIMIT = 10
TOPIC_SIMILARITY_THRESHOLD = 0.6
TOP_CHUNKS = 5


async def retrieve_relevant_chunks(conversation_key: str, question: str):
    """
    Returns (qualifying_topics, top_chunks) for a question scoped to one
    conversation. qualifying_topics is every topic that cleared the
    relevance threshold; top_chunks is the final ranked, chronologically
    ordered set of chunks pooled across all of them.
    """
    query_embedding = embed_text(question)

    pipeline = [
        {
            "$vectorSearch": {
                "index": "topics_vector_index",
                "path": "centroidEmbedding",
                "queryVector": query_embedding,
                "filter": {"conversationKey": conversation_key},
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
        return [], []

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

    return qualifying_topics, top_chunks


def build_prompt(qualifying_topics, top_chunks, question: str) -> str:
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

    return f"""You are answering a question about a real conversation history between the user and other people. Use ONLY the conversation excerpts provided below.

Rules:
- If later messages update, correct, or reverse something said earlier, treat the most recent one as the current/true state.
- If the conversation touches multiple related subjects, use whichever parts are actually relevant to the question.
- If the provided context does not contain enough information to answer, say so clearly instead of guessing.

--- Summaries (older history, may span multiple related topics) ---
{summary_text}

--- Relevant messages (chronological) ---
{context_text}

--- Question ---
{question}
"""
