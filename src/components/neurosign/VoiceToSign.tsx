import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";
import { useVoicePipeline } from "@/hooks/useVoicePipeline";

// ── ASL Fingerspelling poses ───────────────────────────────────────────────────
// [thumb_ext, index_ext, middle_ext, ring_ext, pinky_ext]  0=curled  1=extended
const LETTER_POSES: Record<string, number[]> = {
  A: [0.2, 0,   0,   0,   0  ],
  B: [0,   1,   1,   1,   1  ],
  C: [0.6, 0.7, 0.7, 0.7, 0.6],
  D: [0,   1,   0.2, 0.2, 0.2],
  E: [0.1, 0.1, 0.1, 0.1, 0.1],
  F: [0.8, 0.1, 1,   1,   1  ],
  G: [0.8, 1,   0,   0,   0  ],
  H: [0,   1,   1,   0,   0  ],
  I: [0,   0,   0,   0,   1  ],
  J: [0,   0,   0,   0,   1  ],
  K: [0.5, 1,   1,   0,   0  ],
  L: [1,   1,   0,   0,   0  ],
  M: [0,   0.1, 0.1, 0.1, 0  ],
  N: [0,   0.1, 0.1, 0,   0  ],
  O: [0.5, 0.5, 0.5, 0.5, 0.5],
  P: [0.5, 1,   1,   0,   0  ],
  Q: [0.5, 1,   0,   0,   0  ],
  R: [0,   1,   1,   0,   0  ],
  S: [0.2, 0,   0,   0,   0  ],
  T: [0.3, 0.1, 0,   0,   0  ],
  U: [0,   1,   1,   0,   0  ],
  V: [0,   1,   1,   0,   0  ],
  W: [0,   1,   1,   1,   0  ],
  X: [0,   0.4, 0,   0,   0  ],
  Y: [1,   0,   0,   0,   1  ],
  Z: [0,   1,   0,   0,   0  ],
};

// Whole-word poses override fingerspelling for common signs
const WORD_POSES: Record<string, number[]> = {
  HELLO:       [1,   1,   1,   1,   1  ],
  THANK:       [0,   1,   1,   1,   1  ],
  "THANK YOU": [0,   1,   1,   1,   1  ],
  PLEASE:      [0.5, 0.8, 0.8, 0.8, 0.8],
  SORRY:       [0,   0,   0,   0,   0  ],
  YES:         [0.2, 0,   0,   0,   0  ],
  NO:          [0,   1,   1,   0,   0  ],
  HELP:        [0.5, 0,   0,   0,   0  ],
  LOVE:        [0,   0,   0,   0,   0  ],
  YOU:         [0,   1,   0,   0,   0  ],
  ME:          [0,   1,   0,   0,   0  ],
  I:           [0,   1,   0,   0,   0  ],
  GOOD:        [0,   1,   1,   1,   1  ],
  BAD:         [0,   1,   1,   1,   1  ],
  STOP:        [0,   0,   0,   0,   0  ],
  GO:          [0,   1,   1,   0,   0  ],
  WANT:        [0.3, 0.7, 0.7, 0.7, 0.7],
  NEED:        [0.3, 0.4, 0,   0,   0  ],
  WATER:       [0,   1,   1,   1,   0  ],
  EAT:         [0.5, 0.5, 0.5, 0.5, 0.5],
  HAPPY:       [0,   1,   1,   1,   1  ],
  SICK:        [0.5, 0,   1,   0,   0  ],
  WORK:        [0.2, 0,   0,   0,   0  ],
  HOME:        [0.5, 0.5, 0.5, 0.5, 0.5],
  FRIEND:      [0,   1,   0,   0,   0  ],
  UNDERSTAND:  [0,   0,   0,   0,   1  ],
  KNOW:        [0,   1,   1,   1,   1  ],
  FINISH:      [0,   1,   1,   1,   1  ],
  MORE:        [0.5, 0.5, 0.5, 0.5, 0.5],
  WHERE:       [0,   1,   0,   0,   0  ],
  WHAT:        [0,   1,   1,   1,   1  ],
  WHO:         [0,   1,   0,   0,   0  ],
  WHY:         [1,   0,   0,   0,   1  ],
  HOW:         [0,   0,   0,   0,   0  ],
};

function getPoses(word: string): number[][] {
  const up = word.toUpperCase();
  if (WORD_POSES[up]) return [WORD_POSES[up]];
  return Array.from(up).map(c => LETTER_POSES[c] ?? [0.5, 0.5, 0.5, 0.5, 0.5]);
}

// ── Canvas hand renderer ──────────────────────────────────────────────────────
function drawHandPose(canvas: HTMLCanvasElement, pose: number[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2;
  const palmTop = H * 0.44;
  const palmW = 54, palmH = 64;
  const palmLeft = cx - palmW / 2;

  // Ambient glow
  const grd = ctx.createRadialGradient(cx, palmTop + palmH / 2, 5, cx, palmTop + palmH / 2, 100);
  grd.addColorStop(0, "rgba(0,255,255,0.08)");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Palm (manual rounded rect for compat)
  const r = 14;
  ctx.beginPath();
  ctx.moveTo(palmLeft + r, palmTop);
  ctx.lineTo(palmLeft + palmW - r, palmTop);
  ctx.quadraticCurveTo(palmLeft + palmW, palmTop, palmLeft + palmW, palmTop + r);
  ctx.lineTo(palmLeft + palmW, palmTop + palmH - r);
  ctx.quadraticCurveTo(palmLeft + palmW, palmTop + palmH, palmLeft + palmW - r, palmTop + palmH);
  ctx.lineTo(palmLeft + r, palmTop + palmH);
  ctx.quadraticCurveTo(palmLeft, palmTop + palmH, palmLeft, palmTop + palmH - r);
  ctx.lineTo(palmLeft, palmTop + r);
  ctx.quadraticCurveTo(palmLeft, palmTop, palmLeft + r, palmTop);
  ctx.closePath();
  ctx.fillStyle = "rgba(0,255,255,0.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,255,255,0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const cyan   = "rgba(0,255,255,0.92)";
  const purple = "rgba(160,50,255,0.92)";

  function seg(x1: number, y1: number, x2: number, y2: number, w: number, col: string) {
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round";
    ctx.shadowColor = col; ctx.shadowBlur = 10;
    ctx.stroke(); ctx.shadowBlur = 0;
  }
  function dot(x: number, y: number, col: string) {
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
  }
  function finger(bx: number, by: number, ext: number, col: string, w: number) {
    const curl = (1 - ext) * (Math.PI * 0.72);
    const s1 = 22, s2 = 17, s3 = 12;
    const a1 = -Math.PI / 2;
    const x1 = bx + Math.cos(a1) * s1, y1 = by + Math.sin(a1) * s1;
    const a2 = a1 + curl;
    const x2 = x1 + Math.cos(a2) * s2, y2 = y1 + Math.sin(a2) * s2;
    const a3 = a2 + curl * 0.6;
    const x3 = x2 + Math.cos(a3) * s3, y3 = y2 + Math.sin(a3) * s3;
    seg(bx, by, x1, y1, w,   col); seg(x1, y1, x2, y2, w-1, col); seg(x2, y2, x3, y3, w-2, col);
    dot(bx, by, col); dot(x1, y1, col); dot(x2, y2, col);
  }

  // Thumb (left side of palm)
  const tx = palmLeft + 4, ty = palmTop + palmH * 0.35;
  const thumbCurl = (1 - pose[0]) * (Math.PI * 0.65);
  const ta1 = -Math.PI + 0.3;
  const tx1 = tx + Math.cos(ta1) * 16, ty1 = ty + Math.sin(ta1) * 16;
  const ta2 = ta1 + thumbCurl;
  const tx2 = tx1 + Math.cos(ta2) * 13, ty2 = ty1 + Math.sin(ta2) * 13;
  const tx3 = tx2 + Math.cos(ta2 + thumbCurl * 0.5) * 10, ty3 = ty2 + Math.sin(ta2 + thumbCurl * 0.5) * 10;
  seg(tx, ty, tx1, ty1, 8, purple); seg(tx1, ty1, tx2, ty2, 7, purple); seg(tx2, ty2, tx3, ty3, 6, purple);
  dot(tx, ty, purple); dot(tx1, ty1, purple); dot(tx2, ty2, purple);

  // Index, middle, ring, pinky
  const xOff  = [-17, -5, 7, 19];
  const fWidths = [ 8,  9, 8,  6];
  xOff.forEach((xo, i) => finger(cx + xo, palmTop, pose[i + 1], cyan, fWidths[i]));
}

// ── Wave bar ──────────────────────────────────────────────────────────────────
const WaveBar = ({ i, active }: { i: number; active: boolean }) => {
  const [h, setH] = useState(4);
  useEffect(() => {
    if (!active) { setH(4); return; }
    const id = setInterval(() => setH(Math.random() * 40 + 4), 100 + i * 20);
    return () => clearInterval(id);
  }, [active, i]);
  return (
    <div
      className="rounded-full transition-all duration-100 flex-shrink-0"
      style={{
        width: "3px", height: `${h}px`,
        background: active
          ? "linear-gradient(to top, hsl(272 76% 53%), hsl(183 100% 50%))"
          : "hsl(240 10% 20%)",
        boxShadow: active ? "0 0 6px hsl(272 76% 53% / 0.5)" : "none",
      }}
    />
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
interface Props { onBack: () => void; onSettings: () => void; }

export default function VoiceToSign({ onBack, onSettings }: Props) {
  const { settings } = useAccessibility();
  const { status, transcript, aslWords, error, start, stop, reset } = useVoicePipeline();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wordIdx, setWordIdx]     = useState(0);
  const [letterIdx, setLetterIdx] = useState(0);

  const isListening  = status === "listening";
  const isProcessing = status === "processing";
  const isDone       = status === "done" && aslWords.length > 0;

  // Reset animation when new words arrive
  useEffect(() => {
    if (status === "done" && aslWords.length > 0) {
      setWordIdx(0);
      setLetterIdx(0);
    }
  }, [status, aslWords]);

  // Animate: cycle through letter poses of current word
  useEffect(() => {
    if (!isDone || aslWords.length === 0) return;
    const poses = getPoses(aslWords[wordIdx] ?? "");
    if (letterIdx >= poses.length) {
      // Advance to next word
      const t = setTimeout(() => {
        if (wordIdx < aslWords.length - 1) {
          setWordIdx(wi => wi + 1);
          setLetterIdx(0);
        }
        // else: stay on last word (done)
      }, settings.stepMode ? 99999 : 800);
      return () => clearTimeout(t);
    }
    if (settings.stepMode) return; // manual advance only
    const delay = letterIdx === 0 ? 700 : 480;
    const t = setTimeout(() => setLetterIdx(li => li + 1), delay);
    return () => clearTimeout(t);
  }, [wordIdx, letterIdx, isDone, aslWords, settings.stepMode]);

  // Draw canvas when indices change
  useEffect(() => {
    if (!canvasRef.current || !isDone || aslWords.length === 0) return;
    const poses = getPoses(aslWords[wordIdx] ?? "");
    const pIdx  = Math.min(letterIdx, poses.length - 1);
    drawHandPose(canvasRef.current, poses[Math.max(0, pIdx)]);
  }, [wordIdx, letterIdx, isDone, aslWords]);

  // Draw idle pose on mount
  useEffect(() => {
    if (canvasRef.current && !isDone) {
      drawHandPose(canvasRef.current, [0.3, 0.6, 0.6, 0.6, 0.6]);
    }
  }, [isDone]);

  const toggleMic = () => {
    if (isListening) { stop(); return; }
    if (isDone || status === "error") { reset(); return; }
    start();
  };

  const currentWord   = isDone ? (aslWords[wordIdx] ?? "") : "";
  const poses         = isDone ? getPoses(currentWord) : [];
  const currentLetter = isDone && poses.length > 1
    ? (currentWord.toUpperCase()[Math.min(letterIdx, currentWord.length - 1)] ?? "")
    : "";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, hsl(272 76% 53% / 0.08) 0%, transparent 60%), hsl(240 20% 4%)",
        }}
      />

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
          <span className="font-display text-sm font-bold gradient-text-purple-cyan">ASTRASIGN</span>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Mode pill */}
      <div className="relative z-10 flex justify-center mb-4">
        <div className="glass rounded-full px-4 py-1.5 neon-border-cyan flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="4" y="1" width="6" height="8" rx="3" fill="hsl(183 100% 50%)" />
            <path d="M2 7a5 5 0 0010 0" stroke="hsl(183 100% 50%)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            <line x1="7" y1="12" x2="7" y2="13.5" stroke="hsl(183 100% 50%)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs font-semibold text-neon-cyan tracking-wider">VOICE → SIGN</span>
        </div>
      </div>

      {/* Hand canvas panel */}
      <div className="relative z-10 mx-5 mb-4">
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "hsl(240 15% 7%)",
            border: "1px solid hsl(183 100% 50% / 0.25)",
            boxShadow: "0 0 30px hsl(183 100% 50% / 0.08)",
            minHeight: "200px",
          }}
        >
          <div className="relative flex flex-col items-center justify-center py-4">
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={220}
              height={200}
              style={{ display: "block" }}
            />

            {/* Current word overlay */}
            {isDone && currentWord && (
              <div className="mt-1 flex flex-col items-center gap-1">
                <div
                  className="font-display text-3xl font-black gradient-text-purple-cyan"
                  style={{ textShadow: "0 0 20px hsl(272 76% 53% / 0.4)" }}
                >
                  {currentWord}
                </div>
                {currentLetter && (
                  <div className="text-xs text-neon-cyan/60 tracking-[0.3em]">
                    fingerspelling: {currentLetter}
                  </div>
                )}
              </div>
            )}

            {/* Idle placeholder */}
            {!isDone && !isProcessing && (
              <p className="absolute bottom-4 text-xs text-muted-foreground">
                {isListening ? "Listening… speak now" : "Tap mic · speak · see your signs"}
              </p>
            )}

            {/* Processing spinner */}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                    style={{
                      borderTopColor: "hsl(183 100% 50%)",
                      borderRightColor: "hsl(272 76% 53%)",
                    }}
                  />
                  <span className="text-xs text-neon-cyan">Converting to ASL…</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ASL word chips */}
      {isDone && aslWords.length > 0 && (
        <div className="relative z-10 px-5 mb-3">
          {settings.stepMode && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground">
                Step {wordIdx + 1} / {aslWords.length}
              </span>
              <button
                onClick={() => {
                  if (wordIdx < aslWords.length - 1) {
                    setWordIdx(wi => wi + 1);
                    setLetterIdx(0);
                  }
                }}
                className="text-[10px] font-semibold px-3 py-1 rounded-full"
                style={{
                  background: "hsl(240 10% 10%)",
                  border: "1px solid hsl(240 10% 16%)",
                  color: "hsl(183 100% 50%)",
                }}
              >
                Next sign →
              </button>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {aslWords.map((w, i) => (
              <button
                key={`${w}-${i}`}
                onClick={() => { setWordIdx(i); setLetterIdx(0); }}
                className="rounded-2xl px-3 py-2 flex-shrink-0 flex flex-col items-center gap-1 transition-all"
                style={{
                  background:
                    i === wordIdx
                      ? "hsl(183 100% 50% / 0.15)"
                      : "hsl(240 15% 7%)",
                  border:
                    i === wordIdx
                      ? "1px solid hsl(183 100% 50% / 0.6)"
                      : "1px solid hsl(240 10% 14%)",
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: i === wordIdx ? "hsl(183 100% 50%)" : "hsl(240 5% 65%)" }}
                >
                  {w}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      {(transcript || error) && (
        <div className="relative z-10 mx-5 mb-3 glass neon-border-purple rounded-2xl p-3 animate-fade-in-up">
          {error ? (
            <>
              <div className="text-xs text-red-400 font-medium tracking-wider mb-1">ERROR</div>
              <p className="text-sm text-red-300">{error}</p>
            </>
          ) : (
            <>
              <div className="text-xs text-neon-purple font-medium tracking-wider mb-1">RECOGNIZED SPEECH</div>
              <p className="text-sm text-foreground">{transcript}</p>
            </>
          )}
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

        {/* Button */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute rounded-full" style={{ width: 100, height: 100, top: -18, left: -18, border: "2px solid hsl(272 76% 53% / 0.3)", animation: "pulse-purple 1.8s ease-in-out infinite" }} />
                <div className="absolute rounded-full" style={{ width: 120, height: 120, top: -28, left: -28, border: "1px solid hsl(272 76% 53% / 0.15)", animation: "pulse-purple 1.8s ease-in-out 0.4s infinite" }} />
              </>
            )}
            <button
              onClick={toggleMic}
              disabled={isProcessing}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90 relative z-10 disabled:opacity-50"
              style={{
                background: isListening
                  ? "linear-gradient(135deg, hsl(183 100% 40%), hsl(272 76% 53%))"
                  : isDone
                  ? "linear-gradient(135deg, hsl(240 15% 15%), hsl(240 15% 10%))"
                  : "linear-gradient(135deg, hsl(272 76% 53%), hsl(272 76% 40%))",
                boxShadow: isListening
                  ? "0 0 30px hsl(183 100% 50% / 0.5), 0 0 60px hsl(183 100% 50% / 0.2)"
                  : "0 0 25px hsl(272 76% 53% / 0.5)",
              }}
            >
              {isDone ? (
                // Replay icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4v6h6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : isListening ? (
                // Stop icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="white"/>
                </svg>
              ) : (
                // Mic icon
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="8" y="3" width="8" height="14" rx="4" fill="white"/>
                  <path d="M4 12a8 8 0 0016 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <line x1="12" y1="20" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="9" y1="23" x2="15" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {isListening ? (
              <span className="text-neon-cyan animate-glow-pulse">Listening… speak naturally, then pause</span>
            ) : isProcessing ? (
              <span className="text-neon-purple">Converting to ASL grammar…</span>
            ) : isDone ? (
              <span className="text-muted-foreground">Tap to record again</span>
            ) : (
              "Tap mic and speak · signs appear below"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
