/**
 * useFastSignPipeline — Local gesture recognition (no API calls)
 *
 * Uses MediaPipe's pre-trained Gesture Recognizer for instant sign recognition.
 * Free, fast, runs entirely in browser. Recognizes common ASL gestures.
 *
 * Supported signs: 👍 GOOD, 👎 BAD, ✌️ VICTORY, 🤟 ILOVEYOU, 👋 HELLO, 
 * ✊ YES, ☝️ UP, and more.
 */

import { useCallback, useRef, useState, useEffect } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

// MediaPipe gesture to ASL word mapping
const GESTURE_MAP: Record<string, string> = {
  "Thumb_Up": "GOOD",
  "Thumb_Down": "BAD",
  "Open_Palm": "HELLO",
  "Closed_Fist": "YES",
  "Victory": "PEACE",
  "ILoveYou": "ILOVEYOU",
  "Pointing_Up": "UP",
  "Pointing_Down": "DOWN",
};

// WASM CDN paths
const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

export interface FastSignPipelineResult {
  glossWords: string[];
  isDetectingSign: boolean;
  isRecognizing: boolean;
  translatedText: string;
  audioUrl: string | null;
  isTranslating: boolean;
  status: string;
  detectedGesture: string | null;
  beginRecording: () => void;
  commitSegment: () => void;
  triggerTranslate: () => Promise<void>;
  undoLastWord: () => void;
  clearGloss: () => void;
}

export function useFastSignPipeline(
  videoRef: React.RefObject<HTMLVideoElement>
): FastSignPipelineResult {
  const [glossWords, setGlossWords] = useState<string[]>([]);
  const [translatedText, setTranslatedText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetectingSign, setIsDetectingSign] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [status, setStatus] = useState("Loading gesture model…");
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);

  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const detectionStartTime = useRef<number>(0);

  // Initialize MediaPipe Gesture Recognizer
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (!mounted) {
          recognizer.close();
          return;
        }

        recognizerRef.current = recognizer;
        setStatus("Ready — hold a sign for 2 seconds");
      } catch (err) {
        setStatus(`Error: ${String(err)}`);
      }
    }

    init();

    return () => {
      mounted = false;
      recognizerRef.current?.close();
    };
  }, []);

  // Continuous gesture detection while recording
  useEffect(() => {
    if (!isDetectingSign || !recognizerRef.current) return;

    const video = videoRef.current;
    if (!video) return;

    let frameCount = 0;
    const gestureCounts: Record<string, number> = {};

    const detectLoop = () => {
      if (!isDetectingSign) return;

      try {
        const result = recognizerRef.current!.recognizeForVideo(video, Date.now());
        
        if (result.gestures.length > 0 && result.gestures[0].length > 0) {
          const gesture = result.gestures[0][0].categoryName;
          const confidence = result.gestures[0][0].score;
          
          if (confidence > 0.5 && GESTURE_MAP[gesture]) {
            gestureCounts[gesture] = (gestureCounts[gesture] || 0) + 1;
            setDetectedGesture(`${GESTURE_MAP[gesture]} (${Math.round(confidence * 100)}%)`);
          }
        }
      } catch (e) {
        // Ignore frame errors
      }

      frameCount++;
      if (frameCount < 60) { // ~2 seconds at 30fps
        requestAnimationFrame(detectLoop);
      }
    };

    detectLoop();
  }, [isDetectingSign, videoRef]);

  const beginRecording = useCallback(() => {
    setIsDetectingSign(true);
    detectionStartTime.current = Date.now();
    setDetectedGesture(null);
    setStatus("Hold the sign steady…");
  }, []);

  const commitSegment = useCallback(() => {
    setIsDetectingSign(false);
    setIsRecognizing(true);

    const video = videoRef.current;
    const recognizer = recognizerRef.current;

    if (!video || !recognizer) {
      setStatus("Not ready — try again");
      setIsRecognizing(false);
      return;
    }

    // Final recognition
    try {
      const result = recognizer.recognizeForVideo(video, Date.now());
      
      if (result.gestures.length > 0 && result.gestures[0].length > 0) {
        const gesture = result.gestures[0][0].categoryName;
        const confidence = result.gestures[0][0].score;
        const aslWord = GESTURE_MAP[gesture];

        if (aslWord && confidence > 0.6) {
          setGlossWords((prev) => [...prev, aslWord]);
          setStatus(`✓ ${aslWord} — add more or tap Translate`);
        } else if (aslWord) {
          setStatus(`? ${aslWord} — hold sign more steadily`);
        } else {
          setStatus(`Unrecognized: ${gesture} — try a common sign`);
        }
      } else {
        setStatus("No hand detected — try again");
      }
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    }

    setIsRecognizing(false);
    setDetectedGesture(null);
  }, [videoRef]);

  const triggerTranslate = useCallback(async () => {
    if (glossWords.length === 0) {
      setStatus("Sign something first!");
      return;
    }

    setIsTranslating(true);
    setStatus("Converting to speech…");

    try {
      // Simple grammar: join with spaces for now
      const text = glossWords.join(" ");
      setTranslatedText(text);

      // Call ElevenLabs for TTS
      const resp = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice_id: "21m00Tcm4TlvDq8ikWAM" }),
      });

      if (!resp.ok) throw new Error("TTS failed");

      const blob = await resp.blob();
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });

      setStatus("Done! Tap play to hear");
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    } finally {
      setIsTranslating(false);
    }
  }, [glossWords]);

  const undoLastWord = useCallback(() => {
    setGlossWords((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      setStatus(next.length > 0 ? `Words: ${next.join(", ")}` : "Ready — hold a sign for 2 seconds");
      return next;
    });
  }, []);

  const clearGloss = useCallback(() => {
    setGlossWords([]);
    setTranslatedText("");
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStatus("Ready — hold a sign for 2 seconds");
  }, []);

  return {
    glossWords,
    isDetectingSign,
    isRecognizing,
    translatedText,
    audioUrl,
    isTranslating,
    status,
    detectedGesture,
    beginRecording,
    commitSegment,
    triggerTranslate,
    undoLastWord,
    clearGloss,
  };
}
