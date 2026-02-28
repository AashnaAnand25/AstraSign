from fastapi import APIRouter, UploadFile, File, HTTPException
from services.openai_service import transcribe_audio

router = APIRouter()

@router.post("/")
async def transcribe(file: UploadFile = File(...)):
    """
    Receives audio file from Android app.
    Returns transcribed text.
    """
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(400, detail="File must be audio")
    
    # Check file size (max 25MB)
    if hasattr(file, 'size') and file.size and file.size > 25 * 1024 * 1024:
        raise HTTPException(400, detail="File too large (max 25MB)")
    
    try:
        audio_bytes = await file.read()
        
        if len(audio_bytes) == 0:
            raise HTTPException(400, detail="Audio file is empty")
        
        # Minimum audio length check (at least 0.1 seconds of audio)
        if len(audio_bytes) < 1000:
            raise HTTPException(400, detail="Audio file too short")
        
        transcript = await transcribe_audio(audio_bytes, file.filename)
        
        if not transcript:
            return {
                "success": True,
                "transcript": "",
                "words": [],
                "warning": "No speech detected in audio"
            }
        
        return {
            "success": True,
            "transcript": transcript,
            "words": transcript.upper().split()
        }
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    except Exception as e:
        raise HTTPException(500, detail=f"Transcription failed: {str(e)}")
