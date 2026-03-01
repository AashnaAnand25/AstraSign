import { useState, useRef, useEffect } from "react";
import { Mic, Camera, Type, Volume2, Settings, ChevronRight, ArrowLeft, MicOff } from "lucide-react";
import AvatarScene from "./AvatarScene";
import AvatarSelector from "./AvatarSelector";
import { AvatarType } from "./AvatarSelector";
import HandTracker from "./HandTracker";
import { aslClassifier } from "@/ml/aslClassifier";
import VoiceGuidanceSystem from "./VoiceGuidanceSystem";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

interface Props {
  onBack?: () => void;
  onSettings?: () => void;
  embedded?: boolean;
}

export default function SimpleVoiceToSign({ onBack, onSettings, embedded = false }: Props) {
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'camera'>('text');
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLetter, setCurrentLetter] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>('person');
  const [detectedGesture, setDetectedGesture] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isMLInitialized, setIsMLInitialized] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  
  const { settings } = useAccessibility();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize ML model
  useEffect(() => {
    const initializeML = async () => {
      try {
        console.log('Initializing ASL ML model...');
        await aslClassifier.initialize();
        setIsMLInitialized(true);
        console.log('ASL ML model initialized successfully');
      } catch (error) {
        console.error('Failed to initialize ASL ML model:', error);
        setIsMLInitialized(false);
      }
    };

    initializeML();
  }, []);

  // Handle gesture detected from hand tracker
  const handleGestureDetected = (gesture: string, gestureConfidence: number) => {
    setDetectedGesture(gesture);
    setConfidence(gestureConfidence);
    
    console.log(`Gesture detected: ${gesture} with confidence: ${gestureConfidence}`);
    
    // Update current sign
    if (gesture.length === 1) {
      setCurrentLetter(gesture);
      setCurrentWord('');
    } else {
      setCurrentWord(gesture);
      setCurrentLetter('');
    }
    
    setIsAnimating(true);
    
    // Clear animation after delay
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  // Process text to ASL
  const processTextToASL = (inputText: string) => {
    const cleanText = inputText.trim().toUpperCase();
    if (!cleanText) return;

    setIsProcessing(true);
    
    // Split into words and animate
    const words = cleanText.split(' ');
    let wordIndex = 0;
    
    const animateWord = () => {
      if (wordIndex < words.length) {
        const word = words[wordIndex];
        
        // Check if it's a single letter or word
        if (word.length === 1 && /[A-Z]/.test(word)) {
          setCurrentLetter(word);
          setCurrentWord('');
        } else {
          setCurrentWord(word);
          setCurrentLetter('');
        }
        
        setIsAnimating(true);
        
        // Clear animation and move to next word
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          wordIndex++;
          setTimeout(animateWord, 500);
        }, settings.playbackSpeed * 1000);
      } else {
        setIsProcessing(false);
        setIsAnimating(false);
        setCurrentLetter('');
        setCurrentWord('');
      }
    };
    
    animateWord();
  };

  // Handle voice recording
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Here you would send to speech-to-text service
        // For now, simulate with a demo text
        const simulatedText = "HELLO WORLD";
        setText(simulatedText);
        processTextToASL(simulatedText);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle input mode change
  const handleInputModeChange = (mode: 'text' | 'voice' | 'camera') => {
    setInputMode(mode);
  };

  return (
    <VoiceGuidanceSystem 
      enabled={settings.voiceGuidance}
      onGestureChange={(gesture) => {
        setCurrentLetter(gesture.length === 1 ? gesture : '');
        setCurrentWord(gesture.length > 1 ? gesture : '');
      }}
      onNavigation={(section) => console.log('Navigated to:', section)}
    >
      <div 
        className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        style={{
          filter: settings.highContrast ? 'contrast(1.5)' : 'none',
          transform: `scale(${settings.contentScale})`,
          transformOrigin: 'top left'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">
                AstraSign
              </h1>
              <p className="text-sm text-white/70">
                {isMLInitialized ? 'Ready' : 'Initializing...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Accessibility button */}
            <button
              onClick={() => setShowAccessibility(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Settings size={20} className="text-white" />
            </button>
            
            {/* Focus mode toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                focusMode ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Focus
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Input mode selector */}
          <div className="flex gap-2 mb-6">
            {[
              { mode: 'text' as const, icon: Type, label: 'Text' },
              { mode: 'voice' as const, icon: Mic, label: 'Voice' },
              { mode: 'camera' as const, icon: Camera, label: 'Camera' },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => handleInputModeChange(mode)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                  inputMode === mode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Input area */}
          <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            {inputMode === 'text' && (
              <div className="space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type text to translate to ASL..."
                  className="w-full h-24 bg-transparent text-white placeholder-white/50 resize-none focus:outline-none"
                  style={{
                    fontSize: settings.textSize ? `${14 + settings.textSize * 2}px` : '16px',
                    fontFamily: settings.dyslexiaFont ? 'monospace' : 'sans-serif',
                    lineHeight: settings.increasedLineSpacing ? '1.8' : '1.5'
                  }}
                />
                <button
                  onClick={() => processTextToASL(text)}
                  disabled={!text.trim() || isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-50 transition-all"
                >
                  {isProcessing ? 'Translating...' : 'Translate'}
                </button>
              </div>
            )}

            {inputMode === 'voice' && (
              <div className="text-center py-8">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-20 h-20 rounded-full transition-all ${
                    isListening
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}
                >
                  {isListening ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                </button>
                <p className="mt-4 text-white">
                  {isListening ? 'Listening...' : 'Tap to start speaking'}
                </p>
              </div>
            )}

            {inputMode === 'camera' && (
              <div className="space-y-4">
                <HandTracker
                  isActive={true}
                  onGestureDetected={handleGestureDetected}
                />
                {!isMLInitialized && (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-white">
                      Initializing ASL recognition...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar display */}
          <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm" style={{ height: '300px' }}>
            <AvatarScene
              currentLetter={currentLetter}
              currentWord={currentWord}
              isAnimating={isAnimating}
              avatarType={'person'}
            />
          </div>

          {/* Avatar selector */}
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onAvatarChange={setSelectedAvatar}
            />
          </div>

          {/* Status display */}
          {(detectedGesture || confidence > 0) && (
            <div className="bg-white/10 rounded-2xl p-4 mt-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">
                    Detected: {detectedGesture || 'None'}
                  </p>
                  {settings.confidenceDisplay && (
                    <p className="text-white/70 text-sm">
                      Confidence: {Math.round(confidence * 100)}%
                    </p>
                  )}
                </div>
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>
    </VoiceGuidanceSystem>
  );
}
