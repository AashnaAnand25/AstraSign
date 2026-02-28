/**
 * SignToVoice — ASL → Text → Voice screen (LOCAL version)
 *
 * Local pipeline:
 *   Webcam → MediaPipe Gesture Recognizer → instant recognition
 *   → accumulated ASL gloss
 *   → POST /api/speak (ElevenLabs)
 *   → audio playback
 *   
 * NO API calls for recognition — runs entirely in browser!
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

// MediaPipe hand skeleton connections (pairs of landmark indices)
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

// ── SignToVoice ───────────────────────────────────────────────────────────────
export default function SignToVoice({ onBack, onSettings, focusMode }: Props) {
  const { settings } = useAccessibility();

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef  = useRef<HTMLAudioElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [camReady, setCamReady]       = useState(false);
  const [camError, setCamError]       = useState<string | null>(null);
  const [isPlaying, setIsPlaying]     = useState(false);

  // MediaPipe hand tracking — runs inference on every video frame
  const { landmarks, isReady: mpReady, error: mpError } = useHandTracking(videoRef);

  // Sign recognition pipeline — LOCAL gesture recognizer (no API calls)
  const {
    glossWords,
    isDetectingSign,
    isRecognizing,
    translatedText,
    audioUrl,
    isTranslating,
    status,
    detectedGesture,
    beginRecording,
    commitSegment,
    triggerTranslate,
    undoLastWord,
    clearGloss,
  } = useFastSignPipeline(videoRef);

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

  // ── Draw hand skeleton on canvas overlay ────────────────────────────────────
  const drawSkeleton = useCallback((lms: Landmark[] | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!lms) return;

    const w = canvas.width;
    const h = canvas.height;
    // Mirror x to match the horizontally-flipped video feed
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
      ctx.fillStyle  = isTip ? "hsl(272,76%,70%)" : "hsl(183,100%,60%)";
      ctx.shadowColor = isTip ? "hsl(272,76%,53%)" : "hsl(183,100%,50%)";
      ctx.shadowBlur  = isTip ? 8 : 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [isDetectingSign]);

  useEffect(() => { drawSkeleton(landmarks); }, [landmarks, drawSkeleton]);

  // ── ElevenLabs audio playback ───────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    audio.src = audioUrl;
    audio.play().catch(() => { /* autoplay blocked — user can tap Play */ });
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
      beginRecording();       // clears frame buffer, sets status
      setIsRecording(true);
    } else {
      setIsRecording(false);
      commitSegment();        // sends buffered frames to GPT-4o
    }
  };

  const handleSpeak = () => {
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    else if (audioUrl) { audioRef.current?.play(); setIsPlaying(true); }
    else { triggerTranslate(); }
  };

  const isLoading = !mpReady || !camReady;
  const hasError  = !!(camError || mpError);
  const hasGloss  = glossWords.length > 0;
  const canSpeak  = (hasGloss && !isTranslating) || !!audioUrl;

  // Status dot: colour encodes pipeline state at a glance
  const dotColor = isRecognizing  ? "hsl(40 90% 55%)"
    : isDetectingSign             ? "hsl(142 70% 50%)"
    : isRecording                 ? "hsl(272 76% 53%)"
    :                               "hsl(240 5% 40%)";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#080810]">

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
        backgroundImage:
          "linear-gradient(hsl(272 76% 53% / 0.4) 1px, transparent 1px)," +
          "linear-gradient(90deg, hsl(272 76% 53% / 0.4) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      {isRecording && (
        <div className="absolute left-0 right-0 h-px opacity-25 pointer-events-none z-10" style={{
          background: "hsl(183 100% 50%)",
          boxShadow: "0 0 12px hsl(183 100% 50%)",
          animation: "scan-line 3s linear infinite",
          top: "40%",
        }} />
      )}

      {/* Top bar */}
      <div
        className="relative z-20 flex items-center justify-between px-5 pt-12 pb-3 transition-opacity duration-300"
        style={{ opacity: focusMode ? 0.15 : 1, pointerEvents: focusMode ? "none" : "auto" }}
      >
        <button onClick={onBack} className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full transition-colors duration-300"
               style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
          <span className="font-display text-sm font-bold gradient-text-purple-cyan">SIGN → VOICE</span>
        </div>
        <button onClick={onSettings} className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors">
          <Settings size={16} />
        </button>
      </div>

      {/* Camera viewport */}
      <div className="relative z-10 mx-4 rounded-3xl overflow-hidden"
           style={{ aspectRatio: "4/3", border: "1px solid hsl(272 76% 53% / 0.3)" }}>

        {/* Loading / error overlay */}
        {(isLoading || hasError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20"
               style={{ background: "hsl(240 20% 4%)" }}>
            {hasError ? (
              <>
                <div className="text-3xl">📷</div>
                <p className="text-xs text-center text-muted-foreground px-6">{camError || mpError}</p>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full border-2 animate-spin"
                     style={{ borderColor: "hsl(272 76% 53%)", borderTopColor: "transparent" }} />
                <p className="text-xs text-muted-foreground tracking-wider">
                  {!camReady ? "Requesting camera…" : "Loading AI model…"}
                </p>
              </>
            )}
          </div>
        )}

        {/* Webcam (mirrored) */}
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover"
               style={{ transform: "scaleX(-1)" }} playsInline muted />

        {/* Skeleton overlay */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" width={640} height={480} />

        {/* REC badge */}
        {isRecording && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 z-10"
               style={{ background: "hsl(272 76% 53% / 0.2)", border: "1px solid hsl(272 76% 53% / 0.5)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] font-bold text-red-400 tracking-wider">REC</span>
          </div>
        )}

        {/* Hand guide (pre-recording, no hand visible) */}
        {!isRecording && !hasError && camReady && !landmarks && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="rounded-3xl" style={{ width: "55%", height: "70%", border: "1.5px dashed hsl(272 76% 53% / 0.3)" }}>
              <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" fill="none">
                <path d="M50 90 C30 90 20 75 20 60 L20 35 C20 30 24 27 28 27 C32 27 36 30 36 35 L36 50
                         L36 30 C36 25 40 22 44 22 C48 22 52 25 52 30 L52 48 L52 25 C52 20 56 17 60 17
                         C64 17 68 20 68 25 L68 48 L68 32 C68 27 72 24 76 24 C80 24 84 27 84 32 L84 62
                         C84 78 70 90 50 90Z"
                      stroke="hsl(183 100% 50%)" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[10px] text-muted-foreground tracking-wider mt-2">Position hand in frame, then tap record</p>
          </div>
        )}

        {/* Signing glow rim */}
        {isDetectingSign && (
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
               style={{ boxShadow: "inset 0 0 30px hsl(183 100% 50% / 0.14)" }} />
        )}
      </div>

      {/* Status bar */}
      <div className="relative z-10 mx-4 mt-2 px-3 py-1.5 rounded-xl"
           style={{ background: "hsl(240 10% 8%)", border: "1px solid hsl(240 10% 14%)" }}>
        <p className="text-[10px] text-muted-foreground tracking-wide truncate">
          {status}
          {detectedGesture && (
            <span className="ml-2 text-neon-cyan">({detectedGesture})</span>
          )}
        </p>
      </div>

      {/* Gloss chips */}
      <div className="relative z-10 mx-4 mt-2 min-h-[32px]">
        {hasGloss ? (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {glossWords.map((w, i) => (
              <GlossChip key={`${w}-${i}`} word={w} isLast={i === glossWords.length - 1} />
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground italic">Recognised signs will appear here…</p>
        )}
      </div>

      {/* Translation result */}
      {translatedText && (
        <div className="relative z-10 mx-4 mt-2 p-3 rounded-2xl animate-fade-in-up" style={{
          background: "hsl(183 100% 50% / 0.06)",
          border: "1px solid hsl(183 100% 50% / 0.25)",
          boxShadow: "0 0 20px hsl(183 100% 50% / 0.08)",
        }}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-glow-pulse" />
            <span className="text-[10px] text-neon-cyan tracking-wider font-semibold">TRANSLATED</span>
          </div>
          <p className="text-foreground text-sm font-medium leading-relaxed">{translatedText}</p>
        </div>
      )}

      <div className="flex-1" />

      {/* Control panel */}
      <div className="relative z-20 mx-3 mb-6 glass-strong rounded-3xl p-4"
           style={{ boxShadow: "0 -10px 40px hsl(272 76% 53% / 0.08)" }}>

        {isPlaying && (
          <div className="flex items-center justify-center gap-0.5 mb-3 h-6">
            {Array.from({ length: 20 }).map((_, i) => <WaveformBar key={i} i={i} active={isPlaying} />)}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {/* Undo */}
          <button onClick={undoLastWord} disabled={!hasGloss} title="Remove last word"
                  className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-25"
                  style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 18%)", color: "hsl(240 5% 65%)" }}>
            <Undo2 size={16} />
          </button>

          {/* Record — main CTA */}
          <div className="relative">
            {isRecording && (
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                   style={{ background: "hsl(272 76% 53%)", transform: "scale(1.6)" }} />
            )}
            <button onClick={toggleRecord} disabled={isLoading || hasError}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90 relative z-10 disabled:opacity-40"
                    style={{
                      background: isRecording
                        ? "linear-gradient(135deg, hsl(316 80% 60%), hsl(272 76% 53%))"
                        : "linear-gradient(135deg, hsl(272 76% 53%), hsl(272 76% 38%))",
                      boxShadow: isRecording
                        ? "0 0 35px hsl(316 80% 60% / 0.55), 0 0 60px hsl(316 80% 60% / 0.25)"
                        : "0 0 25px hsl(272 76% 53% / 0.45)",
                    }}>
              {isRecording ? <MicOff size={22} color="white" /> : <Mic size={22} color="white" />}
            </button>
          </div>

          {/* Translate / Speak */}
          <button onClick={handleSpeak} disabled={!canSpeak}
                  title={audioUrl ? (isPlaying ? "Pause" : "Replay") : "Translate & Speak"}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-25"
                  style={{
                    background: "hsl(183 100% 50% / 0.12)",
                    border: `1px solid ${canSpeak ? "hsl(183 100% 50% / 0.4)" : "hsl(240 10% 18%)"}`,
                    color: "hsl(183 100% 50%)",
                    boxShadow: canSpeak ? "0 0 15px hsl(183 100% 50% / 0.2)" : "none",
                  }}>
            {isTranslating
              ? <div className="w-4 h-4 rounded-full border-2 animate-spin"
                     style={{ borderColor: "hsl(183 100% 50%)", borderTopColor: "transparent" }} />
              : <Volume2 size={18} />}
          </button>

          {/* Clear */}
          <button onClick={clearGloss} disabled={!hasGloss && !translatedText} title="Clear session"
                  className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-25"
                  style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 18%)", color: "hsl(240 5% 55%)" }}>
            <Trash2 size={16} />
          </button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-3">
          {isRecognizing
            ? "Recognising sign…"
            : isRecording
            ? "Signing — tap mic again to recognise"
            : "Tap mic → sign → tap mic again • Tap speaker to translate"}
        </p>
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}
