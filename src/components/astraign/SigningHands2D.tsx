/**
 * 2D sign.mt-style signing hands (SVG).
 * Shows actual hand shapes per sign — same pipeline as sign.mt (text → pose → render).
 */
import { useState, useEffect } from "react";
import type { ASLAnimationId } from "@/data/aslAnimationMap";

interface SigningHands2DProps {
  currentSign: ASLAnimationId;
  isAnimating?: boolean;
  className?: string;
}

// SVG hand paths: left and right hand silhouettes per sign (sign.mt-style 2D poses)
function HandLeft({ sign, animate, tick }: { sign: ASLAnimationId; animate: boolean; tick: number }) {
  const wave = animate ? Math.sin(tick / 30) * 8 : 0;
  switch (sign) {
    case "hello":
      return (
        <g transform="translate(42, 28) rotate(-15)">
          <ellipse cx={0} cy={0} rx={14} ry={18} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M -4 -12 Q 2 -8 4 2 Q 2 10 -2 14 L -6 12 Q -2 8 -4 0 Q -6 -8 -4 -12 Z" fill="hsl(30 60% 88%)" stroke="hsl(25 40% 65%)" strokeWidth={1} />
          <path d="M 6 -10 L 10 4 L 6 12" stroke="hsl(25 40% 65%)" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 2 -6 L 4 6 L 2 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -4 L 0 8 L -2 12" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -6 -2 L -4 6 L -6 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
    case "thank":
    case "thank_you":
      return (
        <g transform="translate(38, 40)">
          <ellipse cx={0} cy={0} rx={12} ry={16} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M -2 -14 L 2 0 L 0 12 L -4 10" fill="hsl(30 60% 88%)" stroke="hsl(25 40% 65%)" strokeWidth={1} />
          <path d="M 2 -12 L 6 2 L 4 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M 0 -8 L 2 4 L 0 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -6 L 0 4 L -2 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -6 -4 L -4 2 L -6 6" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
    case "help":
      return (
        <g transform="translate(32, 22) rotate(-10)">
          <ellipse cx={0} cy={0} rx={14} ry={18} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M 2 -14 L 8 2 L 6 14" stroke="hsl(25 40% 65%)" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 0 -10 L 4 4 L 2 12" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -8 L 2 6 L 0 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -4 -6 L -2 4 L -4 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -8 -4 L -6 2 L -8 6" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
    case "yes":
      return (
        <g transform="translate(40, 36)">
          <ellipse cx={0} cy={0} rx={12} ry={14} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M -6 -8 Q 0 -12 6 -8 Q 4 0 2 10 Q 0 14 -4 12 Q -2 6 -6 -8 Z" fill="hsl(30 60% 88%)" stroke="hsl(25 40% 65%)" strokeWidth={1} />
        </g>
      );
    case "no":
      return (
        <g transform="translate(40, 34)">
          <ellipse cx={0} cy={0} rx={12} ry={14} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M -4 -10 L 4 8 M 4 -10 L -4 8" stroke="hsl(25 40% 65%)" strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    case "emergency":
      return (
        <g transform={`translate(36, 24) rotate(${wave})`}>
          <ellipse cx={0} cy={0} rx={14} ry={18} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M 2 -14 L 8 2 L 6 14" stroke="hsl(25 40% 65%)" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 0 -10 L 4 4 L 2 12" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -8 L 2 6 L 0 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -4 -6 L -2 4 L -4 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -8 -4 L -6 2 L -8 6" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g transform="translate(40, 36)">
          <ellipse cx={0} cy={0} rx={12} ry={16} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M 2 -12 L 6 4 L 4 12" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M 0 -8 L 2 4 L 0 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -6 L 0 4 L -2 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -4 -4 L -2 2 L -4 6" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -8 -2 L -6 4 L -8 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

function HandRight({ sign, animate, tick }: { sign: ASLAnimationId; animate: boolean; tick: number }) {
  const wave = animate ? Math.sin(tick / 30) * 8 : 0;
  switch (sign) {
    case "hello":
      return (
        <g transform={`translate(58, 28) scale(-1,1) rotate(${-15 + wave})`}>
          <ellipse cx={0} cy={0} rx={14} ry={18} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M -4 -12 Q 2 -8 4 2 Q 2 10 -2 14 L -6 12 Q -2 8 -4 0 Q -6 -8 -4 -12 Z" fill="hsl(30 60% 88%)" stroke="hsl(25 40% 65%)" strokeWidth={1} />
          <path d="M 6 -10 L 10 4 L 6 12" stroke="hsl(25 40% 65%)" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 2 -6 L 4 6 L 2 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -4 L 0 8 L -2 12" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -6 -2 L -4 6 L -6 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
    case "thank":
    case "thank_you":
      return (
        <g transform="translate(62, 40) scale(-1,1)">
          <ellipse cx={0} cy={0} rx={12} ry={16} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M -2 -14 L 2 0 L 0 12 L -4 10" fill="hsl(30 60% 88%)" stroke="hsl(25 40% 65%)" strokeWidth={1} />
          <path d="M 2 -12 L 6 2 L 4 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M 0 -8 L 2 4 L 0 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -6 L 0 4 L -2 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -6 -4 L -4 2 L -6 6" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
    case "help":
      return (
        <g transform="translate(68, 22) scale(-1,1) rotate(10)">
          <ellipse cx={0} cy={0} rx={14} ry={18} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M 2 -14 L 8 2 L 6 14" stroke="hsl(25 40% 65%)" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 0 -10 L 4 4 L 2 12" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -8 L 2 6 L 0 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -4 -6 L -2 4 L -4 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -8 -4 L -6 2 L -8 6" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
    case "yes":
      return (
        <g transform="translate(60, 36) scale(-1,1)">
          <ellipse cx={0} cy={0} rx={12} ry={14} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M -6 -8 Q 0 -12 6 -8 Q 4 0 2 10 Q 0 14 -4 12 Q -2 6 -6 -8 Z" fill="hsl(30 60% 88%)" stroke="hsl(25 40% 65%)" strokeWidth={1} />
        </g>
      );
    case "no":
      return (
        <g transform="translate(60, 34) scale(-1,1)">
          <ellipse cx={0} cy={0} rx={12} ry={14} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M -4 -10 L 4 8 M 4 -10 L -4 8" stroke="hsl(25 40% 65%)" strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    case "emergency":
      return (
        <g transform={`translate(64, 24) scale(-1,1) rotate(${10 - wave})`}>
          <ellipse cx={0} cy={0} rx={14} ry={18} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M 2 -14 L 8 2 L 6 14" stroke="hsl(25 40% 65%)" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 0 -10 L 4 4 L 2 12" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -8 L 2 6 L 0 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -4 -6 L -2 4 L -4 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -8 -4 L -6 2 L -8 6" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g transform="translate(60, 36) scale(-1,1)">
          <ellipse cx={0} cy={0} rx={12} ry={16} fill="hsl(30 60% 92%)" stroke="hsl(25 40% 70%)" strokeWidth={1.5} />
          <path d="M 2 -12 L 6 4 L 4 12" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M 0 -8 L 2 4 L 0 10" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -2 -6 L 0 4 L -2 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -4 -4 L -2 2 L -4 6" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -8 -2 L -6 4 L -8 8" stroke="hsl(25 40% 65%)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

export default function SigningHands2D({ currentSign, isAnimating = false, className = "" }: SigningHands2DProps) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isAnimating || currentSign === "idle") return;
    let id: number;
    function loop() {
      setTick((t) => t + 1);
      id = requestAnimationFrame(loop);
    }
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [isAnimating, currentSign]);

  return (
    <div className={className} aria-label="2D sign language hands">
      <svg
        viewBox="0 0 100 80"
        className="w-full h-full min-h-[140px]"
        style={{ maxHeight: 200 }}
      >
        <rect width={100} height={80} fill="hsl(240 15% 10%)" rx={4} />
        <HandLeft sign={currentSign} animate={isAnimating && currentSign !== "idle"} tick={tick} />
        <HandRight sign={currentSign} animate={isAnimating && currentSign !== "idle"} tick={tick} />
        {currentSign !== "idle" && (
          <text x={50} y={72} textAnchor="middle" className="fill-neon-cyan text-[8px] font-semibold" style={{ fontFamily: "system-ui" }}>
            {currentSign.toUpperCase()}
          </text>
        )}
      </svg>
    </div>
  );
}
