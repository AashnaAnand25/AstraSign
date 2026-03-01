import { useEffect, useRef, useState } from "react";

interface VoiceGuidanceSystemProps {
  enabled: boolean;
  onGestureChange?: (gesture: string) => void;
  onNavigation?: (section: string) => void;
  children?: React.ReactNode;
}

// Voice synthesis with emotion support
class EmotionalVoiceSynthesis {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    const updateVoices = () => {
      this.voices = this.synth.getVoices();
      // Prefer female voices for guidance, fallback to any English voice
      this.currentVoice = this.voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Female')
      ) || this.voices.find(voice => voice.lang.includes('en')) || this.voices[0];
    };

    updateVoices();
    this.synth.onvoiceschanged = updateVoices;
  }

  speak(text: string, emotion: 'neutral' | 'happy' | 'excited' | 'calm' | 'encouraging' = 'neutral') {
    if (!this.synth || !this.currentVoice) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.currentVoice;

    // Adjust voice parameters based on emotion
    switch (emotion) {
      case 'happy':
        utterance.pitch = 1.2;
        utterance.rate = 1.1;
        utterance.volume = 0.9;
        break;
      case 'excited':
        utterance.pitch = 1.4;
        utterance.rate = 1.2;
        utterance.volume = 1.0;
        break;
      case 'calm':
        utterance.pitch = 0.9;
        utterance.rate = 0.9;
        utterance.volume = 0.8;
        break;
      case 'encouraging':
        utterance.pitch = 1.1;
        utterance.rate = 1.0;
        utterance.volume = 0.85;
        break;
      default: // neutral
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
        utterance.volume = 0.8;
        break;
    }

    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }
}

export default function VoiceGuidanceSystem({ 
  enabled, 
  onGestureChange, 
  onNavigation,
  children 
}: VoiceGuidanceSystemProps) {
  const voiceSystem = useRef(new EmotionalVoiceSynthesis());
  const [lastGesture, setLastGesture] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice guidance for different events
  const speakGuidance = (text: string, emotion: 'neutral' | 'happy' | 'excited' | 'calm' | 'encouraging' = 'neutral') => {
    if (enabled) {
      setIsSpeaking(true);
      voiceSystem.current.speak(text, emotion);
      
      // Reset speaking state after reasonable time
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  // Gesture change guidance
  useEffect(() => {
    if (onGestureChange && enabled) {
      const handleGestureChange = (gesture: string) => {
        if (gesture !== lastGesture) {
          setLastGesture(gesture);
          
          if (gesture === 'idle') {
            speakGuidance('Ready for next sign', 'neutral');
          } else if (gesture.length === 1) {
            // Single letter
            speakGuidance(`Now showing letter ${gesture.toUpperCase()}`, 'neutral');
          } else {
            // Word
            speakGuidance(`Now showing sign for ${gesture}`, 'encouraging');
          }
          
          onGestureChange(gesture);
        }
      };

      // This would be called from the parent component
      const gestureHandler = (e: CustomEvent) => handleGestureChange(e.detail);
      window.addEventListener('gestureChange', gestureHandler as EventListener);
      
      return () => {
        window.removeEventListener('gestureChange', gestureHandler as EventListener);
      };
    }
  }, [enabled, lastGesture, onGestureChange]);

  // Navigation guidance
  useEffect(() => {
    if (onNavigation && enabled) {
      const handleNavigation = (section: string) => {
        switch (section) {
          case 'home':
            speakGuidance('Home screen', 'neutral');
            break;
          case 'translate':
            speakGuidance('Translation screen', 'neutral');
            break;
          case 'accessibility':
            speakGuidance('Accessibility settings', 'neutral');
            break;
          case 'camera':
            speakGuidance('Camera mode activated', 'excited');
            break;
          case 'voice':
            speakGuidance('Voice input activated', 'excited');
            break;
          case 'text':
            speakGuidance('Text input activated', 'excited');
            break;
          default:
            speakGuidance(`Navigated to ${section}`, 'neutral');
        }
        
        onNavigation(section);
      };

      const navigationHandler = (e: CustomEvent) => handleNavigation(e.detail);
      window.addEventListener('navigation', navigationHandler as EventListener);
      
      return () => {
        window.removeEventListener('navigation', navigationHandler as EventListener);
      };
    }
  }, [enabled, onNavigation]);

  // Initial welcome message
  useEffect(() => {
    if (enabled) {
      const timer = setTimeout(() => {
        speakGuidance('Welcome to NeuroSign AI. Voice guidance is enabled.', 'encouraging');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [enabled]);

  // Error handling
  useEffect(() => {
    const handleError = (e: any) => {
      if (enabled) {
        speakGuidance('An error occurred. Please try again.', 'calm');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [enabled]);

  // Success feedback
  const speakSuccess = (message: string) => {
    speakGuidance(message, 'happy');
  };

  // Error feedback
  const speakError = (message: string) => {
    speakGuidance(message, 'calm');
  };

  // Encouragement
  const speakEncouragement = (message: string) => {
    speakGuidance(message, 'encouraging');
  };

  // Expose methods for parent components
  useEffect(() => {
    if (enabled) {
      // Make methods available globally for other components
      (window as any).voiceGuidance = {
        speak: speakGuidance,
        speakSuccess,
        speakError,
        speakEncouragement,
        stop: () => voiceSystem.current.stop()
      };
    }

    return () => {
      delete (window as any).voiceGuidance;
    };
  }, [enabled]);

  return (
    <>
      {children}
      {/* Voice indicator */}
      {enabled && isSpeaking && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-green-500/20 border border-green-500/50">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Voice Active</span>
        </div>
      )}
    </>
  );
}
