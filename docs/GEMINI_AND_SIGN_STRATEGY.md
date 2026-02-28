# What Gemini Does + Sign Strategy (A/B/C)

## What Gemini does

**Gemini is used only for speech-to-text (transcription).**

- **Flow:** Mic → audio blob → backend `POST /api/transcribe` → **Gemini** (or OpenAI Whisper if you prefer) → plain text.
- **Why:** Free tier; no per-minute cost like OpenAI Whisper. Same job: turn speech into text so the rest of the pipeline (ASL grammar → animation queue → avatar) can run.
- **Not used for:** Sign generation, poses, or avatar rendering. Those are separate (rule-based grammar + animation map + 2D viewer).

---

## Current choice: Mix of A + B, 2D only (no 3D)

- **2D only:** No 3D avatar on Translate. All signing is 2D.
- **A:** We try to embed sign.mt in an iframe with our phrase (`?spl=en&sil=ase&text=...`). If they allow embedding, the user sees sign.mt’s 2D output.
- **B:** When sign.mt isn’t available (iframe blocked or no URL params), we use our pipeline (ASL grammar → animation queue) and render it in 2D via `SigningHands2D` (pipeline fallback).
- **No 3D:** AvatarScene / SigningAvatar are not used on the Translate tab.

---

## Sign strategy (reference): pick one

### A) Use sign.mt hosted API (if it exists)

- **Do:** Inspect sign.mt in browser DevTools → Network. If you see something like `/api/translate` or `/api/sign`, call it from our backend.
- **Then:** Map their response (e.g. poses/timings) into our `POST /api/generate-sign` response and render (e.g. skeleton or their player).
- **Pros:** Real sign.mt quality, no extraction. **Cons:** Only works if they expose a public API.

### B) Extract sign.mt pipeline from their repo

- **Do:** Clone [sign/translate](https://github.com/sign/translate), find text → normalization → gloss/SignWriting → pose logic, extract into a small service.
- **Expose:** `POST /generate-sign` with `{ poses, timings }` (or equivalent). Our app calls that and renders.
- **Pros:** Full control, same pipeline as sign.mt. **Cons:** More work, Angular/Firebase to strip out.

### C) Clean avatar clip–based signing (recommended for hackathon)

- **Do:** Keep current pipeline: **Wispr/Web Speech → text → LLM/rule-based ASL gloss → animation queue.**  
  **Change:** Replace “fake” SVG/posed hands with a **single GLTF avatar + prebuilt sign clips** (hello, thank_you, help, yes, no, etc.). Map `animationQueue` → play clip N for duration, then clip N+1.
- **Pitch:** “We use AI to restructure spoken English into ASL grammar, then render via an avatar animation system (prebuilt sign clips).”
- **Pros:** Defensible, demo-ready, no sign.mt dependency. **Cons:** Need one rigged GLTF and a small set of clip files (or procedural clips keyed by gloss).

---

## Recommendation

- **For HackIllinois / time-limited demo:** **C** — keep Wispr + ASL gloss, use one 3D avatar with prebuilt sign clips; drop “sign.mt-style” SVG and avoid fighting their codebase.
- **If you have time and want sign.mt output:** Try **A** first (inspect their API). If no public API, then **B** (extract) or stay with **C**.

Once you pick **A**, **B**, or **C**, we can stop spiraling and implement that path only.
