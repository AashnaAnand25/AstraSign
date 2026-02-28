import { useState } from "react";
import LandingScreen from "@/components/neurosign/LandingScreen";
import ModeSelection from "@/components/neurosign/ModeSelection";
import SignToVoice from "@/components/neurosign/SignToVoice";
import SignToVoiceEnhanced from "@/components/neurosign/SignToVoiceEnhanced";
import VoiceToSign from "@/components/neurosign/VoiceToSign";
import AccessibilityPanel from "@/components/neurosign/AccessibilityPanel";
import ConversationMode from "@/components/neurosign/ConversationMode";
import OnboardingOne from "@/components/neurosign/OnboardingOne";
import OnboardingTwo from "@/components/neurosign/OnboardingTwo";
import MainLayout from "@/components/neurosign/MainLayout";
import ReverseMode from "@/components/neurosign/ReverseMode";
import ScreenWithNav from "@/components/neurosign/ScreenWithNav";
import type { TabId } from "@/components/neurosign/BottomNav";

export type Screen =
  | "landing"
  | "onboarding-1"
  | "onboarding-2"
  | "home"
  | "live"
  | "reverse"
  | "modes"
  | "sign-to-voice"
  | "sign-to-voice-enhanced"
  | "voice-to-sign"
  | "conversation";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const goToTab = (tab: TabId) => {
    setScreen("home");
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen mx-auto overflow-hidden">
        {/* Ambient glow */}
        <div className="fixed inset-0 max-w-[430px] mx-auto pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-48 h-48 rounded-full bg-neon-purple/[0.06] blur-[90px]" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-neon-cyan/[0.04] blur-[90px]" />
        </div>

        {screen === "landing" && (
          <LandingScreen onStart={() => setScreen("onboarding-1")} />
        )}

        {screen === "onboarding-1" && (
          <OnboardingOne
            onNext={() => setScreen("onboarding-2")}
            onSkip={() => setScreen("home")}
          />
        )}
        {screen === "onboarding-2" && (
          <OnboardingTwo
            onNext={() => setScreen("home")}
            onBack={() => setScreen("onboarding-1")}
          />
        )}

        {screen === "home" && (
          <MainLayout
            onStartLive={() => setScreen("live")}
            onReverseMode={() => setScreen("reverse")}
            onCameraMode={() => setScreen("sign-to-voice")}
            onEnhancedCameraMode={() => setScreen("sign-to-voice-enhanced")}
            onConversation={() => setScreen("conversation")}
            onSettings={() => goToTab("settings")}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {screen === "live" && (
          <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
            <VoiceToSign
              onBack={() => setScreen("home")}
              onSettings={() => goToTab("settings")}
            />
          </ScreenWithNav>
        )}

        {screen === "reverse" && (
          <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
            <ReverseMode
              onBack={() => setScreen("home")}
              onSettings={() => goToTab("settings")}
            />
          </ScreenWithNav>
        )}

        {screen === "modes" && (
          <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
            <ModeSelection
              onSelect={(mode) => setScreen(mode)}
              onSettings={() => goToTab("settings")}
              onConversation={() => setScreen("conversation")}
            />
          </ScreenWithNav>
        )}

        {screen === "sign-to-voice" && (
          <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
            <SignToVoice
              onBack={() => setScreen("home")}
              onSettings={() => goToTab("settings")}
            />
          </ScreenWithNav>
        )}

        {screen === "sign-to-voice-enhanced" && (
          <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
            <SignToVoiceEnhanced
              onBack={() => setScreen("home")}
              onSettings={() => goToTab("settings")}
            />
          </ScreenWithNav>
        )}

        {screen === "voice-to-sign" && (
          <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
            <VoiceToSign
              onBack={() => setScreen("home")}
              onSettings={() => goToTab("settings")}
            />
          </ScreenWithNav>
        )}

        {screen === "conversation" && (
          <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
            <ConversationMode onBack={() => setScreen("home")} />
          </ScreenWithNav>
        )}
      </div>
    </div>
  );
};

export default Index;
