import { useCallback } from "react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

const PHRASES = [
  { text: "I am deaf/hard of hearing", emoji: "👋" },
  { text: "Please speak slowly", emoji: "🐢" },
  { text: "Yes", emoji: "✓" },
  { text: "No", emoji: "✗" },
  { text: "Thank you", emoji: "🙏" },
  { text: "I need help", emoji: "🆘" },
  { text: "Please repeat that", emoji: "🔄" },
  { text: "One moment", emoji: "⏳" },
  { text: "Please write it down", emoji: "✏️" },
  { text: "Emergency", emoji: "🚨", emergency: true },
];

export default function QuickPhrasesTab() {
  const { settings } = useAccessibility();

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate =
          Number(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--a11y-speech-rate"
            )
          ) || 1;
        u.onstart = () => {
          if (settings.hapticFeedback && "vibrate" in navigator) {
            navigator.vibrate?.([25]);
          }
        };
        window.speechSynthesis.speak(u);
      } catch {
        // ignore
      }
    },
    [settings.hapticFeedback]
  );

  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-24">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
          <span className="text-xs text-neon-cyan font-medium tracking-wider">
            RAPID COMMUNICATION
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Quick Phrases
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tap any phrase to speak instantly — no camera or mic required
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 content-start">
        {PHRASES.map(({ text, emoji, emergency }) => (
          <button
            key={text}
            onClick={() => speak(text)}
            className="rounded-2xl p-6 text-left transition-all active:scale-95 flex flex-col items-start justify-center min-h-[100px]"
            style={{
              background: emergency
                ? "linear-gradient(135deg, hsl(0 80% 55% / 0.2), hsl(316 80% 60% / 0.15)"
                : "hsl(240 15% 9%)",
              border: emergency
                ? "1px solid hsl(0 80% 55% / 0.5)"
                : "1px solid hsl(240 10% 14%)",
              boxShadow: emergency
                ? "0 0 20px hsl(0 80% 55% / 0.2)"
                : "0 0 12px hsl(183 100% 50% / 0.05)",
            }}
          >
            <span className="text-2xl mb-2">{emoji}</span>
            <span
              className={`font-semibold text-base leading-tight ${
                emergency ? "text-red-400" : "text-foreground"
              }`}
            >
              {text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
