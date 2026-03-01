import React, { useEffect, useState } from "react";
import AstraSignLogo from "@/components/AstraSignLogo";

interface Props {
  onStart: () => void;
}

export default function MinimalLandingScreen({ onStart }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 pb-12">
      <div 
        className="text-center space-y-8"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease" }}
      >
        {/* Logo */}
        <AstraSignLogo size="lg" />

        {/* Title */}
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-black tracking-wider gradient-text-purple-cyan">
            ASTRA<span className="text-neon-cyan">SIGN</span>
          </h1>
          <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-neon-purple to-transparent" />
          <p className="text-xl font-medium text-foreground/90 tracking-wide">
            Breaking Communication
          </p>
          <p className="text-2xl font-bold gradient-text-purple-cyan">
            Barriers.
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{
            background: "hsl(272 76% 53% / 0.08)",
            border: "1px solid hsl(272 76% 53% / 0.25)",
            color: "hsl(var(--neon-purple))",
          }}
        >
          Get Started
        </button>

        {/* Simple Features */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <div className="px-3 py-1 rounded-full text-xs font-medium text-muted-foreground" style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 16%)" }}>
            Audio → ASL
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium text-muted-foreground" style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 16%)" }}>
            ASL → Audio
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium text-muted-foreground" style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 16%)" }}>
            3D Avatar
          </div>
        </div>
      </div>
    </div>
  );
}
