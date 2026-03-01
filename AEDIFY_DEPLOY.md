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
- The **backend** (signbridge) runs separately. For production you’d deploy it elsewhere (e.g. Railway, Render) and set your frontend’s API URL to that backend. For now the app works with camera/ASL in the browser; backend is optional for TTS etc.
- If you need **env vars** later (e.g. `VITE_API_URL`), add them in Aedify’s project **Settings → Environment variables**.

Docs: [doc.aedify.ai](https://doc.aedify.ai) if you need more detail.
