# Devpost Project Story — AstraSign (HackIllinois 2026)

Copy the sections below into your Devpost **Project details → About the project** (Markdown). Adjust team names, tech specifics, and links as needed.

---

## Inspiration

Communication barriers between Deaf and hearing people are real and daily—whether at a doctor’s office, in the classroom, or on the go. Existing tools are often one-directional, expensive, or not built with accessibility first. We wanted to build something that works **both ways**: speak and see ASL, or sign and hear speech, in one app, without needing separate products or extra hardware. We were inspired by the idea of a single “bridge” that any device could provide, so conversations can flow naturally in both directions.

## What it does

**AstraSign** is a bidirectional ASL translation web app that turns any phone or laptop into a real-time communication bridge.

- **Audio → ASL:** Speak into your device and see ASL translation (signing) in real time—for hearing people who want to communicate in sign.
- **ASL → Audio:** Use your camera to sign; the app recognizes hand shapes (e.g., Yes, No, Stop, One, Two) and speaks the translation aloud—for Deaf signers who want to be heard.
- **Translation Hub:** One place to switch between modes, flip camera (front/back), and access quick phrases and history.
- **Accessibility-first:** Focus mode, haptic feedback, voice guidance, confidence display, and theme-aware UI so the app stays usable for everyone.

We focused on making the core flows—speak-to-sign and sign-to-voice—actually work and feel usable in a hackathon timeframe, so judges and users can try a real two-way experience, not just a demo.

## How we built it

- **Frontend:** React + TypeScript + Vite, with a dark theme (purple/cyan) and responsive layout for mobile and desktop.
- **ASL → Audio (Sign-to-Voice):** MediaPipe Hands for hand tracking and landmark detection, plus a custom rule-based gesture classifier that maps hand poses to words (e.g., thumbs up → “Yes”). We used a small set of static poses to keep recognition reliable and low-latency.
- **Audio → ASL (Voice-to-Sign):** MVP voice-to-sign pipeline that takes speech input and drives signing output (text/UI and extensible to avatar animation).
- **State & navigation:** React state and context for history, tab navigation (Home, Translate, Quick Phrases, History, Accessibility), and routing so Audio→ASL and ASL→Audio from the Translation Hub open the same working flows as on the Home screen.
- **Accessibility:** Global accessibility provider, focus mode, optional haptics and voice feedback, and confidence display so users understand when the system is uncertain.

We prioritized a single, coherent user journey: land on the app, pick “Start Signing” or “ASL Detection,” and get into the right mode without extra steps.

## Challenges we ran into

- **Clickability and layout:** On the ASL Detection (camera) screen, overlays and stacking contexts were swallowing taps—buttons for Flip, mode switch, and “Tap to start recognition” didn’t respond. We fixed it by isolating decorative layers with `pointer-events: none`, giving the control panel a dedicated interactive layer and sticky positioning, and raising z-index for the Translate tab’s Flip and mode buttons so they always receive clicks.
- **Making the UI visible on dark theme:** The landing “AstraSign” wordmark and logo were blending into the background. We corrected the gradient utility to use `hsl(var(--neon-purple))` and `hsl(var(--neon-cyan))`, updated the logo SVG to theme purple/cyan, and added the logo back so the first screen reads clearly.
- **Camera and permissions:** Getting the camera to start reliably when the user taps “start recognition” required tying HandTracker’s `isActive` to the record state and handling loading/errors so the feed and controls stay in sync.
- **Scope vs. depth:** We had to choose between many features and a few that actually work. We chose to make Audio→ASL and ASL→Audio flows solid and navigable from both Home and the Translation Hub, so the demo feels complete and judges can try both directions.

## Accomplishments that we're proud of

- **Two-way flow in one app:** One place to go from speech to sign and from sign to speech, with the same flows whether you start from Home or the Translation Hub.
- **Accessibility baked in:** Focus mode, haptics, voice guidance, and confidence display aren’t afterthoughts—they’re part of the core experience so the app is usable for more people.
- **Recognition that works:** Static pose recognition (Yes, No, Stop, One, Two, etc.) is stable and low-latency enough to feel responsive when demoing ASL → Audio.
- **Consistent navigation:** Flip Screen, Audio→ASL, and ASL→Audio in the Translation Hub now correctly open the main app’s Translate tab with the right mode, so the “Inspiration” and “What it does” story matches what users can actually do.

## What we learned

- **Pointer events and z-index:** Complex layouts with camera, overlays, and sticky controls need a clear “interactive layer” strategy (e.g., one decorative layer with `pointer-events: none`, control panels with explicit z-index and `pointer-events: auto`) so nothing blocks taps.
- **Theme and contrast:** CSS variables like `--neon-purple` are raw HSL values; gradients and SVGs need `hsl(var(--name))` to render correctly and stay visible on dark backgrounds.
- **Scoping for a hackathon:** Shipping a focused, working experience (two clear modes + accessibility + navigation) beats a long list of half-built features for both judges and users.

## What's next for AstraSign

- **Expand ASL vocabulary:** Move from a small set of static poses to a larger vocabulary (e.g., more numbers, letters, common phrases) using the same MediaPipe pipeline and a richer classifier or lightweight model.
- **Avatar and 2D signing:** Connect the existing avatar and 2D hand pipelines to the Voice-to-Sign output so Audio→ASL shows animated signing, not just text.
- **Offline and performance:** Optimize bundle size and explore offline hand-model and TTS so the app works in low-connectivity or privacy-sensitive settings.
- **User testing with the Deaf community:** Partner with Deaf and hard-of-hearing users to refine gestures, feedback, and wording so AstraSign truly serves the people we built it for.

---

## Built with

- **Languages:** TypeScript, HTML, CSS
- **Frontend:** React, Vite
- **Libraries:** MediaPipe Hands (hand tracking), Lucide React (icons)
- **Styling:** Tailwind CSS, custom design tokens (purple/cyan theme)
- **Other:** React Router, accessibility-focused UX (focus mode, haptics, voice guidance)

*(Add or remove items to match what you actually used—e.g., Gemini API, ElevenLabs, if applicable—and add any “Try it out” links below.)*

---

## Try it out

- **Demo:** [your Vercel/Netlify or live URL]
- **GitHub:** [your repo URL]
- **Video:** [your ≤3 min demo video URL]

---

*Remember: submission must include a public GitHub repo, a video demo no longer than 3 minutes, and at least one team member present at the Project Showcase. Limit your live presentation to ~3 minutes with a short wrap-up, then 2 minutes for Q&A.*
