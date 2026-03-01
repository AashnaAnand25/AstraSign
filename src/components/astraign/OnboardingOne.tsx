import { ArrowRight } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function OnboardingOne({ onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-10">
      <div className="flex items-center justify-between mb-10">
        <div className="text-sm font-bold text-primary">AstraSign</div>
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">Close</button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">How it works</div>
          <div className="space-y-4">
            {[{
              title: "Speak",
              desc: "Use your voice naturally",
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
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M6 15V8a2 2 0 014 0v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M10 15V6a2 2 0 014 0v7a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ),
            }].map((s) => (
              <div key={s.title} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center text-primary border border-primary/20">
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
        onClick={onBack}
        className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover font-bold text-sm tracking-widest text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
      >
        Back to Home
      </button>
    </div>
  );
}
