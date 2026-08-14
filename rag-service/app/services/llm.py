import httpx
from app.config import OLLAMA_BASE_URL, OLLAMA_MODEL


async def generate_summary(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
        )
        response.raise_for_status()
        data = response.json()
        return data["response"].strip()
