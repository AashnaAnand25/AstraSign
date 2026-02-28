/**
 * useSignPipeline
 *
 * Manages the full ASL → Text pipeline on top of raw MediaPipe landmarks:
 *
 *   landmarks per frame
 *     → sliding-window buffer
 *     → motion-delta segmentation (detects sign boundaries)
 *     → POST /api/recognize/sign   (GPT-4o identifies the sign)
 *     → accumulate gloss words
 *     → POST /api/recognize/gloss-to-english  (GPT-4o-mini naturalises)
 *     → POST /api/speak            (ElevenLabs TTS)
 *
 * Usage:
 *   const pipeline = useSignPipeline();
 *   // Feed each frame:  pipeline.addFrame(landmarks)  (call only while recording)
 *   // When done signing: pipeline.triggerTranslate()
 *   // Reset everything:  pipeline.clearGloss()
 */

import { useCallback, useRef, useState } from "react";
import type { Landmark } from "./useHandTracking";

// ── Segmentation thresholds ───────────────────────────────────────────────────
/** Sum of per-landmark L2 distances must exceed this to count as "in motion" */
const MOTION_THRESHOLD = 0.015;
/** Consecutive still frames needed before we call a sign boundary */
const STILL_FRAMES_NEEDED = 8;
/** Minimum frames for a valid sign (ignores noise / accidental trigger) */
const MIN_SEGMENT_FRAMES = 10;
/** Maximum frames before we force a cut-off (handles very long gestures) */
const MAX_SEGMENT_FRAMES = 90;
/** How many evenly-spaced frames to send to the recognition API */
const SAMPLE_FRAMES = 8;

type PipelineState = "idle" | "signing" | "recognizing";

export interface SignPipelineResult {
  /** Accumulated recognised ASL words for this session */
  glossWords: string[];
  /** true while a sign is actively being performed */
  isDetectingSign: boolean;
  /** true while waiting for the recognition API to respond */
  isRecognizing: boolean;
  /** GPT-4o-mini–naturalised English sentence (set after triggerTranslate) */
  translatedText: string;
  /** Blob URL for the ElevenLabs audio (set after triggerTranslate) */
  audioUrl: string | null;
  /** true while gloss→English + TTS requests are in flight */
  isTranslating: boolean;
  /** Human-readable status for the UI */
  status: string;

  /** Feed one landmark frame into the segmentation engine (call per video frame) */
  addFrame: (landmarks: Landmark[]) => void;
  /** Convert accumulated gloss to English and synthesise speech */
  triggerTranslate: () => Promise<void>;
  /** Remove the last recognised word */
  undoLastWord: () => void;
  /** Reset all state for a fresh session */
  clearGloss: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function motionDelta(prev: Landmark[], curr: Landmark[]): number {
  let sum = 0;
  const n = Math.min(prev.length, curr.length);
  for (let i = 0; i < n; i++) {
    const dx = curr[i].x - prev[i].x;
    const dy = curr[i].y - prev[i].y;
    sum += Math.sqrt(dx * dx + dy * dy);
  }
  return sum;
}

/**
 * Sample n evenly-spaced frames from a buffer.
 * If the buffer is shorter than n, return it as-is.
 */
function sampleFrames(buffer: Landmark[][], n: number): Landmark[][] {
  if (buffer.length <= n) return buffer;
  return Array.from({ length: n }, (_, i) =>
    buffer[Math.round((i * (buffer.length - 1)) / (n - 1))]
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSignPipeline(): SignPipelineResult {
  const [glossWords, setGlossWords] = useState<string[]>([]);
  const [translatedText, setTranslatedText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [isTranslating, setIsTranslating] = useState(false);
  const [status, setStatus] = useState("Ready — show a sign to begin");

  // Mutable state accessed inside callbacks — stored in refs to avoid stale closures
  const currentStateRef = useRef<PipelineState>("idle");
  const frameBufferRef  = useRef<Landmark[][]>([]);
  const prevLandmarksRef = useRef<Landmark[] | null>(null);
  const stillCountRef   = useRef(0);

  // ── Recognition API call ────────────────────────────────────────────────────
  const recognizeSegment = useCallback(async (frames: Landmark[][]) => {
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

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const word = (data.word as string | undefined)?.trim().toUpperCase();

      if (word && word !== "UNKNOWN") {
        setGlossWords((prev) => [...prev, word]);
        setStatus(`Detected: ${word} — show next sign or tap Translate`);
      } else {
        setStatus("Could not identify sign — try again with a clearer gesture");
      }
    } catch (err) {
      setStatus(`Recognition error: ${String(err)}`);
    }

    // Always return to idle so new signs can be captured
    currentStateRef.current = "idle";
    setPipelineState("idle");
  }, []); // stable: only uses setState (stable) and refs (runtime-accessed)

  // ── Main frame ingestion ────────────────────────────────────────────────────
  const addFrame = useCallback(
    (landmarks: Landmark[]) => {
      const prev = prevLandmarksRef.current;
      prevLandmarksRef.current = landmarks;

      if (!prev) return; // first frame — nothing to diff yet

      const motion = motionDelta(prev, landmarks);
      const state  = currentStateRef.current;

      // Skip while an API call is in flight
      if (state === "recognizing") return;

      if (state === "idle") {
        if (motion > MOTION_THRESHOLD) {
          // Signing has started
          currentStateRef.current = "signing";
          setPipelineState("signing");
          frameBufferRef.current  = [landmarks];
          stillCountRef.current   = 0;
          setStatus("Signing detected…");
        }
      } else if (state === "signing") {
        frameBufferRef.current.push(landmarks);

        if (motion < MOTION_THRESHOLD) {
          // Hand has gone still — increment stillness counter
          stillCountRef.current += 1;

          if (stillCountRef.current >= STILL_FRAMES_NEEDED) {
            // Sign boundary detected
            const buffer = frameBufferRef.current.slice();
            frameBufferRef.current = [];
            stillCountRef.current  = 0;

            if (buffer.length >= MIN_SEGMENT_FRAMES) {
              currentStateRef.current = "recognizing";
              setPipelineState("recognizing");
              setStatus("Recognising sign…");
              recognizeSegment(buffer); // fire-and-forget; updates state when done
            } else {
              // Too short — likely noise, discard
              currentStateRef.current = "idle";
              setPipelineState("idle");
              setStatus("Ready — show a sign to begin");
            }
          }
        } else {
          // Still moving — reset stillness counter
          stillCountRef.current = 0;

          // Force a cut-off if the sign runs too long (prevents infinite buffers)
          if (frameBufferRef.current.length >= MAX_SEGMENT_FRAMES) {
            const buffer = frameBufferRef.current.slice();
            frameBufferRef.current  = [];
            stillCountRef.current   = 0;
            currentStateRef.current = "recognizing";
            setPipelineState("recognizing");
            setStatus("Recognising sign…");
            recognizeSegment(buffer);
          }
        }
      }
    },
    [recognizeSegment]
  );

  // ── Gloss → English → ElevenLabs ────────────────────────────────────────────
  const triggerTranslate = useCallback(async () => {
    if (glossWords.length === 0) return;

    setIsTranslating(true);
    setStatus("Converting to English…");

    try {
      // Step 1: ASL gloss → natural English (GPT-4o-mini)
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

      // Step 2: Natural English → ElevenLabs audio
      const speakResp = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_id: "21m00Tcm4TlvDq8ikWAM", // Rachel (ElevenLabs default)
        }),
      });
      if (!speakResp.ok)
        throw new Error(`ElevenLabs API returned ${speakResp.status}`);

      const blob = await speakResp.blob();
      // Revoke previous blob URL to avoid memory leaks
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
          : "Ready — show a sign to begin"
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
    setStatus("Ready — show a sign to begin");
    frameBufferRef.current   = [];
    prevLandmarksRef.current = null;
    stillCountRef.current    = 0;
    currentStateRef.current  = "idle";
    setPipelineState("idle");
    setIsTranslating(false);
  }, []);

  return {
    glossWords,
    isDetectingSign: pipelineState === "signing",
    isRecognizing:   pipelineState === "recognizing",
    translatedText,
    audioUrl,
    isTranslating,
    status,
    addFrame,
    triggerTranslate,
    undoLastWord,
    clearGloss,
  };
}
