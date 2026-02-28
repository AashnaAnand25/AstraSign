# AstraSign — AI Context File
> **For AI assistants (Claude, Copilot, Cursor, etc.):** Read this entire file before helping with any task.
> Keep this file up to date as the project evolves — add new routes, architectural decisions, known issues, and resolved bugs here so future sessions don't repeat past mistakes.

---

## What We're Building

**AstraSign** is a real-time, bidirectional ASL ↔ English communication tool built for HackIllinois 2026.

**The two main flows:**
1. **Sign → Voice**: User signs ASL in front of their webcam → MediaPipe detects hand landmarks → backend identifies the ASL sign via LLM → accumulates a gloss → converts to natural English → ElevenLabs speaks it aloud
2. **Voice → Sign**: User speaks → Whisper transcribes → GPT/Gemini converts to ASL grammar order → frontend animates the corresponding signs

**The problem it solves:** Deaf/HoH individuals and hearing people cannot communicate naturally in real time. AstraSign acts as a live interpreter running entirely in the browser + a local Python backend.

---

## HackIllinois 2026

- **Event**: HackIllinois 2026 — University of Illinois Urbana-Champaign
- **Duration**: 36-hour hackathon
- **Theme**: Build something that matters
- **Our angle**: Accessibility / assistive technology

### Prizes to Target
- Best Accessibility / Social Impact hack
- Best use of AI/LLM APIs
- Overall top projects
- Check the HackIllinois devpost/dashboard for the current sponsor prize list and update here

---

## Team

- **Ammar** — Frontend, AI pipeline integration, Claude Code
- **Aashna** (AashnaAnand25 on GitHub) — Backend, data flow fixes
- *(Add other teammates and their roles here)*

**Repo**: `https://github.com/AashnaAnand25/AstraSign`
**Active branch**: `feature/asl-sign-to-voice`

---

## Tech Stack

### Frontend
- **React + Vite + TypeScript** — `src/`
- **Tailwind CSS** — styling
- **MediaPipe `@mediapipe/tasks-vision`** — hand landmark detection (loaded from CDN WASM, not bundled)
- **lucide-react** — icons
- Dev server runs on `http://localhost:8080`
- Proxies `/api/*` → `http://localhost:8000` (configured in `vite.config.ts`)

### Backend
- **FastAPI + uvicorn** — `signbridge/backend/`
- **Python 3.14** with venv at `signbridge/backend/venv/`
- **httpx** — async HTTP client (used for direct Gemini REST calls)
- **python-dotenv** — loads `signbridge/backend/.env`

### AI / External APIs
| Service | Used For | Key in .env |
|---|---|---|
| **Gemini 1.5 Flash** (Google) | Sign recognition + gloss→English + grammar | `GEMINI_API_KEY` |
| **ElevenLabs** | Text-to-speech (Rachel voice) | `ELEVENLABS_API_KEY` |
| **OpenAI Whisper** | Speech-to-text (voice→sign direction) | `WHISPERAI_KEY` (optional, preferred) |
| **Supermemory** | Conversation memory (optional) | `SUPERMEMORY_API_KEY` |

> **Important**: We call Gemini via its **native REST API** (`httpx` in `gemini_service.py`), NOT the OpenAI compatibility shim. The shim caused 404/routing errors. Do not revert to the OpenAI SDK for Gemini calls.

---

## Project Structure

```
AstraSign/
├── src/                                  # React frontend
│   ├── components/
│   │   └── neurosign/
│   │       ├── SignToVoice.tsx           # Main sign→voice UI (webcam + pipeline controls)
│   │       ├── LiveSigningScreen.tsx     # Voice→sign display
│   │       └── ConversationMode.tsx     # Combined bidirectional mode
│   ├── hooks/
│   │   ├── useHandTracking.ts           # MediaPipe HandLandmarker (~30fps rAF loop)
│   │   └── useSignPipeline.ts           # Push-to-sign pipeline (beginRecording/commitSegment)
│   └── accessibility/
│       └── AccessibilityProvider.tsx    # Haptics, font size, high-contrast settings
│
├── signbridge/backend/                  # FastAPI backend
│   ├── main.py                         # App entry, CORS, route registration
│   ├── routes/
│   │   ├── recognize.py                # POST /api/recognize/sign + /gloss-to-english
│   │   ├── speak.py                    # POST /api/speak (ElevenLabs TTS)
│   │   ├── transcribe.py               # POST /api/transcribe (Whisper STT)
│   │   ├── grammar.py                  # POST /api/grammar (English→ASL grammar)
│   │   ├── signs.py                    # POST /api/signs
│   │   └── memory.py                   # Supermemory integration
│   ├── services/
│   │   ├── gemini_service.py           # Direct REST calls to Gemini API (httpx)
│   │   ├── openai_service.py           # Sign recognition + gloss logic (calls gemini_service)
│   │   └── elevenlabs_service.py       # ElevenLabs TTS
│   ├── .env                            # Real keys — gitignored, never commit
│   ├── .env.example                    # Template — safe to commit
│   └── requirements.txt
│
└── CONTEXT.md                          # ← This file
```

---

## Sign → Voice Pipeline (Current Implementation)

**Push-to-sign model** (no auto-segmentation — threshold-based detection was unreliable):

```
User taps mic button
  → beginRecording() clears frame buffer
  → addFrame(landmarks) called each video frame while recording
  → User taps mic again → commitSegment()
  → Sends 8 sampled frames to POST /api/recognize/sign
  → Gemini 1.5 Flash identifies ASL sign from landmark description
  → Word chip appears in UI
  → Repeat for more signs
  → User taps speaker → triggerTranslate()
  → POST /api/recognize/gloss-to-english → natural English sentence
  → POST /api/speak → ElevenLabs MP3 → plays via <audio> Blob URL
```

**Key files**: [src/hooks/useSignPipeline.ts](src/hooks/useSignPipeline.ts), [src/components/neurosign/SignToVoice.tsx](src/components/neurosign/SignToVoice.tsx)

**Why push-to-sign?** We tried motion-delta auto-segmentation but 21 landmarks × ~0.003 natural trembling/frame ≈ 0.063 total made threshold calibration unreliable. Push-to-sign is 100% reliable for demos.

---

## How to Run

### Backend
```bash
cd signbridge/backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
Requires `signbridge/backend/.env` with at minimum `GEMINI_API_KEY`.

### Frontend
```bash
# from repo root
npm install
npm run dev
# opens on http://localhost:8080
```

---

## Environment Variables

Copy `signbridge/backend/.env.example` → `signbridge/backend/.env` and fill in:

```
GEMINI_API_KEY=...          # Required — sign recognition + grammar
ELEVENLABS_API_KEY=...      # Required — text-to-speech
WHISPERAI_KEY=...           # Optional — only needed for Whisper transcription
OPENAI_API_KEY=...          # Legacy fallback for Whisper (still accepted)
SUPERMEMORY_API_KEY=...     # Optional — memory features
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

> `.env` is gitignored. Never commit real keys. The initial commit only had placeholder values.

---

## Known Issues & History

| Issue | Resolution |
|---|---|
| OpenAI key quota exceeded (429) | Switched to Gemini |
| Gemini OpenAI-compat shim → 404 "v1main" errors | Switched to native Gemini REST API via httpx in `gemini_service.py` |
| Gemini 2.0 Flash free tier quota = 0 | Use `gemini-1.5-flash` |
| Auto-segmentation false-triggering on hand entry | Replaced with push-to-sign (beginRecording/commitSegment) |
| MediaPipe WASM/Vite bundling issues | Load WASM from CDN, not bundled |
| Canvas skeleton mirrored wrong | Mirror x-coord: `px = (1 - lm.x) * w` to match `scaleX(-1)` video |

---

## Git Workflow

- **Main branch**: `main`
- **Active feature branch**: `feature/asl-sign-to-voice`
- Commit often, use descriptive messages
- Do not commit `.env` — it's gitignored

---

## Instructions for AI Assistants

1. **Read this file first** every session before touching any code
2. **Do not revert to OpenAI SDK for Gemini** — use `gemini_service.py` (httpx REST)
3. **Do not re-introduce auto-segmentation** — push-to-sign is intentional
4. **Update this file** when you make significant architectural changes, resolve bugs, or add new features — add a row to the Known Issues table, update the structure diagram, etc.
5. **Check `.env.example`** before assuming which API keys are available
6. **Backend restart required** after `.env` changes — `--reload` only watches Python files
7. **Frontend hot-reloads** automatically for `.ts`/`.tsx` changes via Vite
8. The active branch is `feature/asl-sign-to-voice` — push changes there
