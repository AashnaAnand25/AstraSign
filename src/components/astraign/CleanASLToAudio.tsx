import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, Play, Volume2 } from 'lucide-react';

interface CleanASLToAudioProps {
  onBack?: () => void;
  onSettings?: () => void;
}

export default function CleanASLToAudio({ onBack, onSettings }: CleanASLToAudioProps) {
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
    
    // Simulate sign detection
    detectionIntervalRef.current = setInterval(() => {
      const signs = ['HELLO', 'THANK', 'PLEASE', 'YES', 'HELP'];
      const randomSign = signs[Math.floor(Math.random() * signs.length)];
      
      setDetectedSigns(prev => {
        if (prev.length > 0 && prev[prev.length - 1] === randomSign) {
          return prev; // Avoid duplicates
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
    
    // Convert signs to text
    if (detectedSigns.length > 0) {
      const text = detectedSigns.join(' ').replace(/\bYOU HOW\b/g, 'HOW ARE YOU');
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

  const getSignDescription = (sign: string) => {
    const descriptions: { [key: string]: string } = {
      'HELLO': 'Wave from forehead',
      'THANK': 'Hand from chin forward',
      'PLEASE': 'Circle on chest',
      'YES': 'Nodding fist',
      'HELP': 'Fist on palm'
    };
    
    return descriptions[sign] || 'ASL sign';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">ASL → Audio</h1>
          <div className="flex gap-2">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                Back
              </Button>
            )}
          </div>
        </div>

        {/* Camera */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ minHeight: '300px' }}
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <CameraOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Camera off</p>
                    </div>
                  </div>
                )}
                {isDetecting && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Detecting
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center gap-4">
                {!isCameraActive ? (
                  <Button onClick={startCamera}>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={stopCamera}>
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Camera
                  </Button>
                )}
                
                {isCameraActive && (
                  <Button
                    onClick={isDetecting ? stopDetection : startDetection}
                    variant={isDetecting ? "destructive" : "default"}
                  >
                    {isDetecting ? 'Stop Detection' : 'Start Detection'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detected Signs */}
        {detectedSigns.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Detected Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {detectedSigns.map((sign, index) => (
                  <div key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {sign}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Translation */}
        {translatedText && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Translation
                </CardTitle>
                <Button size="sm" onClick={playAudio} disabled={isPlaying}>
                  {isPlaying ? 'Playing...' : 'Play Audio'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-gray-900">{translatedText}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
