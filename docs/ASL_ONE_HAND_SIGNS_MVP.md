# One-handed ASL signs (MVP set)

Hardcode-friendly list for a single dominant hand. Use these for `getSignPose` / gloss mapping.

---

## 1. HELLO
- **Handshape:** Flat open hand
- **Motion:** Small outward wave from forehead
- **Use:** Greeting

---

## 2. YES
- **Handshape:** Fist (thumb up = “thumbs up”)
- **Motion:** Nod fist up and down
- **Use:** Affirmation

---

## 3. NO
- **Handshape:** Index + middle finger tap thumb (like mouth talking)
- **Motion:** Close twice (tap thumb)
- **Use:** Negation

---

## 4. THANK YOU
- **Handshape:** Flat hand
- **Motion:** From chin outward (forward)
- **Use:** Politeness

---

## 5. PLEASE
- **Handshape:** Flat hand
- **Motion:** Circular motion on chest
- **Use:** Requests

---

## 6. HELP (one-hand simplified)
- **Handshape:** Flat palm up
- **Motion:** Lift upward slightly
- **Use:** Accessibility / “I need help”

*(Real ASL uses two hands; one hand is fine for MVP.)*

---

## 7. STOP
- **Handshape:** Flat palm forward
- **Motion:** Hold firm (no movement)
- **Use:** Clear “stop” cue

---

## 8. OK
- **Handshape:** Index touches thumb (O / F-shape)
- **Motion:** Slight bounce
- **Use:** Confirmation

---

## 9. SORRY
- **Handshape:** Fist
- **Motion:** Circular motion on chest
- **Use:** Apology

---

## 10. WAIT
- **Handshape:** W-shape (three fingers up)
- **Motion:** Small side shake
- **Use:** “Wait” / pacing

---

## Gloss tokens for code

Map text → these keys for `getSignPose` / animation lookup:

| Phrase / word | Gloss key(s) |
|---------------|--------------|
| hello         | HELLO        |
| yes           | YES          |
| no            | NO           |
| thank you, thanks | THANK    |
| please        | PLEASE       |
| help          | HELP         |
| stop          | STOP         |
| ok, okay      | OK           |
| sorry         | SORRY        |
| wait          | WAIT         |

---

## Motion summary (for implementation)

| Sign     | Height      | Main motion                          |
|----------|-------------|--------------------------------------|
| HELLO    | forehead    | wave (rotZ or small side motion)     |
| YES      | chest       | nod up/down (rotX)                   |
| NO       | chest       | shake side to side (rotZ)            |
| THANK    | chin→out    | move hand forward (z or rotZ)       |
| PLEASE   | chest       | circle (rotY over time)              |
| HELP     | chest       | palm up, lift (rotX + y)             |
| STOP     | chest/forward | static, palm out (rotX ~0)        |
| OK       | chest       | index-thumb touch, bounce (small y)  |
| SORRY    | chest       | circle on chest (rotY)              |
| WAIT     | chest       | W-hand, small side shake (rotZ)      |

You can paste this file (or the table) into Cursor when asking to add or adjust hardcoded signs.
