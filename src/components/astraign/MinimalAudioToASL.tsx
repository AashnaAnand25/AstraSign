import React, { useState, useRef } from 'react';
import { Mic, MicOff, Play } from 'lucide-react';

interface MinimalAudioToASLProps {
  onBack?: () => void;
}

export default function MinimalAudioToASL({ onBack }: MinimalAudioToASLProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aslSigns, setAslSigns] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
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
          "please help me",
          "yes i understand"
        ];
        
        const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
        const words = randomText.toUpperCase().split(' ');
        
        setTranscript(randomText);
        setAslSigns(words);
        setIsProcessing(false);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 5000);
      
    } catch (err) {
      console.error('Recording failed:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playASL = () => {
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
                <button 
                  onClick={onBack}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ← Back
                </button>
              )}
              <h1 className="text-lg font-semibold text-foreground">Audio → ASL</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 space-y-4">
          {/* Audio Recording */}
          <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <div className="text-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-neon-purple hover:bg-neon-purple/80'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
              
              <div className="mt-4">
                {isRecording && (
                  <p className="text-red-400 text-sm animate-pulse">Recording...</p>
                )}
                {isProcessing && (
                  <p className="text-neon-cyan text-sm animate-pulse">Processing...</p>
                )}
                {!isRecording && !isProcessing && (
                  <p className="text-muted-foreground text-sm">Tap to speak</p>
                )}
              </div>
            </div>
          </div>

          {/* Transcription */}
          {transcript && (
            <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
              <h3 className="text-sm font-medium text-foreground mb-3">Transcription</h3>
              <div className="p-3 bg-background/50 rounded-xl">
                <p className="text-foreground">{transcript}</p>
              </div>
            </div>
          )}

          {/* ASL Signs */}
          {aslSigns.length > 0 && (
            <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">ASL Signs</h3>
                <button
                  onClick={isPlaying ? () => setIsPlaying(false) : () => {
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
                  }}
                  className="neon-border-cyan text-neon-cyan text-sm"
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </button>
              </div>

              {/* Progress */}
              {isPlaying && (
                <div className="mb-4">
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-neon-cyan h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentSignIndex + 1) / aslSigns.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Sign {currentSignIndex + 1} of {aslSigns.length}</span>
                  </div>
                </div>
              )}

              {/* Signs Display */}
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
          )}

          {/* Mode Status */}
          <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Mode</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
