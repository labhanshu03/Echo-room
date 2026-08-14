import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI =os.environ["MONGO_URI"]
INTERNAL_JWT_SECRET=os.environ["INTERNAL_JWT_SECRET"]

OLLAMA_BASE_URL = os.environ["OLLAMA_BASE_URL"]
OLLAMA_MODEL = os.environ["OLLAMA_MODEL"]


