# ASL .glb files for the demo

## Do I have to download from Sketchfab?

**No.** You can get ASL or signing-ready animations from several places:

| Source | What you get | Notes |
|--------|----------------|------|
| **Sketchfab** | Some free/paid GLB characters; few are ASL-specific | Search "sign language" or "hand gesture"; check license. |
| **Mixamo** | Free mocap (FBX). No ASL packs; generic gestures (wave, thumbs up) | Download FBX → retarget in Blender → export GLB. |
| **Asset stores** (IconScout, CGTrader, etc.) | Paid ASL/signing packs | Easiest if you need real ASL signs. |
| **Your own** | Blender + keyframes or mocap | Full control; most work. |

So: **Sketchfab is one option, not required.** Use any source that gives you **.glb files with animation clips** that match your avatar’s skeleton (or use our placeholder setup below).

---

## Option A: Use your own ASL .glb files

1. **Where to put them**  
   Put each file under:
   ```text
   public/animations/
   ```
   Names must match what the app expects (uppercase, one word per file), e.g.:
   - `HELLO.glb`
   - `THANK.glb`
   - `YES.glb`
   - `NO.glb`
   - `PLEASE.glb`
   - `YOU.glb`
   - `HOW.glb`
   - `ARE.glb`

2. **What the file must contain**  
   Each GLB should contain **at least one animation clip** (e.g. “Hello”, “Wave”).  
   The app loads `avatar.glb` from `public/models/avatar.glb` and plays clips from the animation GLBs. For clips to work, either:
   - the animation GLB uses the **same skeleton** as `avatar.glb`, or  
   - you use **animation-only** GLBs that are retargeted to your avatar in Blender before export.

3. **Current placeholders**  
   Right now, `public/animations/*.glb` are copies of the same base model (so the app doesn’t crash). Replacing them with real ASL clips (from Sketchfab, Mixamo, or anywhere else) will make the avatar actually sign.

---

## Option B: Demo without downloading ASL .glb files

If you don’t add new files, the app still runs:

- **Start Signing (live)** uses `MVPVoiceToSign`: it loads `public/models/avatar.glb` and plays whatever animations exist in `public/animations/*.glb`. With the current placeholders, the avatar may only repeat the same motion (or idle).
- A **procedural fallback** is available: for words like HELLO, YES, NO, THANK the avatar can play a simple wave/thumbs-up style motion so the demo **visibly moves** even without real ASL GLBs.

So for the hackathon you can:
- **Option A:** Download or create ASL .glb files (from Sketchfab, Mixamo, or elsewhere) and drop them into `public/animations/` with the names above, **or**
- **Option B:** Rely on the current avatar + placeholders + procedural fallback so the MVP moves without any new downloads.

---

## Summary

- You do **not** have to use Sketchfab; any source of compatible .glb animations is fine.
- If you use your own files: put them in `public/animations/` with names like `HELLO.glb`, `YES.glb`, etc.
- If you don’t add files: the app still runs and can use the procedural fallback so the avatar moves for the demo.
