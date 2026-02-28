from openai import AsyncOpenAI
import os, io

# Check if API key is available
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

client = AsyncOpenAI(api_key=api_key)

async def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    """Send audio to Whisper, get back transcript"""
    if not audio_bytes:
        raise ValueError("Audio bytes cannot be empty")
    
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = filename or "audio.m4a"
    
    try:
        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="text",
            language="en"
        )
        return response.strip()
    except Exception as e:
        raise Exception(f"Transcription failed: {str(e)}")

async def convert_to_asl_grammar(text: str) -> list[str]:
    """Reorder English to ASL grammar using GPT-4o"""
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """Convert English to ASL grammar order.
Rules:
- Topic-Comment structure (put topic first)  
- Subject-Object-Verb order
- Drop: a, an, the, is, are, am, be, to, of
- Keep: nouns, verbs, adjectives, pronouns, important adverbs
- Return ONLY the words in order, ALL CAPS, space-separated
- Nothing else — no punctuation, no explanation

Example: "I am going to the store" → "STORE I GO"
Example: "The cat is hungry" → "CAT HUNGRY"
Example: "Can you help me" → "YOU HELP ME"
"""
                },
                {"role": "user", "content": text}
            ],
            temperature=0.1,
            max_tokens=100
        )
        content = response.choices[0].message.content
        if not content:
            return []
        words = content.strip().split()
        return [w.upper() for w in words]
    except Exception as e:
        raise Exception(f"Grammar conversion failed: {str(e)}")
