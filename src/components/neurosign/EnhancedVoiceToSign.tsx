import { useState, useRef, useEffect } from "react";
import { Mic, Camera, Type, Volume2, Settings, ChevronRight, ArrowLeft, MicOff } from "lucide-react";
import AvatarScene from "./AvatarScene";
import AvatarSelector from "./AvatarSelector";
import { AvatarType } from "./AvatarSelector";
import HandTracker from "./HandTracker";
import { aslClassifier } from "@/ml/aslClassifier";
import VoiceGuidanceSystem from "./VoiceGuidanceSystem";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";
import React from "react";

interface Props {
  onBack?: () => void;
  onSettings?: () => void;
  embedded?: boolean;
}

export default function EnhancedVoiceToSign({ onBack, onSettings, embedded = false }: Props) {
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
        
        // Voice guidance for ML initialization
        if (settings.voiceGuidance && (window as any).voiceGuidance) {
          (window as any).voiceGuidance.speakSuccess('ASL recognition system ready');
        }
      } catch (error) {
        console.error('Failed to initialize ASL ML model:', error);
        setIsMLInitialized(false);
        
        // Voice guidance for error
        if (settings.voiceGuidance && (window as any).voiceGuidance) {
          (window as any).voiceGuidance.speakError('Failed to initialize ASL recognition');
        }
      }
    };

    initializeML();
  }, [settings.voiceGuidance]);

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
    
    // Voice guidance for gesture detection
    if (settings.voiceGuidance && (window as any).voiceGuidance) {
      if (gestureConfidence > 0.7) {
        (window as any).voiceGuidance.speakSuccess(`Detected ${gesture}`);
      } else if (gestureConfidence > 0.4) {
        (window as any).voiceGuidance.speak(`Maybe ${gesture}?`);
      }
    }
    
    // Haptic feedback
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  // Process text to ASL
  const processTextToASL = (inputText: string) => {
    const cleanText = inputText.trim().toUpperCase();
    if (!cleanText) return;

    setIsProcessing(true);
    
    // Voice guidance
    if (settings.voiceGuidance && (window as any).voiceGuidance) {
      (window as any).voiceGuidance.speak(`Processing ${cleanText}`);
    }
    
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
        
        // Voice guidance for each sign
        if (settings.voiceGuidance && (window as any).voiceGuidance) {
          (window as any).voiceGuidance.speak(`Signing ${word}`);
        }
        
        // Haptic feedback
        if (settings.hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        // Clear animation and move to next word
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          wordIndex++;
          
          // Add delay between signs if step mode is enabled
          const delay = settings.stepMode ? 1500 : 500;
          setTimeout(animateWord, delay);
        }, settings.playbackSpeed * 1000);
      } else {
        setIsProcessing(false);
        setIsAnimating(false);
        setCurrentLetter('');
        setCurrentWord('');
        
        // Voice guidance for completion
        if (settings.voiceGuidance && (window as any).voiceGuidance) {
          (window as any).voiceGuidance.speakSuccess('Translation complete');
        }
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
      
      // Voice guidance
      if (settings.voiceGuidance && (window as any).voiceGuidance) {
        (window as any).voiceGuidance.speak('Listening...');
      }
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      // Voice guidance for error
      if (settings.voiceGuidance && (window as any).voiceGuidance) {
        (window as any).voiceGuidance.speakError('Microphone access denied');
      }
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      
      // Voice guidance
      if (settings.voiceGuidance && (window as any).voiceGuidance) {
        (window as any).voiceGuidance.speak('Processing speech...');
      }
    }
  };

  // Handle input mode change
  const handleInputModeChange = (mode: 'text' | 'voice' | 'camera') => {
    setInputMode(mode);
    
    // Voice guidance for mode change
    if (settings.voiceGuidance && (window as any).voiceGuidance) {
      (window as any).voiceGuidance.speak(`Switched to ${mode} mode`);
    }
    
    // Dispatch navigation event
    window.dispatchEvent(new CustomEvent('navigation', { detail: mode }));
  };

  // Apply accessibility styles
  const getAccessibilityStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (settings.highContrast) {
      styles.filter = 'contrast(1.5)';
    }
    
    if (settings.invertColors) {
      styles.filter = (styles.filter || '') + ' invert(1)';
    }
    
    if (settings.grayscale) {
      styles.filter = (styles.filter || '') + ' grayscale(1)';
    }
    
    if (settings.contentScale !== 1) {
      styles.transform = `scale(${settings.contentScale})`;
      styles.transformOrigin = 'top left';
    }
    
    return styles;
  };

  const getTextStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (settings.dyslexiaFont) {
      styles.fontFamily = 'OpenDyslexic, sans-serif';
    }
    
    if (settings.textSize) {
      const sizes = ['14px', '16px', '18px', '20px'];
      styles.fontSize = sizes[settings.textSize - 1] || '16px';
    }
    
    if (settings.increasedLineSpacing) {
      styles.lineHeight = '1.8';
    }
    
    if (settings.letterSpacing > 0) {
      styles.letterSpacing = `${settings.letterSpacing}em`;
    }
    
    return styles;
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
        className={`w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${focusMode ? 'focus-mode' : ''}`}
        style={getAccessibilityStyles()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
                style={{ fontSize: settings.largerButtons ? '18px' : '14px' }}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white" style={getTextStyles()}>
                NeuroSign AI
              </h1>
              <p className="text-sm text-white/70" style={getTextStyles()}>
                {isMLInitialized ? 'Ready' : 'Initializing...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Accessibility button */}
            <button
              onClick={() => setShowAccessibility(true)}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
              style={{ fontSize: settings.largerButtons ? '18px' : '14px' }}
            >
              <Settings size={20} />
            </button>
            
            {/* Focus mode toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                focusMode ? 'bg-purple-600 text-white' : 'glass text-white'
              }`}
              style={{ fontSize: settings.largerButtons ? '14px' : '12px' }}
            >
              Focus
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex-1 p-4 ${focusMode ? 'focus-content' : ''}`}>
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
                    : 'glass text-white/70 hover:text-white'
                }`}
                style={{ fontSize: settings.largerButtons ? '16px' : '14px' }}
              >
                <Icon size={20} />
                <span style={getTextStyles()}>{label}</span>
              </button>
            ))}
          </div>

          {/* Input area */}
          <div className="glass rounded-2xl p-4 mb-6">
            {inputMode === 'text' && (
              <div className="space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type text to translate to ASL..."
                  className="w-full h-24 bg-transparent text-white placeholder-white/50 resize-none focus:outline-none"
                  style={getTextStyles()}
                />
                <button
                  onClick={() => processTextToASL(text)}
                  disabled={!text.trim() || isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-50 transition-all"
                  style={{ fontSize: settings.largerButtons ? '16px' : '14px' }}
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
                <p className="mt-4 text-white" style={getTextStyles()}>
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
                    <p className="text-white" style={getTextStyles()}>
                      Initializing ASL recognition...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar display */}
          <div className="glass rounded-2xl p-4 mb-6" style={{ height: focusMode ? '400px' : '300px' }}>
            <AvatarScene
              currentLetter={currentLetter}
              currentWord={currentWord}
              isAnimating={isAnimating}
              avatarType={'person'}
            />
          </div>

          {/* Avatar selector */}
          <div className="glass rounded-2xl p-4">
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onAvatarChange={setSelectedAvatar}
            />
          </div>

          {/* Status display */}
          {(detectedGesture || confidence > 0) && (
            <div className="glass rounded-2xl p-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold" style={getTextStyles()}>
                    Detected: {detectedGesture || 'None'}
                  </p>
                  {settings.confidenceDisplay && (
                    <p className="text-white/70 text-sm" style={getTextStyles()}>
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
