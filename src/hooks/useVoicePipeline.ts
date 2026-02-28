import { useState, useRef, useCallback } from "react";

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
  const recognitionRef = useRef<any>(null);

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
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

    recognition.onresult = (event: any) => {
      const t = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      transcriptRef.current = t;
      setState(s => ({ ...s, transcript: t }));
    };

    recognition.onerror = (event: any) => {
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
      try {
        const resp = await fetch("/api/grammar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: t }),
        });
        if (!resp.ok) throw new Error(`Server error ${resp.status}`);
        const data = await resp.json();
        setState(s => ({ ...s, status: "done", aslWords: data.asl_ordered ?? [] }));
      } catch (err) {
        setState(s => ({
          ...s,
          status: "error",
          error: `Grammar conversion failed: ${String(err)}`,
        }));
      }
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
