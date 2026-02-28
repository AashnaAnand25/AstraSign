# sign.mt Integration Strategy

We want: **Audio → Wispr → Text → sign.mt pipeline → 3D Avatar**, without rewriting our app or adopting the full Angular codebase.

## What We Have Now

- **Backend:** `POST /api/generate-sign`  
  - Body: `{ "text": "hello how are you" }`  
  - Response: `{ "asl_text", "words", "animation_ids", "poses", "source" }`  
  - Current implementation: same logic as frontend (ASL grammar restructure + word→animation map). Output is compatible with our Three.js avatar (SigningAvatar uses `animation_ids`).

- **Frontend:** React + Vite + Three.js (R3F). Pipeline: Audio → Web Speech or Wispr → `restructureToASLGrammar()` → `textToAnimationQueue()` → AvatarScene/SigningAvatar.

- **sign/translate repo:** [github.com/sign/translate](https://github.com/sign/translate) — Angular, Firebase, full-stack. Pipeline: **Spoken Text → Normalized → SignWriting → Pose → 3D Avatar**.

## Goal

Use **only** the sign production part of sign.mt:

- **Text → SignWriting → Pose sequence** (and optionally pose → video).
- Expose that as a **service** we call from our backend or frontend.
- **Do not** refactor our project into Angular or copy their full UI.

## Two Paths

### A) Call sign.mt hosted API (fastest if available)

1. Open [sign.mt](https://sign.mt/), open DevTools → Network.
2. Enter text and trigger “sign”; find the request that returns pose/sign data.
3. If they expose a public API, from our backend we do:
   - `Audio → Wispr → Text` (existing).
   - `Text → fetch(sign.mt API)` → pose/animation data.
   - Map their response to our `animation_ids` / `poses` and return from `POST /api/generate-sign`.
4. Frontend keeps calling `POST /api/generate-sign`; only the backend implementation changes.

### B) Extract pipeline from sign/translate repo

1. **Clone and run locally:**
   ```bash
   git clone https://github.com/sign/translate.git
   cd translate && npm install && npm start
   ```
2. **Find the text→sign production logic:**
   - Likely under: `src/app/` (e.g. `modules/`, `core/`, `pages/`).
   - Look for: “SignWriting”, “pose”, “skeleton”, “gloss”, “normalize”.
   - Firebase `functions/` may contain backend logic for text→pose.
3. **Extract only that logic:**
   - New minimal **Node/Express** (or Python) service.
   - No Angular; no full UI.
   - Single job: `POST /generate-sign` → body `{ text }` → response: pose sequence or animation data.
4. **Remove Angular/Firebase deps** from the extracted code; stub anything that’s not needed for “text → pose”.
5. **Run the service** next to our app (e.g. port 8002). Our FastAPI backend calls it and maps result into `POST /api/generate-sign` response.

## Cursor Prompt for Extraction

Use this when you want to extract the pipeline from the repo:

```text
We are building a hackathon project that performs:

Audio → Speech-to-Text (Wispr) → Text → ASL Avatar

We want to integrate ONLY the sign language production pipeline from:

https://github.com/sign/translate

Specifically: Text input → SignWriting conversion → Pose sequence → data we can use for a 3D avatar.

Constraints:
- Do NOT refactor our project into Angular.
- Do NOT copy the full UI.
- Extract only the core logic that converts text into sign pose/animation data.
- Create a minimal Node/Express service (or standalone module) we can call via API.

Output:
- POST /generate-sign
  Body: { "text": "hello how are you" }
  Response: pose sequence / animation data (e.g. list of poses or sign IDs).

Steps:
1. Identify where in the repo the text → sign production logic lives.
2. Extract that logic into a standalone service; remove Angular-specific dependencies.
3. Expose POST /generate-sign so it runs independently from the Angular frontend.
4. Keep it minimal; stub anything unnecessary; focus on working text → pose output.
```

## Technical Notes (from sign.mt docs)

- **Dictionary-based:** text → gloss → pose from dictionary → video. Simpler, less fluent.
- **SignWriting MT:** text → SignWriting (MT) → SignWriting→pose → video. Better fluency.
- They may rely on **Firebase / cloud functions / ML services**. If extraction is heavy, prefer **calling their hosted API** (path A) if available.
- Our backend currently returns `animation_ids` (and optional `poses`) so the frontend can drive SigningAvatar or a future pose-based renderer without change.

## Summary

| Step              | Owner        | Action |
|-------------------|-------------|--------|
| Audio → Text      | Us (Wispr)  | Done   |
| Text → ASL/pose   | Us or sign.mt | Backend `POST /api/generate-sign`; today: our pipeline; later: call sign.mt API or extracted service |
| Pose/IDs → 3D     | Us          | SigningAvatar / Three.js |

Keep the integration surface small: one endpoint (`/api/generate-sign`), one response shape. Swap the implementation behind it when sign.mt is available.
