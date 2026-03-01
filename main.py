"""
AstraSign v3.5 — Pro Adaptive Motion Engine

Technical Upgrades:
- Adaptive EMA Smoothing: Scalable alpha for zero lag + high stability.
- Frequency-Based Analysis: Peak counting for YES (nodding) and NO (tapping).
- Proximity-Aware Multi-Hand Signs: MEDICINE & BREATHE require hand closeness.
- Multi-hand emergency logic.
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
from collections import deque

# ── MediaPipe ───────────────────────────────────────────────────────
HAND_MODEL = "hand_landmarker.task"
hand_opts = mp_vision.HandLandmarkerOptions(
    base_options=mp_tasks.BaseOptions(model_asset_path=HAND_MODEL),
    running_mode=mp_vision.RunningMode.IMAGE,
    num_hands=2,
    min_hand_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)

# ── Smoothing & Motion Classes ──────────────────────────────────────

class LandmarkSmoother:
    """Adaptive EMA: auto-scales alpha based on hand velocity."""
    def __init__(self):
        self.prev_pts = None

    def smooth(self, landmarks, velocity):
        curr_pts = np.array([[l.x, l.y, l.z] for l in landmarks])
        if self.prev_pts is None:
            self.prev_pts = curr_pts
            return curr_pts
        
        # Adaptive Alpha: Scale with velocity (0.2 slow/stable, 0.8 fast/zero-lag)
        # Typical normalization: vel 0.005 is slow, 0.05 is fast
        alpha = np.clip(velocity * 10.0, 0.2, 0.8)
        
        smoothed = alpha * curr_pts + (1 - alpha) * self.prev_pts
        self.prev_pts = smoothed
        return smoothed

class HandHistory:
    """Maintains a buffer for motion frequency and velocity analysis."""
    def __init__(self, max_len=30):
        self.buffer = deque(maxlen=max_len)

    def add(self, pts):
        self.buffer.append(pts)

    def get_velocity(self):
        """Standard velocity of the wrist."""
        if len(self.buffer) < 2: return 0.005 # default
        v = np.linalg.norm(self.buffer[-1][0] - self.buffer[-2][0])
        return v

    def count_vertical_peaks(self):
        """Count vertical (Y-axis) reversals for nodding detection."""
        if len(self.buffer) < 15: return 0
        y_vals = [p[0][1] for p in self.buffer]
        peaks = 0
        for i in range(1, len(y_vals)-1):
            if (y_vals[i] > y_vals[i-1] and y_vals[i] > y_vals[i+1]) or \
               (y_vals[i] < y_vals[i-1] and y_vals[i] < y_vals[i+1]):
                if abs(y_vals[i] - y_vals[i-1]) > 0.008:
                    peaks += 1
        return peaks

# ── Core Geometric Logic ──────────────────────────────────────────

def get_finger_states(pts):
    wrist = pts[0]
    states = []
    palm_center = np.mean(pts[[0, 5, 17]], axis=0) 
    tip_dist = np.linalg.norm(pts[4] - palm_center)
    ip_dist = np.linalg.norm(pts[3] - palm_center)
    states.append(tip_dist > ip_dist * 1.1)

    for tip_idx, pip_idx in [(8, 6), (12, 10), (16, 14), (20, 18)]:
        tip_wrist_dist = np.linalg.norm(pts[tip_idx] - wrist)
        pip_wrist_dist = np.linalg.norm(pts[pip_idx] - wrist)
        states.append(tip_wrist_dist > pip_wrist_dist)
    return states

def classify_hand(pts, history):
    states = get_finger_states(pts)
    thumb, index, middle, ring, pinky = states
    
    peaks = history.count_vertical_peaks()
    vel = history.get_velocity()

    # 1. YES (Proper): Node detected by 2+ vertical peaks in window
    if not any(states[1:]) and thumb and peaks >= 2:
        return "YES (Nodding)", 0.98

    # 2. NO (Proper): Tapping tips detection (high frequency)
    tips_dist = np.linalg.norm(pts[4]-pts[8]) + np.linalg.norm(pts[4]-pts[12])
    if tips_dist < 0.15 and not ring and not pinky and peaks >= 3:
         return "NO (Tapping)", 0.95

    # 3. HELP: Thumbs up down-stroke
    if thumb and not any(states[1:]) and vel > 0.015:
        return "HELP", 0.95

    # 4. STOP / HELLO: Open Palm
    if all(states):
        return "STOP / HELLO", 0.95

    # 5. WATER / WE: W-Shape
    if not thumb and index and middle and ring and not pinky:
        return "WATER / WE", 0.95

    # 6. I / ME: Pinky Only
    if not thumb and not index and not middle and not ring and pinky:
        return "I / ME", 0.95

    # 7. YOU: Index Only
    if not thumb and index and not middle and not ring and not pinky:
        return "YOU", 0.95

    # 8. HURT: Middle Only
    if not thumb and not index and middle and not ring and not pinky:
        return "HURT / PAIN", 0.95

    # 9. LOVE: ILY
    if thumb and index and not middle and not ring and pinky:
        return "LOVE", 0.98

    # 10. OK: F-shape
    dist_ti = np.linalg.norm(pts[4] - pts[8])
    if dist_ti < 0.06 and middle and ring and pinky:
        return "OK", 0.95

    # 11. AND / L
    if thumb and index and not middle and not ring and not pinky:
        return "AND / L", 0.90

    extended_count = sum(states)
    return f"({extended_count} fingers)", 0.10

def draw_vibrant_hands(frame, pts, color):
    h, w = frame.shape[:2]
    connections = [(0,1),(1,2),(2,3),(3,4),(0,5),(5,6),(6,7),(7,8),(5,9),(9,10),(10,11),(11,12),
                   (9,13),(13,14),(14,15),(15,16),(13,17),(17,18),(18,19),(19,20),(0,17)]
    px = [(int(p[0]*w), int(p[1]*h)) for p in pts]
    for a, b in connections:
        cv2.line(frame, px[a], px[b], color, 4)
    for p in px:
        cv2.circle(frame, p, 7, (255,255,255), -1)
        cv2.circle(frame, p, 5, color, -1)

def main():
    print("\n🚀 AstraSign v3.5 — Adaptive Motion active.")
    print("   Nod your fist for YES, tap your tips for NO.")

    sentence = []
    last_sign = ""
    stable_count = 0
    fps = 0.0
    prev_time = time.time()
    
    smoothers = [LandmarkSmoother(), LandmarkSmoother()]
    histories = [HandHistory(), HandHistory()]

    cap = cv2.VideoCapture(0)
    with mp_vision.HandLandmarker.create_from_options(hand_opts) as hand_det:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            frame = cv2.flip(frame, 1)
            h, w, c = frame.shape
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_img = Image(image_format=ImageFormat.SRGB, data=rgb)
            result = hand_det.detect(mp_img)

            current_sign = ""
            conf = 0.0

            if result.hand_landmarks:
                signs_found = []
                centers = []
                for i, lms in enumerate(result.hand_landmarks):
                    vel = histories[i % 2].get_velocity()
                    pts = smoothers[i % 2].smooth(lms, vel)
                    histories[i % 2].add(pts)
                    centers.append(pts[0]) # Wrist
                    
                    color = (0, 255, 128) if i==0 else (255, 200, 0)
                    draw_vibrant_hands(frame, pts, color)
                    
                    s, c = classify_hand(pts, histories[i % 2])
                    signs_found.append(s)
                    if c > conf: conf = c

                # Multi-hand proximity check
                if len(signs_found) == 2:
                    dist = np.linalg.norm(centers[0] - centers[1])
                    if dist < 0.25: # Hands must be close
                        if "STOP / HELLO" in signs_found and "STOP / HELLO" in signs_found:
                            current_sign = "BREATHE"
                        elif "STOP / HELLO" in signs_found and "HURT / PAIN" in signs_found:
                            current_sign = "MEDICINE"
                        else:
                            current_sign = signs_found[0]
                    else:
                        current_sign = signs_found[0]
                else:
                    current_sign = signs_found[0]

                # UI
                cv2.rectangle(frame, (0, 55), (420, 110), (20, 20, 20), -1)
                cv2.putText(frame, current_sign.upper(), (20, 95), cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 255, 0), 4)
                
                if current_sign == last_sign:
                    stable_count += 1
                else:
                    stable_count = 0
                    last_sign = current_sign

                if stable_count == 6:
                    if not sentence or sentence[-1] != current_sign:
                        sentence.append(current_sign)
            else:
                stable_count = 0

            # Header
            if len(sentence) > 6: sentence = sentence[-6:]
            cv2.rectangle(frame, (0, 0), (w, 50), (10, 10, 10), -1)
            sent_str = " → ".join(sentence) if sentence else "ASTRASIGN PRO READY"
            cv2.putText(frame, sent_str.upper(), (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

            now = time.time()
            fps = 0.9 * fps + 0.1 * (1.0 / max(now - prev_time, 0.001))
            prev_time = now
            cv2.putText(frame, f"FPS: {int(fps)}", (w - 110, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            cv2.imshow('AstraSign 3.5 Adaptive', frame)
            if (cv2.waitKey(1) & 0xFF) == 27: break
            elif (cv2.waitKey(1) & 0xFF) == ord('c'): sentence.clear()

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
