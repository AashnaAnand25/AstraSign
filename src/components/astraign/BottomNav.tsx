import { Home, MessageSquare, Zap, History, Accessibility } from "lucide-react";

export type TabId = "home" | "translate" | "quick" | "history" | "settings";

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Home size={20} /> },
  { id: "translate", label: "Translate", icon: <MessageSquare size={20} /> },
  { id: "quick", label: "Quick Phrases", icon: <Zap size={20} /> },
  { id: "history", label: "History", icon: <History size={20} /> },
  { id: "settings", label: "Accessibility", icon: <Accessibility size={20} /> },
];

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999] max-w-[430px] mx-auto border-t border-border/50"
      style={{
        background: "hsl(240 18% 6% / 0.95)",
        backdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {TABS.map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 py-2 transition-all active:scale-95"
            >
              <div
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                  isActive
                    ? "text-neon-cyan"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={
                  isActive
                    ? {
                        background: "hsl(183 100% 50% / 0.12)",
                        boxShadow: "0 0 12px hsl(183 100% 50% / 0.2)",
                      }
                    : {}
                }
              >
                {icon}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-neon-cyan" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
