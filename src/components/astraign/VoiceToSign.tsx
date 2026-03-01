import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Mic, MicOff, Settings, Type, Volume2 } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";
import SigningHands2D from "./SigningHands2D";
import HandTracker from "./HandTracker";
import AvatarSelector, { AvatarType } from "./AvatarSelector";
import { aslClassifier } from "@/ml/aslClassifier";

interface Props {
  onBack?: () => void;
  onSettings?: () => void;
  embedded?: boolean;
  onStatusChange?: (status: "ready" | "listening" | "processing") => void;
  onAddToHistory?: (audioText: string, aslTranslation: string) => void;
}

const WaveBar = ({ i, active }: { i: number; active: boolean }) => {
  const [h, setH] = useState(4);
  useEffect(() => {
    if (!active) { setH(4); return; }
    const interval = setInterval(() => setH(Math.random() * 40 + 4), 100 + i * 20);
    return () => clearInterval(interval);
  }, [active, i]);

  return (
    <div
      className="rounded-full transition-all duration-100 flex-shrink-0"
      style={{
        width: "3px",
        height: `${h}px`,
        background: active
          ? `linear-gradient(to top, hsl(272 76% 53%), hsl(183 100% 50%))`
          : "hsl(240 10% 20%)",
        boxShadow: active ? "0 0 6px hsl(272 76% 53% / 0.5)" : "none",
      }}
    />
  );
};

const ASLCard = ({ letter, delay }: { letter: string; delay: number }) => (
  <div
    className="glass neon-border-cyan rounded-2xl p-3 flex flex-col items-center gap-2 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms`, minWidth: "64px" }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
      style={{ background: "hsl(183 100% 50% / 0.1)", color: "hsl(183 100% 50%)" }}
    >
      {/* Simple hand shape indicator */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 16V8a2 2 0 014 0M12 16V6a2 2 0 014 0v2M16 16V9a2 2 0 014 0v7a6 6 0 01-12 0v-4a2 2 0 014 0" stroke="hsl(183 100% 50%)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
    <span className="text-xs font-bold text-neon-cyan">{letter}</span>
  </div>
);

const SAMPLE_PHRASES = [
  { text: "Nice to meet you!", letters: ["N", "I", "C", "E"], words: ["NICE", "MEET", "YOU"] },
  { text: "How are you doing?", letters: ["H", "O", "W"], words: ["HOW", "YOU"] },
  { text: "Thank you very much!", letters: ["T", "H", "K", "U"], words: ["THANK"] },
];

// Enhanced text processing with ASL gesture database
const processTextToASL = (text: string): { letters: string[], words: string[] } => {
  const words = text.toUpperCase().split(/\s+/).filter(word => word.length > 0);
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '').split('');
  
  return {
    letters: letters.filter(letter => letter >= 'A' && letter <= 'Z'),
    words: words
  };
};

// API Configuration
const API_BASE_URL = "http://localhost:8001/api";
const API_SECRET = "AstraSign-secret-key-123";

// API call helper
const apiCall = async (endpoint: string, data: any) => {
  try {
    console.log('🔥 Making API call to:', `${API_BASE_URL}${endpoint}`);
    console.log('📤 Sending data:', data);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_SECRET,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('📥 API Response:', result);
    console.log('🎯 Source:', result.source || 'unknown');
    
    return result;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

// Wispr API integration
const transcribeWithWispr = async (audioBlob: Blob): Promise<string> => {
  try {
    // For demo, use backend API
    const formData = new FormData();
    formData.append('audio_data', audioBlob);
    formData.append('format', 'webm');
    
    const result = await apiCall('/transcribe', {
      audio_data: await blobToBase64(audioBlob),
      format: 'webm'
    });
    
    return result.transcript || "HELLO WORLD";
  } catch (error) {
    console.error('Wispr transcription failed:', error);
    throw error;
  }
};

// Convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Pipeline: text (after ASL restructure) → letters + words for display; animation queue from aslAnimationMap
const translateWithSignMTPipeline = async (text: string): Promise<{ letters: string[]; words: string[] }> => {
  const normalizedText = text.trim().toUpperCase().replace(/[^\w\s]/g, "").trim();
  if (!normalizedText) return { letters: [], words: [] };

  const commonPhrases: Record<string, string[]> = {
    HELLO: ["HELLO"],
    "THANK YOU": ["THANK", "YOU"],
    PLEASE: ["PLEASE"],
    SORRY: ["SORRY"],
    YES: ["YES"],
    NO: ["NO"],
    HELP: ["HELP"],
    LOVE: ["LOVE"],
    "NICE TO MEET YOU": ["NICE", "MEET", "YOU"],
    "HOW ARE YOU": ["HOW", "YOU"],
  };

  // Exact phrase match only (so "HELLO THANK YOU" is handled word-by-word)
  const signs = commonPhrases[normalizedText];
  if (signs) {
    return {
      letters: normalizedText.replace(/\s/g, "").split(""),
      words: signs,
    };
  }

  return processTextToASL(text);
};

import { restructureToASLGrammar } from "@/data/aslGrammar";
import { getGestureForCharacter, getGestureForWord } from "@/data/aslGestures";
import {
  textToAnimationQueue,
  ANIMATION_DURATION_MS,
  type ASLAnimationId,
} from "@/data/aslAnimationMap";

export default function VoiceToSign({ onBack, onSettings, embedded, onStatusChange, onAddToHistory }: Props) {
  const { settings } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [phrase, setPhrase] = useState<{ text: string; letters: string[]; words?: string[] } | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'voice' | 'text' | 'camera'>('voice');
  const [signMode, setSignMode] = useState<'letters' | 'words'>('words');
  const [animationQueue, setAnimationQueue] = useState<ASLAnimationId[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [avatarType, setAvatarType] = useState<"default" | "astronaut" | "spiderman" | "minimal">("default");
  const [isMLInitialized, setIsMLInitialized] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string>("");
  const [gestureConfidence, setGestureConfidence] = useState<number>(0);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>('person');

  // Initialize ML model
  useEffect(() => {
    const initializeML = async () => {
      try {
        console.log('Initializing ASL ML model...');
        await aslClassifier.initialize();
        setIsMLInitialized(true);
        console.log('ASL ML model ready!');
      } catch (error) {
        console.error('Failed to initialize ML model:', error);
        setIsMLInitialized(false); // Set to false so we know it failed
      }
    };

    initializeML();
  }, []);

  // Handle gesture detection from hand tracker
  const handleGestureDetected = (gesture: string, confidence: number) => {
    console.log('Gesture detected:', gesture, 'confidence:', confidence);
    setDetectedGesture(gesture);
    setGestureConfidence(confidence);
    
    // Update 3D avatar with detected gesture
    if (confidence > 0.3) { // Lower threshold for testing
      setTranscript(gesture);
      setPhrase({ 
        text: gesture, 
        letters: gesture.split(''),
        words: [gesture]
      });
      setStepIndex(1);
      setCurrentLetterIndex(0);
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 2000);
    }
  };

  const visibleLetters = useMemo(() => {
    if (!phrase) return [] as string[];
    if (!settings.stepMode) return phrase.letters;
    return phrase.letters.slice(0, Math.max(0, Math.min(stepIndex, phrase.letters.length)));
  }, [phrase, settings.stepMode, stepIndex]);

  // Real speech recognition using Web Speech API
  useEffect(() => {
    if (!isListening) return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      // Fallback to simulation for demo
      const t = setTimeout(() => {
        const p = SAMPLE_PHRASES[Math.floor(Math.random() * SAMPLE_PHRASES.length)];
        setTranscript(p.text);
        setPhrase(p);
        setStepIndex(settings.stepMode ? 1 : p.letters.length);
        setCurrentLetterIndex(0);
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 2000);
      }, 2500);
      return () => clearTimeout(t);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const rawText = event.results[current][0].transcript;
      setTranscript(rawText);

      // Pipeline: Audio → Wispr/Web Speech → LLM-style ASL grammar → animation map → queue
      const aslText = restructureToASLGrammar(rawText) || rawText;
      translateWithSignMTPipeline(aslText).then((result) => {
        if (result.letters.length > 0 || result.words.length > 0) {
          setPhrase({
            text: aslText,
            letters: result.letters,
            words: result.words,
          });
          setStepIndex(settings.stepMode ? 1 : result.letters.length);
          setCurrentLetterIndex(0);
          setCurrentWordIndex(0);
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 2000);
        }
      });
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.start();
    
    return () => {
      recognition.stop();
    };
  }, [isListening, settings.stepMode]);

  // Cycle through letters for 3D avatar animation (respects ASL speed setting)
  const aslSpeed = settings.aslSpeed ?? 1;
  useEffect(() => {
    if (!phrase || !visibleLetters.length) return;
    const baseMs = 1500;
    const ms = Math.round(baseMs / aslSpeed);
    const interval = setInterval(() => {
      setCurrentLetterIndex((prev) => {
        const next = (prev + 1) % visibleLetters.length;
        return next;
      });
    }, ms);
    return () => clearInterval(interval);
  }, [phrase, visibleLetters, aslSpeed]);

  const currentLetter = visibleLetters[currentLetterIndex];
  const currentWord = phrase?.words?.[currentWordIndex];

  // Compute animation queue when phrase changes (for word-level ASL)
  useEffect(() => {
    if (phrase?.text) {
      const queue = textToAnimationQueue(phrase.text);
      setAnimationQueue(queue);
      setQueueIndex(0);
    } else {
      setAnimationQueue([]);
      setQueueIndex(0);
    }
  }, [phrase?.text]);

  // Advance animation queue index for sequential playback
  useEffect(() => {
    if (signMode !== "words" || animationQueue.length <= 1) return;
    const duration = Math.round(ANIMATION_DURATION_MS / aslSpeed);
    const interval = setInterval(() => {
      setQueueIndex((prev) => {
        const next = prev + 1;
        return next >= animationQueue.length ? 0 : next;
      });
    }, duration);
    return () => clearInterval(interval);
  }, [signMode, animationQueue.length, aslSpeed]);

  // Cycle through words for display (when not using animation queue)
  useEffect(() => {
    if (!phrase?.words || phrase.words.length === 0 || signMode !== 'words') return;
    if (animationQueue.length > 0) return; // Use queue instead
    const baseMs = 2000;
    const ms = Math.round(baseMs / aslSpeed);
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        const next = (prev + 1) % phrase.words!.length;
        return next;
      });
    }, ms);
    return () => clearInterval(interval);
  }, [phrase?.words, signMode, aslSpeed, animationQueue.length]);

  // Quick test: same pipeline as voice/text (restructure → animation map → queue → play)
  const testAvatar = () => {
    const demo = "Hello, thank you!";
    setTranscript(demo);
    const aslText = restructureToASLGrammar(demo) || demo;
    translateWithSignMTPipeline(aslText).then((result) => {
      setPhrase({ text: aslText, letters: result.letters, words: result.words });
      setStepIndex(settings.stepMode ? 1 : result.letters.length);
      setCurrentLetterIndex(0);
      setCurrentWordIndex(0);
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 2000);
    });
  };

  // Handle text input: restructure to ASL grammar → animation map → queue
  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    const aslText = restructureToASLGrammar(textInput) || textInput.trim();
    const translation = await translateWithSignMTPipeline(aslText);

    if (translation.letters.length === 0 && translation.words.length === 0) return;

    setTranscript(textInput);
    setPhrase({
      text: aslText,
      letters: translation.letters,
      words: translation.words,
    });
    setStepIndex(settings.stepMode ? 1 : translation.letters.length);
    setCurrentLetterIndex(0);
    setCurrentWordIndex(0);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 2000);
  };

  useEffect(() => {
    onStatusChange?.(isListening ? "listening" : phrase ? "processing" : "ready");
  }, [isListening, phrase, onStatusChange]);

  const lastAddedRef = useRef<string | null>(null);
  useEffect(() => {
    if (phrase && onAddToHistory && transcript) {
      const key = `${transcript}-${phrase.text}`;
      if (lastAddedRef.current !== key) {
        lastAddedRef.current = key;
        onAddToHistory(transcript, phrase.words?.join(" ") ?? phrase.letters.join(" "));
      }
    }
  }, [phrase, transcript]);

  useEffect(() => {
    if (!transcript) return;

    if (settings.hapticFeedback && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.([25, 18, 25]);
      } catch {
        // ignore
      }
    }

    if (settings.voiceGuidance && typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(`Recognized: ${transcript}`);
        u.rate = Number(getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate")) || 1;
        window.speechSynthesis.speak(u);
      } catch {
        // ignore
      }
    }
  }, [transcript, settings.hapticFeedback, settings.voiceGuidance]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, hsl(272 76% 53% / 0.08) 0%, transparent 60%), hsl(240 20% 4%)",
        }}
      />

      {/* Particles on translation */}
      {showParticles && Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${30 + Math.random() * 30}%`,
            background: i % 2 === 0 ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)",
            boxShadow: `0 0 8px ${i % 2 === 0 ? "hsl(272 76% 53%)" : "hsl(183 100% 50%)"}`,
            animation: `particle-float 1.8s ease-out ${i * 0.08}s forwards`,
            "--tx": `${(Math.random() - 0.5) * 100}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Top bar - hidden when embedded */}
      {!embedded && (
        <div className={`relative z-10 flex items-center justify-between px-5 pt-12 pb-4 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-glow-pulse" />
            <span className="font-display text-sm font-bold gradient-text-purple-cyan">AstraSign</span>
          </div>
          <button
            onClick={onSettings}
            className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      )}

      {/* Mode pill - hidden when embedded */}
      {!embedded && (
        <div className={`relative z-10 flex flex-col items-center gap-3 mb-6 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
          <div className="glass rounded-full px-4 py-1.5 neon-border-cyan flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="1" width="6" height="8" rx="3" fill="hsl(183 100% 50%)" />
              <path d="M2 7a5 5 0 0010 0" stroke="hsl(183 100% 50%)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <line x1="7" y1="12" x2="7" y2="13.5" stroke="hsl(183 100% 50%)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-semibold text-neon-cyan tracking-wider">VOICE → SIGN</span>
          </div>
        </div>
      )}

      {/* Avatar dropdown - contextual to Audio→ASL */}
      <div className={`relative z-10 flex flex-col items-center gap-3 mb-6 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
        <div className="flex items-center gap-2 w-full max-w-[280px] mx-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Avatar</span>
          <select
            value={avatarType}
            onChange={(e) => setAvatarType(e.target.value as "default" | "astronaut" | "spiderman" | "minimal")}
            className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-background/80 border border-border focus:border-neon-cyan focus:outline-none"
          >
            <option value="default">Default (ASL Signing)</option>
            <option value="astronaut">Astronaut</option>
            <option value="spiderman">Spider-Man</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              inputMode === 'text'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                : 'bg-background/50 text-muted-foreground border border-border'
            }`}
          >
            <Type size={16} className="inline mr-2" />
            Text
          </button>
          <button
            onClick={() => setInputMode('voice')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              inputMode === 'voice'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                : 'bg-background/50 text-muted-foreground border border-border'
            }`}
          >
            <Mic size={16} className="inline mr-2" />
            Voice
          </button>
        </div>

        {/* Content based on input mode */}
        {inputMode === 'voice' && (
          <div className="text-center">
            {/* Voice input UI */}
            <button
              onClick={() => setIsListening(!isListening)}
              className={`w-20 h-20 rounded-full transition-all active:scale-95 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500/20 border-2 border-red-500 animate-pulse'
                  : 'bg-neon-cyan/20 border-2 border-neon-cyan'
              }`}
            >
              {isListening ? <MicOff size={28} className="text-red-400" /> : <Mic size={28} className="text-neon-cyan" />}
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              {isListening ? "Listening..." : "Tap to speak"}
            </p>
          </div>
        )}

        {inputMode === 'text' && (
          <div className="text-center">
            {/* Text input UI */}
            <div className="relative">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Type text to translate..."
                className="w-full px-4 py-3 rounded-2xl bg-background/50 border border-border focus:border-neon-cyan focus:outline-none transition-all"
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Translate
              </button>
            </div>
          </div>
        )}

        {inputMode === 'camera' && (
          <div className="text-center">
            {/* Camera input UI */}
            <div className="relative">
              {!isMLInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Loading ML Model...</p>
                    <p className="text-xs mt-2">Check console for errors</p>
                  </div>
                </div>
              )}
              <HandTracker 
                onGestureDetected={handleGestureDetected}
                isActive={inputMode === 'camera' && isMLInitialized}
              />
            </div>
            {detectedGesture && (
              <div className="mt-3 text-center">
                <div className="text-xs text-muted-foreground">Detected Gesture:</div>
                <div className="font-bold text-neon-cyan">{detectedGesture}</div>
                <div className="text-xs text-gray-400">Confidence: {(gestureConfidence * 100).toFixed(0)}%</div>
              </div>
            )}
          </div>
        )}

        {/* Avatar Selector */}
        <div className="mb-4">
          <AvatarSelector
            selectedAvatar={selectedAvatar}
            onAvatarChange={setSelectedAvatar}
          />
        </div>

        {/* Sign mode toggle (letters vs words) */}
        {inputMode === 'text' && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setSignMode('letters')}
              className={`text-xs font-medium px-2 py-1 rounded-full transition-all ${
                signMode === 'letters' 
                  ? 'bg-neon-cyan text-white' 
                  : 'text-muted-foreground hover:text-neon-cyan'
              }`}
            >
              Letters
            </button>
            <button
              onClick={() => setSignMode('words')}
              className={`text-xs font-medium px-2 py-1 rounded-full transition-all ${
                signMode === 'words' 
                  ? 'bg-neon-purple text-white' 
                  : 'text-muted-foreground hover:text-neon-purple'
              }`}
            >
              Words
            </button>
          </div>
        )}
      </div>

      {/* 2D signing: our pipeline (same logic as sign.mt — text → normalize → ASL queue → render) */}
      <div className={`relative z-10 mx-5 mb-6 shrink-0 ${settings.focusMode ? "a11y-focus-content" : ""}`}>
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            minHeight: "260px",
            background: "hsl(240 18% 7%)",
            border: "2px solid hsl(183 100% 50% / 0.5)",
            boxShadow: "0 0 32px hsl(183 100% 50% / 0.3), 0 0 48px hsl(272 76% 53% / 0.2), inset 0 0 32px hsl(183 100% 50% / 0.04)",
          }}
        >
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{
              borderBottom: "1px solid hsl(183 100% 50% / 0.25)",
              background: "hsl(183 100% 50% / 0.06)",
              boxShadow: "0 0 16px hsl(183 100% 50% / 0.1)",
            }}
          >
            <span className="text-[10px] font-bold tracking-wider" style={{ color: "hsl(183 100% 50%)", textShadow: "0 0 12px hsl(183 100% 50% / 0.6)" }}>
              2D · Our pipeline (text → ASL → hands)
            </span>
            <button
              onClick={testAvatar}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, hsl(272 76% 53%), hsl(183 100% 50%))",
                color: "#fff",
                boxShadow: "0 0 16px hsl(272 76% 53% / 0.5), 0 0 24px hsl(183 100% 50% / 0.3)",
              }}
            >
              TEST
            </button>
          </div>
          {phrase?.text ? (
            <div style={{ height: "220px" }} className="flex flex-col">
              <SigningHands2D
                currentSign={signMode === "words" && animationQueue.length > 0 ? (animationQueue[queueIndex] ?? "idle") : "idle"}
                isAnimating={!!phrase && signMode === "words" && animationQueue.length > 0}
                className="flex-1 min-h-0"
              />
              <p className="text-[10px] text-center pb-2" style={{ color: "hsl(183 100% 50% / 0.7)" }}>
                &quot;{phrase.text}&quot;
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[220px] text-sm px-4 text-center" style={{ color: "hsl(183 100% 50% / 0.8)" }}>
              <p>Enter text or speak — signing will show here.</p>
              <p className="text-xs mt-2" style={{ color: "hsl(272 76% 53% / 0.8)" }}>Text → normalize → ASL signs → 2D hands (our logic)</p>
            </div>
          )}
        </div>
      </div>

      {/* Sign gesture cards */}
      {phrase && (
        <div className={`relative z-10 px-5 mb-4 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
          {settings.stepMode && (
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-muted-foreground">
                Step Mode: {Math.min(stepIndex, phrase.letters.length)}/{phrase.letters.length}
              </div>
              <button
                onClick={() => setStepIndex((i) => Math.min(i + 1, phrase.letters.length))}
                className="text-[10px] font-semibold px-3 py-1 rounded-full"
                style={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 10% 16%)", color: "hsl(183 100% 50%)" }}
              >
                Next
              </button>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {visibleLetters.map((l, i) => (
              <ASLCard key={`${l}-${i}`} letter={l} delay={i * 150} />
            ))}
          </div>
        </div>
      )}

      {/* Transcript / Live Text Buffer - focus content when focus mode */}
      {transcript && (
        <div className={`relative z-10 mx-5 mb-4 glass neon-border-purple rounded-2xl p-4 animate-fade-in-up ${settings.focusMode ? "a11y-focus-content" : ""}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
              <span className="text-xs text-neon-purple font-medium tracking-wider">LIVE TEXT</span>
            </div>
            <button
              onClick={() => {
                setTranscript("");
                setPhrase(null);
                setTextInput("");
                setCurrentLetterIndex(0);
              }}
              className="text-xs font-semibold px-3 py-1 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "hsl(var(--neon-purple))" }}
            >
              Clear
            </button>
          </div>
          <p className="text-foreground font-medium">{transcript}</p>
        </div>
      )}

      <div className="flex-1" />

      {/* Input controls */}
      <div className={`relative z-10 mx-5 mb-8 ${settings.focusMode ? "a11y-focus-dim" : ""}`}>
        {inputMode === 'text' ? (
          /* Text input mode */
          <div className="glass-strong rounded-3xl p-5" style={{ boxShadow: "0 -10px 40px hsl(183 100% 50% / 0.1)" }}>
            <div className="mb-4">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type text to translate to ASL..."
                className="w-full h-20 p-3 rounded-2xl bg-background/50 border border-neon-cyan/30 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
                style={{ backdropFilter: "blur(10px)" }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="flex-1 py-3 rounded-2xl font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: textInput.trim() 
                    ? "linear-gradient(135deg, hsl(183 100% 50%), hsl(183 100% 40%))" 
                    : "hsl(240 10% 20%)",
                  color: textInput.trim() ? "white" : "hsl(240 5% 55%)",
                  boxShadow: textInput.trim() ? "0 0 20px hsl(183 100% 50% / 0.3)" : "none",
                }}
              >
                Translate to ASL
              </button>
              <button
                onClick={() => {
                  setTextInput("");
                  setTranscript("");
                  setPhrase(null);
                  setCurrentLetterIndex(0);
                }}
                className="px-4 py-3 rounded-2xl font-medium transition-all"
                style={{
                  background: "hsl(240 10% 20%)",
                  border: "1px solid hsl(240 10% 30%)",
                  color: "hsl(240 5% 55%)",
                }}
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          /* Voice input mode */
          <div>
            {/* Waveform */}
            <div className="flex items-center justify-center gap-0.5 mb-5 h-10">
              {Array.from({ length: 32 }).map((_, i) => (
                <WaveBar key={i} i={i} active={isListening} />
              ))}
            </div>

            {/* Big mic button */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {isListening && (
                  <>
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: "100px", height: "100px",
                        top: "-18px", left: "-18px",
                        border: "2px solid hsl(272 76% 53% / 0.3)",
                        animation: "pulse-purple 1.8s ease-in-out infinite",
                      }}
                    />
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: "120px", height: "120px",
                        top: "-28px", left: "-28px",
                        border: "1px solid hsl(272 76% 53% / 0.15)",
                        animation: "pulse-purple 1.8s ease-in-out 0.4s infinite",
                      }}
                    />
                  </>
                )}
                <button
                  onClick={() => { 
                    setIsListening(!isListening); 
                    if (!isListening) { 
                      setTranscript(""); 
                      setPhrase(null); 
                      setCurrentLetterIndex(0);
                    } 
                  }}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90 relative z-10"
                  style={{
                    background: isListening
                      ? "linear-gradient(135deg, hsl(183 100% 40%), hsl(272 76% 53%))"
                      : "linear-gradient(135deg, hsl(272 76% 53%), hsl(272 76% 40%))",
                    boxShadow: isListening
                      ? "0 0 30px hsl(183 100% 50% / 0.5), 0 0 60px hsl(183 100% 50% / 0.2)"
                      : "0 0 25px hsl(272 76% 53% / 0.5)",
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <rect x="8" y="3" width="8" height="14" rx="4" fill="white" />
                    <path d="M4 12a8 8 0 0016 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <line x1="12" y1="20" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <line x1="9" y1="23" x2="15" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {isListening ? (
                  <span className="text-neon-cyan animate-glow-pulse">Listening… speak naturally</span>
                ) : (
                  "Start Listening"
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
