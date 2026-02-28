import { Settings, ArrowLeft } from "lucide-react";

interface Props {
  onSelect: (mode: "sign-to-voice" | "voice-to-sign") => void;
  onSettings: () => void;
  onConversation: () => void;
}

const GlowCard = ({
  icon,
  title,
  subtitle,
  description,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  color: "purple" | "cyan";
  onClick: () => void;
}) => {
  const isPurple = color === "purple";
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-3xl glass transition-all duration-300 active:scale-95 hover:scale-[1.02] group relative overflow-hidden"
      style={{
        border: `1px solid ${isPurple ? "hsl(272 76% 53% / 0.4)" : "hsl(183 100% 50% / 0.4)"}`,
        boxShadow: isPurple
          ? "0 0 20px hsl(272 76% 53% / 0.15), inset 0 0 30px hsl(272 76% 53% / 0.05)"
          : "0 0 20px hsl(183 100% 50% / 0.15), inset 0 0 30px hsl(183 100% 50% / 0.05)",
      }}
    >
      {/* Animated border glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: isPurple
            ? "0 0 40px hsl(272 76% 53% / 0.3), inset 0 0 40px hsl(272 76% 53% / 0.1)"
            : "0 0 40px hsl(183 100% 50% / 0.3), inset 0 0 40px hsl(183 100% 50% / 0.1)",
        }}
      />

      <div className="p-6 space-y-4">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: isPurple
              ? "linear-gradient(135deg, hsl(272 76% 53% / 0.2), hsl(272 76% 53% / 0.05))"
              : "linear-gradient(135deg, hsl(183 100% 50% / 0.2), hsl(183 100% 50% / 0.05))",
            border: `1px solid ${isPurple ? "hsl(272 76% 53% / 0.4)" : "hsl(183 100% 50% / 0.4)"}`,
          }}
        >
          <div
            style={{
              color: isPurple ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)",
              filter: `drop-shadow(0 0 8px ${isPurple ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)"})`,
            }}
          >
            {icon}
          </div>
        </div>

        <div>
          <div
            className="text-xs font-medium tracking-widest uppercase mb-1"
            style={{ color: isPurple ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)" }}
          >
            {subtitle}
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isPurple ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)",
                  opacity: 0.3 + i * 0.35,
                }}
              />
            ))}
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
            style={{
              background: isPurple ? "hsl(272 76% 53% / 0.15)" : "hsl(183 100% 50% / 0.15)",
              color: isPurple ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
};

export default function ModeSelection({ onSelect, onSettings, onConversation }: Props) {
  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium tracking-wider">AI ACTIVE</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Select Mode
          </h2>
        </div>
        <button
          onClick={onSettings}
          className="w-10 h-10 rounded-2xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Choose your translation direction. NeuroSign AI adapts to your communication needs in real time.
      </p>

      {/* Cards */}
      <div className="flex flex-col gap-4 flex-1">
        <GlowCard
          color="purple"
          onClick={() => onSelect("sign-to-voice")}
          icon={
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="6" y="4" width="4" height="12" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="12" y="6" width="4" height="10" rx="2" fill="currentColor" opacity="0.8" />
              <rect x="18" y="3" width="4" height="14" rx="2" fill="currentColor" />
              <path d="M4 22h20M8 18l4 3 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          title="Sign → Voice"
          subtitle="Camera Mode"
          description="Point your camera at ASL gestures and NeuroSign instantly translates them into natural speech."
        />

        <GlowCard
          color="cyan"
          onClick={() => onSelect("voice-to-sign")}
          icon={
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="11" y="3" width="6" height="14" rx="3" fill="currentColor" opacity="0.9" />
              <path d="M7 14a7 7 0 0014 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <line x1="14" y1="21" x2="14" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="25" x2="18" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          title="Voice → Sign"
          subtitle="Microphone Mode"
          description="Speak naturally and watch NeuroSign translate your words into expressive ASL in real time."
        />

        {/* Conversation Mode CTA */}
        <button
          onClick={onConversation}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{
            background: "hsl(272 76% 53% / 0.08)",
            border: "1px solid hsl(272 76% 53% / 0.25)",
            color: "hsl(var(--neon-purple))",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h7a1 1 0 011 1v4a1 1 0 01-1 1H5l-3 2V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M7 10.5V12a1 1 0 001 1h5l2 2V7a1 1 0 00-1-1h-2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          Conversation Mode
        </button>

        {/* Conversation history */}
        <div className="glass rounded-2xl p-4 neon-border-purple">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Recent Sessions</span>
            <button className="text-xs text-neon-cyan">View all</button>
          </div>
          <div className="space-y-2">
            {[
              { time: "2m ago", text: "Hello, how are you today?", mode: "S→V" },
              { time: "1h ago", text: "Nice to meet you!", mode: "V→S" },
            ].map(({ time, text, mode }) => (
              <div key={time} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: mode === "S→V" ? "hsl(272 76% 53% / 0.15)" : "hsl(183 100% 50% / 0.15)",
                    color: mode === "S→V" ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)",
                  }}
                >
                  {mode}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{text}</p>
                  <p className="text-xs text-muted-foreground">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
