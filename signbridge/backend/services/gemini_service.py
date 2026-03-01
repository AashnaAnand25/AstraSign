"""
Direct Gemini REST client — no SDK, no OpenAI shim, just httpx.
Uses gemini-2.0-flash-lite via the v1 generateContent endpoint.
"""
import os
import httpx

_API_KEY = os.getenv("GEMINI_API_KEY", "")
_MODEL   = "gemini-2.0-flash-lite"
_URL     = f"https://generativelanguage.googleapis.com/v1/models/{_MODEL}:generateContent"


async def chat(system: str, user: str, max_tokens: int = 100) -> str:
    if not _API_KEY:
        raise ValueError("GEMINI_API_KEY not set in .env")

    payload = {
        "contents": [{"role": "user", "parts": [{"text": f"{system}\n\n{user}"}]}],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": max_tokens,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(_URL, params={"key": _API_KEY}, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
