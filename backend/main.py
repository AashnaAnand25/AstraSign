from fastapi import FastAPI, HTTPException, Header, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import asyncio
from functools import lru_cache
import httpx
from datetime import datetime

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Configuration
class Settings(BaseModel):
    API_SECRET: str = os.getenv("INTERNAL_API_SECRET", "your-secret-key-here")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()

# Debug: Print settings to verify they're loaded
print(f"API_SECRET: {settings.API_SECRET}")
print(f"ENVIRONMENT: {settings.ENVIRONMENT}")

# Initialize FastAPI
app = FastAPI(
    title="NeuroSign API",
    description="Production-grade ASL Translation Backend",
    version="1.0.0"
)

# CORS for Android
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Android app domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis client for caching (optional)
redis_client = None
redis_available = False

# Security dependency
async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.API_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return x_api_key

# Request models
class TranscribeRequest(BaseModel):
    audio_data: str  # base64 encoded audio
    format: str = "webm"
    
class GrammarRequest(BaseModel):
    text: str
    
class SignRequest(BaseModel):
    word: str
    
class BatchSignRequest(BaseModel):
    words: List[str]
    
class SpeakRequest(BaseModel):
    text: str
    voice_id: str = "rachel"

class MemorySaveRequest(BaseModel):
    user_id: str
    phrase: str
    translation: str
    
class MemoryLoadRequest(BaseModel):
    user_id: str

# Load ASL signs database
with open("asl_signs.json", "r") as f:
    ASL_SIGNS_DB = json.load(f)

@lru_cache(maxsize=1000)
def cached_asl_conversion(text: str) -> dict:
    """Cache ASL grammar conversions"""
    # Simple ASL grammar conversion (can be enhanced with GPT-4)
    words = text.upper().split()
    
    # Basic ASL grammar rules
    asl_grammar = []
    for word in words:
        if word in ["WHAT", "WHERE", "WHEN", "WHY", "HOW"]:
            asl_grammar.append(f"{word} YOU")  # Question words
        elif word in ["I", "YOU", "HE", "SHE", "WE", "THEY"]:
            asl_grammar.append(word)  # Pronouns stay
        elif word in ["MY", "YOUR", "HIS", "HER", "OUR", "THEIR"]:
            asl_grammar.append(f"{word.replace('MY', 'I').replace('YOUR', 'YOU')} {word[-2:]}")  # Possessives
        else:
            asl_grammar.append(word)
    
    return {
        "original": text,
        "asl_grammar": " ".join(asl_grammar),
        "words": asl_grammar
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "redis_connected": redis_available,
        "environment": settings.ENVIRONMENT
    }

# Audio transcription with Whisper
@app.post("/api/transcribe", dependencies=[Depends(verify_api_key)])
async def transcribe_audio(request: TranscribeRequest):
    try:
        # For demo, return simulated transcription
        # In production, decode base64 audio and use OpenAI Whisper
        
        # Demo response
        demo_transcripts = [
            "HELLO WORLD",
            "HOW ARE YOU",
            "MY NAME IS NEUROSIGN",
            "NICE TO MEET YOU",
            "THANK YOU",
            "PLEASE HELP ME",
            "SORRY",
            "YES",
            "NO",
            "GOOD MORNING",
            "SEE YOU LATER"
        ]
        
        import random
        transcript = random.choice(demo_transcripts)
        
        return {
            "transcript": transcript,
            "confidence": 0.95,
            "processing_time": 0.5
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

# ASL grammar conversion
@app.post("/api/grammar", dependencies=[Depends(verify_api_key)])
async def convert_to_asl_grammar(request: GrammarRequest):
    try:
        result = cached_asl_conversion(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grammar conversion failed: {str(e)}")

# Single sign lookup
@app.get("/api/signs/{word}", dependencies=[Depends(verify_api_key)])
async def get_sign(word: str):
    try:
        word = word.upper()
        if word in ASL_SIGNS_DB:
            return {
                "word": word,
                "sign": ASL_SIGNS_DB[word],
                "found": True
            }
        else:
            return {
                "word": word,
                "sign": None,
                "found": False,
                "suggestions": [w for w in ASL_SIGNS_DB.keys() if w.startswith(word[:3])][:5]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sign lookup failed: {str(e)}")

# Batch sign lookup
@app.post("/api/signs/batch", dependencies=[Depends(verify_api_key)])
async def get_batch_signs(request: BatchSignRequest):
    try:
        results = {}
        for word in request.words:
            word_upper = word.upper()
            if word_upper in ASL_SIGNS_DB:
                results[word_upper] = {
                    "sign": ASL_SIGNS_DB[word_upper],
                    "found": True
                }
            else:
                results[word_upper] = {
                    "sign": None,
                    "found": False
                }
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch lookup failed: {str(e)}")

# Text to speech with ElevenLabs
@app.post("/api/speak", dependencies=[Depends(verify_api_key)])
async def text_to_speech(request: SpeakRequest):
    try:
        import elevenlabs
        client = elevenlabs.ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
        
        audio = client.generate(
            text=request.text,
            voice=request.voice_id,
            model="eleven_monolingual_v1"
        )
        
        # Convert to base64 for Android
        import base64
        audio_b64 = base64.b64encode(audio).decode()
        
        return {
            "audio": audio_b64,
            "voice_id": request.voice_id,
            "text": request.text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

# Save user memory
@app.post("/api/memory/save", dependencies=[Depends(verify_api_key)])
async def save_memory(request: MemorySaveRequest):
    try:
        if redis_client:
            memory_key = f"memory:{request.user_id}"
            memory_data = {
                "phrase": request.phrase,
                "translation": request.translation,
                "timestamp": datetime.now().isoformat()
            }
            
            # Get existing memories
            existing = redis_client.get(memory_key)
            memories = json.loads(existing) if existing else []
            memories.append(memory_data)
            
            # Keep only last 100 memories
            memories = memories[-100:]
            
            redis_client.set(memory_key, json.dumps(memories), ex=86400)  # 24 hours expiry
            return {"status": "saved", "count": len(memories)}
        else:
            return {"status": "error", "message": "Redis not available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory save failed: {str(e)}")

# Load user memory
@app.post("/api/memory/load", dependencies=[Depends(verify_api_key)])
async def load_memory(request: MemoryLoadRequest):
    try:
        if redis_client:
            memory_key = f"memory:{request.user_id}"
            memories = redis_client.get(memory_key)
            
            if memories:
                return {"memories": json.loads(memories)}
            else:
                return {"memories": []}
        else:
            return {"memories": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory load failed: {str(e)}")

# WebSocket for streaming transcription (OPTIONAL B - IMPRESSIVE)
@app.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Receive audio chunk
            audio_chunk = await websocket.receive_bytes()
            
            # Process chunk (simplified - in production, you'd buffer and process)
            import base64
            audio_b64 = base64.b64encode(audio_chunk).decode()
            
            # Send back partial result (mock for demo)
            await websocket.send_text(json.dumps({
                "type": "partial",
                "text": "Processing...",
                "confidence": 0.3
            }))
            
            await asyncio.sleep(0.1)  # Prevent overwhelming
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": str(e)
        }))

# Production startup
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
