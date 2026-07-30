import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AccessibilitySettings {
  // Display Settings
  focusMode: boolean;
  textSize: number;
  contentScaling: number;
  highContrast: boolean;
  reduceMotion: boolean;
  stopMotion: boolean;
  invertColors: boolean;
  grayscale: boolean;
  
  // Reading Settings
  dyslexiaFont: boolean;
  increasedLineSpacing: boolean;
  highlightLinks: boolean;
  letterSpacing: 'default' | 'medium' | 'large';
  
  // Interaction Settings
  largerButtons: boolean;
  hapticFeedback: boolean;
  voiceGuidance: boolean;
  bigCursor: boolean;
  readingMask: boolean;
  
  // Translation Settings
  playbackSpeed: number;
  stepMode: boolean;
  confidenceDisplay: boolean;
  
  // AI & Memory Settings
  aiReordering: boolean;
  memorySync: boolean;
  speechProvider: 'wispr' | 'mock';
  
  // Hardware Settings
  metaGlassesConnected: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: AccessibilitySettings[keyof AccessibilitySettings]) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  focusMode: false,
  textSize: 2,
  contentScaling: 100,
  highContrast: false,
  reduceMotion: false,
  stopMotion: false,
  invertColors: false,
  grayscale: false,
  dyslexiaFont: false,
  increasedLineSpacing: false,
  highlightLinks: false,
  letterSpacing: 'default',
  largerButtons: false,
  hapticFeedback: false,
  voiceGuidance: false,
  bigCursor: false,
  readingMask: false,
  playbackSpeed: 3,
  stepMode: false,
  confidenceDisplay: false,
  aiReordering: false,
  memorySync: false,
  speechProvider: 'wispr',
  metaGlassesConnected: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function GlobalAccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('astrasign-accessibility');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const updateSetting = (key: keyof AccessibilitySettings, value: AccessibilitySettings[keyof AccessibilitySettings]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('astrasign-accessibility', JSON.stringify(newSettings));
    
    // Apply global styles
    applyGlobalStyles(key, value);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('astrasign-accessibility');
    applyAllSettings(defaultSettings);
  };

  const applyGlobalStyles = (key: keyof AccessibilitySettings, value: AccessibilitySettings[keyof AccessibilitySettings]) => {
    const root = document.documentElement;
    
    switch (key) {
      case 'textSize':
        root.style.setProperty('--accessibility-text-size', `${0.8 + (Number(value) * 0.1)}rem`);
        break;
      case 'contentScaling':
        root.style.setProperty('--accessibility-scaling', String(Number(value) / 100));
        break;
      case 'highContrast':
        root.classList.toggle('high-contrast', Boolean(value));
        break;
      case 'invertColors':
        root.classList.toggle('invert-colors', Boolean(value));
        break;
      case 'grayscale':
        root.classList.toggle('grayscale', Boolean(value));
        break;
      case 'dyslexiaFont':
        root.classList.toggle('dyslexia-font', Boolean(value));
        break;
      case 'reduceMotion':
        root.classList.toggle('reduce-motion', Boolean(value));
        break;
      case 'stopMotion':
        root.classList.toggle('stop-motion', Boolean(value));
        break;
      case 'largerButtons':
        root.classList.toggle('larger-buttons', Boolean(value));
        break;
      case 'bigCursor':
        root.classList.toggle('big-cursor', Boolean(value));
        break;
      case 'focusMode':
        root.classList.toggle('focus-mode', Boolean(value));
        break;
      case 'increasedLineSpacing':
        root.classList.toggle('increased-line-spacing', Boolean(value));
        break;
      case 'highlightLinks':
        root.classList.toggle('highlight-links', Boolean(value));
        break;
      case 'readingMask':
        root.classList.toggle('reading-mask', Boolean(value));
        break;
    }
  };

  const applyAllSettings = (settingsToApply: AccessibilitySettings) => {
    Object.entries(settingsToApply).forEach(([key, value]) => {
      applyGlobalStyles(key as keyof AccessibilitySettings, value);
    });
  };

  // Apply settings on mount
  useEffect(() => {
    applyAllSettings(settings);
  }, []);

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Voice guidance helper
  const speak = (text: string) => {
    if (settings.voiceGuidance && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ 
      settings, 
      updateSetting, 
      resetSettings 
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// Helper hooks for specific features
export function useHapticFeedback() {
  const { settings } = useAccessibility();
  
  return () => {
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };
}

export function useVoiceGuidance() {
  const { settings } = useAccessibility();
  
  return (text: string) => {
    if (settings.voiceGuidance && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };
}

export function useConfidenceDisplay() {
  const { settings } = useAccessibility();
  return settings.confidenceDisplay;
}

export function useStepMode() {
  const { settings } = useAccessibility();
  return settings.stepMode;
}

export function usePlaybackSpeed() {
  const { settings } = useAccessibility();
  return settings.playbackSpeed;
}
