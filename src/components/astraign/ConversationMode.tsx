import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, Square, Volume2 } from "lucide-react";
import ASLHandDisplay from "./ASLHandDisplay";
import { hasASLAnimation } from "@/data/aslWordAnimations";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/speechRecognition";

const CONVERSATION_MODES = [
  { id: "general", label: "General Chat", color: "bg-blue-500", icon: "💬", desc: "Everyday conversations" },
  { id: "doctor", label: "Medical", color: "bg-red-500", icon: "🏥", desc: "Healthcare appointments" },
];

const STATUS = {
  IDLE: { label: "Ready", color: "text-gray-400", icon: "⚪" },
  LISTENING: { label: "Listening...", color: "text-green-400", icon: "🟢" },
  TRANSLATING: { label: "Translating...", color: "text-yellow-400", icon: "⏳" },
  SIGNING: { label: "Signing...", color: "text-purple-400", icon: "🤟" },
  SPEAKING: { label: "Speaking...", color: "text-blue-400", icon: "🔊" },
};

interface Message {
  id: string;
  type: "hearing" | "deaf";
  text: string;
  gloss?: string;
  timestamp: number;
  mode: string;
}

interface Props {
  onBack?: () => void;
}

export default function ConversationMode({ onBack }: Props) {
  const [mode, setMode] = useState("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStatus, setCurrentStatus] = useState<keyof typeof STATUS>("IDLE");
  const [liveCaption, setLiveCaption] = useState("");
  const [currentGloss, setCurrentGloss] = useState<string[]>([]);
  const [currentGlossIndex, setCurrentGlossIndex] = useState(0);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [deafInput, setDeafInput] = useState("");
  const [context, setContext] = useState<string[]>([]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return null;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setCurrentStatus("LISTENING");

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) setLiveCaption(interimTranscript);
      if (finalTranscript) handleHearingPersonSpeech(finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setCurrentStatus("IDLE");
    };

    recognition.onend = () => {
      if (isConversationActive) recognition.start();
    };

    return recognition;
  }, [isConversationActive]);

  const startConversation = () => {
    setIsConversationActive(true);
    const recognition = initSpeechRecognition();
    if (recognition) {
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const stopConversation = () => {
    setIsConversationActive(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    setCurrentStatus("IDLE");
    setLiveCaption("");
  };

  const handleHearingPersonSpeech = async (text: string) => {
    setLiveCaption("");
    setCurrentStatus("TRANSLATING");

    // Simple gloss conversion for demo
    const gloss = text.toUpperCase()
      .replace(/[^A-Z\s]/g, "")
      .replace(/\bI\b/g, "ME")
      .replace(/\bMY\b/g, "MY")
      .replace(/\bTHE\b/g, "")
      .replace(/\bA\b/g, "")
      .replace(/\bAN\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "hearing",
      text,
      gloss,
      timestamp: Date.now(),
      mode
    };

    setMessages(prev => [...prev, newMessage]);
    setContext(prev => [...prev, text]);
    await playASLSigns(gloss);
  };

  const playASLSigns = async (gloss: string) => {
    const words = gloss.split(/\s+/).filter(w => w.length > 0);
    const signWords = words.filter(word => hasASLAnimation(word));

    if (signWords.length === 0) {
      setCurrentStatus("IDLE");
      return;
    }

    setCurrentGloss(signWords);
    setCurrentStatus("SIGNING");

    for (let i = 0; i < signWords.length; i++) {
      setCurrentGlossIndex(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setCurrentStatus("IDLE");
    setCurrentGloss([]);
    setCurrentGlossIndex(0);
  };

  const handleDeafSubmit = async () => {
    if (!deafInput.trim()) return;

    const text = deafInput;
    setDeafInput("");

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "deaf",
      text,
      timestamp: Date.now(),
      mode
    };

    setMessages(prev => [...prev, newMessage]);
    setContext(prev => [...prev, text]);
    setCurrentStatus("SPEAKING");

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setCurrentStatus("IDLE");
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setCurrentStatus("IDLE"), 2000);
    }
  };

  const currentSign = currentGloss[currentGlossIndex] || "";
  const status = STATUS[currentStatus];

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 pt-16 pb-24 overflow-hidden">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8 shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-display text-sm font-bold gradient-text-purple-cyan uppercase tracking-widest text-center">Conversation</span>
          <div className="flex gap-4 mt-2">
            {CONVERSATION_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`text-[10px] font-bold uppercase tracking-wider transition-all ${mode === m.id ? "text-neon-cyan" : "text-muted-foreground opacity-50 hover:opacity-100"
                  }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-10" />
      </div>

      {/* Status Bar */}
      <div className="relative z-10 mb-6 flex items-center justify-center gap-3 py-2 px-4 rounded-full glass neon-border-purple/30 mx-auto">
        <div className={`w-2 h-2 rounded-full ${status.color === 'text-green-400' ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground'}`} />
        <span className={`text-[10px] font-bold uppercase tracking-widest ${status.color}`}>{status.label}</span>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col gap-6 overflow-hidden">

        {/* ASL Display Box */}
        <div className="glass rounded-3xl p-4 min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden shrink-0" style={{ border: "1px solid hsl(240 10% 14%)" }}>
          {currentSign ? (
            <>
              <div className="absolute top-4 left-4 text-[10px] text-neon-cyan font-bold uppercase tracking-widest">Live ASL</div>
              <div className="w-40 h-40 flex items-center justify-center">
                <ASLHandDisplay word={currentSign} isPlaying={true} />
              </div>
              <div className="mt-2 text-xl font-bold text-foreground font-display tracking-tight">{currentSign}</div>
            </>
          ) : (
            <div className="text-center opacity-40">
              <div className="text-4xl mb-3">🤟</div>
              <div className="text-[10px] font-bold uppercase tracking-widest">Ready to Translate</div>
            </div>
          )}

          {liveCaption && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-neon-purple/10 border-t border-neon-purple/20 backdrop-blur-md">
              <p className="text-[9px] text-neon-purple font-bold uppercase tracking-widest mb-1">Live Caption</p>
              <p className="text-xs text-foreground font-medium line-clamp-1 italic">"{liveCaption}"</p>
            </div>
          )}
        </div>

        {/* Messages History */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 px-8 text-center pt-8">
              <div className="text-sm font-medium leading-relaxed">
                Connect naturally across the bridge of silence. Speak or type to begin.
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${msg.type === "hearing" ? "self-start" : "self-end"}`}
              >
                <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 px-2 ${msg.type === "hearing" ? "text-neon-purple" : "text-neon-cyan"}`}>
                  {msg.type}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl glass ${msg.type === "hearing"
                      ? "rounded-tl-none neon-border-purple/30"
                      : "rounded-tr-none neon-border-cyan/30 bg-neon-cyan/5"
                    }`}
                >
                  <p className="text-sm text-foreground">{msg.text}</p>
                  {msg.gloss && (
                    <p className={`text-[10px] mt-2 font-mono ${msg.type === "hearing" ? "text-neon-purple/70" : "text-neon-cyan/70"}`}>
                      &gt; {msg.gloss}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="relative z-20 mt-4 flex flex-col gap-4">
        <div className="relative">
          <input
            type="text"
            value={deafInput}
            onChange={(e) => setDeafInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleDeafSubmit()}
            placeholder="Type response to speak..."
            className="w-full bg-muted/50 text-foreground placeholder-muted-foreground px-5 py-4 rounded-2xl border border-white/5 focus:border-neon-cyan/50 focus:outline-none transition-all text-sm pr-16"
          />
          <button
            onClick={handleDeafSubmit}
            disabled={!deafInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neon-cyan disabled:opacity-20 transition-all hover:scale-110"
          >
            <Volume2 size={20} />
          </button>
        </div>

        <button
          onClick={isConversationActive ? stopConversation : startConversation}
          className={`w-full py-4 rounded-2xl font-display font-bold text-sm tracking-widest text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-2xl ${isConversationActive
              ? "bg-destructive border-t border-white/20"
              : "bg-primary border-t border-white/20"
            }`}
          style={{
            boxShadow: isConversationActive
              ? "0 0 20px hsl(0 84% 60% / 0.2)"
              : "0 0 20px hsl(272 76% 53% / 0.2)"
          }}
        >
          {isConversationActive ? (
            <><Square size={16} fill="white" /> STOP CONVERSATION</>
          ) : (
            <><Play size={16} fill="white" /> START CONVERSATION</>
          )}
        </button>
      </div>
    </div>
  );
}
