"""
Direct Gemini REST client — no SDK, no OpenAI shim, just httpx.
Uses the v1beta generateContent endpoint which is stable for all accounts.
"""
import os
import httpx

_API_KEY = os.getenv("GEMINI_API_KEY", "")
_MODEL   = "gemini-1.5-flash"
_URL     = f"https://generativelanguage.googleapis.com/v1beta/models/{_MODEL}:generateContent"


async def chat(system: str, user: str, max_tokens: int = 100) -> str:
    if not _API_KEY:
        raise ValueError("GEMINI_API_KEY not set in .env")

    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": user}]}],
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
