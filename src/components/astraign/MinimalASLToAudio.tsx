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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Simple Header */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-2xl font-light text-gray-900">ASL to Audio</h1>
          {onBack && (
            <button 
              onClick={onBack}
              className="text-gray-500 hover:text-gray-900 text-sm"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Camera Section */}
        <div className="mb-16">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
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
          
          <div className="flex justify-center gap-4 mt-6">
            {!isCameraActive ? (
              <button 
                onClick={startCamera}
                className="px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800"
              >
                Start Camera
              </button>
            ) : (
              <button 
                onClick={stopCamera}
                className="px-6 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
              >
                Stop Camera
              </button>
            )}
            
            {isCameraActive && (
              <button
                onClick={isDetecting ? stopDetection : startDetection}
                className="px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800"
              >
                {isDetecting ? 'Stop Detection' : 'Start Detection'}
              </button>
            )}
          </div>
        </div>

        {/* Detected Signs */}
        {detectedSigns.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
              Detected Signs
            </h2>
            <div className="flex flex-wrap gap-2">
              {detectedSigns.map((sign, index) => (
                <div key={index} className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm">
                  {sign}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Translation */}
        {translatedText && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Translation
              </h2>
              <button
                onClick={playAudio}
                disabled={isPlaying}
                className="text-black hover:text-gray-600 text-sm flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                {isPlaying ? 'Playing...' : 'Play'}
              </button>
            </div>
            
            <div className="p-8 bg-gray-50 rounded-lg">
              <p className="text-xl text-gray-900">{translatedText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
