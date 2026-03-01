import BottomNav, { type TabId } from "./BottomNav";

interface Props {
  children: React.ReactNode;
  activeTab: TabId;
  onNavChange: (tab: TabId) => void;
}

/** Wraps a full-screen view (e.g. VoiceToSign, SignToVoice) with bottom nav so user can jump to other sections */
export default function ScreenWithNav({ children, activeTab, onNavChange }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <BottomNav activeTab={activeTab} onTabChange={onNavChange} />
    </div>
  );
}
