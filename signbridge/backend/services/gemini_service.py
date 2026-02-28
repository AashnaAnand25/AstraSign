"""
Direct Gemini REST client — no SDK, no OpenAI shim, just httpx.
Uses the v1 generateContent endpoint (stable) with fallback to v1beta.
"""
import os
import httpx

_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
_MODEL = "gemini-2.0-flash"
_URL_V1 = f"https://generativelanguage.googleapis.com/v1/models/{_MODEL}:generateContent"
_URL_BETA = f"https://generativelanguage.googleapis.com/v1beta/models/{_MODEL}:generateContent"


async def chat(system: str, user: str, max_tokens: int = 100) -> str:
    if not _API_KEY:
        raise ValueError("GEMINI_API_KEY not set in .env")

    # Gemini API format: combine system + user in contents array
    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": f"System instruction: {system}\n\nUser message: {user}"}]}
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": max_tokens,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        urls = [_URL_V1, _URL_BETA]
        last_error = None
        for url in urls:
            try:
                resp = await client.post(url, params={"key": _API_KEY}, json=payload)
                resp.raise_for_status()
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
            except httpx.HTTPStatusError as e:
                last_error = e
                if e.response.status_code == 404:
                    continue
                elif e.response.status_code == 429:
                    raise Exception(f"Gemini API rate limit exceeded. Please wait a moment and try again.")
                raise
        raise Exception(f"Gemini API error: {last_error}")
