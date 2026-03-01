/**
 * useSignPipeline — batch processing model
 *
 * Collects multiple signs and sends them in one API call to reduce rate limits.
 */

import { useCallback, useRef, useState, useEffect } from "react";
import type { Landmark } from "./useHandTracking";

const MIN_SEGMENT_FRAMES = 10;
const MAX_SEGMENT_FRAMES = 120;
const SAMPLE_FRAMES = 8;
const BATCH_SIZE = 3;

interface QueuedSign {
  frames: Landmark[][];
  handedness: string;
}

type PipelineState = "idle" | "recognizing";

export interface SignPipelineResult {
  glossWords: string[];
  isDetectingSign: boolean;
  isRecognizing: boolean;
  translatedText: string;
  audioUrl: string | null;
  isTranslating: boolean;
  status: string;
  queueLength: number;
  beginRecording: () => void;
  addFrame: (landmarks: Landmark[]) => void;
  commitSegment: () => void;
  triggerTranslate: () => Promise<void>;
  undoLastWord: () => void;
  clearGloss: () => void;
  flushQueue: () => void;
}

function sampleFrames(buffer: Landmark[][], n: number): Landmark[][] {
  if (buffer.length <= n) return buffer;
  return Array.from({ length: n }, (_, i) =>
    buffer[Math.round((i * (buffer.length - 1)) / (n - 1))]
  );
}

export function useSignPipeline(): SignPipelineResult {
  const [glossWords, setGlossWords] = useState<string[]>([]);
  const [translatedText, setTranslatedText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetectingSign, setIsDetectingSign] = useState(false);
  const [status, setStatus] = useState(`Tap mic, sign ${BATCH_SIZE} times, then Translate`);
  const [queueLength, setQueueLength] = useState(0);

  const frameBufferRef = useRef<Landmark[][]>([]);
  const signQueueRef = useRef<QueuedSign[]>([]);
  const processingRef = useRef<boolean>(false);

  const processBatch = useCallback(async (force = false) => {
    const queue = signQueueRef.current;
    if (queue.length === 0) return;
    if (!force && queue.length < BATCH_SIZE) {
      setStatus(`Sign ${BATCH_SIZE - queue.length} more time(s), then tap Translate`);
      return;
    }
    
    if (processingRef.current) return;
    processingRef.current = true;
    setPipelineState("recognizing");
    setStatus(`Recognizing ${queue.length} signs…`);

    const segments = queue.map((sign) => ({
      frames: sampleFrames(sign.frames, SAMPLE_FRAMES).map((f) =>
        f.map((lm) => [lm.x, lm.y, lm.z])
      ),
      handedness: sign.handedness,
    }));

    try {
      const resp = await fetch("/api/recognize/sign-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments }),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.detail || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const words: string[] = data.words || [];
      const validWords = words.filter((w: string) => w && w !== "UNKNOWN");
      
      if (validWords.length > 0) {
        setGlossWords((prev) => [...prev, ...validWords]);
        setStatus(`Detected: ${validWords.join(", ")} — tap Translate`);
      } else {
        setStatus("Could not identify signs — try again");
      }

      signQueueRef.current = [];
      setQueueLength(0);
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    } finally {
      processingRef.current = false;
      setPipelineState("idle");
    }
  }, []);

  useEffect(() => {
    if (signQueueRef.current.length >= BATCH_SIZE && !processingRef.current) {
      processBatch(false);
    }
  }, [queueLength, processBatch]);

  const beginRecording = useCallback(() => {
    frameBufferRef.current = [];
    setIsDetectingSign(true);
    setStatus(`Signing… release to capture sign ${signQueueRef.current.length + 1}/${BATCH_SIZE}`);
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
      setStatus("Too short — hold the sign longer");
      return;
    }

    signQueueRef.current.push({ frames: buffer, handedness: "Right" });
    const newLength = signQueueRef.current.length;
    setQueueLength(newLength);

    if (newLength < BATCH_SIZE) {
      setStatus(`Sign ${BATCH_SIZE - newLength} more time(s), then tap Translate`);
    }
  }, []);

  const flushQueue = useCallback(() => {
    processBatch(true);
  }, [processBatch]);

  const triggerTranslate = useCallback(async () => {
    if (signQueueRef.current.length > 0) {
      await processBatch(true);
    }

    if (glossWords.length === 0) {
      setStatus("No signs detected — sign first, then translate");
      return;
    }

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
      setStatus("Synthesising speech…");

      const speakResp = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice_id: "21m00Tcm4TlvDq8ikWAM" }),
      });
      if (!speakResp.ok)
        throw new Error(`TTS API returned ${speakResp.status}`);

      const blob = await speakResp.blob();
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });

      setStatus("Done — tap Play to hear");
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    } finally {
      setIsTranslating(false);
    }
  }, [glossWords, processBatch]);

  const undoLastWord = useCallback(() => {
    setGlossWords((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      setStatus(next.length > 0 ? `Removed word — current: ${next.join(" ")}` : `Tap mic, sign ${BATCH_SIZE} times, then Translate`);
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
    signQueueRef.current = [];
    setQueueLength(0);
    frameBufferRef.current = [];
    setIsDetectingSign(false);
    setPipelineState("idle");
    setIsTranslating(false);
    setStatus(`Tap mic, sign ${BATCH_SIZE} times, then Translate`);
  }, []);

  return {
    glossWords,
    isDetectingSign,
    isRecognizing: pipelineState === "recognizing",
    translatedText,
    audioUrl,
    isTranslating,
    status,
    queueLength,
    beginRecording,
    addFrame,
    commitSegment,
    triggerTranslate,
    undoLastWord,
    clearGloss,
    flushQueue,
  };
}
