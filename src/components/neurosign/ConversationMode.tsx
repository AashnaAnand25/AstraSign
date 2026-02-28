import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

interface Props {
  onBack: () => void;
}

const WaveBar = ({ i, active }: { i: number; active: boolean }) => {
  const [h, setH] = useState(4);
  useEffect(() => {
    if (!active) { setH(4); return; }
    const interval = setInterval(() => setH(Math.random() * 32 + 4), 80 + i * 15);
    return () => clearInterval(interval);
  }, [active, i]);
  return (
    <div
      className="rounded-full transition-all duration-75 flex-shrink-0"
      style={{
        width: "2px",
        height: `${h}px`,
        background: active ? "linear-gradient(to top, hsl(272 76% 53%), hsl(183 100% 50%))" : "hsl(240 10% 18%)",
      }}
    />
  );
};

const DIALOGUES = [
  { caption: "Hello, I'm here for my appointment.", sign: "HELLO / APPOINTMENT" },
  { caption: "The doctor will see you shortly.", sign: "DOCTOR / SHORTLY" },
  { caption: "Can you confirm your name?", sign: "NAME / CONFIRM" },
  { caption: "Thank you, please take a seat.", sign: "THANK YOU / SEAT" },
];

export default function ConversationMode({ onBack }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sign: string; side: "left" | "right" }[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => {
      setMessages((prev) => {
        const item = DIALOGUES[idx % DIALOGUES.length];
        return [...prev, { text: item.caption, sign: item.sign, side: prev.length % 2 === 0 ? "left" : "right" }];
      });
      setIdx((i) => i + 1);
    }, 2800);
    return () => clearInterval(t);
  }, [isActive, idx]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "hsl(240 20% 4%)" }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="text-center">
          <div className="font-display text-sm font-bold gradient-text-purple-cyan">CONVERSATION</div>
          <div className="text-[10px] text-muted-foreground tracking-wider">Live dialogue interface</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
          <span className={`text-xs font-medium ${isActive ? "text-green-400" : "text-muted-foreground"}`}>
            {isActive ? "Live" : "Idle"}
          </span>
        </div>
      </div>

      {/* Split header labels */}
      <div className="relative z-10 flex items-center mx-5 mb-3 gap-2">
        <div className="flex-1 text-center py-1.5 rounded-xl text-xs font-semibold text-neon-cyan"
          style={{ background: "hsl(183 100% 50% / 0.08)", border: "1px solid hsl(183 100% 50% / 0.2)" }}>
          Live Captions
        </div>
        <div className="w-px h-6 bg-border/40" />
        <div className="flex-1 text-center py-1.5 rounded-xl text-xs font-semibold text-neon-purple"
          style={{ background: "hsl(272 76% 53% / 0.08)", border: "1px solid hsl(272 76% 53% / 0.2)" }}>
          Sign Output
        </div>
      </div>

      {/* Conversation feed */}
      <div className="relative z-10 flex-1 mx-5 overflow-y-auto space-y-3 pb-4" style={{ scrollbarWidth: "none" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div className="text-sm text-muted-foreground">Start a live dialogue session</div>
            <div className="text-xs text-muted-foreground opacity-60">Tap the button below to begin</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 animate-fade-in-up ${m.side === "right" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Caption bubble */}
            <div
              className="flex-1 rounded-2xl p-3 text-sm"
              style={{
                background: m.side === "left" ? "hsl(183 100% 50% / 0.07)" : "hsl(272 76% 53% / 0.07)",
                border: `1px solid ${m.side === "left" ? "hsl(183 100% 50% / 0.2)" : "hsl(272 76% 53% / 0.2)"}`,
              }}
            >
              <p className="text-foreground leading-relaxed">{m.text}</p>
              <div className="mt-1.5 text-[10px] font-semibold tracking-wider"
                style={{ color: m.side === "left" ? "hsl(var(--neon-cyan))" : "hsl(var(--neon-purple))" }}>
                {m.sign}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Waveform + controls */}
      <div className="relative z-10 mx-5 mb-8">
        <div className="flex items-center justify-center gap-0.5 mb-4 h-8">
          {Array.from({ length: 28 }).map((_, i) => (
            <WaveBar key={i} i={i} active={isActive} />
          ))}
        </div>

        {/* Use case pills */}
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {["Doctor Office", "Classroom", "Interview", "Gov Services"].map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-medium text-muted-foreground"
              style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 16%)" }}>
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => { setIsActive(!isActive); if (isActive) setMessages([]); setIdx(0); }}
          className="w-full py-4 rounded-2xl font-display font-bold text-sm tracking-widest text-white transition-all active:scale-95"
          style={{
            background: isActive
              ? "linear-gradient(135deg, hsl(316 80% 50%), hsl(272 76% 45%))"
              : "linear-gradient(135deg, hsl(272 76% 53%), hsl(183 100% 35%))",
            boxShadow: isActive
              ? "0 0 24px hsl(316 80% 60% / 0.4)"
              : "0 0 24px hsl(272 76% 53% / 0.35)",
          }}
        >
          {isActive ? "END SESSION" : "START CONVERSATION"}
        </button>
      </div>
    </div>
  );
}
