from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.elevenlabs_service import text_to_speech
import io

router = APIRouter()

class SpeakRequest(BaseModel):
    text: str
    voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Default: Rachel

@router.post("/")
async def speak(req: SpeakRequest):
    """
    Converts text to speech via ElevenLabs.
    Returns audio stream directly — Android plays it immediately.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(400, detail="Text cannot be empty")
    
    if len(req.text) > 500:
        raise HTTPException(400, detail="Text too long (max 500 chars)")
    
    if not req.voice_id:
        raise HTTPException(400, detail="Voice ID cannot be empty")
    
    try:
        audio_bytes = await text_to_speech(req.text, req.voice_id)
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    except Exception as e:
        raise HTTPException(500, detail=f"Text-to-speech failed: {str(e)}")
