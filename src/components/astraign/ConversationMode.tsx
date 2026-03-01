import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, Square, Volume2 } from "lucide-react";
import ASLHandDisplay from "./ASLHandDisplay";
import { hasASLAnimation } from "@/data/aslWordAnimations";

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
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initSpeechRecognition = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.error("Speech recognition not supported");
      return null;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    
    recognition.onstart = () => setCurrentStatus("LISTENING");
    
    recognition.onresult = (event: any) => {
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
    
    recognition.onerror = (event: any) => {
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
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Conversation Mode</h1>
            <p className="text-sm text-white/70">Two-way accessibility bridge</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {CONVERSATION_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m.id ? `${m.color} text-white` : "bg-white/10 text-white/70 hover:text-white"
              }`}
            >
              <span className="mr-1">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Fixed Height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Conversation History - Scrollable */}
        <div className="w-1/2 p-4 border-r border-white/10 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-white/50 py-8">
                <div className="text-4xl mb-4">💬</div>
                <p>Start a conversation to see live ASL translation</p>
                <p className="text-sm mt-2">Hearing person speaks → ASL signs play</p>
                <p className="text-sm">Deaf person types → Speech plays</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl ${
                  msg.type === "hearing" 
                    ? "bg-blue-500/20 border-l-4 border-blue-500"
                    : "bg-green-500/20 border-l-4 border-green-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{msg.type === "hearing" ? "🎤" : "✍️"}</span>
                  <span className="text-white/60 text-sm capitalize">{msg.type}</span>
                  {msg.mode && (
                    <span className="px-2 py-0.5 bg-white/10 rounded text-white/50 text-xs">
                      {CONVERSATION_MODES.find(m => m.id === msg.mode)?.label}
                    </span>
                  )}
                </div>
                <p className="text-white text-lg">{msg.text}</p>
                {msg.gloss && (
                  <p className="text-cyan-400 text-sm mt-2 font-mono">[{msg.gloss}]</p>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right: ASL Display */}
        <div className="w-1/2 p-4 flex flex-col">
          <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-white/5 rounded-xl">
            <span className="text-2xl animate-pulse">{status.icon}</span>
            <span className={`font-semibold ${status.color}`}>{status.label}</span>
          </div>

          {liveCaption && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm mb-1">🎤 Live Caption</p>
              <p className="text-white text-xl">{liveCaption}</p>
            </div>
          )}

          <div className="flex-1 bg-black/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px]">
            {currentSign ? (
              <>
                <div className="text-cyan-400 text-3xl font-bold mb-4">{currentSign}</div>
                <div className="w-64 h-64 bg-black/50 rounded-xl overflow-hidden flex items-center justify-center">
                  <ASLHandDisplay 
                    word={currentSign} 
                    isPlaying={true}
                  />
                </div>
                <div className="mt-4 flex gap-1 flex-wrap justify-center max-w-md">
                  {currentGloss.map((word, i) => (
                    <span 
                      key={i}
                      className={`px-2 py-1 rounded text-sm ${
                        i === currentGlossIndex ? "bg-cyan-500 text-white" : 
                        i < currentGlossIndex ? "bg-white/20 text-white/50" : "bg-white/10 text-white/30"
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-white/50">
                <div className="text-6xl mb-4">🤟</div>
                <p className="text-xl">Ready to sign</p>
                <p className="text-sm mt-2">
                  {isConversationActive ? "Listening for speech..." : "Start conversation to begin"}
                </p>
              </div>
            )}
          </div>

          {context.length > 0 && (
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <p className="text-white/50 text-xs mb-2">💭 Context (last 3)</p>
              <div className="flex gap-2 flex-wrap">
                {context.slice(-3).map((ctx, i) => (
                  <span key={i} className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded">
                    {ctx.slice(0, 30)}{ctx.length > 30 ? "..." : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex gap-4">
          <div className="flex-1">
            <button
              onClick={isConversationActive ? stopConversation : startConversation}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                isConversationActive
                  ? "bg-red-500/20 text-red-400 border-2 border-red-500 animate-pulse"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {isConversationActive ? <><Square size={24} /> Stop</> : <><Play size={24} /> Start Conversation</>}
            </button>
          </div>

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={deafInput}
              onChange={(e) => setDeafInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleDeafSubmit()}
              placeholder="Type response for text-to-speech..."
              className="flex-1 px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={handleDeafSubmit}
              disabled={!deafInput.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Volume2 size={20} />
              Speak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
