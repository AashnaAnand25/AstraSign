import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

interface Props {
  onBack: () => void;
  onSettings: () => void;
}

const WaveBar = ({ i, active }: { i: number; active: boolean }) => {
  const [h, setH] = useState(4);
  useEffect(() => {
    if (!active) { setH(4); return; }
    const interval = setInterval(() => setH(Math.random() * 40 + 4), 100 + i * 20);
    return () => clearInterval(interval);
  }, [active, i]);

  return (
    <div
      className="rounded-full transition-all duration-100 flex-shrink-0"
      style={{
        width: "3px",
        height: `${h}px`,
        background: active
          ? `linear-gradient(to top, hsl(272 76% 53%), hsl(183 100% 50%))`
          : "hsl(240 10% 20%)",
        boxShadow: active ? "0 0 6px hsl(272 76% 53% / 0.5)" : "none",
      }}
    />
  );
};

const ASLCard = ({ letter, delay }: { letter: string; delay: number }) => (
  <div
    className="glass neon-border-cyan rounded-2xl p-3 flex flex-col items-center gap-2 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms`, minWidth: "64px" }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
      style={{ background: "hsl(183 100% 50% / 0.1)", color: "hsl(183 100% 50%)" }}
    >
      {/* Simple hand shape indicator */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 16V8a2 2 0 014 0M12 16V6a2 2 0 014 0v2M16 16V9a2 2 0 014 0v7a6 6 0 01-12 0v-4a2 2 0 014 0" stroke="hsl(183 100% 50%)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
    <span className="text-xs font-bold text-neon-cyan">{letter}</span>
  </div>
);

const SAMPLE_PHRASES = [
  { text: "Nice to meet you!", letters: ["N", "I", "C", "E"] },
  { text: "How are you doing?", letters: ["H", "O", "W"] },
  { text: "Thank you very much!", letters: ["T", "H", "K", "U"] },
];

export default function VoiceToSign({ onBack, onSettings }: Props) {
  const { settings } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [phrase, setPhrase] = useState<typeof SAMPLE_PHRASES[0] | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const visibleLetters = useMemo(() => {
    if (!phrase) return [] as string[];
    if (!settings.stepMode) return phrase.letters;
    return phrase.letters.slice(0, Math.max(0, Math.min(stepIndex, phrase.letters.length)));
  }, [phrase, settings.stepMode, stepIndex]);

  useEffect(() => {
    if (!isListening) return;
    const t = setTimeout(() => {
      const p = SAMPLE_PHRASES[Math.floor(Math.random() * SAMPLE_PHRASES.length)];
      setTranscript(p.text);
      setPhrase(p);
      setStepIndex(settings.stepMode ? 1 : p.letters.length);
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 2000);
    }, 2500);
    return () => clearTimeout(t);
  }, [isListening, settings.stepMode]);

  useEffect(() => {
    if (!transcript) return;

    if (settings.hapticFeedback && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.([25, 18, 25]);
      } catch {
        // ignore
      }
    }

    if (settings.voiceGuidance && typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(`Recognized: ${transcript}`);
        u.rate = Number(getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate")) || 1;
        window.speechSynthesis.speak(u);
      } catch {
        // ignore
      }
    }
  }, [transcript, settings.hapticFeedback, settings.voiceGuidance]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, hsl(272 76% 53% / 0.08) 0%, transparent 60%), hsl(240 20% 4%)",
        }}
      />

      {/* Particles on translation */}
      {showParticles && Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${30 + Math.random() * 30}%`,
            background: i % 2 === 0 ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)",
            boxShadow: `0 0 8px ${i % 2 === 0 ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)"}`,
            animation: `particle-float 1.8s ease-out ${i * 0.08}s forwards`,
            "--tx": `${(Math.random() - 0.5) * 100}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-glow-pulse" />
          <span className="font-display text-sm font-bold gradient-text-purple-cyan">NEUROSIGN</span>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Mode pill */}
      <div className="relative z-10 flex justify-center mb-6">
        <div className="glass rounded-full px-4 py-1.5 neon-border-cyan flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="4" y="1" width="6" height="8" rx="3" fill="hsl(183 100% 50%)" />
            <path d="M2 7a5 5 0 0010 0" stroke="hsl(183 100% 50%)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <line x1="7" y1="12" x2="7" y2="13.5" stroke="hsl(183 100% 50%)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-semibold text-neon-cyan tracking-wider">VOICE → SIGN</span>
        </div>
      </div>

      {/* ASL Avatar panel */}
      <div className="relative z-10 mx-5 mb-6">
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "hsl(240 15% 7%)",
            border: "1px solid hsl(183 100% 50% / 0.25)",
            boxShadow: "0 0 30px hsl(183 100% 50% / 0.08)",
            minHeight: "220px",
          }}
        >
          {/* Avatar or animated hands */}
          <div className="relative flex items-center justify-center py-8">
            {/* Neon hands illustration */}
            <div className="relative w-48 h-40">
              {/* Left hand */}
              <svg
                className="absolute left-0 top-0"
                width="90"
                height="100"
                viewBox="0 0 90 100"
                fill="none"
                style={{
                  filter: phrase ? "drop-shadow(0 0 12px hsl(183 100% 50%))" : "drop-shadow(0 0 6px hsl(272 76% 53%))",
                  transition: "filter 0.3s",
                }}
              >
                <path d="M45 90 C20 90 10 75 10 60 L10 30 C10 25 14 22 18 22 C22 22 26 25 26 30 L26 50 L26 25 C26 20 30 17 34 17 C38 17 42 20 42 25 L42 45 L42 20 C42 15 46 12 50 12 C54 12 58 15 58 20 L58 45 L58 28 C58 23 62 20 66 20 C70 20 74 23 74 28 L74 58 C74 74 65 90 45 90Z"
                  stroke="hsl(183 100% 50%)"
                  strokeWidth="1.5"
                  fill="hsl(183 100% 50% / 0.06)"
                  strokeLinejoin="round"
                />
                {/* Knuckle dots */}
                {[[30, 23], [42, 18], [54, 15], [66, 23]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(183 100% 50%)" opacity="0.8" />
                ))}
              </svg>

              {/* Right hand */}
              <svg
                className="absolute right-0 bottom-0"
                width="90"
                height="100"
                viewBox="0 0 90 100"
                fill="none"
                style={{
                  filter: phrase ? "drop-shadow(0 0 12px hsl(272 76% 53%))" : "drop-shadow(0 0 6px hsl(272 76% 53% / 0.4))",
                  transition: "filter 0.3s",
                  transform: "scaleX(-1)",
                }}
              >
                <path d="M45 90 C20 90 10 75 10 60 L10 30 C10 25 14 22 18 22 C22 22 26 25 26 30 L26 50 L26 25 C26 20 30 17 34 17 C38 17 42 20 42 25 L42 45 L42 20 C42 15 46 12 50 12 C54 12 58 15 58 20 L58 45 L58 28 C58 23 62 20 66 20 C70 20 74 23 74 28 L74 58 C74 74 65 90 45 90Z"
                  stroke="hsl(272 76% 53%)"
                  strokeWidth="1.5"
                  fill="hsl(272 76% 53% / 0.06)"
                  strokeLinejoin="round"
                />
                {[[30, 23], [42, 18], [54, 15], [66, 23]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(272 76% 53%)" opacity="0.8" />
                ))}
              </svg>
            </div>

            {phrase && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="font-display text-4xl font-black gradient-text-purple-cyan"
                  style={{ textShadow: "0 0 30px hsl(272 76% 53% / 0.5)" }}
                >
                  ASL
                </div>
              </div>
            )}

            {!phrase && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-xs text-muted-foreground">Avatar ready · Speak to animate</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign gesture cards */}
      {phrase && (
        <div className="relative z-10 px-5 mb-4">
          {settings.stepMode && (
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-muted-foreground">
                Step Mode: {Math.min(stepIndex, phrase.letters.length)}/{phrase.letters.length}
              </div>
              <button
                onClick={() => setStepIndex((i) => Math.min(i + 1, phrase.letters.length))}
                className="text-[10px] font-semibold px-3 py-1 rounded-full"
                style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 16%)", color: "hsl(183 100% 50%)" }}
              >
                Next
              </button>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {visibleLetters.map((l, i) => (
              <ASLCard key={`${l}-${i}`} letter={l} delay={i * 150} />
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="relative z-10 mx-5 mb-4 glass neon-border-purple rounded-2xl p-4 animate-fade-in-up">
          <div className="text-xs text-neon-purple font-medium tracking-wider mb-1">RECOGNIZED SPEECH</div>
          <p className="text-foreground font-medium">{transcript}</p>
        </div>
      )}

      <div className="flex-1" />

      {/* Mic control */}
      <div className="relative z-10 mx-5 mb-8">
        {/* Waveform */}
        <div className="flex items-center justify-center gap-0.5 mb-5 h-10">
          {Array.from({ length: 32 }).map((_, i) => (
            <WaveBar key={i} i={i} active={isListening} />
          ))}
        </div>

        {/* Big mic button */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {isListening && (
              <>
                <div
                  className="absolute rounded-full"
                  style={{
                    width: "100px", height: "100px",
                    top: "-18px", left: "-18px",
                    border: "2px solid hsl(272 76% 53% / 0.3)",
                    animation: "pulse-purple 1.8s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    width: "120px", height: "120px",
                    top: "-28px", left: "-28px",
                    border: "1px solid hsl(272 76% 53% / 0.15)",
                    animation: "pulse-purple 1.8s ease-in-out 0.4s infinite",
                  }}
                />
              </>
            )}
            <button
              onClick={() => { setIsListening(!isListening); if (!isListening) { setTranscript(""); setPhrase(null); } }}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90 relative z-10"
              style={{
                background: isListening
                  ? "linear-gradient(135deg, hsl(183 100% 40%), hsl(272 76% 53%))"
                  : "linear-gradient(135deg, hsl(272 76% 53%), hsl(272 76% 40%))",
                boxShadow: isListening
                  ? "0 0 30px hsl(183 100% 50% / 0.5), 0 0 60px hsl(183 100% 50% / 0.2)"
                  : "0 0 25px hsl(272 76% 53% / 0.5)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="8" y="3" width="8" height="14" rx="4" fill="white" />
                <path d="M4 12a8 8 0 0016 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="12" y1="20" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="9" y1="23" x2="15" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {isListening ? (
              <span className="text-neon-cyan animate-glow-pulse">Listening... speak naturally</span>
            ) : (
              "Hold to record · Tap for continuous"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
