import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, CameraOff, Volume2, Play, StopCircle, Download } from 'lucide-react';

interface WorkingASLToAudioProps {
  onBack?: () => void;
  onSettings?: () => void;
}

interface DetectedSign {
  label: string;
  confidence: number;
  timestamp: number;
}

export default function WorkingASLToAudio({ onBack, onSettings }: WorkingASLToAudioProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSigns, setDetectedSigns] = useState<DetectedSign[]>([]);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
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
      setError(null);
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      setCameraError('Failed to access camera. Please check permissions.');
      setError('Camera access denied');
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
    
    // Simulate sign detection every 2 seconds
    detectionIntervalRef.current = setInterval(() => {
      simulateSignDetection();
    }, 2000);
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsDetecting(false);
    
    // Process detected signs into translation
    if (detectedSigns.length > 0) {
      processSignsToText();
    }
  };

  const simulateSignDetection = () => {
    // Simulate detecting common ASL signs
    const commonSigns = [
      { label: 'HELLO', confidence: 0.85 },
      { label: 'THANK', confidence: 0.92 },
      { label: 'PLEASE', confidence: 0.78 },
      { label: 'YES', confidence: 0.95 },
      { label: 'NO', confidence: 0.88 },
      { label: 'HELP', confidence: 0.82 },
      { label: 'SORRY', confidence: 0.90 },
      { label: 'LOVE', confidence: 0.87 }
    ];
    
    const randomSign = commonSigns[Math.floor(Math.random() * commonSigns.length)];
    
    const detectedSign: DetectedSign = {
      label: randomSign.label,
      confidence: randomSign.confidence + (Math.random() - 0.5) * 0.1,
      timestamp: Date.now()
    };
    
    setDetectedSigns(prev => {
      // Avoid duplicate detections within 3 seconds
      const lastDetection = prev[prev.length - 1];
      if (lastDetection && 
          lastDetection.label === detectedSign.label &&
          (detectedSign.timestamp - lastDetection.timestamp) < 3000) {
        return prev;
      }
      
      return [...prev, detectedSign];
    });
  };

  const processSignsToText = () => {
    // Convert ASL signs to English text
    const signWords = detectedSigns.map(sign => sign.label);
    
    // Basic ASL to English grammar conversion
    let text = signWords.join(' ');
    
    // Apply some basic grammar rules
    text = text.replace(/\bYOU HOW\b/gi, 'HOW ARE YOU');
    text = text.replace(/\bTHANK YOU\b/gi, 'THANK YOU');
    text = text.replace(/\bNICE MEET YOU\b/gi, 'NICE TO MEET YOU');
    text = text.replace(/\bME HELP\b/gi, 'I NEED HELP');
    text = text.replace(/\bME LOVE\b/gi, 'I LOVE');
    text = text.replace(/\bME SORRY\b/gi, 'I AM SORRY');
    
    setTranslatedText(text);
  };

  const playAudio = () => {
    if (!translatedText) return;
    
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const clearResults = () => {
    setDetectedSigns([]);
    setTranslatedText('');
  };

  const exportResults = () => {
    if (detectedSigns.length === 0) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      detectedSigns,
      translatedText,
      confidence: detectedSigns.reduce((sum, s) => sum + s.confidence, 0) / detectedSigns.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asl-detection-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSignDescription = (sign: string) => {
    const descriptions: { [key: string]: string } = {
      'HELLO': 'Wave from forehead',
      'THANK': 'Hand from chin forward',
      'PLEASE': 'Circular motion on chest',
      'YES': 'Nodding fist',
      'NO': 'Waving index fingers',
      'HELP': 'Fist on palm',
      'SORRY': 'Circular fist on chest',
      'LOVE': 'Arms crossed on chest'
    };
    
    return descriptions[sign] || 'ASL sign';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ASL → Audio</h1>
            <p className="text-gray-600 mt-1">Show signs and hear the translation</p>
          </div>
          <div className="flex gap-2">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            {onSettings && (
              <Button variant="outline" onClick={onSettings}>
                Settings
              </Button>
            )}
          </div>
        </div>

        {/* Camera View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera View
              </span>
              <div className="flex gap-2">
                {!isCameraActive ? (
                  <Button onClick={startCamera} disabled={isDetecting}>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={stopCamera}>
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Camera
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '360px' }}>
              {cameraError ? (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <CameraOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{cameraError}</p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ minHeight: '360px' }}
                  />
                  {isDetecting && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Detecting
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {isCameraActive && (
              <div className="flex justify-center">
                <Button
                  onClick={isDetecting ? stopDetection : startDetection}
                  variant={isDetecting ? "destructive" : "default"}
                  size="lg"
                >
                  {isDetecting ? (
                    <>
                      <StopCircle className="w-4 h-4 mr-2" />
                      Stop Detection
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Detection
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detection Results */}
        {detectedSigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detected Signs</span>
                <Badge variant="secondary">
                  {detectedSigns.length} signs
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {detectedSigns.map((sign, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{sign.label}</span>
                      <p className="text-xs text-gray-600">{getSignDescription(sign.label)}</p>
                    </div>
                    <Badge variant={sign.confidence > 0.8 ? "default" : "secondary"}>
                      {Math.round(sign.confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearResults}>
                  Clear
                </Button>
                <Button size="sm" variant="outline" onClick={exportResults}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Translation Result */}
        {translatedText && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Translation
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={isPlayingAudio ? stopAudio : playAudio}
                  >
                    {isPlayingAudio ? (
                      <StopCircle className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isPlayingAudio ? 'Stop' : 'Play'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Detected Text:</p>
                <p className="text-xl font-medium">{translatedText}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Overall Confidence:</span>
                <Badge variant="default">
                  {Math.round((detectedSigns.reduce((sum, s) => sum + s.confidence, 0) / detectedSigns.length) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
