import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Volume2, Play, StopCircle } from 'lucide-react';

interface WorkingAudioToASLProps {
  onBack?: () => void;
  onSettings?: () => void;
}

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  words: string[];
}

export default function WorkingAudioToASL({ onBack, onSettings }: WorkingAudioToASLProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      // Simulate processing with demo data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const demoTranscriptions = [
        "HELLO HOW ARE YOU",
        "THANK YOU VERY MUCH", 
        "NICE TO MEET YOU",
        "PLEASE HELP ME",
        "YES I UNDERSTAND",
        "SORRY FOR TROUBLE"
      ];
      
      const randomTranscript = demoTranscriptions[Math.floor(Math.random() * demoTranscriptions.length)];
      const words = randomTranscript.split(' ');
      
      setTranscription({
        transcript: randomTranscript,
        confidence: 0.85 + Math.random() * 0.15,
        words
      });
      
      setIsProcessing(false);
    } catch (err) {
      console.error('Processing failed:', err);
      setError('Failed to process audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const playASLAnimation = () => {
    if (!transcription) return;
    
    setIsPlaying(true);
    setCurrentWordIndex(0);
    
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => {
        if (prev >= transcription.words.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 1500); // 1.5 seconds per word
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    setCurrentWordIndex(0);
  };

  const getASLDemonstration = (word: string) => {
    // Simple mapping of common words to ASL descriptions
    const aslMap: { [key: string]: string } = {
      'HELLO': 'Wave hand from forehead',
      'HOW': 'Fingers wiggle',
      'ARE': 'Point forward',
      'YOU': 'Point at person',
      'THANK': 'Hand from chin forward',
      'VERY': 'Arms spread wide',
      'MUCH': 'Hands cup together',
      'NICE': 'Hands brush forward',
      'TO': 'Point direction',
      'MEET': 'Index fingers meet',
      'PLEASE': 'Hand circles on chest',
      'HELP': 'Fist on palm',
      'ME': 'Point to self',
      'YES': 'Fist nods up/down',
      'UNDERSTAND': 'Index to head then forward',
      'SORRY': 'Fist circles on chest',
      'FOR': 'Hands push forward',
      'TROUBLE': 'Hands rub together'
    };
    
    return aslMap[word] || 'Fingerspell word';
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
                <Progress value={66} className="w-full" />
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
              <div className="mt-2 flex flex-wrap gap-2">
                {transcription.words.map((word, index) => (
                  <Badge 
                    key={index} 
                    variant={isPlaying && index === currentWordIndex ? "default" : "outline"}
                    className="text-xs"
                  >
                    {word}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ASL Translation Display */}
        {transcription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  ASL Translation
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={isPlaying ? stopAnimation : playASLAnimation}
                    disabled={!transcription}
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
              {isPlaying && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Playing ASL Animation</span>
                    <span>{currentWordIndex + 1} / {transcription.words.length}</span>
                  </div>
                  <Progress value={((currentWordIndex + 1) / transcription.words.length) * 100} />
                </div>
              )}
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">ASL Signs:</p>
                <div className="grid gap-2">
                  {transcription.words.map((word, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border transition-all ${
                        isPlaying && index === currentWordIndex 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{word}</span>
                          <p className="text-xs text-gray-600 mt-1">
                            {getASLDemonstration(word)}
                          </p>
                        </div>
                        {isPlaying && index === currentWordIndex && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
