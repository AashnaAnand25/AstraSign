import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Mic, MicOff } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";
import { useHistory } from "@/context/HistoryContext";
import VoiceToSign from "./VoiceToSign";
import MVPVoiceToSign from "./MVPVoiceToSign";
import SignToVoice from "./SignToVoice";

export type TranslateMode = "audio-to-asl" | "asl-to-audio";

interface Props {
  onAddToHistory?: (audio: string, asl: string) => void;
  /** When set, use this mode on mount (e.g. from Home "ASL Detection"); cleared after use */
  initialMode?: TranslateMode | null;
  /** Call when user has switched mode so parent can clear initialMode */
  onInitialModeConsumed?: () => void;
}

export default function TranslateTab({ onAddToHistory, initialMode, onInitialModeConsumed }: Props) {
  const { settings } = useAccessibility();
  const { addEntry } = useHistory();
  const [mode, setMode] = useState<TranslateMode>(initialMode ?? "audio-to-asl");
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState<"ready" | "listening" | "processing">("ready");

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      onInitialModeConsumed?.();
    }
  }, [initialMode, onInitialModeConsumed]);

  const handleHaptic = useCallback(() => {
    if (settings.hapticFeedback && "vibrate" in navigator) {
      navigator.vibrate?.([25]);
    }
  }, [settings.hapticFeedback]);

  const handleFlip = useCallback(() => {
    handleHaptic();
    setFlipped((f) => !f);
  }, [handleHaptic]);

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden transition-transform duration-500"
      style={{
        transform: flipped ? "rotate(180deg)" : "none",
      }}
    >
      {/* Flip Screen floating button */}
      <button
        type="button"
        onClick={handleFlip}
        className="fixed top-20 right-5 z-[100] flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 backdrop-blur-sm border border-border shadow-lg transition-all duration-200 active:scale-95 hover:border-primary cursor-pointer pointer-events-auto"
      >
        <RotateCcw size={16} className="text-primary" />
        <span className="text-xs font-medium text-foreground">Flip Screen</span>
      </button>

      {/* Mode switch at top — ensure clickable above content */}
      <div className="relative z-[60] flex justify-center pt-24 pb-2 px-4 pointer-events-none">
        <div className="inline-flex rounded-full p-1 bg-secondary border border-border pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              handleHaptic();
              setMode("audio-to-asl");
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${mode === "audio-to-asl"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Audio → ASL
          </button>
          <button
            type="button"
            onClick={() => {
              handleHaptic();
              setMode("asl-to-audio");
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${mode === "asl-to-audio"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            ASL → Audio
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="relative z-[60] flex justify-center mb-2 pointer-events-none">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${status === "listening"
            ? "bg-accent-subtle border-primary text-primary"
            : status === "processing"
              ? "bg-accent-subtle border-primary text-primary"
              : "bg-secondary border-border text-muted-foreground"
            }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${status === "listening"
              ? "bg-primary animate-pulse"
              : status === "processing"
                ? "bg-primary animate-pulse"
                : "bg-primary"
              }`}
          />
          {status === "listening" && "Listening…"}
          {status === "processing" && "Processing…"}
          {status === "ready" && "Ready"}
        </div>
      </div>

      {/* Content — scrollable; buttons inside have pointer-events */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {mode === "audio-to-asl" && (
          <MVPVoiceToSign embedded />
        )}
        {mode === "asl-to-audio" && (
          <SignToVoice
            embedded
            onStatusChange={setStatus}
            onAddToHistory={addEntry}
          />
        )}
      </div>
    </div>
  );
}
