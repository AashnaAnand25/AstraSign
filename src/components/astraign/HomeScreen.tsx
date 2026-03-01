import { Settings, Users, ArrowLeftRight, Info } from "lucide-react";

interface Props {
  onStartLive: () => void;
  onReverseMode: () => void;
  onVoiceToSign: () => void;
  onCameraMode: () => void;
  onEnhancedCameraMode?: () => void;
  onConversation: () => void;
  onSettings: () => void;
  onTranslationHub?: () => void;
  onInfo?: () => void;
}


const BigCard = ({ title, subtitle, desc, onClick }: { title: string; subtitle: string; desc: string; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl bg-card border border-border transition-all duration-200 active:scale-95 hover:shadow-md hover:border-primary/50 overflow-hidden"
    >
      <div className="p-6">
        <div className="text-xs font-semibold tracking-widest uppercase text-primary">{subtitle}</div>
        <div className="text-xl font-bold text-foreground mt-1">{title}</div>
        <div className="text-sm text-muted-foreground mt-2 leading-relaxed">{desc}</div>
        <div className="mt-4 flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" style={{ opacity: 0.25 + i * 0.25 }} />
          ))}
        </div>
      </div>
    </button>
  );
};

export default function HomeScreen({ onStartLive, onReverseMode, onCameraMode, onEnhancedCameraMode, onVoiceToSign, onConversation, onSettings, onTranslationHub, onInfo }: Props) {
  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium tracking-wider">AI READY</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Home</h2>
        </div>
        <div className="flex gap-2">
          {onInfo && (
            <button
              onClick={onInfo}
              className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
            >
              <Info size={18} />
            </button>
          )}
          <button
            onClick={onSettings}
            className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
          >
            <Users size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <BigCard
          title="Start Signing"
          subtitle="Live"
          desc="Speak naturally and watch sign output update in real time."
          onClick={onStartLive}
        />
        <BigCard
          title="Deaf → Hearing"
          subtitle="Text to Speech"
          desc="Type or tap a phrase and speak it aloud for the hearing person."
          onClick={onReverseMode}
        />
        <BigCard
          title="Hearing → Deaf"
          subtitle="Voice → Sign (v4.0)"
          desc="Listen to voice and visualize as ASL symbols in real-time."
          onClick={onVoiceToSign}
        />
        <BigCard
          title="ASL Detection"
          subtitle="Sign → Voice"
          desc="Point the camera at signing and generate natural voice output."
          onClick={onCameraMode}
        />

        <button
          onClick={onConversation}
          className="w-full py-3 rounded-lg bg-accent-subtle border border-primary/25 text-primary text-sm font-semibold transition-all duration-200 active:scale-95 hover:bg-accent-subtle/80 flex items-center justify-center gap-2"
        >
          Conversation Mode
        </button>

        {onTranslationHub && (
          <button
            onClick={onTranslationHub}
            className="w-full py-3 rounded-lg bg-secondary border border-border text-foreground text-sm font-semibold transition-all duration-200 active:scale-95 hover:bg-accent-subtle hover:text-primary hover:border-primary/50 flex items-center justify-center gap-2"
          >
            <ArrowLeftRight size={16} />
            ASL Translation Hub
          </button>
        )}

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">Preloaded Vocabulary</div>
          <div className="flex flex-wrap gap-2">
            {["Medical", "Appointments", "Safety", "Classroom"].map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full text-[10px] font-medium text-muted-foreground bg-secondary border border-border">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
