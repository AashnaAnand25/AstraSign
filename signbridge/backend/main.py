from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="SignBridge API", 
    version="1.0.0",
    description="API for SignBridge - Speech to ASL translation service"
)

# Environment variables
# GEMINI_API_KEY is required for sign recognition + grammar conversion.
# OPENAI_API_KEY is only required for Whisper transcription.
# ELEVENLABS_API_KEY is only required for text-to-speech.
required_vars = ["GEMINI_API_KEY"]
optional_vars = ["OPENAI_API_KEY", "ELEVENLABS_API_KEY", "SUPERMEMORY_API_KEY"]

missing_required = [var for var in required_vars if not os.getenv(var)]
missing_optional = [var for var in optional_vars if not os.getenv(var)]

if missing_required:
    print(f"Warning: Missing required environment variables: {missing_required}")
    print("Some endpoints will return errors until these are set.")

if missing_optional:
    print(f"Note: Optional environment variables not set: {missing_optional}")

# CORS — allows your Lovable frontend + Android app to connect
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
if "*" in allowed_origins:
    print("Warning: CORS is set to allow all origins. Restrict this in production.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes with error handling
try:
    from routes import transcribe, signs, grammar, speak, memory, recognize

    # Register all routes
    app.include_router(transcribe.router, prefix="/api/transcribe", tags=["Speech"])
    app.include_router(signs.router,      prefix="/api/signs",      tags=["Signs"])
    app.include_router(grammar.router,    prefix="/api/grammar",    tags=["Grammar"])
    app.include_router(speak.router,      prefix="/api/speak",      tags=["Voice"])
    app.include_router(memory.router,     prefix="/api/memory",     tags=["Memory"])
    app.include_router(recognize.router,  prefix="/api/recognize",  tags=["Recognition"])
except ImportError as e:
    print(f"Error importing routes: {e}")
    print("Make sure all route files exist in the routes/ directory")

@app.get("/")
def root():
    return {
        "status": "SignBridge API running", 
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "api": "/api"
        }
    }

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
