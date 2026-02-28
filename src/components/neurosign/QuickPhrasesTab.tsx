import { useCallback } from "react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

type Expression = "urgent" | "calm" | "warm" | "clear" | "firm" | "gentle" | "neutral";

const PHRASES: { text: string; emoji: string; emergency?: boolean; expression?: Expression }[] = [
  { text: "I am deaf or hard of hearing.", emoji: "👋", expression: "clear" },
  { text: "Please speak slowly.", emoji: "🐢", expression: "calm" },
  { text: "Yes.", emoji: "✓", expression: "warm" },
  { text: "No.", emoji: "✗", expression: "firm" },
  { text: "Thank you.", emoji: "🙏", expression: "warm" },
  { text: "I need help.", emoji: "🆘", expression: "urgent" },
  { text: "Please repeat that.", emoji: "🔄", expression: "gentle" },
  { text: "One moment.", emoji: "⏳", expression: "calm" },
  { text: "Please write it down.", emoji: "✏️", expression: "clear" },
  { text: "Emergency!", emoji: "🚨", emergency: true, expression: "urgent" },
];

function getExpressionParams(expression: Expression, baseRate: number): { rate: number; pitch: number; volume: number } {
  switch (expression) {
    case "urgent":
      return { rate: Math.min(baseRate * 1.4, 1.45), pitch: 1.35, volume: 1 };
    case "calm":
      return { rate: Math.max(baseRate * 0.65, 0.55), pitch: 0.82, volume: 0.9 };
    case "warm":
      return { rate: baseRate * 0.8, pitch: 1.22, volume: 1 };
    case "clear":
      return { rate: baseRate * 0.78, pitch: 1, volume: 1 };
    case "firm":
      return { rate: baseRate * 0.85, pitch: 0.78, volume: 1 };
    case "gentle":
      return { rate: baseRate * 0.65, pitch: 1.12, volume: 0.82 };
    default:
      return { rate: baseRate, pitch: 1, volume: 1 };
  }
}

export default function QuickPhrasesTab() {
  const { settings } = useAccessibility();

  const speak = useCallback(
    (phrase: (typeof PHRASES)[number]) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const baseRate =
          Number(
            getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate")
          ) || 1;
        const { rate, pitch, volume } = getExpressionParams(phrase.expression ?? "neutral", baseRate);

        const u = new SpeechSynthesisUtterance(phrase.text);
        u.rate = rate;
        u.pitch = pitch;
        u.volume = volume;
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
        {PHRASES.map((phrase) => (
          <button
            key={phrase.text}
            onClick={() => speak(phrase)}
            className="rounded-2xl p-6 text-left transition-all active:scale-95 flex flex-col items-start justify-center min-h-[100px]"
            style={{
              background: phrase.emergency
                ? "linear-gradient(135deg, hsl(0 80% 55% / 0.2), hsl(316 80% 60% / 0.15)"
                : "hsl(240 15% 9%)",
              border: phrase.emergency
                ? "1px solid hsl(0 80% 55% / 0.5)"
                : "1px solid hsl(240 10% 14%)",
              boxShadow: phrase.emergency
                ? "0 0 20px hsl(0 80% 55% / 0.2)"
                : "0 0 12px hsl(183 100% 50% / 0.05)",
            }}
          >
            <span className="text-2xl mb-2">{phrase.emoji}</span>
            <span
              className={`font-semibold text-base leading-tight ${
                phrase.emergency ? "text-red-400" : "text-foreground"
              }`}
            >
              {phrase.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
