import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, CameraOff, Volume2, StopCircle, Play, Download } from 'lucide-react';
import { aslSignsDatabase } from '@/data/ASLSignsDatabase';
import { aslModelService, ASLDetection } from '@/services/ASLModelService';

interface ASLToAudioProps {
  onBack?: () => void;
  onSettings?: () => void;
}

interface DetectedSign {
  label: string;
  confidence: number;
  timestamp: number;
  signData?: any;
}

interface ASLTranslation {
  detectedSigns: DetectedSign[];
  translatedText: string;
  confidence: number;
  audioUrl?: string;
}

export default function ASLToAudioComponent({ onBack, onSettings }: ASLToAudioProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [translation, setTranslation] = useState<ASLTranslation | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<DetectedSign[]>([]);
  const [selectedModel, setSelectedModel] = useState('mobilenet');
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Initialize the ML model
    aslModelService.loadModel({ modelType: selectedModel as any })
      .catch(err => console.error('Failed to load model:', err));

    return () => {
      stopCamera();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      aslModelService.dispose();
    };
  }, [selectedModel]);

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
    if (!videoRef.current || !isCameraActive) return;
    
    setIsDetecting(true);
    setDetectionHistory([]);
    setTranslation(null);
    
    // Detect signs every 500ms
    detectionIntervalRef.current = setInterval(() => {
      detectSigns();
    }, 500);
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsDetecting(false);
    
    // Process the detected signs into translation
    if (detectionHistory.length > 0) {
      processDetectionResults();
    }
  };

  const detectSigns = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Run detection
      const detections = await aslModelService.predictASLSign(canvas);
      
      if (detections.length > 0) {
        const bestDetection = detections.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
        
        const detectedSign: DetectedSign = {
          label: bestDetection.label,
          confidence: bestDetection.confidence,
          timestamp: Date.now(),
          signData: bestDetection
        };
        
        setDetectionHistory(prev => {
          // Avoid duplicate detections within 1 second
          const lastDetection = prev[prev.length - 1];
          if (lastDetection && 
              lastDetection.label === detectedSign.label &&
              (detectedSign.timestamp - lastDetection.timestamp) < 1000) {
            return prev;
          }
          
          return [...prev, detectedSign];
        });
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  }, []);

  const processDetectionResults = async () => {
    if (detectionHistory.length === 0) return;
    
    try {
      // Group consecutive detections of the same sign
      const groupedSigns: string[] = [];
      let currentSign = detectionHistory[0].label;
      let confidenceSum = detectionHistory[0].confidence;
      let count = 1;
      
      for (let i = 1; i < detectionHistory.length; i++) {
        const sign = detectionHistory[i];
        
        // If same sign within 2 seconds, group them
        if (sign.label === currentSign && (sign.timestamp - detectionHistory[i - 1].timestamp) < 2000) {
          confidenceSum += sign.confidence;
          count++;
        } else {
          // Add previous sign
          if (confidenceSum / count > 0.6) { // Minimum confidence threshold
            groupedSigns.push(currentSign);
          }
          
          // Start new sign
          currentSign = sign.label;
          confidenceSum = sign.confidence;
          count = 1;
        }
      }
      
      // Add the last sign
      if (confidenceSum / count > 0.6) {
        groupedSigns.push(currentSign);
      }
      
      // Convert signs to text
      const translatedText = await translateSignsToText(groupedSigns);
      
      // Generate speech
      const audioUrl = await generateSpeech(translatedText);
      
      const overallConfidence = detectionHistory.reduce((sum, s) => sum + s.confidence, 0) / detectionHistory.length;
      
      setTranslation({
        detectedSigns: detectionHistory,
        translatedText,
        confidence: overallConfidence,
        audioUrl
      });
      
    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to process detected signs');
    }
  };

  const translateSignsToText = async (signs: string[]): Promise<string> => {
    try {
      // Convert sign IDs to words
      const words = signs.map(signId => {
        const sign = aslSignsDatabase.getSign(signId.toLowerCase());
        return sign ? sign.word : signId.toUpperCase();
      });
      
      // Basic ASL to English grammar conversion
      let text = words.join(' ');
      
      // Apply some basic grammar rules
      text = text.replace(/\bYOU HOW\b/gi, 'HOW ARE YOU');
      text = text.replace(/\bNAME ME\b/gi, 'MY NAME IS');
      text = text.replace(/\bTHANK YOU\b/gi, 'THANK YOU');
      text = text.replace(/\bNICE MEET YOU\b/gi, 'NICE TO MEET YOU');
      text = text.replace(/\bME GO\b/gi, 'I AM GOING');
      text = text.replace(/\bME\b/gi, 'I');
      
      return text;
    } catch (err) {
      console.error('Translation error:', err);
      return signs.join(' ');
    }
  };

  const generateSpeech = async (text: string): Promise<string | undefined> => {
    try {
      const response = await fetch('http://localhost:8001/api/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'your-secret-key-here'
        },
        body: JSON.stringify({
          text,
          voice_id: 'rachel'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return `data:audio/mp3;base64,${result.audio}`;
      }
    } catch (err) {
      console.error('Speech generation error:', err);
    }
    
    return undefined;
  };

  const playAudio = () => {
    if (translation?.audioUrl && audioRef.current) {
      audioRef.current.src = translation.audioUrl;
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const clearResults = () => {
    setDetectionHistory([]);
    setTranslation(null);
  };

  const exportResults = () => {
    if (!translation) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      detectedSigns: translation.detectedSigns,
      translatedText: translation.translatedText,
      confidence: translation.confidence
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asl-translation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSignDisplay = (signId: string) => {
    const sign = aslSignsDatabase.getSign(signId.toLowerCase());
    return sign ? sign.word : signId.toUpperCase();
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

        {/* Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Detection Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['mobilenet', 'resnet50', 'efficientnet', 'inception', 'vgg16', 'densenet'].map(model => (
                <Button
                  key={model}
                  variant={selectedModel === model ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedModel(model)}
                  disabled={isDetecting}
                >
                  {model.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

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
                  <canvas
                    ref={canvasRef}
                    className="hidden"
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

        {/* Detection History */}
        {detectionHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detected Signs</span>
                <Badge variant="secondary">
                  {detectionHistory.length} signs
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {detectionHistory.map((sign, index) => (
                  <Badge 
                    key={index} 
                    variant={sign.confidence > 0.8 ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {getSignDisplay(sign.label)}
                    <span className="text-xs opacity-70">
                      {Math.round(sign.confidence * 100)}%
                    </span>
                  </Badge>
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
        {translation && (
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
                    disabled={!translation.audioUrl}
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
                <p className="text-xl font-medium">{translation.translatedText}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Overall Confidence:</span>
                <Badge variant={translation.confidence > 0.8 ? "default" : "secondary"}>
                  {Math.round(translation.confidence * 100)}%
                </Badge>
              </div>
              
              {translation.audioUrl && (
                <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
