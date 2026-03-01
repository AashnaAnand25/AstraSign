import React, { useState, useRef } from 'react';
import { Mic, MicOff, Type, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DefaultASLSigningProps {
  onBack?: () => void;
  onAvatar?: () => void;
}

export default function DefaultASLSigning({ onBack, onAvatar }: DefaultASLSigningProps) {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [aslSigns, setAslSigns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const demoTexts = [
          "hello nice to meet you",
          "thank you very much",
          "please help me today",
          "yes i understand completely"
        ];
        
        const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
        setInputText(randomText);
        
        // Process text through pipeline
        const normalizedText = normalizeText(randomText);
        const signs = textToASL(normalizedText);
        
        setAslSigns(signs);
        setIsProcessing(false);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsListening(false);
        }
      }, 5000);
      
    } catch (err) {
      console.error('Recording failed:', err);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const normalizeText = (text: string): string => {
    // Simple text normalization for ASL
    return text.toUpperCase().trim();
  };

  const textToASL = (text: string): string[] => {
    // Convert text to ASL signs
    const words = text.split(' ');
    
    // Basic ASL grammar conversion
    const aslWords = words.map(word => {
      switch(word) {
        case 'YOU': return 'YOU';
        case 'HOW': return 'HOW';
        case 'ARE': return 'ARE';
        case 'THANK': return 'THANK';
        case 'VERY': return 'VERY-MUCH';
        case 'MUCH': return 'MUCH';
        case 'PLEASE': return 'PLEASE';
        case 'HELP': return 'HELP';
        case 'ME': return 'ME';
        case 'TODAY': return 'TODAY';
        case 'YES': return 'YES';
        case 'UNDERSTAND': return 'UNDERSTAND';
        case 'COMPLETELY': return 'COMPLETELY';
        case 'HELLO': return 'HELLO';
        case 'NICE': return 'NICE';
        case 'TO': return 'TO';
        case 'MEET': return 'MEET';
        default: return word;
      }
    });
    
    return aslWords;
  };

  const playASLAnimation = () => {
    if (aslSigns.length === 0) return;
    
    setIsPlaying(true);
    setCurrentSignIndex(0);
    
    const interval = setInterval(() => {
      setCurrentSignIndex(prev => {
        if (prev >= aslSigns.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const normalizedText = normalizeText(inputText);
      const signs = textToASL(normalizedText);
      
      setAslSigns(signs);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen mx-auto overflow-hidden">
        {/* Ambient glow */}
        <div className="fixed inset-0 max-w-[430px] mx-auto pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-48 h-48 rounded-full bg-neon-purple/[0.06] blur-[90px]" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-neon-cyan/[0.04] blur-[90px]" />
        </div>

        {/* Header */}
        <div className="glass rounded-2xl p-4 m-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                  ← Back
                </Button>
              )}
              <h1 className="text-lg font-semibold text-foreground">Default (ASL Signing)</h1>
            </div>
            {onAvatar && (
              <Button variant="outline" size="sm" onClick={onAvatar} className="neon-border-cyan text-neon-cyan">
                Choose Avatar →
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 space-y-4">
          {/* Pipeline Info */}
          <div className="glass rounded-2xl p-3" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <p className="text-xs text-neon-cyan font-medium text-center">
              Text → normalize → ASL signs → 2D hands (our logic)
            </p>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            {/* Text Input */}
            <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-neon-cyan" />
                <h3 className="font-medium text-foreground text-sm">Text</h3>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text or speak — signing will show here."
                className="w-full h-20 p-3 bg-background/50 border border-gray-700/50 rounded-xl resize-none text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              />
              <Button 
                onClick={handleTextSubmit}
                disabled={!inputText.trim() || isProcessing}
                className="w-full mt-3 neon-border-cyan text-neon-cyan"
              >
                Process Text
              </Button>
            </div>

            {/* Voice Input */}
            <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Mic className="w-4 h-4 text-neon-purple" />
                <h3 className="font-medium text-foreground text-sm">Voice</h3>
              </div>
              <div className="text-center">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-neon-purple hover:bg-neon-purple/80'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </button>
                
                <div className="mt-3">
                  {isListening && (
                    <p className="text-red-400 text-xs animate-pulse">Listening...</p>
                  )}
                  {isProcessing && (
                    <p className="text-neon-cyan text-xs animate-pulse">Processing...</p>
                  )}
                  {!isListening && !isProcessing && (
                    <p className="text-muted-foreground text-xs">Tap to speak</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ASL Output */}
          {aslSigns.length > 0 && (
            <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-neon-cyan" />
                  <h3 className="font-medium text-foreground text-sm">2D · Our pipeline (text → ASL → hands)</h3>
                </div>
                <Button
                  onClick={isPlaying ? () => setIsPlaying(false) : playASLAnimation}
                  variant="outline"
                  size="sm"
                  className="neon-border-cyan text-neon-cyan"
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </Button>
              </div>

              {/* Progress */}
              {isPlaying && (
                <div className="mb-4">
                  <div className="w-full bg-gray-700/50 rounded-full h-1">
                    <div
                      className="bg-neon-cyan h-1 rounded-full transition-all duration-500"
                      style={{ width: `${((currentSignIndex + 1) / aslSigns.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Sign {currentSignIndex + 1} of {aslSigns.length}</span>
                  </div>
                </div>
              )}

              {/* ASL Signs Display */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-neon-cyan">ASL Signs:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {aslSigns.map((sign, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border transition-all duration-300 text-center ${
                        isPlaying && index === currentSignIndex
                          ? 'bg-neon-cyan/20 border-neon-cyan'
                          : 'bg-background/50 border-gray-700/50'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-1 bg-gray-700/50 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-neon-cyan">
                          {sign.charAt(0)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-foreground">{sign}</p>
                      {isPlaying && index === currentSignIndex && (
                        <div className="mt-1">
                          <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full mx-auto animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ready Status */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
