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
    <div className="min-h-screen flex flex-col relative overflow-hidden px-6 pt-16 pb-24">
      <div className={`relative z-10 flex items-center justify-between mb-8 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-bold text-primary">REVERSE</span>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className={`relative z-10 mb-6 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
        <div className="text-[10px] text-muted-foreground tracking-wider uppercase mb-3">Quick phrases</div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_PHRASES.map((p) => (
            <button
              key={p}
              onClick={() => setText(p)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-secondary border border-border text-primary hover:bg-accent-subtle transition-colors duration-200"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className={`relative z-10 bg-card border border-border rounded-2xl p-4 mb-6 ${settings.focusMode ? "a11y-focus-content" : ""}`}>
        <div className="text-xs text-muted-foreground mb-2">Type message</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[120px] bg-transparent outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/50"
          placeholder="Type what you want spoken aloud…"
        />
      </div>

      <div className="flex-1" />

      <div className={`relative z-10 mx-5 mb-8 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
        <button
          onClick={speak}
          disabled={!text.trim()}
          className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover font-bold text-sm tracking-widest text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Volume2 size={16} />
          {speaking ? "SPEAKING" : "SPEAK ALOUD"}
        </button>
      </div>
    </div>
  );
}
