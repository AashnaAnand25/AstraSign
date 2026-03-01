import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, Settings, Play, Pause, ToggleLeft, ToggleRight, Volume2 } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";
import HandTracker from "@/components/astraign/HandTracker";
import { gestureToWord } from "@/utils/aslStaticPoses";

interface Props {
  onBack?: () => void;
  onSettings?: () => void;
  focusMode?: boolean;
  embedded?: boolean;
  onStatusChange?: (status: "ready" | "listening" | "processing") => void;
  onAddToHistory?: (audioText: string, aslTranslation: string) => void;
}

const QUICK_PHRASES = [
  "I need help",
  "Please repeat that",
  "Thank you",
  "I understand",
  "Call 911",
  "One moment",
];

const HandLandmark = ({ x, y }: { x: number; y: number }) => (
  <div
    className="absolute w-2.5 h-2.5 rounded-full border border-primary animate-pulse"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      background: "hsl(var(--primary) / 0.4)",
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

const POSE_HOLD_MS = 500;
const COOLDOWN_MS = 1800;

export default function SignToVoice({ onBack, onSettings, focusMode: focusModeProp, embedded, onStatusChange, onAddToHistory }: Props) {
  const { settings } = useAccessibility();
  const focusMode = focusModeProp ?? settings.focusMode;
  const [isRecording, setIsRecording] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [translation, setTranslation] = useState("");
  const [manualText, setManualText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeakingManual, setIsSpeakingManual] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastGestureRef = useRef<string>("");
  const lastGestureTimeRef = useRef<number>(0);
  const lastSpokenWordRef = useRef<string>("");
  const lastSpokenTimeRef = useRef<number>(0);

  const speechRate = useMemo(() => {
    const v = Number(getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate"));
    return Number.isFinite(v) && v > 0 ? v : 1;
  }, [settings.playbackSpeed]);

  useEffect(() => {
    onStatusChange?.(isRecording ? "processing" : translation ? "ready" : "ready");
  }, [isRecording, translation, onStatusChange]);

  const handleGestureDetected = useCallback(
    (gesture: string, conf: number) => {
      const word = gestureToWord(gesture);
      if (!word || conf < 0.55) {
        lastGestureRef.current = "";
        return;
      }
      const now = Date.now();
      if (lastGestureRef.current === gesture) {
        const held = now - lastGestureTimeRef.current;
        if (held >= POSE_HOLD_MS) {
          const canSpeak =
            lastSpokenWordRef.current !== word || now - lastSpokenTimeRef.current >= COOLDOWN_MS;
          if (canSpeak) {
            setTranslation(word);
            setConfidence(Math.round(conf * 100));
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 1500);
            lastSpokenWordRef.current = word;
            lastSpokenTimeRef.current = now;
            onAddToHistory?.(word, gesture);
          }
        }
      } else {
        lastGestureRef.current = gesture;
        lastGestureTimeRef.current = now;
      }
    },
    [onAddToHistory]
  );

  useEffect(() => {
    if (!translation) return;

    if (settings.hapticFeedback && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.([35, 20, 35]);
      } catch {
        // ignore
      }
    }

    // Always speak translation when detected in ASL to Audio mode, 
    // but still respect the speech synthesis availability.
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
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

  const speakManual = async () => {
    if (!manualText.trim()) return;
    setIsSpeakingManual(true);

    try {
      // Try ElevenLabs backend first
      const resp = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manualText.trim(), voice_id: "21m00Tcm4TlvDq8ikWAM" }),
      });

      if (!resp.ok) {
        throw new Error("ElevenLabs backend failed");
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onplay = () => setIsSpeakingManual(true);
      audio.onended = () => {
        setIsSpeakingManual(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsSpeakingManual(false);
        URL.revokeObjectURL(url);
        speakNativeManual(); // Final fallback inside audio error
      };

      await audio.play();
    } catch (err) {
      console.warn("ElevenLabs failed, using native fallback:", err);
      speakNativeManual();
    }
  };

  const speakNativeManual = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeakingManual(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(manualText.trim());
      u.rate = speechRate;
      u.onstart = () => setIsSpeakingManual(true);
      u.onend = () => setIsSpeakingManual(false);
      u.onerror = () => setIsSpeakingManual(false);
      window.speechSynthesis.speak(u);
    } catch {
      setIsSpeakingManual(false);
    }
  };

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
      {/* Single non-interactive layer: background + grid + hand guide + particles — never block clicks */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        {/* Hand guide — only top 50% of screen so bottom controls are never covered */}
        {!isRecording && (
          <div className="absolute left-0 right-0 top-0 bottom-[50%] flex items-end justify-center pb-4">
            <div
              className="relative rounded-3xl flex-shrink-0 border-2 border-dashed border-primary/30 bg-card/30"
              style={{
                width: "55%",
                aspectRatio: "0.7",
                boxShadow: "inset 0 0 30px hsl(var(--primary) / 0.05)",
              }}
            >
              {[["top-0 left-0", "border-t border-l"], ["top-0 right-0", "border-t border-r"], ["bottom-0 left-0", "border-b border-l"], ["bottom-0 right-0", "border-b border-r"]].map(([pos, border], i) => (
                <div key={i} className={`absolute w-4 h-4 ${pos} ${border} border-primary/60`}
                  style={{ margin: "-2px" }} />
              ))}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" fill="none">
                <path d="M50 90 C30 90 20 75 20 60 L20 35 C20 30 24 27 28 27 C32 27 36 30 36 35 L36 50 L36 30 C36 25 40 22 44 22 C48 22 52 25 52 30 L52 48 L52 25 C52 20 56 17 60 17 C64 17 68 20 68 25 L68 48 L68 32 C68 27 72 24 76 24 C80 24 84 27 84 32 L84 62 C84 78 70 90 50 90Z"
                  stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinejoin="round" />
                {[[36, 27], [50, 22], [64, 18], [76, 27]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--primary))" />
                ))}
              </svg>
            </div>
          </div>
        )}
        {!isRecording && (
          <div className="absolute left-0 right-0 top-[42%] text-center">
            <p className="text-xs text-muted-foreground tracking-wider">Hold pose: 👍 Yes · ✊ No · ✋ Stop · ☝️ One · ✌️ Two</p>
          </div>
        )}
        {showParticles && Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary shadow-lg"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${40 + Math.random() * 20}%`,
              animation: `particle-float 1.5s ease-out ${i * 0.1}s forwards`,
              "--tx": `${(Math.random() - 0.5) * 80}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Camera + MediaPipe when recording — constrained so it doesn't cover bottom controls */}
      {isRecording && (
        <div
          className="absolute left-4 right-4 top-4 bottom-[320px] rounded-3xl overflow-hidden border-2 border-primary/50 bg-card z-[5] pointer-events-auto shadow-xl"
        >
          <HandTracker isActive={true} onGestureDetected={handleGestureDetected} />
        </div>
      )}

      {/* Top bar - hidden when embedded */}
      {!embedded && (
        <div className={`relative z-10 flex items-center justify-between px-5 pt-12 pb-4 transition-opacity duration-300 ${focusMode ? "a11y-focus-dim" : ""}`}
        >
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-bold text-primary">AstraSign</span>
          </div>
          <button
            onClick={onSettings}
            className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
          >
            <Settings size={16} />
          </button>
        </div>
      )}

      {/* Mode label - hidden when embedded */}
      {!embedded && (
        <div className={`relative z-10 flex justify-center mb-2 ${focusMode ? "a11y-focus-dim" : ""}`}>
          <div className="bg-card border border-primary rounded-full px-4 py-1.5 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
              <rect x="2" y="1" width="2.5" height="8" rx="1.25" fill="currentColor" />
              <rect x="5.5" y="2.5" width="2.5" height="6.5" rx="1.25" fill="currentColor" opacity="0.8" />
              <rect x="9" y="0.5" width="2.5" height="9" rx="1.25" fill="currentColor" opacity="0.6" />
            </svg>
            <span className="text-xs font-semibold text-primary tracking-wider">SIGN → VOICE</span>
          </div>
        </div>
      )}

      {/* Floating confidence badge - "HELP – 92% Match" style */}
      {translation && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl font-semibold text-sm"
          style={{
            background: "hsl(240 15% 9% / 0.95)",
            border: `1px solid ${confidence >= 90 ? "hsl(142 70% 50% / 0.5)" : confidence >= 70 ? "hsl(40 90% 55% / 0.5)" : "hsl(0 80% 55% / 0.5)"
              }`,
            color: confidence >= 90 ? "hsl(142 70% 50%)" : confidence >= 70 ? "hsl(40 90% 55%)" : "hsl(0 80% 65%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {translation.split(" ").slice(0, 2).join(" ").replace(/\.$/, "")} – {confidence}% Accuracy
        </div>
      )}

      {/* Spacer for camera area */}
      <div className="flex-1 min-h-[120px]" />

      {/* Bottom interactive layer: translation + manual text + control panel — above decorative layer, below app nav (z-50) */}
      <div className="relative z-20 flex flex-col pointer-events-auto shrink-0 mb-2">
        {/* Quick phrases — added for text integration */}
        <div className={`relative z-10 px-5 mb-4 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
          <div className="text-[10px] text-muted-foreground tracking-wider uppercase mb-3 px-1">Quick phrases</div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_PHRASES.map((p) => (
              <button
                key={p}
                onClick={() => setManualText(p)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-secondary border border-border text-primary hover:bg-accent-subtle transition-colors duration-200 whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Text Area — integrated for text access */}
        <div className={`relative z-10 bg-card border border-border rounded-2xl p-4 mx-5 mb-4 shadow-sm ${settings.focusMode ? "a11y-focus-content" : ""}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Type message</span>
            <button
              onClick={speakManual}
              disabled={!manualText.trim() || isSpeakingManual}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-[10px] font-bold text-primary-foreground flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
            >
              <Volume2 size={12} />
              {isSpeakingManual ? "SPEAKING" : "SPEAK"}
            </button>
          </div>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="w-full min-h-[60px] bg-transparent outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/30"
            placeholder="Type what you want spoken aloud…"
          />
        </div>

        {/* Translation text - result of ASL detection */}
        {translation && (
          <div
            className={`mx-5 mb-4 p-4 bg-card border border-primary rounded-2xl shadow-md ${focusMode ? "a11y-focus-content" : ""}`}
            style={{ boxShadow: "0 4px 12px hsl(var(--primary) / 0.1)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary tracking-wider font-medium uppercase">Sign Detected</span>
              <span className="ml-auto text-xs font-bold text-primary">{confidence}% Accuracy</span>
            </div>
            <p className="text-foreground font-medium text-base leading-relaxed">{translation}</p>
          </div>
        )}

        {/* Control Panel — sticky at bottom so it's always visible and clickable */}
        <div
          className={`sticky bottom-0 mx-3 mb-6 mt-auto bg-card border border-border rounded-3xl p-5 shadow-lg ${focusMode ? "a11y-focus-dim" : ""}`}
        >
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
              type="button"
              onClick={() => setLiveMode(!liveMode)}
              className="flex items-center gap-2 bg-secondary border border-border rounded-full px-3 py-1.5 transition-all duration-200 cursor-pointer hover:border-primary"
            >
              {liveMode ? <ToggleRight size={16} className="text-primary" /> : <ToggleLeft size={16} className="text-muted-foreground" />}
              <span className={`text-xs font-medium ${liveMode ? "text-primary" : "text-muted-foreground"}`}>
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
                  <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke={confidence >= 90 ? "hsl(142 70% 50%)" : confidence >= 70 ? "hsl(40 90% 55%)" : confidence > 0 ? "hsl(0 80% 55%)" : "hsl(var(--primary))"}
                    strokeWidth="3"
                    strokeDasharray={`${(confidence / 100) * 125.6} 125.6`}
                    strokeLinecap="round"
                    style={{ transition: "stroke 0.4s, stroke-dasharray 0.4s" }}
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ color: confidence >= 90 ? "hsl(142 70% 50%)" : confidence >= 70 ? "hsl(40 90% 55%)" : confidence > 0 ? "hsl(0 80% 55%)" : "hsl(var(--primary))" }}
                >
                  {confidence ? `${confidence}%` : "--"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">Accuracy</span>
              {/* Tooltip on low confidence */}
              {confidence > 0 && confidence < 70 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 text-[10px] text-center rounded-xl px-2 py-1.5 pointer-events-none"
                  style={{ background: "hsl(240 15% 10%)", border: "1px solid hsl(0 80% 55% / 0.4)", color: "hsl(0 80% 65%)" }}>
                  Low accuracy. Try clearer gesture.
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
                type="button"
                onClick={() => {
                  setIsRecording(!isRecording);
                  setTranslation("");
                  setConfidence(0);
                }}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90 relative z-10 cursor-pointer"
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
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!translation}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
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
    </div>
  );
}
