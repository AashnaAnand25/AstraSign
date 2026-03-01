import { useState } from "react";
import LandingScreen from "@/components/neurosign/LandingScreen";
import ModeSelection from "@/components/neurosign/ModeSelection";
import SignToVoice from "@/components/neurosign/SignToVoice";
import VoiceToSign from "@/components/neurosign/VoiceToSign";
import AccessibilityPanel from "@/components/neurosign/AccessibilityPanel";
import ConversationMode from "@/components/neurosign/ConversationMode";
import OnboardingOne from "@/components/neurosign/OnboardingOne";
import OnboardingTwo from "@/components/neurosign/OnboardingTwo";
import HomeScreen from "@/components/neurosign/HomeScreen";
import LiveSigningScreen from "@/components/neurosign/LiveSigningScreen";
import ReverseMode from "@/components/neurosign/ReverseMode";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

export type Screen =
  | "landing"
  | "onboarding-1"
  | "onboarding-2"
  | "home"
  | "live"
  | "reverse"
  | "modes"
  | "sign-to-voice"
  | "voice-to-sign"
  | "conversation";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [showAccessibility, setShowAccessibility] = useState(false);
  const { settings, updateSettings } = useAccessibility();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen mx-auto overflow-hidden">
        {/* Ambient glow — very subtle, only two anchors */}
        <div className="fixed inset-0 max-w-[430px] mx-auto pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-48 h-48 rounded-full bg-neon-purple/[0.06] blur-[90px]" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-neon-cyan/[0.04] blur-[90px]" />
        </div>

        {screen === "landing" && <LandingScreen onStart={() => setScreen("onboarding-1")} />}

        {screen === "onboarding-1" && (
          <OnboardingOne onNext={() => setScreen("onboarding-2")} onSkip={() => setScreen("home")} />
        )}
        {screen === "onboarding-2" && (
          <OnboardingTwo onNext={() => setScreen("home")} onBack={() => setScreen("onboarding-1")} />
        )}

        {screen === "home" && (
          <HomeScreen
            onStartLive={() => setScreen("live")}
            onReverseMode={() => setScreen("reverse")}
            onVoiceToSign={() => setScreen("voice-to-sign")}
            onCameraMode={() => setScreen("sign-to-voice")}
            onConversation={() => setScreen("conversation")}
            onSettings={() => setShowAccessibility(true)}
          />
        )}

        {screen === "live" && (
          <LiveSigningScreen onBack={() => setScreen("home")} onSettings={() => setShowAccessibility(true)} />
        )}

        {screen === "reverse" && (
          <ReverseMode onBack={() => setScreen("home")} onSettings={() => setShowAccessibility(true)} />
        )}

        {screen === "modes" && (
          <ModeSelection
            onSelect={(mode) => setScreen(mode)}
            onSettings={() => setShowAccessibility(true)}
            onConversation={() => setScreen("conversation")}
          />
        )}
        {screen === "sign-to-voice" && (
          <SignToVoice
            onBack={() => setScreen("home")}
            onSettings={() => setShowAccessibility(true)}
            focusMode={settings.focusMode}
          />
        )}
        {screen === "voice-to-sign" && (
          <VoiceToSign
            onBack={() => setScreen("home")}
            onSettings={() => setShowAccessibility(true)}
          />
        )}
        {screen === "conversation" && (
          <ConversationMode onBack={() => setScreen("home")} />
        )}

        <AccessibilityPanel
          isOpen={showAccessibility}
          onClose={() => setShowAccessibility(false)}
          focusMode={settings.focusMode}
          onFocusModeChange={(v) => updateSettings({ focusMode: v })}
        />
      </div>
    </div>
  );
};

export default Index;
