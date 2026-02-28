import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Settings, Play, Pause, ToggleLeft, ToggleRight } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

interface Props {
  onBack: () => void;
  onSettings: () => void;
  focusMode?: boolean;
}

const HandLandmark = ({ x, y }: { x: number; y: number }) => (
  <div
    className="absolute w-2.5 h-2.5 rounded-full border border-neon-cyan animate-glow-pulse"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      background: "hsl(183 100% 50% / 0.4)",
      boxShadow: "0 0 8px hsl(183 100% 50%)",
      transform: "translate(-50%, -50%)",
    }}
  />
);

const WaveformBar = ({ i }: { i: number }) => {
  const [h, setH] = useState(Math.random() * 20 + 4);
  useEffect(() => {
    const interval = setInterval(() => setH(Math.random() * 28 + 4), 150 + i * 30);
    return () => clearInterval(interval);
  }, [i]);
  return (
    <div
      className="w-1 rounded-full transition-all duration-150"
      style={{
        height: `${h}px`,
        background: "linear-gradient(to top, hsl(272 76% 53%), hsl(183 100% 50%))",
      }}
    />
  );
};

const SAMPLE_TRANSLATIONS = [
  "Hello, I am happy to meet you.",
  "Can you help me find the library?",
  "Thank you so much for your kindness.",
];

export default function SignToVoice({ onBack, onSettings, focusMode }: Props) {
  const { settings } = useAccessibility();
  const [isRecording, setIsRecording] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [translation, setTranslation] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setTimeout(() => {
        setTranslation(SAMPLE_TRANSLATIONS[Math.floor(Math.random() * SAMPLE_TRANSLATIONS.length)]);
        setConfidence(92 + Math.floor(Math.random() * 7));
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 2000);
      }, 2200);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRecording]);

  useEffect(() => {
    if (!translation) return;

    if (settings.hapticFeedback && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.([35, 20, 35]);
      } catch {
        // ignore
      }
    }

    if (settings.voiceGuidance && typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(translation);
        u.rate = Number(getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate")) || 1;
        utteranceRef.current = u;
        window.speechSynthesis.speak(u);
        setIsPlaying(true);
        u.onend = () => setIsPlaying(false);
      } catch {
        // ignore
      }
    }
  }, [translation, settings.hapticFeedback, settings.voiceGuidance]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!translation) {
      setIsPlaying(false);
      return;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlaying) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(translation);
        u.rate = Number(getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate")) || 1;
        utteranceRef.current = u;
        window.speechSynthesis.speak(u);
        u.onend = () => setIsPlaying(false);
      } catch {
        // ignore
      }
    } else {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }, [isPlaying, translation, settings.playbackSpeed]);

  const handLandmarks = [
    { x: 48, y: 35 }, { x: 52, y: 22 }, { x: 46, y: 18 }, { x: 42, y: 16 },
    { x: 38, y: 18 }, { x: 56, y: 22 }, { x: 60, y: 16 }, { x: 62, y: 12 },
    { x: 64, y: 9 }, { x: 60, y: 28 }, { x: 65, y: 22 }, { x: 67, y: 17 },
    { x: 69, y: 14 }, { x: 54, y: 34 }, { x: 59, y: 30 }, { x: 62, y: 26 },
    { x: 64, y: 23 }, { x: 48, y: 42 }, { x: 44, y: 38 }, { x: 41, y: 34 },
    { x: 38, y: 30 },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Camera preview simulation */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0a15] to-[#080810]">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(hsl(272 76% 53% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(272 76% 53% / 0.3) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        {/* Scan line */}
        {isRecording && (
          <div
            className="absolute left-0 right-0 h-px opacity-30"
            style={{
              background: "hsl(183 100% 50%)",
              boxShadow: "0 0 10px hsl(183 100% 50%)",
              animation: "scan-line 3s linear infinite",
              top: "40%",
            }}
          />
        )}
      </div>

      {/* Hand guide skeleton — shown before recording */}
      {!isRecording && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ top: "15%", height: "50%" }}>
          {/* Guide boundary */}
          <div
            className="relative rounded-3xl"
            style={{
              width: "55%",
              height: "80%",
              border: "1.5px dashed hsl(272 76% 53% / 0.25)",
              boxShadow: "inset 0 0 30px hsl(272 76% 53% / 0.03)",
            }}
          >
            {/* Corner accents */}
            {[["top-0 left-0","border-t border-l"], ["top-0 right-0","border-t border-r"], ["bottom-0 left-0","border-b border-l"], ["bottom-0 right-0","border-b border-r"]].map(([pos, border], i) => (
              <div key={i} className={`absolute w-4 h-4 ${pos} ${border}`}
                style={{ borderColor: "hsl(183 100% 50% / 0.5)", margin: "-1px" }} />
            ))}
            {/* Ghost hand skeleton */}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" fill="none">
              <path d="M50 90 C30 90 20 75 20 60 L20 35 C20 30 24 27 28 27 C32 27 36 30 36 35 L36 50 L36 30 C36 25 40 22 44 22 C48 22 52 25 52 30 L52 48 L52 25 C52 20 56 17 60 17 C64 17 68 20 68 25 L68 48 L68 32 C68 27 72 24 76 24 C80 24 84 27 84 32 L84 62 C84 78 70 90 50 90Z"
                stroke="hsl(183 100% 50%)" strokeWidth="1.5" strokeLinejoin="round" />
              {[[36,27],[50,22],[64,18],[76,27]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(183 100% 50%)" />
              ))}
            </svg>
          </div>
          <div className="absolute bottom-2 text-center">
            <p className="text-xs text-muted-foreground tracking-wider">Position hands inside frame</p>
          </div>
        </div>
      )}

      {/* Hand landmarks overlay */}
      {isRecording && (
        <div className="absolute inset-0 pointer-events-none" style={{ top: "15%", height: "55%" }}>
          {handLandmarks.map((lm, i) => (
            <HandLandmark key={i} x={lm.x} y={lm.y} />
          ))}
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full opacity-40">
            {[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20]].map(([a,b], i) => (
              <line
                key={i}
                x1={`${handLandmarks[a].x}%`} y1={`${handLandmarks[a].y}%`}
                x2={`${handLandmarks[b].x}%`} y2={`${handLandmarks[b].y}%`}
                stroke="hsl(183 100% 50%)"
                strokeWidth="1"
              />
            ))}
          </svg>
          {/* Glow when recognizing */}
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              left: "30%", top: "5%", width: "40%", height: "90%",
              background: "radial-gradient(ellipse, hsl(183 100% 50% / 0.08) 0%, transparent 70%)",
            }}
          />
        </div>
      )}

      {/* Particles */}
      {showParticles && Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${40 + Math.random() * 20}%`,
            background: i % 2 === 0 ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)",
            boxShadow: `0 0 6px ${i % 2 === 0 ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)"}`,
            animation: `particle-float 1.5s ease-out ${i * 0.1}s forwards`,
            "--tx": `${(Math.random() - 0.5) * 80}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Top bar */}
      <div
        className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4 transition-opacity duration-300"
        style={{ opacity: focusMode ? 0.2 : 1, pointerEvents: focusMode ? "none" : "auto" }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-glow-pulse" />
          <span className="font-display text-sm font-bold gradient-text-purple-cyan">NEUROSIGN</span>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Mode label */}
      <div className="relative z-10 flex justify-center mb-2">
        <div className="glass rounded-full px-4 py-1.5 neon-border-purple flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="1" width="2.5" height="8" rx="1.25" fill="hsl(272 76% 53%)" />
            <rect x="5.5" y="2.5" width="2.5" height="6.5" rx="1.25" fill="hsl(272 76% 53%)" opacity="0.8" />
            <rect x="9" y="0.5" width="2.5" height="9" rx="1.25" fill="hsl(272 76% 53%)" opacity="0.6" />
          </svg>
          <span className="text-xs font-semibold text-neon-purple tracking-wider">SIGN → VOICE</span>
        </div>
      </div>

      {/* Spacer for camera area */}
      <div className="flex-1" />

      {/* Translation text */}
      {translation && (
        <div
          className="relative z-10 mx-5 mb-3 p-4 glass rounded-2xl neon-border-cyan animate-fade-in-up"
          style={{ boxShadow: "0 0 20px hsl(183 100% 50% / 0.1)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-glow-pulse" />
            <span className="text-xs text-neon-cyan tracking-wider font-medium">TRANSLATED</span>
            {settings.confidenceDisplay && (
              <span className="ml-auto text-xs font-bold text-neon-cyan">{confidence}%</span>
            )}
          </div>
          <p className="text-foreground font-medium text-base leading-relaxed">{translation}</p>
        </div>
      )}

      {/* Control Panel */}
      <div className="relative z-10 mx-3 mb-6 glass-strong rounded-3xl p-5" style={{ boxShadow: "0 -10px 40px hsl(272 76% 53% / 0.1)" }}>
        {/* Waveform */}
        {isPlaying && (
          <div className="flex items-center justify-center gap-0.5 mb-4 h-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <WaveformBar key={i} i={i} />
            ))}
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs text-muted-foreground font-medium">Mode</span>
          <button
            onClick={() => setLiveMode(!liveMode)}
            className="flex items-center gap-2 glass rounded-full px-3 py-1.5 neon-border-purple transition-all"
          >
            {liveMode ? <ToggleRight size={16} className="text-neon-cyan" /> : <ToggleLeft size={16} className="text-muted-foreground" />}
            <span className="text-xs font-medium" style={{ color: liveMode ? "hsl(183 100% 50%)" : "hsl(240 5% 55%)" }}>
              {liveMode ? "Live" : "Sentence"}
            </span>
          </button>
        </div>

        {/* Confidence ring + Record button */}
        <div className="flex items-center justify-center gap-6">
          {/* Confidence — dynamic color */}
          <div className="text-center group relative">
            <div className="relative w-12 h-12 mx-auto">
              <svg viewBox="0 0 48 48" className="-rotate-90 w-12 h-12">
                <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(240 10% 18%)" strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke={confidence >= 90 ? "hsl(142 70% 50%)" : confidence >= 70 ? "hsl(40 90% 55%)" : confidence > 0 ? "hsl(0 80% 55%)" : "hsl(272 76% 53%)"}
                  strokeWidth="3"
                  strokeDasharray={`${(confidence / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                  style={{ transition: "stroke 0.4s, stroke-dasharray 0.4s" }}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                style={{ color: confidence >= 90 ? "hsl(142 70% 50%)" : confidence >= 70 ? "hsl(40 90% 55%)" : confidence > 0 ? "hsl(0 80% 55%)" : "hsl(var(--neon-purple))" }}
              >
                {settings.confidenceDisplay ? (confidence ? `${confidence}%` : "--") : "--"}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">AI Score</span>
            {/* Tooltip on low confidence */}
            {settings.confidenceDisplay && confidence > 0 && confidence < 70 && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 text-[10px] text-center rounded-xl px-2 py-1.5 pointer-events-none"
                style={{ background: "hsl(240 15% 10%)", border: "1px solid hsl(0 80% 55% / 0.4)", color: "hsl(0 80% 65%)" }}>
                Low confidence. Try clearer gesture.
              </div>
            )}
          </div>

          {/* Record button */}
          <div className="relative">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "hsl(272 76% 53%)", transform: "scale(1.5)" }} />
                <div className="absolute inset-0 rounded-full" style={{
                  width: "88px", height: "88px", top: "-12px", left: "-12px",
                  border: "2px solid hsl(272 76% 53% / 0.4)",
                  borderRadius: "50%",
                  animation: "pulse-purple 1.5s ease-in-out infinite",
                }} />
              </>
            )}
            <button
              onClick={() => { setIsRecording(!isRecording); if (!isRecording) { setTranslation(""); setConfidence(0); } }}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90 relative z-10"
              style={{
                background: isRecording
                  ? "linear-gradient(135deg, hsl(316 80% 60%), hsl(272 76% 53%))"
                  : "linear-gradient(135deg, hsl(272 76% 53%), hsl(272 76% 40%))",
                boxShadow: isRecording
                  ? "0 0 30px hsl(316 80% 60% / 0.6), 0 0 60px hsl(316 80% 60% / 0.3)"
                  : "0 0 25px hsl(272 76% 53% / 0.5)",
              }}
            >
              {isRecording ? (
                <div className="w-5 h-5 rounded bg-white" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="8" y="3" width="8" height="14" rx="4" fill="white" />
                  <path d="M4 12a8 8 0 0016 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <line x1="12" y1="20" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="9" y1="23" x2="15" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Play button */}
          <div className="text-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!translation}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{
                background: "hsl(183 100% 50% / 0.15)",
                border: "1px solid hsl(183 100% 50% / 0.3)",
                color: "hsl(183 100% 50%)",
                boxShadow: translation ? "0 0 15px hsl(183 100% 50% / 0.2)" : "none",
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <span className="text-[10px] text-muted-foreground mt-1 block">Play</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {isRecording ? "Detecting hand gestures..." : "Tap to start recognition"}
        </p>
      </div>
    </div>
  );
}
