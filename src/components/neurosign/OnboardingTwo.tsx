import { ArrowRight } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingTwo({ onNext, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-10">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="text-xs text-muted-foreground">Back</button>
        <div className="font-display text-sm font-bold gradient-text-purple-cyan">SIGNBRIDGE</div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <div className="glass rounded-3xl p-6 neon-border-cyan">
          <div className="text-xs font-semibold tracking-widest uppercase text-neon-cyan mb-3">Future vision</div>
          <div className="text-sm text-foreground font-semibold mb-1">Meta glasses display</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            The same live sign output can be mirrored to wearable displays for hands-free communication.
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(240 10% 15%)" }}>
              <div className="h-full rounded-full" style={{ width: "72%", background: "linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)))" }} />
            </div>
            <div className="text-[10px] text-muted-foreground">Prototype</div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 neon-border-purple">
          <div className="text-xs font-semibold tracking-widest uppercase text-neon-purple mb-3">Two-way</div>
          <div className="text-sm text-foreground font-semibold mb-1">Deaf → Hearing mode</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            Type or choose quick phrases and speak them aloud for the hearing person.
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl font-display font-bold text-sm tracking-widest text-white transition-all active:scale-95 flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, hsl(272 76% 53%), hsl(183 100% 35%))",
          boxShadow: "0 0 24px hsl(272 76% 53% / 0.35)",
        }}
      >
        Get Started
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
