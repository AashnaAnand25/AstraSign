import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Play, Volume2, Sparkles, Eye } from 'lucide-react';

interface PremiumASLToAudioProps {
  onBack?: () => void;
  onSettings?: () => void;
}

export default function PremiumASLToAudio({ onBack, onSettings }: PremiumASLToAudioProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSigns, setDetectedSigns] = useState<string[]>([]);
  const [translatedText, setTranslatedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  
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
        video: { width: 1280, height: 720 }
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
    setDetectionCount(0);
  };

  const startDetection = () => {
    if (!isCameraActive) return;
    
    setIsDetecting(true);
    setDetectedSigns([]);
    setTranslatedText('');
    setDetectionCount(0);
    
    // Simulate sign detection with better timing
    detectionIntervalRef.current = setInterval(() => {
      const signs = [
        'HELLO', 'THANK', 'PLEASE', 'YES', 'HELP', 
        'SORRY', 'LOVE', 'NICE', 'MEET', 'YOU'
      ];
      const randomSign = signs[Math.floor(Math.random() * signs.length)];
      
      setDetectedSigns(prev => {
        // Avoid duplicates and limit to 8 signs
        if (prev.length >= 8 || (prev.length > 0 && prev[prev.length - 1] === randomSign)) {
          return prev;
        }
        return [...prev, randomSign];
      });
      
      setDetectionCount(prev => prev + 1);
    }, 2500);
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsDetecting(false);
    
    // Convert signs to natural English
    if (detectedSigns.length > 0) {
      let text = detectedSigns.join(' ');
      
      // Better grammar conversion
      text = text.replace(/\bYOU HOW\b/g, 'HOW ARE YOU');
      text = text.replace(/\bTHANK YOU\b/g, 'THANK YOU');
      text = text.replace(/\bNICE MEET YOU\b/g, 'NICE TO MEET YOU');
      text = text.replace(/\bME HELP\b/g, 'I NEED HELP');
      text = text.replace(/\bME LOVE\b/g, 'I LOVE');
      text = text.replace(/\bME SORRY\b/g, 'I AM SORRY');
      text = text.replace(/\bHELLO NICE MEET YOU\b/g, 'HELLO, NICE TO MEET YOU');
      
      setTranslatedText(text);
    }
  };

  const playAudio = () => {
    if (!translatedText || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const getSignDescription = (sign: string) => {
    const descriptions: { [key: string]: string } = {
      'HELLO': 'Wave hand from forehead with a smile',
      'THANK': 'Hand moves from chin forward and down',
      'PLEASE': 'Circular motion on chest, open palm',
      'YES': 'Fist nods up and down smoothly',
      'HELP': 'Fist rests on opposite palm, lift up',
      'SORRY': 'Circular fist motion over heart',
      'LOVE': 'Arms crossed over chest gently',
      'NICE': 'Brush hands forward twice',
      'MEET': 'Index fingers touch and separate',
      'YOU': 'Point index finger directly at person'
    };
    
    return descriptions[sign] || 'ASL sign gesture';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light text-gray-900 tracking-tight">
              ASL to Audio
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Show signs, hear the translation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
          </div>
        </div>

        <div className="space-y-16">
          {/* Camera Section */}
          <div className="space-y-8">
            {/* Camera View */}
            <div className="relative">
              <div className="relative bg-black rounded-3xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
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
                      <CameraOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-light">Camera is off</p>
                      <p className="text-gray-400 mt-2">Enable camera to start detection</p>
                    </div>
                  </div>
                )}
                
                {isDetecting && (
                  <div className="absolute top-6 right-6">
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-500 text-white rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="font-medium">Detecting signs</span>
                    </div>
                  </div>
                )}
                
                {isCameraActive && !isDetecting && (
                  <div className="absolute top-6 right-6">
                    <div className="flex items-center gap-3 px-4 py-2 bg-black/50 text-white rounded-full backdrop-blur-sm">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">Camera ready</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-6">
              {!isCameraActive ? (
                <Button 
                  size="lg" 
                  onClick={startCamera}
                  className="rounded-full bg-black hover:bg-gray-800 px-8"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button 
                  variant="destructive" 
                  size="lg"
                  onClick={stopCamera}
                  className="rounded-full px-8"
                >
                  <CameraOff className="w-5 h-5 mr-2" />
                  Stop Camera
                </Button>
              )}
              
              {isCameraActive && (
                <Button
                  size="lg"
                  onClick={isDetecting ? stopDetection : startDetection}
                  variant={isDetecting ? "destructive" : "default"}
                  className="rounded-full px-8"
                >
                  {isDetecting ? 'Stop Detection' : 'Start Detection'}
                </Button>
              )}
            </div>

            {/* Detection Status */}
            {isDetecting && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-gray-700 font-medium">
                    Detected {detectionCount} signs
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Detected Signs */}
          {detectedSigns.length > 0 && (
            <div className="space-y-8">
              <div className="border-b border-gray-100 pb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Detected Signs</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {detectedSigns.map((sign, index) => (
                    <div 
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {sign}
                    </div>
                  ))}
                </div>
              </div>

              {/* Translation */}
              {translatedText && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Translation</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playAudio}
                      disabled={isPlaying}
                      className="rounded-full"
                    >
                      {isPlaying ? 'Playing...' : 'Play Audio'}
                    </Button>
                  </div>
                  
                  <div className="p-8 bg-gray-50 rounded-3xl">
                    <p className="text-2xl font-light text-gray-900 leading-relaxed">
                      {translatedText}
                    </p>
                  </div>

                  {/* Sign Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sign Descriptions</span>
                    </div>
                    <div className="grid gap-4">
                      {detectedSigns.map((sign, index) => (
                        <div
                          key={index}
                          className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {sign}
                              </h3>
                              <p className="text-gray-500 leading-relaxed">
                                {getSignDescription(sign)}
                              </p>
                            </div>
                            <div className="ml-4">
                              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
