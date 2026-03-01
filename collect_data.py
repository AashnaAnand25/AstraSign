"""
collect_data.py — Webcam-based ASL training data collector.

Usage:
  python collect_data.py

Instructions will appear on-screen. You record signs one at a time,
and the script saves normalized hand landmarks to training_data/.
"""
import cv2
import numpy as np
import os
import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision
from mediapipe import Image, ImageFormat

HAND_MODEL = "hand_landmarker.task"
DATA_DIR = "training_data"

# ── Hand landmark extraction & normalization ──────────────────────

def get_hand_landmarks(rgb_frame, hand_det):
    """
    Detect hands and return normalized landmark vectors.
    Returns: (left_hand_vec, right_hand_vec) each of shape (63,)
    Normalized: all coordinates are relative to wrist and scaled by hand size.
    """
    mp_img = Image(image_format=ImageFormat.SRGB, data=rgb_frame)
    result = hand_det.detect(mp_img)
    
    lh = np.zeros(63)
    rh = np.zeros(63)
    
    for i, handedness_list in enumerate(result.handedness):
        label = handedness_list[0].display_name  # 'Left' or 'Right'
        landmarks = result.hand_landmarks[i]
        
        # Extract raw coordinates
        coords = np.array([[l.x, l.y, l.z] for l in landmarks])  # (21, 3)
        
        # Normalize: center on wrist (landmark 0)
        wrist = coords[0].copy()
        coords -= wrist
        
        # Scale by hand size (distance from wrist to middle finger tip)
        middle_tip = coords[9]  # Middle finger MCP
        scale = np.linalg.norm(middle_tip) + 1e-6
        coords /= scale
        
        vec = coords.flatten()  # (63,)
        if label == 'Left':
            lh = vec
        else:
            rh = vec
    
    return lh, rh


def draw_hand_dots(frame, rgb, hand_det):
    """Draw detected hand landmarks on frame."""
    mp_img = Image(image_format=ImageFormat.SRGB, data=rgb)
    result = hand_det.detect(mp_img)
    h, w = frame.shape[:2]
    
    for hand_lms in result.hand_landmarks:
        pts = [(int(l.x * w), int(l.y * h)) for l in hand_lms]
        for pt in pts:
            cv2.circle(frame, pt, 5, (0, 255, 128), -1)
        # Draw connections
        connections = [
            (0,1),(1,2),(2,3),(3,4),
            (0,5),(5,6),(6,7),(7,8),
            (5,9),(9,10),(10,11),(11,12),
            (9,13),(13,14),(14,15),(15,16),
            (13,17),(17,18),(18,19),(19,20),(0,17)
        ]
        for a, b in connections:
            cv2.line(frame, pts[a], pts[b], (0, 200, 100), 2)


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    hand_opts = mp_vision.HandLandmarkerOptions(
        base_options=mp_tasks.BaseOptions(model_asset_path=HAND_MODEL),
        running_mode=mp_vision.RunningMode.IMAGE,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    
    with mp_vision.HandLandmarker.create_from_options(hand_opts) as hand_det:
        cap = cv2.VideoCapture(0)
        
        # Pre-defined common ASL signs to collect
        default_signs = [
            "hello", "thank_you", "yes", "no", "please",
            "sorry", "help", "i_love_you", "good", "bad",
            "more", "stop", "eat", "drink", "water",
            "family", "friend", "school", "work", "home"
        ]
        
        print("\n🤟 AstraSign — Data Collector")
        print("=" * 50)
        print("Default signs to collect:")
        for i, s in enumerate(default_signs):
            print(f"  {i+1}. {s}")
        print("\nYou can also type custom sign names.")
        print("Type 'done' when finished collecting.\n")
        
        signs_to_collect = []
        while True:
            inp = input("Enter sign name (or 'all' for defaults, 'done' to finish): ").strip().lower()
            if inp == 'done':
                break
            elif inp == 'all':
                signs_to_collect = default_signs.copy()
                break
            elif inp:
                signs_to_collect.append(inp.replace(' ', '_'))
        
        if not signs_to_collect:
            print("No signs to collect. Exiting.")
            return
        
        SAMPLES_PER_SIGN = 30
        
        for sign_name in signs_to_collect:
            sign_dir = os.path.join(DATA_DIR, sign_name)
            os.makedirs(sign_dir, exist_ok=True)
            existing = len([f for f in os.listdir(sign_dir) if f.endswith('.npy')])
            
            print(f"\n--- Collecting: '{sign_name}' ({existing} existing samples) ---")
            print(f"    Show the sign and press 'R' to record {SAMPLES_PER_SIGN} samples.")
            print(f"    Press 'S' to skip this sign. Press 'Q' to quit entirely.")
            
            collected = 0
            recording = False
            record_count = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    continue
                
                frame = cv2.flip(frame, 1)
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Draw hand skeleton
                draw_hand_dots(frame, rgb, hand_det)
                
                # Status bar
                cv2.rectangle(frame, (0, 0), (frame.shape[1], 50), (30, 30, 30), -1)
                if recording:
                    status = f"RECORDING '{sign_name}': {record_count}/{SAMPLES_PER_SIGN}"
                    cv2.putText(frame, status, (10, 35),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                else:
                    status = f"Show '{sign_name}' — press R to record, S to skip"
                    cv2.putText(frame, status, (10, 35),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
                cv2.imshow('AstraSign — Data Collector', frame)
                
                if recording:
                    lh, rh = get_hand_landmarks(rgb, hand_det)
                    combined = np.concatenate([lh, rh])  # (126,)
                    
                    # Only save if at least one hand is detected
                    if np.any(lh != 0) or np.any(rh != 0):
                        idx = existing + collected
                        np.save(os.path.join(sign_dir, f"sample_{idx:04d}.npy"), combined)
                        collected += 1
                        record_count += 1
                    
                    if record_count >= SAMPLES_PER_SIGN:
                        recording = False
                        print(f"    ✅ Collected {collected} samples for '{sign_name}'")
                        break
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord('r') or key == ord('R'):
                    recording = True
                    record_count = 0
                    print(f"    🔴 Recording started...")
                elif key == ord('s') or key == ord('S'):
                    print(f"    ⏭️  Skipped '{sign_name}'")
                    break
                elif key == ord('q') or key == ord('Q') or key == 27:
                    print("Quitting collector.")
                    cap.release()
                    cv2.destroyAllWindows()
                    return
        
        cap.release()
        cv2.destroyAllWindows()
        
        # Summary
        print("\n" + "=" * 50)
        print("Collection complete! Summary:")
        for sign_name in signs_to_collect:
            sign_dir = os.path.join(DATA_DIR, sign_name)
            if os.path.exists(sign_dir):
                n = len([f for f in os.listdir(sign_dir) if f.endswith('.npy')])
                print(f"  {sign_name}: {n} samples")
        print(f"\nRun 'python train_classifier.py' to train the model.")


if __name__ == '__main__':
    main()
