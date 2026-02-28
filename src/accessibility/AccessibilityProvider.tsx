import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ContentScale = 1 | 1.1 | 1.25 | 1.5;
export type TextSize = 1 | 2 | 3 | 4;
export type PlaybackSpeed = 1 | 2 | 3 | 4 | 5;
export type SpeechProvider = "wispr" | "mock";

export interface AccessibilitySettings {
  focusMode: boolean;

  textSize: TextSize;
  contentScale: ContentScale;
  highContrast: boolean;
  darkMode: boolean;
  invertColors: boolean;
  grayscale: boolean;

  reduceMotion: boolean;
  stopMotion: boolean;

  dyslexiaFont: boolean;
  increasedLineSpacing: boolean;
  highlightLinks: boolean;
  letterSpacing: 0 | 0.02 | 0.05;

  largerButtons: boolean;
  bigCursor: boolean;
  hapticFeedback: boolean;
  voiceGuidance: boolean;

  readingMask: boolean;

  playbackSpeed: PlaybackSpeed;
  stepMode: boolean;
  confidenceDisplay: boolean;

  enableAIReorder: boolean;
  memorySync: boolean;
  preferredSpeechProvider: SpeechProvider;
  glassesConnected: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  focusMode: false,

  textSize: 2,
  contentScale: 1,
  highContrast: false,
  darkMode: true,
  invertColors: false,
  grayscale: false,

  reduceMotion: false,
  stopMotion: false,

  dyslexiaFont: false,
  increasedLineSpacing: false,
  highlightLinks: false,
  letterSpacing: 0,

  largerButtons: false,
  bigCursor: false,
  hapticFeedback: true,
  voiceGuidance: false,

  readingMask: false,

  playbackSpeed: 3,
  stepMode: false,
  confidenceDisplay: true,

  enableAIReorder: true,
  memorySync: false,
  preferredSpeechProvider: "wispr",
  glassesConnected: false,
};

type AccessibilityContextValue = {
  settings: AccessibilitySettings;
  setSettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  updateSettings: (patch: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const STORAGE_KEY = "neurosign:a11y";

function safeParseSettings(raw: string | null): AccessibilitySettings | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return null;
  }
}

function textSizeToScale(textSize: TextSize): number {
  if (textSize === 1) return 0.92;
  if (textSize === 2) return 1;
  if (textSize === 3) return 1.12;
  return 1.25;
}

function playbackSpeedToSpeechRate(speed: PlaybackSpeed): number {
  if (speed === 1) return 0.7;
  if (speed === 2) return 0.85;
  if (speed === 3) return 1;
  if (speed === 4) return 1.15;
  return 1.3;
}

function applyAccessibilityToDom(settings: AccessibilitySettings) {
  const root = document.documentElement;

  root.classList.toggle("a11y-focus-mode", settings.focusMode);
  root.classList.toggle("a11y-high-contrast", settings.highContrast);
  root.classList.toggle("a11y-reduce-motion", settings.reduceMotion);
  root.classList.toggle("a11y-stop-motion", settings.stopMotion);
  root.classList.toggle("a11y-dyslexia-font", settings.dyslexiaFont);
  root.classList.toggle("a11y-line-spacing", settings.increasedLineSpacing);
  root.classList.toggle("a11y-highlight-links", settings.highlightLinks);
  root.classList.toggle("a11y-larger-buttons", settings.largerButtons);
  root.classList.toggle("a11y-big-cursor", settings.bigCursor);
  root.classList.toggle("a11y-invert", settings.invertColors);
  root.classList.toggle("a11y-grayscale", settings.grayscale);
  root.classList.toggle("dark", settings.darkMode);

  root.style.setProperty("--a11y-text-scale", String(textSizeToScale(settings.textSize)));
  root.style.setProperty("--a11y-content-scale", String(settings.contentScale));
  root.style.setProperty("--a11y-letter-spacing", `${settings.letterSpacing}em`);
  root.style.setProperty("--a11y-speech-rate", String(playbackSpeedToSpeechRate(settings.playbackSpeed)));
}

function AccessibilityOverlays({ settings }: { settings: AccessibilitySettings }) {
  if (!settings.readingMask) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          clipPath: "polygon(0 0, 100% 0, 100% 36%, 0 36%, 0 64%, 100% 64%, 100% 100%, 0 100%)",
          backdropFilter: "blur(1px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          top: "36%",
          height: "28%",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0)",
        }}
      />
    </div>
  );
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const fromStorage = safeParseSettings(window.localStorage.getItem(STORAGE_KEY));
    return fromStorage ?? DEFAULT_SETTINGS;
  });

  useEffect(() => {
    applyAccessibilityToDom(settings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      settings,
      setSettings,
      updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
      resetSettings: () => setSettings(DEFAULT_SETTINGS),
    }),
    [settings]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <AccessibilityOverlays settings={settings} />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
