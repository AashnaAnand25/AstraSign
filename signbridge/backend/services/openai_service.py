from openai import AsyncOpenAI
import os, io, re, math

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


# ─── ASL Sign Recognition ────────────────────────────────────────────────────

# MediaPipe landmark indices (21 points per hand)
_WRIST       = 0
_THUMB_CMC, _THUMB_MCP, _THUMB_IP, _THUMB_TIP         = 1, 2, 3, 4
_INDEX_MCP,  _INDEX_PIP,  _INDEX_DIP,  _INDEX_TIP      = 5, 6, 7, 8
_MIDDLE_MCP, _MIDDLE_PIP, _MIDDLE_DIP, _MIDDLE_TIP     = 9, 10, 11, 12
_RING_MCP,   _RING_PIP,   _RING_DIP,   _RING_TIP       = 13, 14, 15, 16
_PINKY_MCP,  _PINKY_PIP,  _PINKY_DIP,  _PINKY_TIP      = 17, 18, 19, 20


def _dist2d(a: list, b: list) -> float:
    return math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)


def _build_sign_description(frames: list[list[list[float]]], handedness: str) -> str:
    """
    Convert a sequence of MediaPipe landmark frames into a human-readable
    description suitable for GPT-4o sign identification.

    Each frame is a list of 21 landmarks, each landmark is [x, y, z]
    where (0,0) is top-left, (1,1) is bottom-right, z is depth.
    """
    n = len(frames)
    # Use the middle frame for static hand-shape analysis
    mid = frames[n // 2]

    # ── Finger extension heuristic ──────────────────────────────────────────
    # A finger is "extended" when its tip is higher in the image than its PIP
    # joint (lower y value = higher on screen).  Thumb uses horizontal spread.
    def extended(tip_idx: int, pip_idx: int) -> bool:
        return mid[tip_idx][1] < mid[pip_idx][1]

    thumb_out = (mid[_THUMB_TIP][0] < mid[_THUMB_CMC][0]
                 if handedness == "Right"
                 else mid[_THUMB_TIP][0] > mid[_THUMB_CMC][0])

    finger_state = {
        "thumb":  thumb_out,
        "index":  extended(_INDEX_TIP,  _INDEX_PIP),
        "middle": extended(_MIDDLE_TIP, _MIDDLE_PIP),
        "ring":   extended(_RING_TIP,   _RING_PIP),
        "pinky":  extended(_PINKY_TIP,  _PINKY_PIP),
    }
    extended_fingers = [k for k, v in finger_state.items() if v]
    curled_fingers   = [k for k, v in finger_state.items() if not v]

    # ── Motion analysis ─────────────────────────────────────────────────────
    start_wrist = frames[0][_WRIST]
    end_wrist   = frames[-1][_WRIST]
    dx = end_wrist[0] - start_wrist[0]
    dy = end_wrist[1] - start_wrist[1]

    # Peak single-frame motion (max landmark displacement across all frames)
    peak_motion = max(
        sum(_dist2d(frames[i][j], frames[i-1][j]) for j in range(21))
        for i in range(1, n)
    )

    motion_parts: list[str] = []
    if abs(dx) > 0.04:
        motion_parts.append(f"{'rightward' if dx > 0 else 'leftward'} Δ={abs(dx):.2f}")
    if abs(dy) > 0.04:
        motion_parts.append(f"{'downward' if dy > 0 else 'upward'} Δ={abs(dy):.2f}")
    if not motion_parts:
        motion_parts.append("in-place / static" if peak_motion < 0.06 else "circular / wiggling")

    # ── Hand location in frame ───────────────────────────────────────────────
    wx, wy = mid[_WRIST][0], mid[_WRIST][1]
    h_pos = "left" if wx < 0.35 else ("right" if wx > 0.65 else "center")
    v_pos = "upper" if wy < 0.33 else ("lower" if wy > 0.66 else "mid")

    ext_str  = ", ".join(extended_fingers) if extended_fingers else "none (closed fist)"
    curl_str = ", ".join(curled_fingers)   if curled_fingers   else "none (fully open)"

    return (
        f"Handedness: {handedness}\n"
        f"Duration: {n} frames (~{n/30:.1f}s)\n"
        f"Extended fingers: {ext_str}\n"
        f"Curled fingers:   {curl_str}\n"
        f"Wrist location in frame: {h_pos}-{v_pos}\n"
        f"Motion: {', '.join(motion_parts)}\n"
    )


async def recognize_sign_from_landmarks(
    frames: list[list[list[float]]],
    handedness: str = "Right",
) -> tuple[str, float]:
    """
    Identify an ASL sign from a MediaPipe landmark sequence.

    frames  – list of N frames; each frame is 21 landmarks [[x,y,z], ...]
    Returns (word_in_uppercase, confidence_0_to_1)
    """
    if not frames or len(frames) < 5:
        return "UNKNOWN", 0.0

    description = _build_sign_description(frames, handedness)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert ASL (American Sign Language) sign recognition system.\n"
                        "You receive hand-pose data extracted by MediaPipe and must identify the ASL sign.\n\n"
                        "Common signs (not exhaustive):\n"
                        "HELLO, THANK YOU, PLEASE, SORRY, HELP, LOVE, YOU, ME, YES, NO, STOP, GO,\n"
                        "GOOD, BAD, FRIEND, FAMILY, MOTHER, FATHER, NAME, WATER, EAT, DRINK, SCHOOL,\n"
                        "WORK, HOME, PLAY, LEARN, UNDERSTAND, KNOW, THINK, WANT, NEED, LIKE, HATE,\n"
                        "HOW, WHAT, WHERE, WHEN, WHO, WHY, TIME, TODAY, MORE, FINISH, HAPPY, SAD,\n"
                        "ANGRY, SCARED, TIRED, SICK, FINE, BEAUTIFUL, BOOK, CAR, HOUSE, MONEY.\n\n"
                        "Respond with ONLY the single ASL word in UPPERCASE.\n"
                        "If you cannot identify it with reasonable confidence, respond with UNKNOWN."
                    ),
                },
                {"role": "user", "content": description},
            ],
            temperature=0.1,
            max_tokens=20,
        )
        raw = response.choices[0].message.content or ""
        # Strip anything that isn't letters (quotes, punctuation, etc.)
        word = re.sub(r"[^A-Z]", "", raw.strip().upper()) or "UNKNOWN"
        return word, 0.85
    except Exception as e:
        raise Exception(f"Sign recognition failed: {str(e)}")


async def gloss_to_english(words: list[str]) -> str:
    """
    Convert an ASL gloss word list into a natural English sentence.

    ASL gloss uses topic-comment structure, drops articles/copulas, and uses
    base verb forms.  GPT-4o-mini converts it to fluent English for TTS.
    """
    if not words:
        return ""

    gloss = " ".join(w.upper() for w in words)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Convert ASL gloss (simplified sign labels) into one natural, fluent English sentence.\n"
                        "ASL gloss drops articles/copulas and uses topic-comment word order.\n\n"
                        "Examples:\n"
                        "STORE I GO → \"I'm going to the store.\"\n"
                        "NAME YOU → \"What's your name?\"\n"
                        "HELLO FRIEND MEET HAPPY → \"Hello! It's so nice to meet you.\"\n"
                        "THANK YOU HELP → \"Thank you for your help.\"\n"
                        "WATER WANT → \"I'd like some water, please.\"\n"
                        "SORRY LATE → \"I'm sorry I'm late.\"\n\n"
                        "Respond with ONLY the English sentence — no explanation, no quotes."
                    ),
                },
                {"role": "user", "content": f"ASL gloss: {gloss}"},
            ],
            temperature=0.3,
            max_tokens=120,
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as e:
        raise Exception(f"Gloss-to-English failed: {str(e)}")
