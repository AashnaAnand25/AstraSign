"""
Direct Gemini REST client — no SDK, no OpenAI shim, just httpx.
Uses the v1 generateContent endpoint (stable) with fallback to v1beta.
Includes exponential backoff retry for rate limits.
"""
import os
import httpx
import asyncio

import random

_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
_MODEL = "gemini-2.0-flash"
_URL_V1 = f"https://generativelanguage.googleapis.com/v1/models/{_MODEL}:generateContent"
_URL_BETA = f"https://generativelanguage.googleapis.com/v1beta/models/{_MODEL}:generateContent"


async def chat(system: str, user: str, max_tokens: int = 100, retries: int = 5) -> str:
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
        
        for attempt in range(retries):
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
                        continue  # Try next URL
                    elif e.response.status_code == 429:
                        if attempt < retries - 1:
                            # Longer exponential backoff for Gemini free tier: 2s, 4s, 8s, 16s, 32s
                            wait_time = min((2 ** (attempt + 1)) + random.uniform(0, 1), 60)
                            await asyncio.sleep(wait_time)
                            break  # Retry from outer loop
                        raise Exception(f"Gemini API rate limit exceeded. Please wait ~60 seconds and try again.")
                    raise
            else:
                # Both URLs failed, retry with backoff
                if attempt < retries - 1:
                    wait_time = min((2 ** (attempt + 1)) + random.uniform(0, 1), 60)
                    await asyncio.sleep(wait_time)
                    continue
        
        raise Exception(f"Gemini API error: {last_error}")
