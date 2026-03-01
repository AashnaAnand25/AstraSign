"""
AstraSign v3.1 — Real-time ASL Hand Shape Translator

Uses geometric rules on hand landmarks to recognize ASL signs.
No training data needed. Works on any person instantly.
Optimized for high speed and robustness.
"""
import cv2
import json
import numpy as np
import os
import time
import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision
from mediapipe import Image, ImageFormat

# ── MediaPipe ───────────────────────────────────────────────────────
HAND_MODEL = "hand_landmarker.task"
hand_opts = mp_vision.HandLandmarkerOptions(
    base_options=mp_tasks.BaseOptions(model_asset_path=HAND_MODEL),
    running_mode=mp_vision.RunningMode.IMAGE,
    num_hands=2,
    min_hand_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)

# ── Finger detection geometry ───────────────────────────────────────
# MediaPipe hand landmark indices:
# Thumb:  1(CMC) 2(MCP) 3(IP) 4(TIP)
# Index:  5(MCP) 6(PIP) 7(DIP) 8(TIP)
# Middle: 9(MCP) 10(PIP) 11(DIP) 12(TIP)
# Ring:  13(MCP) 14(PIP) 15(DIP) 16(TIP)
# Pinky: 17(MCP) 18(PIP) 19(DIP) 20(TIP)
# Wrist: 0

def get_finger_states(landmarks):
    """
    Determine which fingers are extended.
    Returns: [thumb, index, middle, ring, pinky] as booleans
    """
    pts = np.array([[l.x, l.y, l.z] for l in landmarks])
    wrist = pts[0]

    states = []

    # Thumb: Use the distance from the palm center (wrist + MCPs)
    # Thumb is "out" if tip is significantly farther from palm than IP joint
    palm_center = np.mean(pts[[0, 5, 17]], axis=0) # wrist, index MCP, pinky MCP
    tip_dist = np.linalg.norm(pts[4] - palm_center)
    ip_dist = np.linalg.norm(pts[3] - palm_center)
    states.append(tip_dist > ip_dist * 1.1)

    # Other fingers: extended if tip is farther from wrist than PIP
    for tip_idx, pip_idx in [(8, 6), (12, 10), (16, 14), (20, 18)]:
        tip_dist_wrist = np.linalg.norm(pts[tip_idx] - wrist)
        pip_dist_wrist = np.linalg.norm(pts[pip_idx] - wrist)
        states.append(tip_dist_wrist > pip_dist_wrist)

    return states


def fingers_touching(landmarks, idx_a, idx_b, threshold=0.06):
    """Check if two landmark points are close together."""
    pts = np.array([[l.x, l.y, l.z] for l in landmarks])
    dist = np.linalg.norm(pts[idx_a] - pts[idx_b])
    return dist < threshold


def is_fist(states):
    """No fingers extended (or just thumb)."""
    return not any(states[1:])  # index through pinky all curled


def classify_sign(landmarks):
    """
    Classify the hand configuration into an ASL sign.
    Returns: (sign_name, confidence)
    """
    states = get_finger_states(landmarks)
    thumb, index, middle, ring, pinky = states
    pts = np.array([[l.x, l.y, l.z] for l in landmarks])

    # Count extended fingers
    extended_count = sum(states)

    # ── Static ASL Signs ────────────────────────────────────────

    # I LOVE YOU: thumb + index + pinky extended, middle + ring curled
    if thumb and index and not middle and not ring and pinky:
        return "I Love You", 0.98

    # PEACE / V: index + middle extended, rest curled
    if not thumb and index and middle and not ring and not pinky:
        return "Peace / 2", 0.95

    # THUMBS UP: only thumb extended
    if thumb and not index and not middle and not ring and not pinky:
        # Check if thumb is pointing upward (tip.y < mcp.y)
        if pts[4][1] < pts[3][1]:
            return "Good / Thumbs Up", 0.92
        else:
            return "A / Done", 0.80

    # OK sign: thumb and index touching, others extended
    if fingers_touching(landmarks, 4, 8, 0.08) and middle and ring and pinky:
        return "OK", 0.95

    # HELLO / 5: all 5 fingers extended
    if all(states):
        return "Hello / 5", 0.90

    # FIST / S: no fingers extended
    if is_fist(states) and not thumb:
        return "Fist / S", 0.90

    # 1 / INDEX: only index extended
    if not thumb and index and not middle and not ring and not pinky:
        return "1 / Index", 0.90

    # 3: thumb + index + middle extended
    if thumb and index and middle and not ring and not pinky:
        return "3", 0.90

    # 4: all except thumb
    if not thumb and index and middle and ring and pinky:
        return "4", 0.90

    # Y / CALL ME: thumb + pinky extended
    if thumb and not index and not middle and not ring and pinky:
        return "Y / Call Me", 0.95

    # L shape: thumb + index extended
    if thumb and index and not middle and not ring and not pinky:
        return "L", 0.90

    # W / 6: index + middle + ring extended
    if not thumb and index and middle and ring and not pinky:
        return "W / 6", 0.90

    # ROCK ON: index + pinky extended
    if not thumb and index and not middle and not ring and pinky:
        return "Rock On", 0.90

    return f"({extended_count} fingers)", 0.20


def draw_hands(frame, result):
    """Draw hand skeleton on frame."""
    h, w = frame.shape[:2]
    connections = [
        (0,1),(1,2),(2,3),(3,4),
        (0,5),(5,6),(6,7),(7,8),
        (5,9),(9,10),(10,11),(11,12),
        (9,13),(13,14),(14,15),(15,16),
        (13,17),(17,18),(18,19),(19,20),(0,17)
    ]
    hand_colors = [(0, 255, 128), (255, 200, 0)]
    for hand_idx, hand_lms in enumerate(result.hand_landmarks):
        color = hand_colors[hand_idx % 2]
        pts = [(int(l.x * w), int(l.y * h)) for l in hand_lms]
        for a, b in connections:
            cv2.line(frame, pts[a], pts[b], color, 2)
        for pt in pts:
            cv2.circle(frame, pt, 5, (255, 255, 255), -1)
            cv2.circle(frame, pt, 3, color, -1)


def main():
    print("\n🤟 AstraSign — ASL Hand Shape Translator")
    print("   Rule-based logic (v3.1) active.")
    print("   Press 'C' to clear. Press Esc to exit.\n")

    sentence = []
    last_sign = ""
    stable_count = 0
    fps = 0.0
    prev_time = time.time()

    cap = cv2.VideoCapture(0)

    with mp_vision.HandLandmarker.create_from_options(hand_opts) as hand_det:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                continue

            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            mp_img = Image(image_format=ImageFormat.SRGB, data=rgb)
            result = hand_det.detect(mp_img)

            current_sign = ""

            if result.hand_landmarks:
                draw_hands(frame, result)

                # Classify each detected hand
                signs_found = []
                for i, hand_lms in enumerate(result.hand_landmarks):
                    label = result.handedness[i][0].display_name
                    sign, conf = classify_sign(hand_lms)
                    signs_found.append((label, sign, conf))

                # Use the sign with highest confidence
                best = max(signs_found, key=lambda x: x[2])
                current_sign = best[1]
                conf = best[2]

                # Draw current detection
                color = (0, 255, 0) if conf > 0.7 else (0, 200, 255)
                cv2.rectangle(frame, (0, 55), (350, 95), (40, 40, 40), -1)
                text = f"{current_sign} ({conf:.0%})"
                cv2.putText(frame, text, (10, 85),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

                # Show finger state debug info
                for i, hand_lms in enumerate(result.hand_landmarks):
                    s = get_finger_states(hand_lms)
                    fingers = ['T', 'I', 'M', 'R', 'P']
                    state_str = ' '.join(f"{f}:{'UP' if val else '--'}" for f, val in zip(fingers, s))
                    y_pos = 120 + i * 25
                    cv2.putText(frame, state_str, (10, y_pos),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

                # Stability: add to sentence after 6 consistent frames (approx 0.4s)
                if current_sign == last_sign and conf > 0.6:
                    stable_count += 1
                else:
                    stable_count = 0
                    last_sign = current_sign

                if stable_count == 6:
                    if not sentence or sentence[-1] != current_sign:
                        sentence.append(current_sign)
            else:
                cv2.rectangle(frame, (0, 55), (400, 95), (40, 40, 40), -1)
                cv2.putText(frame, "Show your hand to the camera", (10, 85),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 100, 255), 2)
                stable_count = 0

            if len(sentence) > 8:
                sentence = sentence[-8:]

            # FPS
            now = time.time()
            fps = 0.9 * fps + 0.1 * (1.0 / max(now - prev_time, 0.001))
            prev_time = now

            # Header
            cv2.rectangle(frame, (0, 0), (frame.shape[1], 50), (30, 30, 30), -1)
            sent_text = ' → '.join(sentence) if sentence else "Waiting for sign..."
            cv2.putText(frame, sent_text, (10, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            cv2.putText(frame, f"FPS: {fps:.0f}", (frame.shape[1] - 120, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            cv2.imshow('AstraSign', frame)

            key = cv2.waitKey(1) & 0xFF
            if key == 27:
                break
            elif key in (ord('c'), ord('C')):
                sentence.clear()

    cap.release()
    cv2.destroyAllWindows()


if __name__ == '__main__':
    main()
