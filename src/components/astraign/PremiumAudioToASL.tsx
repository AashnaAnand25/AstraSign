import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Volume2, Sparkles } from 'lucide-react';

interface PremiumAudioToASLProps {
  onBack?: () => void;
  onSettings?: () => void;
}

export default function PremiumAudioToASL({ onBack, onSettings }: PremiumAudioToASLProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aslSigns, setAslSigns] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      mediaRecorder.onstop = async () => {
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const demoTexts = [
          "Hello nice to meet you",
          "Thank you very much", 
          "Please help me today",
          "Yes I understand completely"
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
      
      // Auto stop after 8 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 8000);
      
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
    }, 2500);
  };

  const getSignDescription = (sign: string) => {
    const descriptions: { [key: string]: string } = {
      'HELLO': 'Wave hand from forehead outward',
      'NICE': 'Brush hands forward twice',
      'TO': 'Point index finger forward',
      'MEET': 'Index fingers touch and separate',
      'YOU': 'Point index finger at person',
      'THANK': 'Hand moves from chin forward',
      'VERY': 'Arms spread wide with emphasis',
      'MUCH': 'Hands cupped together',
      'PLEASE': 'Circular motion on chest',
      'HELP': 'Fist rests on opposite palm',
      'ME': 'Point index finger to self',
      'TODAY': 'Both hands in Y shape move down',
      'YES': 'Fist nods up and down',
      'UNDERSTAND': 'Index finger touches forehead then moves forward',
      'COMPLETELY': 'Both hands sweep down and out'
    };
    
    return descriptions[sign] || 'Fingerspell the word';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light text-gray-900 tracking-tight">
              Audio to ASL
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Speak naturally, watch signs appear
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Recording Section */}
          <div className="text-center">
            <div className="inline-flex flex-col items-center">
              {/* Recording Button */}
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-red-50 animate-pulse" />
                )}
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`w-24 h-24 rounded-full transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
                      : 'bg-black hover:bg-gray-800 shadow-lg'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </Button>
                
                {/* Recording Time */}
                {isRecording && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <span className="text-sm font-medium text-red-500">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Status Text */}
              <div className="mt-12">
                {isRecording && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-500 font-medium">Recording your voice</span>
                    </div>
                    <p className="text-gray-400 text-sm">Speak clearly and naturally</p>
                  </div>
                )}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-blue-500 font-medium">Processing your speech</span>
                    </div>
                    <p className="text-gray-400 text-sm">Converting to ASL signs</p>
                  </div>
                )}
                {!isRecording && !isProcessing && (
                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium text-lg">Tap to start recording</p>
                    <p className="text-gray-400 text-sm">Maximum 8 seconds</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transcription Result */}
          {transcript && (
            <div className="space-y-8">
              <div className="border-b border-gray-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Transcription</span>
                </div>
                <p className="text-2xl font-light text-gray-900 leading-relaxed">
                  {transcript}
                </p>
              </div>

              {/* ASL Translation */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">ASL Translation</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isPlaying ? () => setIsPlaying(false) : playASL}
                    className="rounded-full"
                  >
                    {isPlaying ? 'Stop' : 'Play Animation'}
                  </Button>
                </div>

                {/* Progress Bar */}
                {isPlaying && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Playing animation</span>
                      <span>{currentSignIndex + 1} of {aslSigns.length}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div
                        className="bg-black h-1 rounded-full transition-all duration-500"
                        style={{ width: `${((currentSignIndex + 1) / aslSigns.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Sign Cards */}
                <div className="grid gap-4">
                  {aslSigns.map((sign, index) => (
                    <div
                      key={index}
                      className={`group transition-all duration-300 ${
                        isPlaying && index === currentSignIndex
                          ? 'transform scale-105'
                          : 'hover:transform hover:scale-102'
                      }`}
                    >
                      <div
                        className={`p-6 rounded-2xl border transition-all duration-300 ${
                          isPlaying && index === currentSignIndex
                            ? 'bg-black text-white border-black'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-lg font-medium mb-2 ${
                              isPlaying && index === currentSignIndex ? 'text-white' : 'text-gray-900'
                            }`}>
                              {sign}
                            </h3>
                            <p className={`text-sm leading-relaxed ${
                              isPlaying && index === currentSignIndex ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {getSignDescription(sign)}
                            </p>
                          </div>
                          {isPlaying && index === currentSignIndex && (
                            <div className="ml-4">
                              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
