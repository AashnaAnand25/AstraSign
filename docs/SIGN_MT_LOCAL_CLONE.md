# Run sign.mt Locally (Exact Same Thing, Tweak 2D Avatar)

We use sign.mt’s pipeline exactly: **Text → Normalized → SignWriting → Pose → Skeleton Viewer**. You can run their app locally and point our app at it so you get their exact output and can change the 2D avatar (e.g. neon) in their repo.

## 1. Clone and run sign/translate

From the AstraSign repo root:

```bash
./scripts/setup-sign-mt-local.sh
cd sign-translate && npm start
```

Their app will run at **http://localhost:4200**.

## 2. Point our app at the local clone

Create a `.env` file in the **AstraSign project root** (same folder as `package.json`):

```env
VITE_SIGN_VIEWER_URL=http://localhost:4200
```

Restart our app (`npm run dev`). On the Translate tab, the 2D viewer will load **your local sign.mt** instead of https://sign.mt.

## 3. Change the 2D avatar (e.g. neon) in the clone

In the **sign-translate** repo you can edit their 2D output:

- **Pose / skeleton viewer:** `sign-translate/src/app/modules/pose/` — pose rendering and skeleton viewer.
- **Animation / avatar:** `sign-translate/src/app/modules/animation/` — animation and avatar output.
- **Translate page / UI:** `sign-translate/src/app/pages/translate/` — main translate page and how the viewer is shown.

Edit their CSS/SCSS or component styles to add neon borders, glows, or colors. After saving, their dev server will reload; our app’s iframe will show the updated look.

## 4. No local clone (use hosted sign.mt)

If you don’t set `VITE_SIGN_VIEWER_URL`, we use **https://sign.mt** by default. You get their exact pipeline and look, but you can’t change their 2D avatar (only our neon frame around the iframe).

## Summary

| Goal                         | What to do |
|-----------------------------|------------|
| Exact same as sign.mt       | Don’t set `VITE_SIGN_VIEWER_URL` (uses https://sign.mt). |
| Same pipeline + tweak 2D   | Run `./scripts/setup-sign-mt-local.sh`, then `cd sign-translate && npm start`, set `VITE_SIGN_VIEWER_URL=http://localhost:4200`, and edit their repo’s pose/animation/translate modules. |
