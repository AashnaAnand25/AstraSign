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
      className="min-h-screen flex flex-col relative overflow-hidden transition-transform duration-500"
      style={{
        transform: flipped ? "rotate(180deg)" : "none",
      }}
    >
      {/* Flip Screen floating button */}
      <button
        type="button"
        onClick={handleFlip}
        className="fixed top-20 right-5 z-[100] flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer pointer-events-auto"
        style={{
          background: "hsl(240 15% 9% / 0.9)",
          border: "1px solid hsl(272 76% 53% / 0.25)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <RotateCcw size={16} className="text-neon-cyan" />
        <span className="text-xs font-medium text-foreground">Flip Screen</span>
      </button>

      {/* Mode switch at top — ensure clickable above content */}
      <div className="relative z-[60] flex justify-center pt-14 pb-2 pointer-events-none">
        <div
          className="inline-flex rounded-full p-1 pointer-events-auto"
          style={{
            background: "hsl(240 15% 9%)",
            border: "1px solid hsl(240 10% 14%)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              handleHaptic();
              setMode("audio-to-asl");
              onInitialModeConsumed?.();
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              mode === "audio-to-asl"
                ? "bg-neon-cyan/20 text-neon-cyan"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={
              mode === "audio-to-asl"
                ? { border: "1px solid hsl(183 100% 50% / 0.4)" }
                : {}
            }
          >
            Audio → ASL
          </button>
          <button
            type="button"
            onClick={() => {
              handleHaptic();
              setMode("asl-to-audio");
              onInitialModeConsumed?.();
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              mode === "asl-to-audio"
                ? "bg-neon-purple/20 text-neon-purple"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={
              mode === "asl-to-audio"
                ? { border: "1px solid hsl(272 76% 53% / 0.4)" }
                : {}
            }
          >
            ASL → Audio
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="relative z-[60] flex justify-center mb-2 pointer-events-none">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background:
              status === "listening"
                ? "hsl(183 100% 50% / 0.15)"
                : status === "processing"
                  ? "hsl(272 76% 53% / 0.15)"
                  : "hsl(240 10% 12%)",
            border:
              status === "listening"
                ? "1px solid hsl(183 100% 50% / 0.3)"
                : status === "processing"
                  ? "1px solid hsl(272 76% 53% / 0.3)"
                  : "1px solid hsl(240 10% 18%)",
            color:
              status === "listening"
                ? "hsl(183 100% 50%)"
                : status === "processing"
                  ? "hsl(272 76% 53%)"
                  : "hsl(240 5% 65%)",
          }}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              status === "listening"
                ? "bg-neon-cyan animate-pulse"
                : status === "processing"
                  ? "bg-neon-purple animate-pulse"
                  : "bg-green-400"
            }`}
          />
          {status === "listening" && "Listening…"}
          {status === "processing" && "Processing…"}
          {status === "ready" && "Ready"}
        </div>
      </div>

      {/* Content — scrollable; buttons inside have pointer-events */}
      <div className="flex-1 overflow-y-auto pb-24 min-h-0">
        {mode === "audio-to-asl" ? (
          <MVPVoiceToSign embedded />
        ) : (
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
