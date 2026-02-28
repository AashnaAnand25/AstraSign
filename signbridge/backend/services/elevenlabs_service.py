import httpx, os

ELEVENLABS_KEY = os.getenv("ELEVENLABS_API_KEY")
BASE_URL = "https://api.elevenlabs.io/v1"

if not ELEVENLABS_KEY:
    raise ValueError("ELEVENLABS_API_KEY environment variable is not set")

async def text_to_speech(text: str, voice_id: str) -> bytes:
    """Call ElevenLabs and return audio bytes"""
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")
    
    if len(text) > 500:
        raise ValueError("Text too long (max 500 characters)")
    
    if not voice_id:
        raise ValueError("Voice ID cannot be empty")
    
    headers = {"xi-api-key": ELEVENLABS_KEY}
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{BASE_URL}/text-to-speech/{voice_id}",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return response.content
    except httpx.HTTPStatusError as e:
        raise Exception(f"ElevenLabs API error: {e.response.status_code} - {e.response.text}")
    except httpx.TimeoutException:
        raise Exception("ElevenLabs API request timed out")
    except Exception as e:
        raise Exception(f"Text-to-speech failed: {str(e)}")
