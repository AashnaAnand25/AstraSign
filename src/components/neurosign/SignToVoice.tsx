/**
 * SignToVoice — ASL → Text → Voice screen (LOCAL v4.0 version)
 *
 * Local pipeline:
 *   Webcam → MediaPipe → AslEngine (v4.0 Pro) → ContextModel → instant recognition
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Settings, Mic, MicOff, Volume2, Trash2, Undo2 } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useFastSignPipeline } from "@/hooks/useFastSignPipeline";
import type { Landmark } from "@/hooks/useHandTracking";

interface Props {
  onBack: () => void;
  onSettings: () => void;
  focusMode?: boolean;
}

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];
const TIP_INDICES = new Set([4, 8, 12, 16, 20]);

// ── WaveformBar ───────────────────────────────────────────────────────────────
const WaveformBar = ({ i, active }: { i: number; active: boolean }) => {
  const [h, setH] = useState(4);
  useEffect(() => {
    if (!active) { setH(4); return; }
    const t = setInterval(() => setH(Math.random() * 28 + 4), 120 + i * 25);
    return () => clearInterval(t);
  }, [active, i]);
  return (
    <div
      className="rounded-full transition-all duration-150"
      style={{
        width: "3px",
        height: `${h}px`,
        background: active
          ? "linear-gradient(to top, hsl(272 76% 53%), hsl(183 100% 50%))"
          : "hsl(240 10% 20%)",
      }}
    />
  );
};

// ── GlossChip ─────────────────────────────────────────────────────────────────
const GlossChip = ({ word, isLast }: { word: string; isLast: boolean }) => (
  <span
    className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider shrink-0"
    style={{
      background: isLast ? "hsl(272 76% 53% / 0.25)" : "hsl(240 10% 12%)",
      border: `1px solid ${isLast ? "hsl(272 76% 53% / 0.6)" : "hsl(240 10% 18%)"}`,
      color: isLast ? "hsl(272 76% 75%)" : "hsl(240 5% 65%)",
      boxShadow: isLast ? "0 0 10px hsl(272 76% 53% / 0.2)" : "none",
    }}
  >
    {word}
  </span>
);

export default function SignToVoice({ onBack, onSettings, focusMode }: Props) {
  const { settings } = useAccessibility();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { landmarks, isReady: mpReady, error: mpError } = useHandTracking(videoRef);

  const {
    glossWords,
    isDetectingSign,
    isRecognizing,
    translatedText,
    audioUrl,
    isTranslating,
    status,
    detectedGesture,
    suggestions,
    beginRecording,
    commitSegment,
    triggerTranslate,
    undoLastWord,
    clearGloss,
    setGlossWords,
  } = useFastSignPipeline(videoRef, landmarks);

  // ── Start webcam ────────────────────────────────────────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setCamReady(true);
      } catch {
        setCamError("Camera access denied — please allow webcam permission and reload.");
      }
    }
    start();
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };
  }, []);

  // ── Draw hand skeleton ──────────────────────────────────────────────────────
  const drawSkeleton = useCallback((allHands: Landmark[][] | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!allHands || allHands.length === 0) return;

    const w = canvas.width;
    const h = canvas.height;

    allHands.forEach((lms) => {
      const px = (lm: Landmark) => (1 - lm.x) * w;
      const py = (lm: Landmark) => lm.y * h;

      ctx.strokeStyle = isDetectingSign ? "rgba(0,255,240,0.80)" : "rgba(0,255,240,0.45)";
      ctx.lineWidth = 2;
      for (const [a, b] of CONNECTIONS) {
        ctx.beginPath();
        ctx.moveTo(px(lms[a]), py(lms[a]));
        ctx.lineTo(px(lms[b]), py(lms[b]));
        ctx.stroke();
      }
      for (let i = 0; i < lms.length; i++) {
        const isTip = TIP_INDICES.has(i);
        ctx.beginPath();
        ctx.arc(px(lms[i]), py(lms[i]), isTip ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? "hsl(272,76%,70%)" : "hsl(183,100%,60%)";
        ctx.shadowColor = isTip ? "hsl(272,76%,53%)" : "hsl(183,100%,50%)";
        ctx.shadowBlur = isTip ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }, [isDetectingSign]);

  useEffect(() => { drawSkeleton(landmarks); }, [landmarks, drawSkeleton]);

  // ── ElevenLabs audio playback ───────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    audio.src = audioUrl;
    audio.play().catch(() => { });
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  }, [audioUrl]);

  // ── Haptic feedback on new word ─────────────────────────────────────────────
  useEffect(() => {
    if (!glossWords.length) return;
    if (settings.hapticFeedback && "vibrate" in navigator) {
      try { navigator.vibrate?.([30, 15, 30]); } catch { /* ignore */ }
    }
  }, [glossWords.length, settings.hapticFeedback]);

  // ── UI helpers ──────────────────────────────────────────────────────────────
  const toggleRecord = () => {
    if (!isRecording) {
      beginRecording();
      setIsRecording(true);
    } else {
      setIsRecording(false);
      commitSegment();
    }
  };

  const handleSpeak = () => {
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    else if (audioUrl) { audioRef.current?.play(); setIsPlaying(true); }
    else { triggerTranslate(); }
  };

  const isLoading = !mpReady || !camReady;
  const hasError = !!(camError || mpError);
  const hasGloss = glossWords.length > 0;
  const canSpeak = (hasGloss && !isTranslating) || !!audioUrl;

  const dotColor = isRecognizing ? "hsl(40 90% 55%)"
    : isDetectingSign ? "hsl(142 70% 50%)"
      : isRecording ? "hsl(272 76% 53%)"
        : "hsl(240 5% 40%)";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#080810]">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
        backgroundImage: "linear-gradient(hsl(272 76% 53% / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(272 76% 53% / 0.4) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      {isRecording && (
        <div className="absolute left-0 right-0 h-px opacity-25 pointer-events-none z-10" style={{
          background: "hsl(183 100% 50%)", top: "40%", animation: "scan-line 3s linear infinite",
        }} />
      )}

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-12 pb-3 transition-opacity duration-300"
        style={{ opacity: focusMode ? 0.15 : 1, pointerEvents: focusMode ? "none" : "auto" }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
          <span className="font-display text-sm font-bold gradient-text-purple-cyan">ASTRA → VISION</span>
        </div>
        <button onClick={onSettings} className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors">
          <Settings size={16} />
        </button>
      </div>

      {/* Camera */}
      <div className="relative z-10 mx-4 rounded-3xl overflow-hidden"
        style={{ aspectRatio: "4/3", border: "1px solid hsl(272 76% 53% / 0.3)" }}>
        {(isLoading || hasError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20" style={{ background: "hsl(240 20% 4%)" }}>
            {hasError ? <p className="text-xs text-muted-foreground px-6 text-center">{camError || mpError}</p> : <div className="w-8 h-8 rounded-full border-2 animate-spin border-neon-purple border-t-transparent" />}
          </div>
        )}
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" width={640} height={480} />
      </div>

      {/* Status */}
      <div className="relative z-10 mx-4 mt-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/50">
        <p className="text-[10px] text-muted-foreground tracking-wide truncate">
          {status} {detectedGesture && <span className="ml-2 text-neon-cyan">({detectedGesture})</span>}
        </p>
      </div>

      {/* v4.0 Suggestions */}
      {isDetectingSign && suggestions.length > 0 && (
        <div className="relative z-10 mx-4 mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setGlossWords((prev: string[]) => [...prev, s])}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider glass neon-border-cyan text-neon-cyan active:scale-95 transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Gloss */}
      <div className="relative z-10 mx-4 mt-2 min-h-[32px]">
        {hasGloss ? (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {glossWords.map((w, i) => (
              <GlossChip key={i} word={w} isLast={i === glossWords.length - 1} />
            ))}
          </div>
        ) : <p className="text-[10px] text-muted-foreground italic">Sign to begin…</p>}
      </div>

      {/* Translated Text */}
      {translatedText && (
        <div className="relative z-10 mx-4 mt-2 p-3 rounded-2xl glass neon-border-cyan animate-fade-in-up">
          <p className="text-foreground text-sm font-medium">{translatedText}</p>
        </div>
      )}

      <div className="flex-1" />

      {/* Controls */}
      <div className="relative z-20 mx-3 mb-6 glass-strong rounded-3xl p-4 shadow-2xl">
        {isPlaying && (
          <div className="flex items-center justify-center gap-0.5 mb-3 h-6">
            {Array.from({ length: 20 }).map((_, i) => <WaveformBar key={i} i={i} active={isPlaying} />)}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <button onClick={undoLastWord} disabled={!hasGloss} className="w-11 h-11 rounded-2xl flex items-center justify-center bg-muted/20 border border-border/50 disabled:opacity-20"><Undo2 size={16} /></button>
          <button onClick={toggleRecord} disabled={isLoading || hasError}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]" : "bg-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.4)]"}`}>
            {isRecording ? <MicOff size={22} color="white" /> : <Mic size={22} color="white" />}
          </button>
          <button onClick={handleSpeak} disabled={!canSpeak} className="w-11 h-11 rounded-2xl flex items-center justify-center bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan disabled:opacity-20">
            {isTranslating ? <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /> : <Volume2 size={18} />}
          </button>
          <button onClick={clearGloss} disabled={!hasGloss && !translatedText} className="w-11 h-11 rounded-2xl flex items-center justify-center bg-muted/20 border border-border/50 disabled:opacity-20"><Trash2 size={16} /></button>
        </div>
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}
