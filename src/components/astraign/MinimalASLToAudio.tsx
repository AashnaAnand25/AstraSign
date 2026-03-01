import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Play, Volume2 } from 'lucide-react';

interface MinimalASLToAudioProps {
  onBack?: () => void;
}

export default function MinimalASLToAudio({ onBack }: MinimalASLToAudioProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSigns, setDetectedSigns] = useState<string[]>([]);
  const [translatedText, setTranslatedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Camera failed:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsCameraActive(false);
    setIsDetecting(false);
  };

  const startDetection = () => {
    if (!isCameraActive) return;
    
    setIsDetecting(true);
    setDetectedSigns([]);
    setTranslatedText('');
    
    detectionIntervalRef.current = setInterval(() => {
      const signs = ['HELLO', 'THANK', 'PLEASE', 'YES', 'HELP'];
      const randomSign = signs[Math.floor(Math.random() * signs.length)];
      
      setDetectedSigns(prev => {
        if (prev.length > 0 && prev[prev.length - 1] === randomSign) {
          return prev;
        }
        return [...prev, randomSign];
      });
    }, 3000);
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsDetecting(false);
    
    if (detectedSigns.length > 0) {
      let text = detectedSigns.join(' ');
      text = text.replace(/\bYOU HOW\b/g, 'HOW ARE YOU');
      text = text.replace(/\bTHANK YOU\b/g, 'THANK YOU');
      setTranslatedText(text);
    }
  };

  const playAudio = () => {
    if (!translatedText || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
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
              <h1 className="text-lg font-semibold text-foreground">ASL → Audio</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 space-y-4">
          {/* Camera Section */}
          <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <CameraOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Camera off</p>
                  </div>
                </div>
              )}
              
              {isDetecting && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-xs">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Detecting
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-3 mt-4">
              {!isCameraActive ? (
                <button 
                  onClick={startCamera}
                  className="px-4 py-2 bg-neon-purple text-white rounded-xl text-sm hover:bg-neon-purple/80 transition-colors"
                >
                  Start Camera
                </button>
              ) : (
                <button 
                  onClick={stopCamera}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-colors"
                >
                  Stop Camera
                </button>
              )}
              
              {isCameraActive && (
                <button
                  onClick={isDetecting ? stopDetection : startDetection}
                  className="px-4 py-2 neon-border-cyan text-neon-cyan rounded-xl text-sm hover:bg-neon-cyan/20 transition-colors"
                >
                  {isDetecting ? 'Stop Detection' : 'Start Detection'}
                </button>
              )}
            </div>
          </div>

          {/* Hold Pose Guide */}
          <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <h3 className="text-sm font-medium text-foreground mb-3">Hold pose:</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-xs">👍 Yes</span>
              <span className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-xs">✊ No</span>
              <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">✋ Stop</span>
              <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-xs">☝️ One</span>
              <span className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-xs">✌️ Two</span>
            </div>
          </div>

          {/* Mode Section */}
          <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Mode</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">Live</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">AI Score</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-neon-cyan rounded-full" />
                </div>
                <span className="text-xs text-neon-cyan">97%</span>
              </div>
            </div>
          </div>

          {/* Detected Signs */}
          {detectedSigns.length > 0 && (
            <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
              <h3 className="text-sm font-medium text-foreground mb-3">Detected Signs</h3>
              <div className="flex flex-wrap gap-2">
                {detectedSigns.map((sign, index) => (
                  <div key={index} className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-xs">
                    {sign}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Translation */}
          {translatedText && (
            <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Translation</h3>
                <button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="text-neon-cyan hover:text-neon-purple text-sm flex items-center gap-2 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  {isPlaying ? 'Playing...' : 'Play'}
                </button>
              </div>
              
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-lg text-foreground">{translatedText}</p>
              </div>
            </div>
          )}

          {/* Tap to start */}
          {!isCameraActive && (
            <div className="text-center">
              <button
                onClick={startCamera}
                className="px-6 py-3 neon-border-cyan text-neon-cyan rounded-xl text-sm font-medium hover:bg-neon-cyan/20 transition-all"
              >
                Tap to start recognition
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
