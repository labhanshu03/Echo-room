from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI

client = AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()

chunks_collection = db["chunks"]
topics_collection = db["topics"]
