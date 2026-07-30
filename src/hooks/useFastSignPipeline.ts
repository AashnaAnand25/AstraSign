/**
 * useFastSignPipeline — Local gesture recognition (no API calls)
 *
 * Uses MediaPipe's pre-trained Gesture Recognizer for instant sign recognition.
 * Free, fast, runs entirely in browser. Recognizes common ASL gestures.
 *
 * Supported signs: 👍 GOOD, 👎 BAD, ✌️ VICTORY, 🤟 ILOVEYOU, 👋 HELLO, 
 * ✊ YES, ☝️ UP, and more.
 */

import { useCallback, useRef, useState, useEffect, Dispatch, SetStateAction, RefObject } from "react";
import { Landmark, LandmarkSmoother, HandHistory, classifyAslSign, RecognitionResult } from "@/services/AslEngine";
import { getContextBias, fuseScores } from "@/services/ContextModel";
import { fetchSpeechUrl, speakNative } from "@/services/api";

export interface FastSignPipelineResult {
  glossWords: string[];
  isDetectingSign: boolean;
  isRecognizing: boolean;
  translatedText: string;
  audioUrl: string | null;
  isTranslating: boolean;
  status: string;
  detectedGesture: string | null;
  suggestions: string[];
  beginRecording: () => void;
  commitSegment: () => void;
  triggerTranslate: () => Promise<void>;
  undoLastWord: () => void;
  clearGloss: () => void;
  setGlossWords: Dispatch<SetStateAction<string[]>>;
}

export function useFastSignPipeline(
  videoRef: RefObject<HTMLVideoElement>,
  landmarks: Landmark[][] | null
): FastSignPipelineResult {
  const [glossWords, setGlossWords] = useState<string[]>([]);
  const [translatedText, setTranslatedText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetectingSign, setIsDetectingSign] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [status, setStatus] = useState("Awaiting hand sign…");
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const smootherRef = useRef<LandmarkSmoother>(new LandmarkSmoother());
  const historyRef = useRef<HandHistory>(new HandHistory());
  const confidenceAccumulator = useRef<Record<string, number>>({});
  const lastSignRef = useRef<string | null>(null);

  // Confidence threshold to commit a sign (integrated over time)
  const COMMIT_THRESHOLD = 3.5;

  // Run recognition engine whenever landmarks update
  useEffect(() => {
    if (!landmarks || landmarks.length === 0 || !isDetectingSign) {
      if (!landmarks || landmarks.length === 0) setDetectedGesture(null);
      return;
    }

    // Process all hands (for now we use the first hand as primary, but check both for BREATHE/MEDICINE)
    const handResults = landmarks.map((handLms) => {
      // In a more complex app, we'd use separate smoothers/histories per hand index. 
      // For this MVP, we analyze the 'focus' hand but allow multi-hand combos.
      const vel = historyRef.current.getVelocity();
      const smoothed = smootherRef.current.smooth(handLms, vel);
      historyRef.current.add(smoothed);

      const { word, confidence, allScores } = classifyAslSign(smoothed, historyRef.current);
      return { word, confidence, allScores, pts: smoothed };
    });

    let finalWord = handResults[0].word;
    let finalConf = handResults[0].confidence;

    // Multi-hand proximity logic (v3.5 Pro)
    if (handResults.length === 2) {
      const h1 = handResults[0];
      const h2 = handResults[1];
      const dist = Math.sqrt(
        Math.pow(h1.pts[0].x - h2.pts[0].x, 2) +
        Math.pow(h1.pts[0].y - h2.pts[0].y, 2)
      );

      if (dist < 0.25) {
        if (h1.word === "STOP" && h2.word === "STOP") {
          finalWord = "BREATHE";
          finalConf = 0.98;
        } else if ((h1.word === "STOP" && h2.word === "HURT / PAIN") ||
          (h2.word === "STOP" && h1.word === "HURT / PAIN")) {
          finalWord = "MEDICINE";
          finalConf = 0.98;
        }
      }
    }

    // 4. Score Fusion (Geo + Context)
    const lastWord = glossWords.length > 0 ? glossWords[glossWords.length - 1] : null;
    const contextWeights = getContextBias(lastWord);
    const fusedScores = fuseScores(handResults[0].allScores, contextWeights);

    // 5. High-Speed Rolling Accumulation
    let currentBestWord = "NONE";
    let currentBestScore = 0;

    for (const [word, score] of Object.entries(fusedScores)) {
      if (score > 0.4) {
        confidenceAccumulator.current[word] = (confidenceAccumulator.current[word] || 0) + score;
      } else {
        // Natural decay for scores not actively detected
        confidenceAccumulator.current[word] = Math.max(0, (confidenceAccumulator.current[word] || 0) - 0.25);
      }

      if (confidenceAccumulator.current[word] > currentBestScore) {
        currentBestScore = confidenceAccumulator.current[word];
        currentBestWord = word;
      }
    }

    setDetectedGesture(currentBestWord !== "NONE" ? currentBestWord : null);

    // 6. Update Top-3 Suggestions for UI
    const tops = Object.entries(confidenceAccumulator.current as Record<string, number>)
      .filter(([_, score]) => score > 0.5)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([word]) => word);
    setSuggestions(tops);

    // 7. Threshold-based Commitment (v4.0 Speed)
    if (currentBestScore >= COMMIT_THRESHOLD) {
      const finalWord = currentBestWord;
      setGlossWords((prev) => {
        if (prev.length > 0 && prev[prev.length - 1] === finalWord) return prev;
        return [...prev, finalWord];
      });
      setStatus(`✓ ${finalWord} — recognized!`);

      // Flash reset accumulator after commit
      confidenceAccumulator.current = {};
    }

  }, [landmarks, isDetectingSign]);

  const beginRecording = useCallback(() => {
    setIsDetectingSign(true);
    setDetectedGesture(null);
    setStatus("Position hand and start signing…");
    confidenceAccumulator.current = {};
    lastSignRef.current = null;
  }, []);

  const commitSegment = useCallback(() => {
    setIsDetectingSign(false);
    setStatus("Ready for next sign");
  }, []);

  const triggerTranslate = useCallback(async () => {
    if (glossWords.length === 0) {
      setStatus("Sign something first!");
      return;
    }

    setIsTranslating(true);
    setStatus("Converting to speech…");

    // Simple grammar: join with spaces for now
    const text = glossWords.join(" ");
    setTranslatedText(text);

    try {
      const url = await fetchSpeechUrl(text);
      if (url) {
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setStatus("Done! Tap play to hear");
      } else {
        // No backend (or TTS failed) — speak with the browser's own voice.
        speakNative(text);
        setStatus("Done (using native voice)");
      }
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
    suggestions,
    beginRecording,
    commitSegment,
    triggerTranslate,
    undoLastWord,
    clearGloss,
    setGlossWords,
  };
}
