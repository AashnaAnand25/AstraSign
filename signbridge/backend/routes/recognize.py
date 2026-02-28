from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.openai_service import recognize_sign_from_landmarks, gloss_to_english

router = APIRouter()


# ── Request / response models ─────────────────────────────────────────────────

class SignRecognizeRequest(BaseModel):
    # N frames (typically 8 sampled from a 30-frame window).
    # Each frame: 21 landmarks, each landmark: [x, y, z] floats.
    frames: list[list[list[float]]]
    handedness: str = "Right"   # "Left" | "Right"


class GlossToEnglishRequest(BaseModel):
    words: list[str]            # e.g. ["HELLO", "NAME", "YOU"]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/sign")
async def recognize_sign(req: SignRecognizeRequest):
    """
    Identify an ASL sign from a MediaPipe landmark sequence.

    Accepts 5–90 frames of hand-landmark data (21 points × [x,y,z] each).
    Returns the recognised word (UPPERCASE) and a confidence score.
    Falls back to UNKNOWN when the sign cannot be identified.
    """
    if not req.frames or len(req.frames) < 5:
        raise HTTPException(400, detail="Need at least 5 frames")

    if len(req.frames) > 90:
        raise HTTPException(400, detail="Too many frames (max 90)")

    # Validate inner shape: each frame must have 21 landmarks × 3 coords
    for i, frame in enumerate(req.frames):
        if len(frame) != 21:
            raise HTTPException(400, detail=f"Frame {i} must have 21 landmarks")
        for j, lm in enumerate(frame):
            if len(lm) != 3:
                raise HTTPException(400, detail=f"Landmark {j} in frame {i} must have 3 coords")

    if req.handedness not in ("Left", "Right"):
        raise HTTPException(400, detail="handedness must be 'Left' or 'Right'")

    try:
        word, confidence = await recognize_sign_from_landmarks(
            req.frames, req.handedness
        )
        return {"word": word, "confidence": confidence}
    except Exception as e:
        raise HTTPException(500, detail=str(e))


@router.post("/gloss-to-english")
async def convert_gloss(req: GlossToEnglishRequest):
    """
    Convert a sequence of ASL gloss words into a natural English sentence.

    Uses GPT-4o-mini to reconstruct grammar, articles, and natural phrasing
    from raw ASL gloss labels so the result is suitable for ElevenLabs TTS.
    """
    if not req.words:
        raise HTTPException(400, detail="words list cannot be empty")

    if len(req.words) > 50:
        raise HTTPException(400, detail="Too many words (max 50)")

    try:
        text = await gloss_to_english(req.words)
        return {"text": text, "gloss": req.words}
    except Exception as e:
        raise HTTPException(500, detail=str(e))
