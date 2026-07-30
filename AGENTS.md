# AstraSign — Agent Guide

## Commands (in order of importance)

```bash
npm install --legacy-peer-deps   # required — R3F v8 vs React 18 peer conflict
npm run build                    # SWC strips types — does NOT typecheck
npx tsc --noEmit -p tsconfig.app.json  # catch broken imports
./run.sh                         # kills stale ports, installs deps, starts both
npm run dev                      # Vite on :8080, proxies /api → :8000
npm run lint                     # eslint (noUnusedVariables OFF, so lint ≠ typecheck)
npm test                         # vitest run (jsdom)
npx vitest run src/path/to/file.test.ts
```

## Architecture landmines

- **Single screen machine:** `src/pages/Index.tsx:14` — `useState<Screen>` not a router. Add screens by extending the `Screen` union and adding a conditional block, not a route.
- **Build doesn't verify imports.** `@vitejs/plugin-react-swc` elides unused imports before resolution. A broken import of a nonexistent file builds clean. Only `tsc --noEmit` catches it.
- **`VITE_API_URL`** controls backend origin. Empty in dev → requests stay relative, Vite proxies to `:8000`. When set, `src/services/api.ts:8` strips trailing slashes.
- **Backend 200 for missing routes:** A static host (Aedify, Netlify) returns `index.html` for any unknown path with a 200. The `apiPost` wrapper in `api.ts:54` checks `content-type` to detect this and throws so callers fall back.

## Recognition (fully client-side)

| Stack | File |
|-------|------|
| Word recognition | `src/services/AslEngine.ts` — rule-based geometry, no ML |
| Letter fingerspelling | `src/services/AslLetterEngine.ts` |
| Context bias (bigram) | `src/services/ContextModel.ts` — `fuseScores` |
| Tone down sensitivity | `COMMIT_THRESHOLD` in pipelines, not the classifier |

## TTS pattern (hard-won)

Route **all** TTS through `fetchSpeechUrl()` / `speakNative()` in `src/services/api.ts`. Never call `/api/speak` via raw fetch — `apiPost` checks content-type to detect missing backend. Callers handle `null` by falling back to native speech.

## Speech recognition

Use `getSpeechRecognition()` from `src/lib/speechRecognition.ts`. It returns the typed constructor or `undefined`. Never reach for `(window as any).webkitSpeechRecognition`.

## File layout conventions

- `src/components/ui/` — shadcn/ui, regenerate via CLI, don't hand-edit
- `src/components/astraign/` — app components
- `.glb` assets in `public/animations/` — reference by absolute path (`/animations/HELLO.glb`), never import
- `@/` → `src/` (vite + vitest config)

## Backend (`signbridge/backend/`)

Only `GEMINI_API_KEY` is required. Route → service is 1:1. Vite proxies `/api` → `:8000` in dev. Activate venv: `source venv/bin/activate`.

## Dead code (don't extend, don't fix)

`Avatar3D.tsx`, `AvatarSelector.tsx`, `CSSHand.tsx` + `SimpleHandAnimator.ts`, `RealisticHand.tsx`, `VoiceGuidanceSystem.tsx`, `VoiceToSign.tsx` (superseded by `MVPVoiceToSign`), `ReverseMode.tsx`, `ASLModelService.ts`, `backend/main_recovered.py`, `* 2.py` files. TensorFlow.js is installed but nothing calls it.

## Bundle splitting

Vite config splits `three` + `@react-three/{fiber,drei}` and `@mediapipe/*` into separate chunks via `manualChunks` at `vite.config.ts:31`.
