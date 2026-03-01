import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, Volume2 } from 'lucide-react';

interface CleanAudioToASLProps {
  onBack?: () => void;
  onSettings?: () => void;
}

export default function CleanAudioToASL({ onBack, onSettings }: CleanAudioToASLProps) {
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
        // Simulate processing
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const demoTexts = [
          "Hello nice to meet you",
          "Thank you very much",
          "Please help me",
          "Yes I understand"
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
      
      // Auto stop after 5 seconds
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

  const getSignDescription = (sign: string) => {
    const descriptions: { [key: string]: string } = {
      'HELLO': 'Wave from forehead',
      'NICE': 'Brush hands forward',
      'TO': 'Point forward',
      'MEET': 'Index fingers meet',
      'YOU': 'Point at person',
      'THANK': 'Hand from chin',
      'VERY': 'Arms spread wide',
      'MUCH': 'Hands cupped',
      'PLEASE': 'Circle on chest',
      'HELP': 'Fist on palm',
      'ME': 'Point to self',
      'YES': 'Nodding fist',
      'UNDERSTAND': 'Index to head'
    };
    
    return descriptions[sign] || 'Fingerspell';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Audio → ASL</h1>
          <div className="flex gap-2">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                Back
              </Button>
            )}
          </div>
        </div>

        {/* Recording */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className="w-20 h-20 rounded-full"
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              <div>
                {isRecording && (
                  <p className="text-red-600 font-medium">Recording... (5s max)</p>
                )}
                {isProcessing && (
                  <p className="text-blue-600 font-medium">Processing...</p>
                )}
                {!isRecording && !isProcessing && (
                  <p className="text-gray-600">Tap to speak</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcription */}
        {transcript && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-gray-900">{transcript}</p>
            </CardContent>
          </Card>
        )}

        {/* ASL Translation */}
        {aslSigns.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  ASL Translation
                </CardTitle>
                <Button
                  size="sm"
                  onClick={isPlaying ? () => setIsPlaying(false) : playASL}
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPlaying && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentSignIndex + 1) / aslSigns.length) * 100}%` }}
                  />
                </div>
              )}
              
              <div className="grid gap-3">
                {aslSigns.map((sign, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      isPlaying && index === currentSignIndex
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{sign}</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {getSignDescription(sign)}
                        </p>
                      </div>
                      {isPlaying && index === currentSignIndex && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
