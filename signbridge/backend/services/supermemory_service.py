import httpx, os, json

SUPERMEMORY_KEY = os.getenv("SUPERMEMORY_API_KEY")
BASE_URL = "https://api.supermemory.ai/v3"

if not SUPERMEMORY_KEY:
    # Don't raise error for Supermemory as it's optional
    pass

async def save_vocab(user_id: str, words: list[str]):
    """Save vocabulary to Supermemory after session"""
    if not SUPERMEMORY_KEY:
        print("Warning: SUPERMEMORY_API_KEY not set, skipping vocabulary save")
        return
    
    if not user_id:
        raise ValueError("User ID cannot be empty")
    
    if not words:
        raise ValueError("Words list cannot be empty")
    
    # Limit to reasonable number of words
    if len(words) > 100:
        words = words[:100]
    
    headers = {"Authorization": f"Bearer {SUPERMEMORY_KEY}"}
    payload = {
        "content": f"Frequent vocabulary: {', '.join(words)}",
        "userId": user_id,
        "metadata": {"type": "vocabulary"}
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{BASE_URL}/memories",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        print(f"Warning: Supermemory API error: {e.response.status_code}")
    except Exception as e:
        print(f"Warning: Failed to save vocabulary: {str(e)}")

async def get_vocab(user_id: str) -> list[str]:
    """Retrieve user's saved vocabulary"""
    if not SUPERMEMORY_KEY:
        print("Warning: SUPERMEMORY_API_KEY not set, returning empty vocabulary")
        return []
    
    if not user_id:
        raise ValueError("User ID cannot be empty")
    
    headers = {"Authorization": f"Bearer {SUPERMEMORY_KEY}"}
    payload = {"q": "frequent vocabulary", "userId": user_id, "limit": 5}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{BASE_URL}/search",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            
            words = []
            for result in data.get("results", []):
                content = result.get("content", "")
                if "Frequent vocabulary:" in content:
                    vocab = content.replace("Frequent vocabulary:", "").strip()
                    words.extend([w.strip() for w in vocab.split(",") if w.strip()])
            
            return list(set(words))  # deduplicate
    except httpx.HTTPStatusError as e:
        print(f"Warning: Supermemory API error: {e.response.status_code}")
        return []
    except Exception as e:
        print(f"Warning: Failed to load vocabulary: {str(e)}")
        return []
