/**
 * useSignPipeline — push-to-sign model
 *
 * The user controls sign boundaries explicitly via the UI:
 *
 *   beginRecording()  →  start buffering landmark frames
 *   addFrame(lms)     →  called each video frame while recording
 *   commitSegment()   →  user releases button; sends buffer to GPT-4o
 *
 * This removes all motion-threshold guessing and is 100% reliable for demos.
 *
 * After words are accumulated:
 *   triggerTranslate()  →  gloss → English (GPT-4o-mini) → ElevenLabs TTS
 */

import { useCallback, useRef, useState } from "react";
import type { Landmark } from "./useHandTracking";

/** Minimum frames for a valid sign (< 10 frames ≈ < 0.33 s is noise) */
const MIN_SEGMENT_FRAMES = 10;
/** Hard cap — prevents runaway buffers if user holds too long */
const MAX_SEGMENT_FRAMES = 120;
/** Evenly-spaced frames sent to the recognition API */
const SAMPLE_FRAMES = 8;
/** Minimum time between recognition calls (30 seconds for Gemini free tier) */
const MIN_RECOGNITION_INTERVAL_MS = 30000;

// Sign queue for batching multiple signs
interface QueuedSign {
  frames: Landmark[][];
  timestamp: number;
}

type PipelineState = "idle" | "recognizing";

export interface SignPipelineResult {
  /** Accumulated recognised ASL words for this session */
  glossWords: string[];
  /** true while a sign is actively being recorded (driven by UI) */
  isDetectingSign: boolean;
  /** true while waiting for the recognition API */
  isRecognizing: boolean;
  /** GPT-4o-mini–naturalised English sentence */
  translatedText: string;
  /** Blob URL for the ElevenLabs audio */
  audioUrl: string | null;
  /** true while gloss→English + TTS are in flight */
  isTranslating: boolean;
  /** Human-readable status */
  status: string;
  /** Countdown timer for rate limit cooldown */
  countdown: number;

  /** Call when the user starts signing (clears frame buffer) */
  beginRecording: () => void;
  /** Feed one landmark frame while recording */
  addFrame: (landmarks: Landmark[]) => void;
  /** Call when the user stops signing — triggers recognition */
  commitSegment: () => void;
  /** Convert accumulated gloss to English + synthesise speech */
  triggerTranslate: () => Promise<void>;
  /** Remove the last recognised word */
  undoLastWord: () => void;
  /** Reset all state for a fresh session */
  clearGloss: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sampleFrames(buffer: Landmark[][], n: number): Landmark[][] {
  if (buffer.length <= n) return buffer;
  return Array.from({ length: n }, (_, i) =>
    buffer[Math.round((i * (buffer.length - 1)) / (n - 1))]
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSignPipeline(): SignPipelineResult {
  const [glossWords, setGlossWords]       = useState<string[]>([]);
  const [translatedText, setTranslatedText] = useState("");
  const [audioUrl, setAudioUrl]           = useState<string | null>(null);
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetectingSign, setIsDetectingSign] = useState(false);
  const [status, setStatus]               = useState("Tap mic to start signing");
  const [countdown, setCountdown]         = useState<number>(0);

  const frameBufferRef = useRef<Landmark[][]>([]);
  const lastRecognitionTimeRef = useRef<number>(0);
  const signQueueRef = useRef<QueuedSign[]>([]);
  const processingRef = useRef<boolean>(false);

  // ── Recognition API call ────────────────────────────────────────────────────
  const recognizeSegment = useCallback(async (frames: Landmark[][]) => {
    // Rate limiting: check if enough time has passed since last call
    const now = Date.now();
    const timeSinceLastCall = now - lastRecognitionTimeRef.current;
    if (timeSinceLastCall < MIN_RECOGNITION_INTERVAL_MS) {
      const waitTime = Math.ceil((MIN_RECOGNITION_INTERVAL_MS - timeSinceLastCall) / 1000);
      setStatus(`Please wait ${waitTime}s between signs to avoid rate limits`);
      setPipelineState("idle");
      return;
    }
    lastRecognitionTimeRef.current = now;
    
    const sampled = sampleFrames(frames, SAMPLE_FRAMES);

    try {
      const resp = await fetch("/api/recognize/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: sampled.map((f) => f.map((lm) => [lm.x, lm.y, lm.z])),
          handedness: "Right",
        }),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.detail || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const word = (data.word as string | undefined)?.trim().toUpperCase();

      if (word && word !== "UNKNOWN") {
        setGlossWords((prev) => [...prev, word]);
        setStatus(`Detected: ${word} — sign again or tap Translate`);
      } else {
        setStatus("Could not identify sign — try again with a clearer gesture");
      }
    } catch (err) {
      setStatus(`Recognition error: ${String(err)}`);
    }

    setPipelineState("idle");
  }, []);

  // ── Push-to-sign controls ───────────────────────────────────────────────────

  const beginRecording = useCallback(() => {
    frameBufferRef.current = [];
    setIsDetectingSign(true);
    setStatus("Signing… release button to recognise");
  }, []);

  const addFrame = useCallback((landmarks: Landmark[]) => {
    if (frameBufferRef.current.length < MAX_SEGMENT_FRAMES) {
      frameBufferRef.current.push(landmarks);
    }
  }, []);

  const commitSegment = useCallback(() => {
    setIsDetectingSign(false);
    const buffer = frameBufferRef.current.slice();
    frameBufferRef.current = [];

    if (buffer.length < MIN_SEGMENT_FRAMES) {
      setStatus("Too short — hold the sign for a moment longer");
      return;
    }

    setPipelineState("recognizing");
    setStatus("Recognising sign…");
    recognizeSegment(buffer);
  }, [recognizeSegment]);

  // ── Gloss → English → ElevenLabs ────────────────────────────────────────────
  const triggerTranslate = useCallback(async () => {
    if (glossWords.length === 0) return;

    setIsTranslating(true);
    setStatus("Converting to English…");

    try {
      const grammarResp = await fetch("/api/recognize/gloss-to-english", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: glossWords }),
      });
      if (!grammarResp.ok)
        throw new Error(`Grammar API returned ${grammarResp.status}`);

      const { text } = await grammarResp.json();
      setTranslatedText(text);
      setStatus("Synthesising speech via ElevenLabs…");

      const speakResp = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice_id: "21m00Tcm4TlvDq8ikWAM" }),
      });
      if (!speakResp.ok)
        throw new Error(`ElevenLabs API returned ${speakResp.status}`);

      const blob = await speakResp.blob();
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });

      setStatus("Done — tap Play to hear the translation");
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    } finally {
      setIsTranslating(false);
    }
  }, [glossWords]);

  // ── Utilities ────────────────────────────────────────────────────────────────
  const undoLastWord = useCallback(() => {
    setGlossWords((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      setStatus(
        next.length > 0
          ? `Removed last word — current gloss: ${next.join(" ")}`
          : "Tap mic to start signing"
      );
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
    frameBufferRef.current = [];
    setIsDetectingSign(false);
    setPipelineState("idle");
    setIsTranslating(false);
    setStatus("Tap mic to start signing");
  }, []);

  return {
    glossWords,
    isDetectingSign,
    isRecognizing: pipelineState === "recognizing",
    translatedText,
    audioUrl,
    isTranslating,
    status,
    countdown,
    beginRecording,
    addFrame,
    commitSegment,
    triggerTranslate,
    undoLastWord,
    clearGloss,
  };
}
