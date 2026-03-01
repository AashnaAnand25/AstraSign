import React, { useState, useRef } from 'react';
import { Mic, MicOff, Play } from 'lucide-react';

interface MinimalAudioToASLProps {
  onBack?: () => void;
}

export default function MinimalAudioToASL({ onBack }: MinimalAudioToASLProps) {
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
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const demoTexts = [
          "hello nice to meet you",
          "thank you very much",
          "please help me",
          "yes i understand"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Simple Header */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-2xl font-light text-gray-900">Audio to ASL</h1>
          {onBack && (
            <button 
              onClick={onBack}
              className="text-gray-500 hover:text-gray-900 text-sm"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Recording Section */}
        <div className="text-center mb-16">
          <div className="inline-flex flex-col items-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
            
            <div className="mt-8">
              {isRecording && (
                <p className="text-red-500 text-sm">Recording...</p>
              )}
              {isProcessing && (
                <p className="text-gray-500 text-sm">Processing...</p>
              )}
              {!isRecording && !isProcessing && (
                <p className="text-gray-900 text-sm">Tap to record</p>
              )}
            </div>
          </div>
        </div>

        {/* Transcription */}
        {transcript && (
          <div className="mb-16">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
              Transcription
            </h2>
            <p className="text-xl text-gray-900">{transcript}</p>
          </div>
        )}

        {/* ASL Translation */}
        {aslSigns.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                ASL Translation
              </h2>
              <button
                onClick={isPlaying ? () => setIsPlaying(false) : playASL}
                className="text-black hover:text-gray-600 text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isPlaying ? 'Stop' : 'Play'}
              </button>
            </div>

            {/* Progress */}
            {isPlaying && (
              <div className="w-full bg-gray-100 rounded-full h-0.5">
                <div
                  className="bg-black h-0.5 rounded-full transition-all duration-500"
                  style={{ width: `${((currentSignIndex + 1) / aslSigns.length) * 100}%` }}
                />
              </div>
            )}

            {/* Signs */}
            <div className="space-y-3">
              {aslSigns.map((sign, index) => (
                <div
                  key={index}
                  className={`py-4 border-b transition-all duration-300 ${
                    isPlaying && index === currentSignIndex
                      ? 'border-black'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-light ${
                        isPlaying && index === currentSignIndex ? 'text-black' : 'text-gray-900'
                      }`}>
                        {sign}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {sign.toLowerCase()} sign
                      </p>
                    </div>
                    {isPlaying && index === currentSignIndex && (
                      <div className="w-2 h-2 bg-black rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
