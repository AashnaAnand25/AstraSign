# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
./run.sh              # frontend (8080) + backend (8000), creates venv + .env, kills stale ports
./run.sh --front      # frontend only    (run.bat is the Windows equivalent)
./run.sh --back       # backend only

npm install --legacy-peer-deps   # required — react-three/fiber v8 vs React 18 peer conflict
npm run dev           # vite on :8080
npm run build         # → dist/
npm run lint          # eslint — currently 0 errors, 30 warnings
npm test              # vitest run
npx vitest run src/path/to/file.test.ts   # single file
npx tsc --noEmit -p tsconfig.app.json     # typecheck; NOT part of the build
```

Backend manually: `cd signbridge/backend && source venv/bin/activate && uvicorn main:app --reload --port 8000`.

The build does **not** typecheck. `@vitejs/plugin-react-swc` strips types without checking them, and it also elides unused imports before resolution — so a broken import of a file that does not exist still builds clean as long as nothing references the binding. Run `tsc --noEmit` to catch that class of bug.

## Deployment

The frontend is a static Vite bundle and works **with no backend at all**. Sign detection, the 3D avatar and English→ASL gloss are all client-side; only ElevenLabs TTS and Gemini grammar need the server, and both degrade to on-device equivalents.

Set `VITE_API_URL` (see [.env.example](.env.example)) only when a backend is actually deployed. Leave it unset locally so requests stay relative and hit the Vite `/api` proxy.

The subtlety that made this break before: a static host answers `POST /api/speak` with `index.html` and a **200**, so `response.ok` is true for a backend that isn't there. [src/services/api.ts](src/services/api.ts) therefore also checks the response content-type, and throws when it doesn't match — that throw is what makes every caller's fallback fire. Route new backend calls through `apiPost` there rather than calling `fetch` directly.

## Architecture

**Recognition is entirely client-side.** MediaPipe + hand-written geometric classifiers run in the browser; the FastAPI backend is only ever hit for `/api/speak` (ElevenLabs TTS) and `/api/grammar`. The backend's `/api/recognize` (Gemini) and `/api/transcribe` (Whisper) routes exist but no frontend code calls them.

### Frontend

Not really a router. [src/App.tsx](src/App.tsx) has one route; [src/pages/Index.tsx](src/pages/Index.tsx) is a `useState<Screen>` machine switching between landing / onboarding / main / conversation screens, all inside a fixed `max-w-[430px]` phone frame. Adding a screen means extending the `Screen` union and the conditional block, not adding a route.

Two translation directions, both surfaced through `TranslateTab`:

- **Audio → ASL** (`MVPVoiceToSign`): Web Speech API → `restructureToASLGrammar` ([src/data/aslGrammar.ts](src/data/aslGrammar.ts)) for English→ASL gloss → 3D avatar plays `.glb` clips from `public/animations/` via `ANIMATION_MAP`. Fully local. `useVoicePipeline` is the async variant that prefers the backend's Gemini gloss and falls back to the same local rules.
- **ASL → Audio** (`SignToVoice`): `useHandTracking` (MediaPipe HandLandmarker, WASM + model fetched from CDN at runtime — needs network on first load, ~30fps) yields 21 landmarks → `useFastSignPipeline` (words) or `useLetterTrackingPipeline` (fingerspelling) → `fetchSpeechUrl`, falling back to `speechSynthesis`.

Speech recognition is vendor-prefixed and absent from TypeScript's DOM lib; use `getSpeechRecognition()` from [src/lib/speechRecognition.ts](src/lib/speechRecognition.ts) rather than reaching for `(window as any).webkitSpeechRecognition`.

Recognition stack, in dependency order:

- [src/services/AslEngine.ts](src/services/AslEngine.ts) — `LandmarkSmoother` (velocity-adaptive EMA), `HandHistory` (30-frame ring buffer, velocity/peak detection), `classifyAslSign`. Rule-based geometry, ported from a Python original; no ML weights.
- [src/services/AslLetterEngine.ts](src/services/AslLetterEngine.ts) — same shape, A–Z fingerspelling.
- [src/services/ContextModel.ts](src/services/ContextModel.ts) — bigram weights that bias the next sign given the last one; `fuseScores` combines this with the geometric score inside the pipelines.

Pipelines accumulate per-sign confidence over frames and commit once a threshold is crossed (`COMMIT_THRESHOLD`) — tune that, not the classifier, when detection feels too eager or too sluggish.

### Backend (`signbridge/backend/`)

FastAPI, routers mounted under `/api/*` in [main.py](signbridge/backend/main.py). Route → service is 1:1: `speak`→elevenlabs, `grammar`/`recognize`→gemini, `transcribe`→openai (Whisper), `signs`→static `data/signs_index.json`, `memory`→supermemory. Only `GEMINI_API_KEY` is required; every other key degrades one endpoint. Copy `.env.example` → `.env`.

Vite proxies `/api` → `:8000` in dev.

## Conventions

- `@/` → `src/`. Path alias is set in both `vite.config.ts` and `vitest.config.ts`.
- `src/components/ui/` is stock shadcn/ui — regenerate rather than hand-edit. `src/components/astraign/` is app code.
- Accessibility settings (haptics, font size, etc.) come from `useAccessibility()` ([src/accessibility/AccessibilityProvider.tsx](src/accessibility/AccessibilityProvider.tsx)); translation history from `useHistory()`. Both wrap the app in `App.tsx`.
- `.glb` assets live in `public/` and are referenced by absolute path (`/animations/HELLO.glb`) — not imported.

## Dead code

Present but unreferenced — don't extend these, and check before "fixing" them: `Avatar3D.tsx`, `AvatarSelector.tsx`, `CSSHand.tsx` + `SimpleHandAnimator.ts` (its pose table is not correct ASL), `RealisticHand.tsx`, `VoiceGuidanceSystem.tsx`, `VoiceToSign.tsx` (superseded by `MVPVoiceToSign`), `ReverseMode.tsx`, `ASLModelService.ts`, `backend/main_recovered.py`, and the `* 2.py` copies in `signbridge/backend/`.

`@tensorflow/tfjs` and `@tensorflow-models/mobilenet` are installed and `ASLModelService.ts` wraps them, but nothing imports it. Recognition does not use TensorFlow today, despite what the README implies.
