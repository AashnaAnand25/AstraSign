import React from "react";
import AstraSignLogo from "@/components/AstraSignLogo";

interface Props {
  onStart: () => void;
}

export default function MinimalLandingScreen({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 max-w-[430px] mx-auto pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="text-center space-y-8 relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center gap-5">
          <AstraSignLogo size="lg" iconOnly />
          <h1 className="text-4xl sm:text-5xl font-black tracking-wider text-foreground">
            AstraSign
          </h1>
        </div>
        <p className="text-sm tracking-wider uppercase text-primary font-medium">
          ASL Translation
        </p>

        {/* Tagline */}
        <p className="text-lg text-muted-foreground font-light tracking-wide">
          Breaking Communication Barriers
        </p>

        {/* CTA button */}
        <button
          type="button"
          onClick={onStart}
          className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover font-semibold text-sm tracking-wider text-primary-foreground transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer"
        >
          Get Started
        </button>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary border border-border text-foreground">
            Audio → ASL
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary border border-border text-foreground">
            ASL → Audio
          </span>
        </div>
      </div>
    </div>
  );
}
