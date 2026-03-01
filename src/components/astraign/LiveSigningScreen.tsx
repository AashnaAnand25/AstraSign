import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, Settings } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

interface Props {
  onBack: () => void;
  onSettings: () => void;
}

const SAMPLE = "HELLO MY NAME IS SIGNBRIDGE NICE TO MEET YOU".split(" ");

const WaveBar = ({ i, active }: { i: number; active: boolean }) => {
  const [h, setH] = useState(4);
  useEffect(() => {
    if (!active) { setH(4); return; }
    const t = setInterval(() => setH(Math.random() * 34 + 4), 90 + i * 18);
    return () => clearInterval(t);
  }, [active, i]);
  return (
    <div
      className="rounded-full transition-all duration-100"
      style={{
        width: "3px",
        height: `${h}px`,
        background: active ? "linear-gradient(to top, hsl(183 100% 50%), hsl(272 76% 53%))" : "hsl(240 10% 20%)",
        boxShadow: active ? "0 0 6px hsl(183 100% 50% / 0.35)" : "none",
      }}
    />
  );
};

export default function LiveSigningScreen({ onBack, onSettings }: Props) {
  const { settings } = useAccessibility();
  const [running, setRunning] = useState(true);
  const [idx, setIdx] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const intervalMs = useMemo(() => {
    const rate = Number(getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate")) || 1;
    return Math.max(420, Math.round(900 / rate));
  }, [settings.playbackSpeed]);

  const current = SAMPLE[idx % SAMPLE.length];
  const upcoming = [SAMPLE[(idx + 1) % SAMPLE.length], SAMPLE[(idx + 2) % SAMPLE.length]];

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => {
      setIdx((i) => i + 1);
      setHistory((prev) => {
        const next = [...prev, SAMPLE[(idx) % SAMPLE.length]];
        return next.slice(Math.max(0, next.length - 4));
      });

      if (settings.hapticFeedback && typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.(12); } catch { /* ignore */ }
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running, intervalMs, settings.hapticFeedback, idx]);

  useEffect(() => {
    if (!settings.voiceGuidance) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(current);
      u.rate = Number(getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate")) || 1;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  }, [current, settings.voiceGuidance, settings.playbackSpeed]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 25%, hsl(272 76% 53% / 0.10) 0%, transparent 60%), hsl(240 20% 4%)" }}
      />

      <div className={`relative z-10 flex items-center justify-between px-5 pt-12 pb-4 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="text-center">
          <div className="font-display text-sm font-bold gradient-text-purple-cyan">LIVE</div>
          <div className="text-[10px] text-muted-foreground tracking-wider">Speech → Sign</div>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 190,
            height: 190,
            background: "linear-gradient(135deg, hsl(272 76% 53% / 0.18), hsl(183 100% 50% / 0.08))",
            border: "1px solid hsl(272 76% 53% / 0.45)",
            boxShadow: "0 0 60px rgba(99,102,241,0.24)",
          }}
        >
          <div className="font-display text-4xl font-black gradient-text-purple-cyan">ASL</div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-[10px] text-muted-foreground tracking-wider">CURRENT</div>
          <div className="font-mono text-2xl tracking-[0.25em] text-foreground mt-2">{current}</div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-1">
          <div className="text-[10px] text-muted-foreground tracking-wider">UP NEXT</div>
          <div className="text-xs text-muted-foreground">{upcoming.join("  ")}</div>
        </div>
      </div>

      <div className="relative z-10 mx-5 mb-6 glass-strong rounded-3xl p-5" style={{ boxShadow: "0 -10px 40px hsl(272 76% 53% / 0.1)" }}>
        <div className="flex items-center justify-center gap-0.5 mb-4 h-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <WaveBar key={i} i={i} active={running} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setRunning((v) => !v)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
            style={{ background: "hsl(183 100% 50% / 0.15)", border: "1px solid hsl(183 100% 50% / 0.3)", color: "hsl(183 100% 50%)" }}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <div className="flex-1 px-4">
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase">Transcript</div>
            <div className="mt-1 flex gap-2 text-xs">
              {history.map((w, i) => (
                <span key={`${w}-${i}`} style={{ color: i === history.length - 1 ? "hsl(272 76% 53%)" : "hsl(240 5% 65%)" }}>
                  {w}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setHistory([])}
            className="px-4 h-12 rounded-2xl text-xs font-semibold"
            style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 16%)", color: "hsl(240 5% 75%)" }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
