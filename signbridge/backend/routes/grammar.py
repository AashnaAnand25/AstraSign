from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.openai_service import convert_to_asl_grammar

router = APIRouter()

class GrammarRequest(BaseModel):
    text: str

@router.post("/")
async def reorder_grammar(req: GrammarRequest):
    """
    Converts English sentence to ASL grammatical order.
    English: "I am going to the store"
    ASL:     "STORE I GO"
    """
    if not req.text or not req.text.strip():
        raise HTTPException(400, detail="Text cannot be empty")
    
    if len(req.text) > 500:
        raise HTTPException(400, detail="Text too long (max 500 characters)")
    
    try:
        asl_words = await convert_to_asl_grammar(req.text)
        return {
            "success": True,
            "original": req.text,
            "asl_ordered": asl_words,
            "word_count": len(asl_words)
        }
    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    except Exception as e:
        raise HTTPException(500, detail=f"Grammar conversion failed: {str(e)}")
