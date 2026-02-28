from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supermemory_service import save_vocab, get_vocab

router = APIRouter()

class SaveMemoryRequest(BaseModel):
    user_id: str
    words: list[str]

class GetMemoryRequest(BaseModel):
    user_id: str

@router.post("/save")
async def save_memory(req: SaveMemoryRequest):
    """Save user's frequent vocabulary after a session"""
    if not req.user_id or not req.user_id.strip():
        raise HTTPException(400, detail="User ID cannot be empty")
    
    if not req.words:
        raise HTTPException(400, detail="Words list cannot be empty")
    
    # Limit number of words
    if len(req.words) > 100:
        raise HTTPException(400, detail="Too many words (max 100)")
    
    # Filter out empty words
    words = [w.strip() for w in req.words if w and w.strip()]
    if not words:
        raise HTTPException(400, detail="No valid words provided")
    
    try:
        await save_vocab(req.user_id, words)
        return {"success": True, "saved": len(words)}
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    except Exception as e:
        raise HTTPException(500, detail=f"Failed to save memory: {str(e)}")

@router.post("/load")
async def load_memory(req: GetMemoryRequest):
    """Load user's frequent words on app start"""
    if not req.user_id or not req.user_id.strip():
        raise HTTPException(400, detail="User ID cannot be empty")
    
    try:
        words = await get_vocab(req.user_id)
        return {"success": True, "words": words, "count": len(words)}
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    except Exception as e:
        raise HTTPException(500, detail=f"Failed to load memory: {str(e)}")
