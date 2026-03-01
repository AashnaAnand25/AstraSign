import React from "react";
import AstraSignLogo from "@/components/AstraSignLogo";

interface Props {
  onStart: () => void;
}

export default function MinimalLandingScreen({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow — theme purple/cyan so logo and text pop */}
      <div className="absolute inset-0 max-w-[430px] mx-auto pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-purple/0.15 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-neon-cyan/0.12 blur-[100px]" />
      </div>

      <div className="text-center space-y-8 relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo + wordmark — theme colors so they don’t blend into background */}
        <div className="flex flex-col items-center gap-5">
          <AstraSignLogo size="lg" iconOnly />
          <h1
            className="font-display text-4xl sm:text-5xl font-black tracking-wider"
            style={{
              background: "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            AstraSign
          </h1>
        </div>
        <p className="text-sm tracking-wider uppercase" style={{ color: "hsl(183 100% 50% / 0.95)" }}>
          ASL Translation
        </p>

        {/* Tagline */}
        <p className="text-lg text-muted-foreground font-light tracking-wide">
          Breaking Communication Barriers
        </p>

        {/* CTA — theme gradient button */}
        <button
          type="button"
          onClick={onStart}
          className="w-full py-4 rounded-2xl font-display font-semibold text-sm tracking-wider text-primary-foreground transition-all active:scale-[0.98] hover:opacity-95 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)))",
            boxShadow: "0 0 24px hsl(var(--neon-purple) / 0.35)",
          }}
        >
          Get Started
        </button>

        {/* Feature pills — theme borders */}
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
            style={{
              background: "hsl(240 15% 10% / 0.8)",
              border: "1px solid hsl(272 76% 53% / 0.35)",
            }}
          >
            Audio → ASL
          </span>
          <span
            className="px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
            style={{
              background: "hsl(240 15% 10% / 0.8)",
              border: "1px solid hsl(183 100% 50% / 0.35)",
            }}
          >
            ASL → Audio
          </span>
        </div>
      </div>
    </div>
  );
}
