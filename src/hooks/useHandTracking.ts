/**
 * useHandTracking
 *
 * Loads MediaPipe HandLandmarker (via CDN WASM) and runs inference on every
 * video frame at ~30 fps.  Returns the 21 normalized landmarks for the first
 * detected hand, or null when no hand is visible.
 *
 * Usage:
 *   const { landmarks, isReady, error } = useHandTracking(videoRef);
 */

import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export interface Landmark {
  x: number; // normalized [0, 1] — 0 = left edge of video frame
  y: number; // normalized [0, 1] — 0 = top edge of video frame
  z: number; // relative depth (negative = closer to camera)
}

interface HandTrackingState {
  /** landmarks for all detected hands (up to 2) */
  landmarks: Landmark[][] | null;
  /** true once the MediaPipe model has finished loading */
  isReady: boolean;
  /** non-null if MediaPipe failed to initialize */
  error: string | null;
}

// WASM and model are fetched from CDN to avoid bundler / path issues with Vite.
const MEDIAPIPE_WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";
const HAND_LANDMARK_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// Target inference interval: ~33 ms ≈ 30 fps
const INFERENCE_INTERVAL_MS = 33;

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement>
): HandTrackingState {
  const [state, setState] = useState<HandTrackingState>({
    landmarks: null,
    isReady: false,
    error: null,
  });

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const lastInferenceRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Load the MediaPipe WASM runtime from CDN
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: HAND_LANDMARK_MODEL_URL,
            // Try GPU delegate; MediaPipe falls back to CPU automatically
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,                    // Enable 2nd hand tracking
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (!mounted) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setState((s) => ({ ...s, isReady: true }));
        startLoop();
      } catch (err) {
        if (mounted) {
          setState((s) => ({
            ...s,
            error: `MediaPipe init failed: ${String(err)}`,
          }));
        }
      }
    }

    function startLoop() {
      function loop(timestamp: number) {
        if (!mounted) return;

        const video = videoRef.current;
        const landmarker = landmarkerRef.current;

        if (!video || !landmarker || video.readyState < 2 /* HAVE_CURRENT_DATA */) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        // Throttle to ~30 fps
        if (timestamp - lastInferenceRef.current >= INFERENCE_INTERVAL_MS) {
          lastInferenceRef.current = timestamp;

          try {
            const results = landmarker.detectForVideo(video, timestamp);

            if (results.landmarks.length > 0) {
              // Map from MediaPipe NormalizedLandmark to our Landmark type
              const allHands: Landmark[][] = results.landmarks.map(hand =>
                hand.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }))
              );
              setState((s) => ({ ...s, landmarks: allHands }));
            } else {
              setState((s) => ({ ...s, landmarks: null }));
            }
          } catch {
            // Transient inference error — skip frame, keep going
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    init();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []); // videoRef is a ref object — stable, no need in deps

  return state;
}
