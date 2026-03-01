import { ArrowRight } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingTwo({ onNext, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-10">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <div className="text-sm font-bold text-primary">AstraSign</div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Future vision</div>
          <div className="text-sm text-foreground font-semibold mb-1">Meta glasses display</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            The same live sign output can be mirrored to wearable displays for hands-free communication.
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: "72%" }} />
            </div>
            <div className="text-[10px] text-muted-foreground">Prototype</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Two-way</div>
          <div className="text-sm text-foreground font-semibold mb-1">Deaf → Hearing mode</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            Type or choose quick phrases and speak them aloud for the hearing person.
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover font-bold text-sm tracking-widest text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
      >
        Get Started
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
