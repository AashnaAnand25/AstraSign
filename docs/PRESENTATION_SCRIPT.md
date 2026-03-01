# AstraSign — Presentation Script / Slide Content

Use this for HackIllinois demo or pitch. Copy each section into one slide.

---

## Slide 1: What We Built With — Tech Stack

**Title:** What We Built With  
**Subtitle:** Tech Stack

**Content (bullets or icons):**
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **MediaPipe** — Hand tracking & ASL pose detection (client-side)
- **Backend:** FastAPI (Python), Uvicorn
- **AI / NLP:** OpenAI Whisper, Google Gemini, ElevenLabs, Supermemory
- **Infra:** Aedify (deploy), Modal (optional serverless)
- **UX:** Accessible design, focus mode, haptics

*Optional one-liner:*  
“A full-stack ASL ↔ spoken language translation app: sign to speech and speech to sign, with real-time hand tracking and natural voice.”

---

## Slide 2: AI Pipeline & Performance

**Title:** AI Pipeline & Performance

**Top row (3 columns):**
| 01 | 02 | 03 |
|----|----|----|
| **Frontend** | **Backend / ML** | **AI / NLP** |
| MediaPipe Hands, React, camera stream | FastAPI, sign lookup, grammar API | Whisper, Gemini, ElevenLabs, Supermemory |

**Flow row (optional):**
- **Receive** → **Upload** → **Fine-tune**  
  (e.g. Receive audio/sign input → Upload to services → Fine-tune grammar & signs)

**Backend services breakdown (incorporate as bullets or a second panel):**

- **Audio processing — OpenAI Whisper**  
  - **Purpose:** Speech-to-text  
  - **Flow:** Microphone → transcribed text  
  - **Use case:** “Audio → ASL” mode when the user speaks  

- **AI processing — Gemini**  
  - **Purpose:** Natural language → ASL grammar  
  - **Flow:** e.g. “Hello how are you” → “HELLO HOW YOU”  
  - **Use case:** Grammar correction and sentence structure for signing  

- **Sign database — Supermemory (built-in)**  
  - **Purpose:** ASL sign lookup and storage  
  - **Flow:** Words/phrases → sign definitions and animations  
  - **Use case:** “THANK YOU” → hand shape / sign data  

- **Audio output — ElevenLabs**  
  - **Purpose:** Text-to-speech  
  - **Flow:** ASL translation text → natural voice audio  
  - **Use case:** “ASL → Audio” mode speaking the result  

- **Modal flow (in code)**  
  - **Purpose:** UI state and mode switching  
  - **Flow:** User picks “Audio→ASL” or “ASL→Audio” → component and pipeline switch  
  - **Use case:** Navigation between translation modes  

**Complete pipeline (one line for the slide):**  
**User speaks → Whisper transcribes → Gemini processes → Supermemory looks up signs → ElevenLabs speaks**  
*(For ASL→Audio: Camera → MediaPipe hands → classifier → text → ElevenLabs speaks.)*

---

## Short verbal script (30–60 sec)

**Slide 1 — Tech stack:**  
“We built AstraSign with a modern frontend — React, Vite, TypeScript — and used MediaPipe in the browser for hand tracking. The backend is FastAPI; we use Whisper for speech-to-text, Gemini for ASL grammar, Supermemory for sign lookup, and ElevenLabs for text-to-speech. We deploy on Aedify.”

**Slide 2 — Pipeline:**  
“The pipeline has three layers: frontend for capture and UI, backend and ML for sign and grammar, and AI/NLP for Whisper, Gemini, and ElevenLabs. End-to-end: user speaks, Whisper transcribes, Gemini fixes grammar for ASL, Supermemory maps to signs, and ElevenLabs speaks when we need audio out. For sign-to-voice we use MediaPipe and our classifier, then send the text to ElevenLabs.”

---

*File: `docs/PRESENTATION_SCRIPT.md` — use as-is or paste into Google Slides / PowerPoint / Figma.*
