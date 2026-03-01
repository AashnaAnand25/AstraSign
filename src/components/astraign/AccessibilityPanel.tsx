import React, { useState } from "react";
import { X, Monitor, BookOpen, Hand, Zap, ChevronDown, Brain, Glasses } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  focusMode: boolean;
  onFocusModeChange: (v: boolean) => void;
}

const Toggle = ({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between py-2.5">
    <div className="flex-1 min-w-0 pr-4">
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
    </div>
    <button
      onClick={onToggle}
      className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
      style={{
        background: enabled ? "hsl(var(--neon-purple))" : "hsl(240 10% 20%)",
        boxShadow: enabled ? "0 0 10px hsl(272 76% 53% / 0.45)" : "none",
      }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: enabled ? "22px" : "2px" }}
      />
    </button>
  </div>
);

const SelectControl = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) => (
  <div className="space-y-2 py-2.5">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span
        className="text-xs font-semibold text-neon-cyan px-2 py-0.5 rounded-full"
        style={{ background: "hsl(183 100% 50% / 0.1)" }}
      >
        {options.find((o) => o.value === value)?.label ?? value}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{
            background: value === o.value ? "hsl(183 100% 50% / 0.12)" : "hsl(240 15% 9%)",
            border: value === o.value ? "1px solid hsl(183 100% 50% / 0.35)" : "1px solid hsl(240 10% 14%)",
            color: value === o.value ? "hsl(var(--neon-cyan))" : "hsl(240 5% 65%)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

const SliderControl = ({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-2 py-2.5">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs font-semibold text-neon-cyan px-2 py-0.5 rounded-full"
        style={{ background: "hsl(183 100% 50% / 0.1)" }}>
        {value}/{max}
      </span>
    </div>
    <div className="relative h-1.5 rounded-full" style={{ background: "hsl(240 10% 15%)" }}>
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          width: `${((value - min) / (max - min)) * 100}%`,
          background: "linear-gradient(90deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)))",
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
  </div>
);

const Section = ({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(240 15% 9%)", border: "1px solid hsl(240 10% 14%)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, color }}>
            {icon}
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <ChevronDown
          size={14}
          className="text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && <div className="px-4 pb-3 divide-y divide-border/20">{children}</div>}
    </div>
  );
};

export default function AccessibilityPanel({ isOpen, onClose, focusMode, onFocusModeChange }: Props) {
  const { settings, updateSettings } = useAccessibility();

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "hsl(240 20% 4% / 0.75)",
          backdropFilter: "blur(6px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
      />

      <div
        className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-50 transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? "translateY(0)" : "translateY(100%)" }}
      >
        <div
          className="rounded-t-[2rem] overflow-hidden"
          style={{
            background: "hsl(240 18% 6%)",
            border: "1px solid hsl(240 10% 14%)",
            borderBottom: "none",
            boxShadow: "0 -20px 60px hsl(272 76% 53% / 0.1)",
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
            <div>
              <h3 className="font-display text-base font-bold gradient-text-purple-cyan">Accessibility</h3>
              <p className="text-xs text-muted-foreground">Personalize your experience</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Focus Mode — hero row */}
          <div className="px-5 pt-4 pb-2">
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3 transition-all"
              style={{
                background: focusMode ? "hsl(272 76% 53% / 0.12)" : "hsl(240 15% 9%)",
                border: `1px solid ${focusMode ? "hsl(272 76% 53% / 0.4)" : "hsl(240 10% 14%)"}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(272 76% 53% / 0.15)", color: "hsl(var(--neon-purple))" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Focus Mode</div>
                  <div className="text-xs text-muted-foreground">Dims UI, enlarges translation output</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onFocusModeChange(!focusMode);
                  updateSettings({ focusMode: !focusMode });
                }}
                className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                style={{
                  background: focusMode ? "hsl(var(--neon-purple))" : "hsl(240 10% 20%)",
                  boxShadow: focusMode ? "0 0 10px hsl(272 76% 53% / 0.45)" : "none",
                }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: focusMode ? "22px" : "2px" }}
                />
              </button>
            </div>
          </div>

          <div className="px-5 py-3 space-y-3 max-h-[60vh] overflow-y-auto">
            {/* Display */}
            <Section icon={<Monitor size={14} />} title="Display" color="hsl(var(--neon-purple))">
              <SliderControl
                label="Text Size"
                value={settings.textSize}
                min={1}
                max={4}
                onChange={(v) => updateSettings({ textSize: v as any })}
              />

              <div className="space-y-2 py-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Content Scaling</span>
                  <span
                    className="text-xs font-semibold text-neon-cyan px-2 py-0.5 rounded-full"
                    style={{ background: "hsl(183 100% 50% / 0.1)" }}
                  >
                    {Math.round(settings.contentScale * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 1.1, 1.25, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateSettings({ contentScale: s as any })}
                      className="py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{
                        background:
                          settings.contentScale === s ? "hsl(272 76% 53% / 0.16)" : "hsl(240 15% 9%)",
                        border:
                          settings.contentScale === s
                            ? "1px solid hsl(272 76% 53% / 0.4)"
                            : "1px solid hsl(240 10% 14%)",
                        color: settings.contentScale === s ? "hsl(var(--neon-purple))" : "hsl(240 5% 65%)",
                      }}
                    >
                      {Math.round(s * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              <Toggle
                label="High Contrast"
                description="Boost visual contrast for clarity"
                enabled={settings.highContrast}
                onToggle={() => updateSettings({ highContrast: !settings.highContrast })}
              />
              <Toggle
                label="Reduce Motion"
                description="Minimize animations and transitions"
                enabled={settings.reduceMotion}
                onToggle={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
              />
              <Toggle
                label="Stop Motion"
                description="Disable all UI animations"
                enabled={settings.stopMotion}
                onToggle={() => updateSettings({ stopMotion: !settings.stopMotion })}
              />
              <Toggle
                label="Invert Colors"
                description="Invert colors for better visibility"
                enabled={settings.invertColors}
                onToggle={() => updateSettings({ invertColors: !settings.invertColors })}
              />
              <Toggle
                label="Grayscale"
                description="Remove colors to reduce visual noise"
                enabled={settings.grayscale}
                onToggle={() => updateSettings({ grayscale: !settings.grayscale })}
              />
            </Section>

            {/* Reading */}
            <Section icon={<BookOpen size={14} />} title="Reading" color="hsl(var(--neon-cyan))">
              <Toggle
                label="Dyslexia Font"
                description="OpenDyslexic optimised typeface"
                enabled={settings.dyslexiaFont}
                onToggle={() => updateSettings({ dyslexiaFont: !settings.dyslexiaFont })}
              />
              <Toggle
                label="Increased Line Spacing"
                description="More space between translated lines"
                enabled={settings.increasedLineSpacing}
                onToggle={() => updateSettings({ increasedLineSpacing: !settings.increasedLineSpacing })}
              />
              <Toggle
                label="Highlight Links"
                description="Underline and emphasize links"
                enabled={settings.highlightLinks}
                onToggle={() => updateSettings({ highlightLinks: !settings.highlightLinks })}
              />

              <div className="space-y-2 py-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Letter Spacing</span>
                  <span
                    className="text-xs font-semibold text-neon-cyan px-2 py-0.5 rounded-full"
                    style={{ background: "hsl(183 100% 50% / 0.1)" }}
                  >
                    {settings.letterSpacing === 0 ? "Default" : settings.letterSpacing === 0.02 ? "Medium" : "Large"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 0.02, 0.05].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateSettings({ letterSpacing: s as any })}
                      className="py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{
                        background:
                          settings.letterSpacing === s ? "hsl(183 100% 50% / 0.12)" : "hsl(240 15% 9%)",
                        border:
                          settings.letterSpacing === s
                            ? "1px solid hsl(183 100% 50% / 0.35)"
                            : "1px solid hsl(240 10% 14%)",
                        color: settings.letterSpacing === s ? "hsl(var(--neon-cyan))" : "hsl(240 5% 65%)",
                      }}
                    >
                      {s === 0 ? "Default" : s === 0.02 ? "Medium" : "Large"}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* Interaction */}
            <Section icon={<Hand size={14} />} title="Interaction" color="hsl(var(--neon-pink))">
              <Toggle
                label="Larger Buttons"
                description="Increase tap target size"
                enabled={settings.largerButtons}
                onToggle={() => updateSettings({ largerButtons: !settings.largerButtons })}
              />
              <Toggle
                label="Haptic Feedback"
                description="Vibration on recognition events"
                enabled={settings.hapticFeedback}
                onToggle={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
              />
              <Toggle
                label="Voice Guidance"
                description="Audio cues for screen navigation"
                enabled={settings.voiceGuidance}
                onToggle={() => updateSettings({ voiceGuidance: !settings.voiceGuidance })}
              />
              <Toggle
                label="Big Cursor"
                description="Make cursor easier to see"
                enabled={settings.bigCursor}
                onToggle={() => updateSettings({ bigCursor: !settings.bigCursor })}
              />
              <Toggle
                label="Reading Mask"
                description="Dim everything except reading area"
                enabled={settings.readingMask}
                onToggle={() => updateSettings({ readingMask: !settings.readingMask })}
              />
            </Section>

            {/* Translation */}
            <Section icon={<Zap size={14} />} title="Translation" color="hsl(272 76% 53%)">
              <SliderControl
                label="Playback Speed"
                value={settings.playbackSpeed}
                min={1}
                max={5}
                onChange={(v) => updateSettings({ playbackSpeed: v as any })}
              />
              <Toggle
                label="Step Mode"
                description="Pause between each sign gesture"
                enabled={settings.stepMode}
                onToggle={() => updateSettings({ stepMode: !settings.stepMode })}
              />
              <Toggle
                label="Confidence Display"
                description="Show AI accuracy percentage"
                enabled={settings.confidenceDisplay}
                onToggle={() => updateSettings({ confidenceDisplay: !settings.confidenceDisplay })}
              />
            </Section>

            {/* AI & Memory */}
            <Section icon={<Brain size={14} />} title="AI & Memory" color="hsl(183 100% 50%)">
              <Toggle
                label="AI Reordering"
                description="Reorder English into ASL-like structure (when available)"
                enabled={settings.enableAIReorder}
                onToggle={() => updateSettings({ enableAIReorder: !settings.enableAIReorder })}
              />
              <Toggle
                label="Memory Sync"
                description="Learn your frequent vocabulary for faster sessions"
                enabled={settings.memorySync}
                onToggle={() => updateSettings({ memorySync: !settings.memorySync })}
              />
              <SelectControl
                label="Speech Provider"
                value={settings.preferredSpeechProvider}
                options={[
                  { value: "wispr", label: "Wispr" },
                  { value: "mock", label: "Mock" },
                ]}
                onChange={(v) => updateSettings({ preferredSpeechProvider: v as any })}
              />
            </Section>

            {/* Hardware */}
            <Section icon={<Glasses size={14} />} title="Hardware" color="hsl(316 80% 60%)">
              <Toggle
                label="Meta Glasses Connected"
                description="Mirror sign output to wearable display"
                enabled={settings.glassesConnected}
                onToggle={() => updateSettings({ glassesConnected: !settings.glassesConnected })}
              />
              <div className="py-2.5">
                <div className="text-xs text-muted-foreground">
                  Status: {settings.glassesConnected ? "Connected" : "Not connected"}
                </div>
              </div>
            </Section>

            {/* AI status */}
            <div
              className="flex items-center gap-3 rounded-2xl p-3"
              style={{ background: "hsl(240 15% 9%)", border: "1px solid hsl(240 10% 14%)" }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">AstraSign v2.4</div>
                <div className="text-xs text-muted-foreground">All systems operational</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-neon-cyan">97%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>

            <div className="h-2" />
          </div>
        </div>
      </div>
    </>
  );
}
