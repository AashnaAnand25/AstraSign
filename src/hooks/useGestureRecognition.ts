/**
 * useGestureRecognition
 *
 * Uses MediaPipe's pre-trained Gesture Recognizer for local sign recognition.
 * Runs entirely in browser - no API calls, no rate limits.
 * Recognizes common hand gestures: 👍 👎 ✌️ 🤟 👌 ☝️ ✊ 👋 and more.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

// Map MediaPipe gestures to ASL words
const GESTURE_TO_ASL: Record<string, string> = {
  "Thumb_Up": "GOOD",
  "Thumb_Down": "BAD",
  "Open_Palm": "HELLO",
  "Closed_Fist": "YES",
  "Victory": "VICTORY",
  "ILoveYou": "ILOVEYOU",
  "Pointing_Up": "UP",
  "None": "",
};

interface GestureState {
  gesture: string | null;
  aslWord: string | null;
  isReady: boolean;
  error: string | null;
}

// WASM and model from CDN
const MEDIAPIPE_WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";
const GESTURE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

export function useGestureRecognition(
  videoRef: React.RefObject<HTMLVideoElement>
): GestureState & { recognizeGesture: () => string | null } {
  const [state, setState] = useState<GestureState>({
    gesture: null,
    aslWord: null,
    isReady: false,
    error: null,
  });

  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const rafRef = useRef<number>(0);

  // Initialize gesture recognizer
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: GESTURE_MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (!mounted) {
          recognizer.close();
          return;
        }

        recognizerRef.current = recognizer;
        setState((s) => ({ ...s, isReady: true }));
      } catch (err) {
        if (mounted) {
          setState((s) => ({
            ...s,
            error: `Gesture recognizer failed: ${String(err)}`,
          }));
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      recognizerRef.current?.close();
    };
  }, []);

  // Recognize gesture from current video frame
  const recognizeGesture = useCallback((): string | null => {
    const video = videoRef.current;
    const recognizer = recognizerRef.current;

    if (!video || !recognizer || video.readyState < 2) {
      return null;
    }

    try {
      const result = recognizer.recognizeForVideo(video, Date.now());
      
      if (result.gestures.length > 0 && result.gestures[0].length > 0) {
        const gestureName = result.gestures[0][0].categoryName;
        const aslWord = GESTURE_TO_ASL[gestureName] || null;
        
        setState((s) => ({
          ...s,
          gesture: gestureName,
          aslWord,
        }));
        
        return aslWord;
      }
      
      return null;
    } catch (err) {
      console.error("Gesture recognition error:", err);
      return null;
    }
  }, [videoRef]);

  return {
    ...state,
    recognizeGesture,
  };
}
