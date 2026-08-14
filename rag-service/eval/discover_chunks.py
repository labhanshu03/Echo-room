import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from bson import ObjectId
from app.db import chunks_collection


async def main():
    topic_id = input("Paste a topicId to inspect: ").strip()

    chunks = await chunks_collection.find({"topicId": ObjectId(topic_id)}).to_list(length=None)

    for chunk in chunks:
        print(f"\n--- chunk {chunk['_id']} ---")
        for entry in sorted(chunk["entries"], key=lambda e: e["timestamp"]):
            print(f"[{entry['timestamp']}] [{entry['senderId']}]: {entry['text']}")


if __name__ == "__main__":
    asyncio.run(main())
