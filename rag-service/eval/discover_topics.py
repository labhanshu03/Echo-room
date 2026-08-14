import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db import topics_collection


async def main():
    topics = await topics_collection.find({}).to_list(length=None)

    if not topics:
        print("No topics found yet — send some messages and let a chunk close first.")
        return

    by_conversation = {}
    for topic in topics:
        key = topic.get("conversationKey", "unknown")
        by_conversation.setdefault(key, []).append(topic)

    for conversation_key, conv_topics in by_conversation.items():
        print(f"\n=== conversationKey: {conversation_key} ===")
        for topic in conv_topics:
            print(f"  topicId: {topic['_id']}")
            print(f"  summary: {topic['summary']}")
            print(f"  chunkRefs: {len(topic['chunkRefs'])} chunk(s)")
            print("")


if __name__ == "__main__":
    asyncio.run(main())
