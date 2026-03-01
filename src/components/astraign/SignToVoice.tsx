import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Settings, Play, Pause, ToggleLeft, ToggleRight, Glasses } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";
import HandTracker from "@/components/astraign/HandTracker";
import { gestureToWord } from "@/utils/aslStaticPoses";
import { useWearableDevice } from "@/hooks/useWearableDevice";

interface Props {
  onBack?: () => void;
  onSettings?: () => void;
  focusMode?: boolean;
  embedded?: boolean;
  onStatusChange?: (status: "ready" | "listening" | "processing") => void;
  onAddToHistory?: (audioText: string, aslTranslation: string) => void;
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

const POSE_HOLD_MS = 500;
const COOLDOWN_MS = 1800;

export default function SignToVoice({ onBack, onSettings, focusMode: focusModeProp, embedded, onStatusChange, onAddToHistory }: Props) {
  const { settings } = useAccessibility();
  const focusMode = focusModeProp ?? settings.focusMode;
  const [isRecording, setIsRecording] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [translation, setTranslation] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastGestureRef = useRef<string>("");
  const lastGestureTimeRef = useRef<number>(0);
  const lastSpokenWordRef = useRef<string>("");
  const lastSpokenTimeRef = useRef<number>(0);

  // Wearables Integration Pipeline
  const { status: wearableStatus, connectToGlasses, disconnectFromGlasses, getGlassesVideoStream } = useWearableDevice();
  const [glassesStream, setGlassesStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (wearableStatus === "connected" && isRecording) {
      getGlassesVideoStream().then(stream => {
        if (stream) setGlassesStream(stream);
      });
    } else {
      setGlassesStream(null);
    }
  }, [wearableStatus, isRecording, getGlassesVideoStream]);

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
      {/* Single non-interactive layer: background + grid + hand guide + particles — never block clicks */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0a15] to-[#080810]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(hsl(272 76% 53% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(272 76% 53% / 0.3) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        {/* Hand guide — only top 50% of screen so bottom controls are never covered */}
        {!isRecording && (
          <div className="absolute left-0 right-0 top-0 bottom-[50%] flex items-end justify-center pb-4">
            <div
              className="relative rounded-3xl flex-shrink-0"
              style={{
                width: "55%",
                aspectRatio: "0.7",
                border: "1.5px dashed hsl(272 76% 53% / 0.25)",
                boxShadow: "inset 0 0 30px hsl(272 76% 53% / 0.03)",
              }}
            >
              {[["top-0 left-0", "border-t border-l"], ["top-0 right-0", "border-t border-r"], ["bottom-0 left-0", "border-b border-l"], ["bottom-0 right-0", "border-b border-r"]].map(([pos, border], i) => (
                <div key={i} className={`absolute w-4 h-4 ${pos} ${border}`}
                  style={{ borderColor: "hsl(183 100% 50% / 0.5)", margin: "-1px" }} />
              ))}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" fill="none">
                <path d="M50 90 C30 90 20 75 20 60 L20 35 C20 30 24 27 28 27 C32 27 36 30 36 35 L36 50 L36 30 C36 25 40 22 44 22 C48 22 52 25 52 30 L52 48 L52 25 C52 20 56 17 60 17 C64 17 68 20 68 25 L68 48 L68 32 C68 27 72 24 76 24 C80 24 84 27 84 32 L84 62 C84 78 70 90 50 90Z"
                  stroke="hsl(183 100% 50%)" strokeWidth="1.5" strokeLinejoin="round" />
                {[[36, 27], [50, 22], [64, 18], [76, 27]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(183 100% 50%)" />
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
      </div>

      {/* Camera + MediaPipe when recording — constrained so it doesn't cover bottom controls */}
      {isRecording && (
        <div
          className="absolute left-4 right-4 top-4 bottom-[320px] rounded-2xl overflow-hidden border border-border z-[5] pointer-events-auto"
          style={{ boxShadow: "0 0 24px hsl(272 76% 53% / 0.15)" }}
        >
          <HandTracker
            isActive={true}
            onGestureDetected={handleGestureDetected}
            externalStream={glassesStream}
          />
        </div>
      )}

      {/* Top bar - hidden when embedded */}
      {!embedded && (
        <div className={`relative z-10 flex items-center justify-between px-5 pt-12 pb-4 transition-opacity duration-300 ${focusMode ? "a11y-focus-dim" : ""}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-glow-pulse" />
            <span className="font-display text-sm font-bold gradient-text-purple-cyan">AstraSign</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={wearableStatus === "connected" ? disconnectFromGlasses : connectToGlasses}
              title={wearableStatus === "connected" ? "Disconnect Glasses" : "Connect Smart Glasses"}
              className={`w-9 h-9 rounded-xl glass flex items-center justify-center transition-colors ${wearableStatus === "connected"
                ? "neon-border-cyan text-neon-cyan"
                : wearableStatus === "connecting"
                  ? "neon-border-purple text-neon-purple animate-pulse"
                  : "border border-border text-muted-foreground hover:text-neon-purple"
                }`}
            >
              <Glasses size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mode label - hidden when embedded */}
      {!embedded && (
        <div className={`relative z-10 flex justify-center mb-2 ${focusMode ? "a11y-focus-dim" : ""}`}>
          <div className="glass rounded-full px-4 py-1.5 neon-border-purple flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="1" width="2.5" height="8" rx="1.25" fill="hsl(272 76% 53%)" />
              <rect x="5.5" y="2.5" width="2.5" height="6.5" rx="1.25" fill="hsl(272 76% 53%)" opacity="0.8" />
              <rect x="9" y="0.5" width="2.5" height="9" rx="1.25" fill="hsl(272 76% 53%)" opacity="0.6" />
            </svg>
            <span className="text-xs font-semibold text-neon-purple tracking-wider">SIGN → VOICE</span>
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

      {/* Bottom interactive layer: translation + control panel — above decorative layer, below app nav (z-50) */}
      <div className="relative z-20 flex flex-col pointer-events-auto shrink-0">
        {/* Translation text - focus content when focus mode */}
        {translation && (
          <div
            className={`mx-5 mb-3 p-4 glass rounded-2xl neon-border-cyan animate-fade-in-up ${focusMode ? "a11y-focus-content" : ""}`}
            style={{ boxShadow: "0 0 20px hsl(183 100% 50% / 0.1)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-glow-pulse" />
              <span className="text-xs text-neon-cyan tracking-wider font-medium">TRANSLATED</span>
              <span className="ml-auto text-xs font-bold text-neon-cyan">{confidence}% Accuracy</span>
            </div>
            <p className="text-foreground font-medium text-base leading-relaxed">{translation}</p>
          </div>
        )}

        {/* Control Panel — sticky at bottom so it's always visible and clickable */}
        <div
          className={`sticky bottom-0 mx-3 mb-6 mt-auto glass-strong rounded-3xl p-5 ${focusMode ? "a11y-focus-dim" : ""}`}
          style={{ boxShadow: "0 -10px 40px hsl(272 76% 53% / 0.1)" }}
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
              className="flex items-center gap-2 glass rounded-full px-3 py-1.5 neon-border-purple transition-all cursor-pointer"
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
