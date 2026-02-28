import { ArrowRight } from "lucide-react";

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function OnboardingOne({ onNext, onSkip }: Props) {
  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-10">
      <div className="flex items-center justify-between mb-10">
        <div className="font-display text-sm font-bold gradient-text-purple-cyan">SIGNBRIDGE</div>
        <button onClick={onSkip} className="text-xs text-muted-foreground">Skip</button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="glass rounded-3xl p-6 neon-border-purple">
          <div className="text-xs font-semibold tracking-widest uppercase text-neon-purple mb-3">How it works</div>
          <div className="space-y-4">
            {[{
              title: "Speak",
              desc: "Use your voice naturally",
              color: "hsl(183 100% 50%)",
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="7" y="2" width="4" height="10" rx="2" fill="currentColor" />
                  <path d="M4 9a5 5 0 0010 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <line x1="9" y1="14" x2="9" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ),
            }, {
              title: "Transcribe",
              desc: "Whisper converts speech to text",
              color: "hsl(272 76% 53%)",
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 4h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M3 9h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M3 14h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ),
            }, {
              title: "Sign",
              desc: "Show sign output instantly",
              color: "hsl(316 80% 60%)",
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M6 15V8a2 2 0 014 0v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M10 15V6a2 2 0 014 0v7a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ),
            }].map((s) => (
              <div key={s.title} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}1A`, color: s.color, border: `1px solid ${s.color}33` }}>
                  {s.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{s.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
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
        Next
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
