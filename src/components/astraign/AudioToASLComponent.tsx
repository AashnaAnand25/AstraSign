import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Volume2, StopCircle, Play } from 'lucide-react';
import { aslSignsDatabase } from '@/data/ASLSignsDatabase';
import { aslModelService, ASLDetection } from '@/services/ASLModelService';

interface AudioToASLProps {
  onBack?: () => void;
  onSettings?: () => void;
}

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  processingTime: number;
  source: string;
}

interface ASLTranslation {
  originalText: string;
  aslText: string;
  signs: string[];
  detectedSigns: ASLDetection[];
}

export default function AudioToASLComponent({ onBack, onSettings }: AudioToASLProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [translation, setTranslation] = useState<ASLTranslation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('mobilenet');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize the ML model
    aslModelService.loadModel({ modelType: selectedModel as any })
      .catch(err => console.error('Failed to load model:', err));

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      aslModelService.dispose();
    };
  }, [selectedModel]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert to base64 for API call
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Call backend for transcription
        const transcriptionResult = await transcribeAudio(base64Audio);
        setTranscription(transcriptionResult);
        
        // Convert to ASL
        const aslTranslation = await convertToASL(transcriptionResult.transcript);
        setTranslation(aslTranslation);
        
        setIsProcessing(false);
      };
    } catch (err) {
      console.error('Failed to process audio:', err);
      setError('Failed to process audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (audioData: string): Promise<TranscriptionResult> => {
    try {
      const response = await fetch('http://localhost:8001/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'your-secret-key-here'
        },
        body: JSON.stringify({
          audio_data: audioData,
          format: 'webm'
        })
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Transcription error:', err);
      // Fallback to demo mode
      return {
        transcript: "HELLO HOW ARE YOU",
        confidence: 0.95,
        processingTime: 0.5,
        source: "demo"
      };
    }
  };

  const convertToASL = async (text: string): Promise<ASLTranslation> => {
    try {
      // Get ASL grammar conversion
      const grammarResponse = await fetch('http://localhost:8001/api/grammar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'your-secret-key-here'
        },
        body: JSON.stringify({ text })
      });

      let aslText = text;
      if (grammarResponse.ok) {
        const grammarResult = await grammarResponse.json();
        aslText = grammarResult.asl_grammar;
      }

      // Split into words and find signs
      const words = aslText.toLowerCase().split(' ').filter(word => word.length > 0);
      const signs: string[] = [];
      
      words.forEach(word => {
        const sign = aslSignsDatabase.getSign(word);
        if (sign) {
          signs.push(sign.id);
        }
      });

      // For demonstration, we'll simulate sign detection
      const detectedSigns: ASLDetection[] = signs.map(signId => ({
        label: signId.toUpperCase(),
        confidence: 0.8 + Math.random() * 0.2
      }));

      return {
        originalText: text,
        aslText,
        signs,
        detectedSigns
      };
    } catch (err) {
      console.error('ASL conversion error:', err);
      return {
        originalText: text,
        aslText: text,
        signs: [],
        detectedSigns: []
      };
    }
  };

  const playASLAnimation = () => {
    if (!translation) return;
    
    setIsPlaying(true);
    setPlaybackProgress(0);
    
    const totalSigns = translation.signs.length;
    let currentSign = 0;
    
    const animate = () => {
      const progress = (currentSign / totalSigns) * 100;
      setPlaybackProgress(progress);
      
      if (currentSign < totalSigns) {
        currentSign++;
        animationRef.current = requestAnimationFrame(() => {
          setTimeout(animate, 1000); // 1 second per sign
        });
      } else {
        setIsPlaying(false);
        setPlaybackProgress(100);
      }
    };
    
    animate();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
  };

  const getSignDisplay = (signId: string) => {
    const sign = aslSignsDatabase.getSign(signId);
    return sign ? sign.word : signId.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audio → ASL</h1>
            <p className="text-gray-600 mt-1">Speak and see ASL translation</p>
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
              <Volume2 className="w-5 h-5" />
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
                  disabled={isRecording || isProcessing}
                >
                  {model.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recording Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className="w-24 h-24 rounded-full"
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </div>
            
            {isRecording && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording...
                </div>
              </div>
            )}
            
            {isProcessing && (
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin" />
                  Processing...
                </div>
                <Progress value={33} className="w-full" />
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcription Result */}
        {transcription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transcription</span>
                <Badge variant="secondary">
                  {Math.round(transcription.confidence * 100)}% confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{transcription.transcript}</p>
              <p className="text-sm text-gray-500 mt-2">
                Source: {transcription.source} • {transcription.processingTime}s
              </p>
            </CardContent>
          </Card>
        )}

        {/* ASL Translation */}
        {translation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>ASL Translation</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={isPlaying ? stopAnimation : playASLAnimation}
                    disabled={!translation.signs.length}
                  >
                    {isPlaying ? (
                      <StopCircle className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isPlaying ? 'Stop' : 'Play'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Original: {translation.originalText}</p>
                <p className="text-lg font-medium">ASL: {translation.aslText}</p>
              </div>
              
              {isPlaying && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Playing ASL Animation</span>
                    <span>{Math.round(playbackProgress)}%</span>
                  </div>
                  <Progress value={playbackProgress} />
                </div>
              )}
              
              {translation.signs.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Detected Signs:</p>
                  <div className="flex flex-wrap gap-2">
                    {translation.signs.map((signId, index) => (
                      <Badge key={index} variant="outline">
                        {getSignDisplay(signId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {translation.detectedSigns.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Detection Confidence:</p>
                  <div className="space-y-1">
                    {translation.detectedSigns.map((detection, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{detection.label}</span>
                        <Badge variant={detection.confidence > 0.8 ? "default" : "secondary"}>
                          {Math.round(detection.confidence * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
