from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json, os

router = APIRouter()

# Load sign database on startup
SIGNS_DB = {}
try:
    # Try to load from the current working directory
    with open("data/signs_index.json") as f:
        SIGNS_DB = json.load(f)
except FileNotFoundError:
    # Fallback to absolute path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, "..", "data", "signs_index.json")
    with open(data_path) as f:
        SIGNS_DB = json.load(f)
except Exception as e:
    print(f"Warning: Could not load signs database: {e}")
    SIGNS_DB = {}

class SignRequest(BaseModel):
    words: list[str]

@router.get("/{word}")
def get_sign(word: str):
    """Look up a single sign by word"""
    if not word or not word.strip():
        raise HTTPException(400, detail="Word cannot be empty")
    
    word = word.upper().strip()
    if word in SIGNS_DB:
        return {"found": True, "word": word, **SIGNS_DB[word]}
    
    # Fingerspell fallback
    return {
        "found": False,
        "word": word,
        "type": "fingerspell",
        "letters": list(word)
    }

@router.post("/batch")
def get_signs_batch(req: SignRequest):
    """Look up multiple signs at once (used for pre-loading)"""
    if not req.words:
        raise HTTPException(400, detail="Words list cannot be empty")
    
    # Limit number of words to prevent abuse
    if len(req.words) > 50:
        raise HTTPException(400, detail="Too many words (max 50)")
    
    results = []
    for word in req.words:
        if not word or not word.strip():
            continue
            
        word = word.upper().strip()
        if word in SIGNS_DB:
            results.append({"word": word, "found": True, **SIGNS_DB[word]})
        else:
            results.append({"word": word, "found": False, "type": "fingerspell", "letters": list(word)})
    
    found_count = sum(1 for r in results if r["found"])
    return {"results": results, "found": found_count, "total": len(results)}
