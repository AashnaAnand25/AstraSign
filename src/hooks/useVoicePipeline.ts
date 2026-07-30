import { useState, useRef, useCallback } from "react";
import { toAslGloss } from "@/services/api";
import {
  getSpeechRecognition,
  joinTranscript,
  type SpeechRecognitionLike,
} from "@/lib/speechRecognition";

export type PipelineStatus = "idle" | "listening" | "processing" | "done" | "error";

export interface VoicePipelineState {
  status: PipelineStatus;
  transcript: string;
  aslWords: string[];
  error: string | null;
}

export function useVoicePipeline() {
  const [state, setState] = useState<VoicePipelineState>({
    status: "idle",
    transcript: "",
    aslWords: [],
    error: null,
  });

  const transcriptRef = useRef("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const start = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setState(s => ({
        ...s,
        status: "error",
        error: "Speech recognition not supported. Please use Chrome or Edge.",
      }));
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      transcriptRef.current = "";
      setState({ status: "listening", transcript: "", aslWords: [], error: null });
    };

    recognition.onresult = (event) => {
      const t = joinTranscript(event.results);
      transcriptRef.current = t;
      setState(s => ({ ...s, transcript: t }));
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        setState(s => ({ ...s, status: "idle" }));
      } else {
        setState(s => ({ ...s, status: "error", error: `Mic error: ${event.error}` }));
      }
    };

    recognition.onend = async () => {
      const t = transcriptRef.current.trim();
      if (!t) {
        setState(s => ({ ...s, status: "idle" }));
        return;
      }
      setState(s => ({ ...s, status: "processing" }));
      // toAslGloss falls back to local rules when no backend is reachable,
      // so this never leaves the user stuck on a static deploy.
      const aslWords = await toAslGloss(t);
      setState(s => ({ ...s, status: "done", aslWords }));
    };

    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    setState({ status: "idle", transcript: "", aslWords: [], error: null });
  }, []);

  return { ...state, start, stop, reset };
}
