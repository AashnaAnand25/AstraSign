import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  Monitor, 
  Type, 
  Zap, 
  Volume2, 
  Hand, 
  MousePointer, 
  Book, 
  Brain, 
  Wifi, 
  Settings,
  Moon,
  Sun,
  Palette,
  ChevronRight
} from 'lucide-react';

interface AccessibilitySettingsProps {
  onBack?: () => void;
}

export default function AccessibilitySettings({ onBack }: AccessibilitySettingsProps) {
  const [settings, setSettings] = useState({
    // Display Settings
    focusMode: false,
    textSize: 2,
    contentScaling: 100,
    highContrast: false,
    reduceMotion: false,
    stopMotion: false,
    invertColors: false,
    grayscale: false,
    
    // Reading Settings
    dyslexiaFont: false,
    increasedLineSpacing: false,
    highlightLinks: false,
    letterSpacing: 'default',
    
    // Interaction Settings
    largerButtons: false,
    hapticFeedback: false,
    voiceGuidance: false,
    bigCursor: false,
    readingMask: false,
    
    // Translation Settings
    playbackSpeed: 3,
    stepMode: false,
    confidenceDisplay: false,
    
    // AI & Memory Settings
    aiReordering: false,
    memorySync: false,
    speechProvider: 'wispr',
    
    // Hardware Settings
    metaGlassesConnected: false
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply global styles immediately
    applyGlobalStyles(key, value);
  };

  const applyGlobalStyles = (key: string, value: any) => {
    const root = document.documentElement;
    
    switch (key) {
      case 'textSize':
        root.style.setProperty('--accessibility-text-size', `${0.8 + (Number(value) * 0.1)}rem`);
        break;
      case 'contentScaling':
        root.style.setProperty('--accessibility-scaling', Number(value) / 100);
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
    }
  };

  const SettingCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Card className="glass" style={{ border: "1px solid hsl(240 10% 14%)" }}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center text-neon-purple">
            {icon}
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  );

  const ToggleSetting = ({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (value: boolean) => void }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-neon-purple' : 'bg-gray-600'
        }`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
          value ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );

  const SliderSetting = ({ label, value, min, max, onChange, unit = '' }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; unit?: string }) => (
    <div className="py-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <span className="text-sm text-neon-cyan">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen mx-auto overflow-hidden">
        {/* Ambient glow */}
        <div className="fixed inset-0 max-w-[430px] mx-auto pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-48 h-48 rounded-full bg-neon-purple/[0.06] blur-[90px]" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-neon-cyan/[0.04] blur-[90px]" />
        </div>

        {/* Header */}
        <div className="glass rounded-2xl p-4 m-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                  ← Back
                </Button>
              )}
              <h1 className="text-lg font-semibold text-foreground">Accessibility</h1>
            </div>
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center text-neon-cyan">
              <Settings className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold gradient-text-purple-cyan">Personalize your experience</h2>
          </div>

          {/* Focus Mode */}
          <SettingCard title="Focus Mode" icon={<Moon className="w-4 h-4" />}>
            <ToggleSetting
              label="Focus Mode"
              description="Dims UI, enlarges translation output"
              value={settings.focusMode}
              onChange={(value) => updateSetting('focusMode', value)}
            />
          </SettingCard>

          {/* Display Settings */}
          <SettingCard title="Display" icon={<Monitor className="w-4 h-4" />}>
            <div className="space-y-3">
              <SliderSetting
                label="Text Size"
                value={settings.textSize}
                min={1}
                max={5}
                onChange={(value) => updateSetting('textSize', value)}
              />
              
              <div className="py-2">
                <p className="text-sm font-medium text-foreground mb-2">Content Scaling</p>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 110, 125, 150].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => updateSetting('contentScaling', scale)}
                      className={`py-2 px-3 rounded-lg text-xs transition-colors ${
                        settings.contentScaling === scale
                          ? 'bg-neon-purple text-white'
                          : 'bg-gray-700/50 text-muted-foreground'
                      }`}
                    >
                      {scale}%
                    </button>
                  ))}
                </div>
              </div>

              <ToggleSetting
                label="High Contrast"
                description="Boost visual contrast for clarity"
                value={settings.highContrast}
                onChange={(value) => updateSetting('highContrast', value)}
              />

              <ToggleSetting
                label="Reduce Motion"
                description="Minimize animations and transitions"
                value={settings.reduceMotion}
                onChange={(value) => updateSetting('reduceMotion', value)}
              />

              <ToggleSetting
                label="Stop Motion"
                description="Disable all UI animations"
                value={settings.stopMotion}
                onChange={(value) => updateSetting('stopMotion', value)}
              />

              <ToggleSetting
                label="Invert Colors"
                description="Invert colors for better visibility"
                value={settings.invertColors}
                onChange={(value) => updateSetting('invertColors', value)}
              />

              <ToggleSetting
                label="Grayscale"
                description="Remove colors to reduce visual noise"
                value={settings.grayscale}
                onChange={(value) => updateSetting('grayscale', value)}
              />
            </div>
          </SettingCard>

          {/* Reading Settings */}
          <SettingCard title="Reading" icon={<Book className="w-4 h-4" />}>
            <div className="space-y-3">
              <ToggleSetting
                label="Dyslexia Font"
                description="OpenDyslexic optimised typeface"
                value={settings.dyslexiaFont}
                onChange={(value) => updateSetting('dyslexiaFont', value)}
              />

              <ToggleSetting
                label="Increased Line Spacing"
                description="More space between translated lines"
                value={settings.increasedLineSpacing}
                onChange={(value) => updateSetting('increasedLineSpacing', value)}
              />

              <ToggleSetting
                label="Highlight Links"
                description="Underline and emphasize links"
                value={settings.highlightLinks}
                onChange={(value) => updateSetting('highlightLinks', value)}
              />

              <div className="py-2">
                <p className="text-sm font-medium text-foreground mb-2">Letter Spacing</p>
                <div className="grid grid-cols-3 gap-2">
                  {['Default', 'Medium', 'Large'].map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => updateSetting('letterSpacing', spacing.toLowerCase())}
                      className={`py-2 px-3 rounded-lg text-xs transition-colors ${
                        settings.letterSpacing === spacing.toLowerCase()
                          ? 'bg-neon-cyan text-white'
                          : 'bg-gray-700/50 text-muted-foreground'
                      }`}
                    >
                      {spacing}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SettingCard>

          {/* Interaction Settings */}
          <SettingCard title="Interaction" icon={<Hand className="w-4 h-4" />}>
            <div className="space-y-3">
              <ToggleSetting
                label="Larger Buttons"
                description="Increase tap target size"
                value={settings.largerButtons}
                onChange={(value) => updateSetting('largerButtons', value)}
              />

              <ToggleSetting
                label="Haptic Feedback"
                description="Vibration on recognition events"
                value={settings.hapticFeedback}
                onChange={(value) => updateSetting('hapticFeedback', value)}
              />

              <ToggleSetting
                label="Voice Guidance"
                description="Audio cues for screen navigation"
                value={settings.voiceGuidance}
                onChange={(value) => updateSetting('voiceGuidance', value)}
              />

              <ToggleSetting
                label="Big Cursor"
                description="Make cursor easier to see"
                value={settings.bigCursor}
                onChange={(value) => updateSetting('bigCursor', value)}
              />

              <ToggleSetting
                label="Reading Mask"
                description="Dim everything except reading area"
                value={settings.readingMask}
                onChange={(value) => updateSetting('readingMask', value)}
              />
            </div>
          </SettingCard>

          {/* Translation Settings */}
          <SettingCard title="Translation" icon={<Type className="w-4 h-4" />}>
            <div className="space-y-3">
              <SliderSetting
                label="Playback Speed"
                value={settings.playbackSpeed}
                min={1}
                max={5}
                onChange={(value) => updateSetting('playbackSpeed', value)}
              />

              <ToggleSetting
                label="Step Mode"
                description="Pause between each sign gesture"
                value={settings.stepMode}
                onChange={(value) => updateSetting('stepMode', value)}
              />

              <ToggleSetting
                label="Confidence Display"
                description="Show AI accuracy percentage"
                value={settings.confidenceDisplay}
                onChange={(value) => updateSetting('confidenceDisplay', value)}
              />
            </div>
          </SettingCard>

          {/* AI & Memory Settings */}
          <SettingCard title="AI & Memory" icon={<Brain className="w-4 h-4" />}>
            <div className="space-y-3">
              <ToggleSetting
                label="AI Reordering"
                description="Reorder English into ASL-like structure (when available)"
                value={settings.aiReordering}
                onChange={(value) => updateSetting('aiReordering', value)}
              />

              <ToggleSetting
                label="Memory Sync"
                description="Learn your frequent vocabulary for faster sessions"
                value={settings.memorySync}
                onChange={(value) => updateSetting('memorySync', value)}
              />

              <div className="py-2">
                <p className="text-sm font-medium text-foreground mb-2">Speech Provider</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Wispr', 'Mock'].map((provider) => (
                    <button
                      key={provider}
                      onClick={() => updateSetting('speechProvider', provider.toLowerCase())}
                      className={`py-2 px-3 rounded-lg text-xs transition-colors ${
                        settings.speechProvider === provider.toLowerCase()
                          ? 'bg-neon-purple text-white'
                          : 'bg-gray-700/50 text-muted-foreground'
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SettingCard>

          {/* Hardware Settings */}
          <SettingCard title="Hardware" icon={<Wifi className="w-4 h-4" />}>
            <div className="space-y-3">
              <ToggleSetting
                label="Meta Glasses Connected"
                description="Mirror sign output to wearable display"
                value={settings.metaGlassesConnected}
                onChange={(value) => updateSetting('metaGlassesConnected', value)}
              />

              <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status: Not connected</span>
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                </div>
              </div>
            </div>
          </SettingCard>

          {/* App Status */}
          <div className="glass rounded-2xl p-4 text-center" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">AstraSign v2.4</p>
              <p className="text-xs text-muted-foreground">All systems operational</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">97% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
