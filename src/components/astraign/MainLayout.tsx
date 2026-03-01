import { useState } from "react";
import BottomNav, { type TabId } from "./BottomNav";
import HomeScreen from "./HomeScreen";
import TranslateTab from "./TranslateTab";
import QuickPhrasesTab from "./QuickPhrasesTab";
import HistoryTab from "./HistoryTab";
import SettingsTab from "./SettingsTab";
import type { TranslateMode } from "./TranslateTab";

interface Props {
  onStartLive: () => void;
  onVoiceToSign?: () => void;
  onCameraMode: () => void;
  onEnhancedCameraMode?: () => void;
  onConversation: () => void;
  onSettings: () => void;
  onTranslationHub?: () => void;
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
  initialTranslateMode?: TranslateMode | null;
  onClearTranslateInitialMode?: () => void;
  onInfo?: () => void;
}

export default function MainLayout({
  onStartLive,
  onVoiceToSign,
  onCameraMode,
  onEnhancedCameraMode,
  onConversation,
  onSettings,
  onTranslationHub,
  activeTab: controlledTab,
  onTabChange,
  initialTranslateMode,
  onClearTranslateInitialMode,
  onInfo,
}: Props) {
  const [internalTab, setInternalTab] = useState<TabId>("home");
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = onTabChange ?? setInternalTab;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen mx-auto flex flex-col h-screen overflow-visible">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 max-w-[430px] mx-auto pointer-events-none overflow-hidden z-0 opacity-30">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-primary/3 blur-3xl" />
        </div>

        <main className="flex-1 min-h-0 relative z-10 overflow-y-auto pt-16 pb-24">
          {activeTab === "home" && (
            <HomeScreen
              onStartLive={onStartLive}
              onVoiceToSign={onVoiceToSign ?? (() => { })}
              onCameraMode={onCameraMode}
              onEnhancedCameraMode={onEnhancedCameraMode}
              onConversation={onConversation}
              onSettings={onSettings}
              onTranslationHub={onTranslationHub}
              onInfo={onInfo}
            />
          )}
          {activeTab === "translate" && (
            <TranslateTab
              initialMode={initialTranslateMode ?? undefined}
              onInitialModeConsumed={onClearTranslateInitialMode}
            />
          )}
          {activeTab === "quick" && <QuickPhrasesTab />}
          {activeTab === "history" && <HistoryTab />}
          {activeTab === "settings" && <SettingsTab />}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
