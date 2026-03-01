import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Mic, MicOff } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";
import { useHistory } from "@/context/HistoryContext";
import VoiceToSign from "./VoiceToSign";
import SignToVoice from "./SignToVoice";

export type TranslateMode = "audio-to-asl" | "asl-to-audio";

interface Props {
  onAddToHistory?: (audio: string, asl: string) => void;
}

export default function TranslateTab({ onAddToHistory }: Props) {
  const { settings } = useAccessibility();
  const { addEntry } = useHistory();
  const [mode, setMode] = useState<TranslateMode>("audio-to-asl");
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState<"ready" | "listening" | "processing">("ready");

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
        onClick={handleFlip}
        className="fixed top-20 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
        style={{
          background: "hsl(240 15% 9% / 0.9)",
          border: "1px solid hsl(272 76% 53% / 0.25)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <RotateCcw size={16} className="text-neon-cyan" />
        <span className="text-xs font-medium text-foreground">Flip Screen</span>
      </button>

      {/* Mode switch at top */}
      <div className="relative z-10 flex justify-center pt-14 pb-2">
        <div
          className="inline-flex rounded-full p-1"
          style={{
            background: "hsl(240 15% 9%)",
            border: "1px solid hsl(240 10% 14%)",
          }}
        >
          <button
            onClick={() => {
              handleHaptic();
              setMode("audio-to-asl");
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
            onClick={() => {
              handleHaptic();
              setMode("asl-to-audio");
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
      <div className="relative z-10 flex justify-center mb-2">
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {mode === "audio-to-asl" ? (
          <VoiceToSign
            embedded
            onStatusChange={setStatus}
            onAddToHistory={addEntry}
          />
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
