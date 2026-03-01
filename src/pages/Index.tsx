import { useState } from "react";
import MinimalLandingScreen from "@/components/astraign/MinimalLandingScreen";
import MVPVoiceToSign from "@/components/astraign/MVPVoiceToSign";
import ConversationMode from "@/components/astraign/ConversationMode";
import OnboardingOne from "@/components/astraign/OnboardingOne";
import OnboardingTwo from "@/components/astraign/OnboardingTwo";
import MainLayout from "@/components/astraign/MainLayout";
import ReverseMode from "@/components/astraign/ReverseMode";
import ScreenWithNav from "@/components/astraign/ScreenWithNav";
import MainNavigationHub from "@/components/astraign/MainNavigationHub";
import AccessibilitySettings from "@/components/astraign/AccessibilitySettings";
import { GlobalAccessibilityProvider } from "@/components/astraign/GlobalAccessibilityProvider";
import type { TabId } from "@/components/astraign/BottomNav";
import type { TranslateMode } from "@/components/astraign/TranslateTab";

export type Screen =
  | "landing"
  | "onboarding-1"
  | "onboarding-2"
  | "home"
  | "live"
  | "sign-to-voice"
  | "voice-to-sign"
  | "conversation"
  | "translation-hub"
  | "accessibility"
  | "info";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [initialTranslateMode, setInitialTranslateMode] = useState<TranslateMode | null>(null);

  const goToTab = (tab: TabId, translateMode?: TranslateMode) => {
    setScreen("home");
    setActiveTab(tab);
    if (translateMode) setInitialTranslateMode(translateMode);
  };

  return (
    <GlobalAccessibilityProvider>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative w-full max-w-[430px] min-h-screen mx-auto overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="fixed inset-0 max-w-[430px] mx-auto pointer-events-none overflow-hidden z-0 opacity-30">
            <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-primary/3 blur-3xl" />
          </div>

          {/* Landing Screen */}
          {screen === "landing" && (
            <MinimalLandingScreen onStart={() => setScreen("onboarding-1")} />
          )}

          {/* Onboarding */}
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



          {/* Main App (tabs: Home, Translate, Quick, History, Settings) */}
          {screen === "home" && (
            <MainLayout
              onStartLive={() => goToTab("translate")}
              onVoiceToSign={() => goToTab("translate")}
              onCameraMode={() => goToTab("translate", "asl-to-audio")}
              onConversation={() => setScreen("conversation")}
              onSettings={() => goToTab("settings")}
              onTranslationHub={() => setScreen("translation-hub")}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              initialTranslateMode={initialTranslateMode}
              onClearTranslateInitialMode={() => setInitialTranslateMode(null)}
              onInfo={() => setScreen("info")}
            />
          )}

          {/* Live (Start Signing) → same as Translate tab */}
          {screen === "live" && (
            <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
              <MVPVoiceToSign onBack={() => setScreen("home")} />
            </ScreenWithNav>
          )}


          {/* Conversation Mode */}
          {screen === "conversation" && (
            <ScreenWithNav activeTab={activeTab} onNavChange={goToTab}>
              <ConversationMode onBack={() => setScreen("home")} />
            </ScreenWithNav>
          )}

          {/* Translation Hub */}
          {screen === "translation-hub" && (
            <MainNavigationHub
              onBack={() => setScreen("home")}
              onHome={() => setScreen("home")}
              onGoToTranslate={(mode) => {
                setScreen("home");
                setActiveTab("translate");
                if (mode) setInitialTranslateMode(mode);
              }}
            />
          )}

          {/* Accessibility Settings */}
          {screen === "accessibility" && (
            <AccessibilitySettings onBack={() => setScreen("home")} />
          )}

          {/* Info Screen (How it works) */}
          {screen === "info" && (
            <OnboardingOne onNext={() => setScreen("home")} onSkip={() => setScreen("home")} />
          )}
        </div>
      </div>
    </GlobalAccessibilityProvider >
  );
};

export default Index;
