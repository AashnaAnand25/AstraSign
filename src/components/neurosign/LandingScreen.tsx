import { useEffect, useState } from "react";
import heroBg from "@/assets/hero-bg.png";

interface Props {
  onStart: () => void;
}

const Particle = ({ delay }: { delay: number }) => {
  const tx = (Math.random() - 0.5) * 60;
  return (
    <div
      className="absolute w-1 h-1 rounded-full bg-neon-purple"
      style={{
        bottom: "30%",
        left: `${Math.random() * 80 + 10}%`,
        animation: `particle-float 2s ease-out ${delay}s infinite`,
        "--tx": `${tx}px`,
        boxShadow: "0 0 6px hsl(272 76% 53%)",
      } as React.CSSProperties}
    />
  );
};

export default function LandingScreen({ onStart }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between pb-12 overflow-hidden">
      {/* Hero image bg */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      </div>

      {/* Particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Particle key={i} delay={i * 0.3} />
      ))}

      {/* Top status bar */}
      <div className="relative z-10 w-full flex justify-between items-center px-6 pt-12 text-xs text-muted-foreground font-sans">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-glow-pulse" />
          <span className="text-neon-cyan font-medium">AI ONLINE</span>
        </div>
      </div>

      {/* Logo & Hero */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 mt-8 px-8"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease" }}
      >
        {/* Logo mark */}
        <div className="relative">
          {/* Spinning ring */}
          <div
            className="absolute inset-0 rounded-full border border-neon-purple/30 animate-spin-slow"
            style={{ width: "120px", height: "120px", top: "-16px", left: "-16px" }}
          />
          <div
            className="absolute inset-0 rounded-full border border-neon-cyan/20 animate-spin-slow"
            style={{
              width: "140px",
              height: "140px",
              top: "-26px",
              left: "-26px",
              animationDirection: "reverse",
              animationDuration: "12s",
            }}
          />
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl glass neon-border-purple glow-purple flex items-center justify-center animate-float">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M8 30 Q8 8 20 8 Q32 8 32 20 Q32 32 20 32"
                stroke="hsl(272 76% 53%)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="12" cy="18" r="2.5" fill="hsl(183 100% 50%)" />
              <circle cx="20" cy="12" r="2" fill="hsl(272 76% 53%)" />
              <circle cx="28" cy="18" r="2" fill="hsl(272 76% 53%)" />
              <circle cx="20" cy="28" r="2.5" fill="hsl(183 100% 50%)" />
              <line x1="12" y1="18" x2="20" y2="12" stroke="hsl(272 76% 53% / 0.5)" strokeWidth="1" />
              <line x1="20" y1="12" x2="28" y2="18" stroke="hsl(183 100% 50% / 0.5)" strokeWidth="1" />
              <line x1="28" y1="18" x2="20" y2="28" stroke="hsl(272 76% 53% / 0.5)" strokeWidth="1" />
              <line x1="20" y1="28" x2="12" y2="18" stroke="hsl(183 100% 50% / 0.5)" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="font-display text-5xl font-black tracking-wider gradient-text-purple-cyan"
            style={{ letterSpacing: "0.08em" }}
          >
            NEURO<span className="text-neon-cyan">SIGN</span>
          </h1>
          <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-neon-purple to-transparent" />
        </div>

        {/* Tagline */}
        <div className="text-center space-y-2">
          <p className="text-xl font-medium text-foreground/90 tracking-wide">
            Breaking Communication
          </p>
          <p className="text-2xl font-bold gradient-text-purple-cyan">
            Barriers.
          </p>
        </div>

        {/* Waveform */}
        <div className="flex items-center gap-1 h-10 my-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="wave-bar w-1 rounded-full bg-gradient-to-t from-neon-purple to-neon-cyan"
              style={{
                height: `${Math.random() * 28 + 8}px`,
                animationDelay: `${i * 0.08}s`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["ASL → Speech", "Real-time AI", "Zero Latency"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full glass neon-border-cyan text-xs font-medium text-neon-cyan"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 w-full px-8 flex flex-col gap-4 items-center">
        {/* AI confidence meter */}
        <div className="glass neon-border-purple rounded-2xl px-5 py-3 flex items-center gap-3 w-full max-w-xs">
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(272 76% 53% / 0.2)" strokeWidth="3" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="hsl(183 100% 50%)"
                strokeWidth="3"
                strokeDasharray={`${0.97 * 100.5} 100.5`}
                strokeLinecap="round"
                className="animate-glow-pulse"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-neon-cyan">97%</span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">AI Confidence</div>
            <div className="text-sm font-semibold text-foreground">Gemini Neural v4</div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="relative w-full max-w-xs py-4 rounded-2xl font-display font-bold text-lg tracking-widest text-white overflow-hidden group transition-transform active:scale-95"
          style={{
            background: "linear-gradient(135deg, hsl(272 76% 53%), hsl(272 76% 40%))",
            boxShadow: "0 0 30px hsl(272 76% 53% / 0.5), 0 0 80px hsl(272 76% 53% / 0.2)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <span className="relative z-10">START TRANSLATING</span>
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Powered by NeuroSign AI · Version 2.4
        </p>
      </div>
    </div>
  );
}
