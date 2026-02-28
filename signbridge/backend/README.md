# SignBridge Backend

FastAPI backend for SignBridge - Speech to ASL translation service.

## Features

- Speech-to-text transcription (OpenAI Whisper)
- English to ASL grammar conversion (GPT-4o)
- Sign language lookup database (300+ signs)
- Text-to-speech synthesis (ElevenLabs)
- Vocabulary memory storage (Supermemory)

## Setup

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables in `.env`:
```
WHISPERAI_KEY=your-openai-key
OPENAI_API_KEY=your-openai-key  # legacy fallback (still accepted)
ELEVENLABS_API_KEY=your-elevenlabs-key
SUPERMEMORY_API_KEY=your-supermemory-key
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,https://your-app-url.com
```

4. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Endpoints

- `POST /api/transcribe/` - Audio transcription
- `POST /api/grammar/` - English to ASL grammar
- `GET /api/signs/{word}` - Single sign lookup
- `POST /api/signs/batch` - Multiple signs lookup
- `POST /api/speak/` - Text to speech
- `POST /api/memory/save` - Save vocabulary
- `POST /api/memory/load` - Load vocabulary

## Deployment

The app includes a `Procfile` for easy deployment to platforms like Railway, Heroku, etc.
