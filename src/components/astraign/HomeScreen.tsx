import { Settings, Users, ArrowLeftRight } from "lucide-react";

interface Props {
  onStartLive: () => void;
  onReverseMode: () => void;
  onVoiceToSign: () => void;
  onCameraMode: () => void;
  onEnhancedCameraMode?: () => void;
  onConversation: () => void;
  onSettings: () => void;
  onTranslationHub?: () => void;
}


const BigCard = ({ title, subtitle, desc, color, onClick }: { title: string; subtitle: string; desc: string; color: "purple" | "cyan" | "pink"; onClick: () => void }) => {
  const c = color === "purple" ? "hsl(272 76% 53%)" : color === "cyan" ? "hsl(183 100% 50%)" : "hsl(316 80% 60%)";
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-3xl glass transition-all duration-300 active:scale-95 hover:scale-[1.01] overflow-hidden"
      style={{ border: `1px solid ${c}33`, boxShadow: `0 0 24px ${c}14, inset 0 0 30px ${c}08` }}
    >
      <div className="p-6">
        <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: c }}>{subtitle}</div>
        <div className="font-display text-xl font-bold text-foreground mt-1">{title}</div>
        <div className="text-sm text-muted-foreground mt-2 leading-relaxed">{desc}</div>
        <div className="mt-4 flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c, opacity: 0.25 + i * 0.25 }} />
          ))}
        </div>
      </div>
    </button>
  );
};

export default function HomeScreen({ onStartLive, onReverseMode, onCameraMode, onEnhancedCameraMode, onVoiceToSign, onConversation, onSettings, onTranslationHub }: Props) {
  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium tracking-wider">AI READY</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Home</h2>
        </div>
        <button
          onClick={onSettings}
          className="w-10 h-10 rounded-2xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <Users size={18} />
        </button>
      </div>


      <div className="flex flex-col gap-4 flex-1">
        <BigCard
          color="cyan"
          title="Start Signing"
          subtitle="Live"
          desc="Speak naturally and watch sign output update in real time."
          onClick={onStartLive}
        />
        <BigCard
          color="pink"
          title="Deaf → Hearing"
          subtitle="Text to Speech"
          desc="Type or tap a phrase and speak it aloud for the hearing person."
          onClick={onReverseMode}
        />
        <BigCard
          color="cyan"
          title="Hearing → Deaf"
          subtitle="Voice → Sign (v4.0)"
          desc="Listen to voice and visualize as ASL symbols in real-time."
          onClick={onVoiceToSign}
        />
        <BigCard
          color="purple"
          title="ASL Detection"
          subtitle="Sign → Voice"
          desc="Point the camera at signing and generate natural voice output."
          onClick={onCameraMode}
        />

        <button
          onClick={onConversation}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{
            background: "hsl(272 76% 53% / 0.08)",
            border: "1px solid hsl(272 76% 53% / 0.25)",
            color: "hsl(var(--neon-purple))",
          }}
        >
          Conversation Mode
        </button>

        {onTranslationHub && (
          <button
            onClick={onTranslationHub}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: "hsl(183 100% 50% / 0.08)",
              border: "1px solid hsl(183 100% 50% / 0.25)",
              color: "hsl(var(--neon-cyan))",
            }}
          >
            <ArrowLeftRight size={16} />
            ASL Translation Hub
          </button>
        )}

        <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
          <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">Preloaded Vocabulary</div>
          <div className="flex flex-wrap gap-2">
            {["Medical", "Appointments", "Safety", "Classroom"].map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full text-[10px] font-medium text-muted-foreground" style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 16%)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
