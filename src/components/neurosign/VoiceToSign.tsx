/**
 * VoiceToSign — Voice → ASL screen (v4.0 Bidirectional)
 * 
 * Hearing user speaks → Web Speech API transcription → 
 *   NLP parsing → ASL Sign Visualization (Avatar/Symbols)
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, Mic, MicOff, Volume2 } from "lucide-react";

interface Props {
  onBack: () => void;
  onSettings?: () => void;
}

export default function VoiceToSign({ onBack }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [activeSign, setActiveSign] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let current = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);

        // Map transcription to simple emergency signs
        const words = current.toUpperCase().split(" ");
        const emergencySigns = ["HELP", "STOP", "LOVE", "OK", "HURT", "YES", "NO", "WATER"];
        const match = words.find(w => emergencySigns.includes(w));
        if (match) setActiveSign(match);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setActiveSign(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#080810] text-foreground p-6">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, hsl(183 100% 50% / 0.3), transparent 70%)",
      }} />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold gradient-text-cyan-purple tracking-tight">VOICE → SIGN</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Bidirectional Loop</p>
        </div>
      </div>

      {/* Sign Visualizer (The Avatar Viewport) */}
      <div className="relative flex-1 rounded-3xl overflow-hidden glass border border-white/5 flex flex-col items-center justify-center mb-6">
        {activeSign ? (
          <div className="flex flex-col items-center animate-bounce-slow">
            <div className="w-48 h-48 rounded-full glass neon-border-cyan flex items-center justify-center mb-4 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              <span className="text-6xl">{
                activeSign === "HELP" ? "🤝" :
                  activeSign === "STOP" ? "✋" :
                    activeSign === "LOVE" ? "🤟" :
                      activeSign === "OK" ? "👌" :
                        activeSign === "HURT" ? "🩹" :
                          activeSign === "YES" ? "✅" :
                            activeSign === "NO" ? "❌" : "💧"
              }</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-neon-cyan">{activeSign}</h2>
          </div>
        ) : (
          <div className="text-center px-12">
            <div className="w-16 h-16 rounded-full bg-muted/10 border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Volume2 className="text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground/50 font-medium">Listening for your speech...</p>
          </div>
        )}
      </div>

      {/* Transcript Area */}
      <div className="h-24 p-4 rounded-2xl bg-muted/5 border border-white/5 mb-6">
        <p className="text-sm text-white/80 leading-relaxed italic">
          {transcript || "Speak into the microphone — recognized signs will be displayed above."}
        </p>
      </div>

      {/* Mic Control */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={toggleListen}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 ${isListening
            ? "bg-neon-cyan shadow-[0_0_40px_rgba(34,211,238,0.4)]"
            : "bg-muted/10 border border-white/10 text-muted-foreground"
            }`}
        >
          {isListening ? <MicOff size={32} color="black" /> : <Mic size={32} />}
        </button>
        <p className="text-xs font-bold tracking-widest text-muted-foreground">
          {isListening ? "TAP TO STOP" : "TAP TO SPEAK"}
        </p>
      </div>
    </div>
  );
}
