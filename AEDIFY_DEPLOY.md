# Deploy AstraSign on Aedify

Use [Aedify](https://www.aedify.ai/) to deploy this app from GitHub.

## Quick steps

1. **Log in** at [aedify.ai](https://www.aedify.ai/) and open the dashboard.
2. **New project** → **Deploy from GitHub**.
3. **Select repo**: `AashnaAnand25/AstraSign` (and the correct account if prompted).
4. **Branch**: `main`.
5. **Build settings** (if Aedify asks or shows a form):
   - **Build command:** `npm run build`
   - **Output directory / Publish directory:** `dist`
   - **Install command:** `npm install` (or leave default)
   - **Node / Runtime:** Node 18 or 20 (if available)
6. **Deploy** — Aedify will run the build and give you a live URL.

## Notes

- This is a **Vite + React** static app. The build produces the `dist` folder; Aedify will serve it.
- Make sure the host uses **SPA fallback** (serve `index.html` for unknown paths). The app has a single route, so this only matters for refreshes on deep links.
- The **backend** (signbridge) is optional and runs separately. Deploy it elsewhere (Railway, Render, Modal) if you want it.
  - **With no backend** — the default — sign detection, the 3D avatar and English→ASL gloss all run in the browser, and speech output uses the device's own voice. Leave `VITE_API_URL` unset.
  - **With a backend**, set `VITE_API_URL` to its origin (no trailing slash) in Aedify's **Settings → Environment variables**, then redeploy. That switches TTS to ElevenLabs and gloss to Gemini.
- The site must be served over **HTTPS**: the camera, microphone and Web Speech API all require a secure context. Aedify does this by default.
- Speech-to-text needs **Chrome or Edge** — the Web Speech API is unimplemented in Firefox and only partial in Safari. Sign→voice works everywhere.

Docs: [doc.aedify.ai](https://doc.aedify.ai) if you need more detail.
