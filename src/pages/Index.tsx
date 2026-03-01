import { useState } from "react";
import MinimalLandingScreen from "@/components/astraign/MinimalLandingScreen";
import ModeSelection from "@/components/astraign/ModeSelection";
import SignToVoice from "@/components/astraign/SignToVoice";
import VoiceToSign from "@/components/astraign/VoiceToSign";
import CleanVoiceToSign from "@/components/astraign/CleanVoiceToSign";
import GuaranteedVoiceToSign from "@/components/astraign/GuaranteedVoiceToSign";
import AccessibilityPanel from "@/components/astraign/AccessibilityPanel";
import ConversationMode from "@/components/astraign/ConversationMode";
import OnboardingOne from "@/components/astraign/OnboardingOne";
import OnboardingTwo from "@/components/astraign/OnboardingTwo";
import MainLayout from "@/components/astraign/MainLayout";
import ReverseMode from "@/components/astraign/ReverseMode";
import ScreenWithNav from "@/components/astraign/ScreenWithNav";
import MainNavigationHub from "@/components/astraign/MainNavigationHub";
import type { TabId } from "@/components/astraign/BottomNav";

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
  | "conversation"
  | "translation-hub";

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
          <MinimalLandingScreen onStart={() => setScreen("onboarding-1")} />
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
            onVoiceToSign={() => setScreen("voice-to-sign")}
            onEnhancedCameraMode={() => setScreen("sign-to-voice-enhanced")}
            onConversation={() => setScreen("conversation")}
            onSettings={() => goToTab("settings")}
            onTranslationHub={() => setScreen("translation-hub")}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {screen === "live" && (
          <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
            <GuaranteedVoiceToSign
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

        {screen === "translation-hub" && (
          <MainNavigationHub
            onBack={() => setScreen("home")}
            onHome={() => setScreen("home")}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
