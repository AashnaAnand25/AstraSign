import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Settings, Volume2 } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

interface Props {
  onBack: () => void;
  onSettings: () => void;
}

const QUICK_PHRASES = [
  "I need help",
  "Please repeat that",
  "Thank you",
  "I understand",
  "Call 911",
  "One moment",
];

export default function ReverseMode({ onBack, onSettings }: Props) {
  const { settings } = useAccessibility();
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const speechRate = useMemo(() => {
    const v = Number(getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate"));
    return Number.isFinite(v) && v > 0 ? v : 1;
  }, [settings.playbackSpeed]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
      }
    };
  }, []);

  const speak = () => {
    if (!text.trim()) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.trim());
      u.rate = speechRate;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch {
      setSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "hsl(240 20% 4%)" }} />

      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-glow-pulse" />
          <span className="font-display text-sm font-bold gradient-text-purple-pink">REVERSE</span>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>

      <div className="relative z-10 px-5 pb-4">
        <div className="text-xs text-muted-foreground mb-2">Quick phrases</div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {QUICK_PHRASES.map((p) => (
            <button
              key={p}
              onClick={() => setText(p)}
              className="px-3 py-2 rounded-2xl text-xs font-semibold"
              style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 16%)", color: "hsl(183 100% 50%)" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-5 glass rounded-3xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
        <div className="text-xs text-muted-foreground mb-2">Type message</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[120px] bg-transparent outline-none resize-none text-sm text-foreground"
          placeholder="Type what you want spoken aloud…"
        />
      </div>

      <div className="flex-1" />

      <div className="relative z-10 mx-5 mb-8">
        <button
          onClick={speak}
          disabled={!text.trim()}
          className="w-full py-4 rounded-2xl font-display font-bold text-sm tracking-widest text-white transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{
            background: speaking
              ? "linear-gradient(135deg, hsl(142 70% 45%), hsl(183 100% 35%))"
              : "linear-gradient(135deg, hsl(183 100% 45%), hsl(272 76% 53%))",
            boxShadow: "0 0 24px hsl(183 100% 50% / 0.25)",
          }}
        >
          <Volume2 size={16} />
          {speaking ? "SPEAKING" : "SPEAK ALOUD"}
        </button>
      </div>
    </div>
  );
}
