import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Settings, Play } from 'lucide-react';

interface ChooseAvatarProps {
  onBack?: () => void;
  onAvatarSelect?: (avatar: string) => void;
}

interface AvatarOption {
  id: string;
  name: string;
  description: string;
  preview: string;
  features: string[];
}

export default function ChooseAvatar({ onBack, onAvatarSelect }: ChooseAvatarProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('minimal');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const avatars: AvatarOption[] = [
    {
      id: 'minimal',
      name: 'Minimal Avatar',
      description: 'Clean, simple 3D character',
      preview: '👤',
      features: ['Fast rendering', 'Low resource usage', 'Clean design']
    },
    {
      id: 'realistic',
      name: 'Realistic Avatar',
      description: 'Detailed human-like character',
      preview: '🧑',
      features: ['High detail', 'Realistic movements', 'Advanced animations']
    },
    {
      id: 'cartoon',
      name: 'Cartoon Avatar',
      description: 'Friendly animated character',
      preview: '🦸',
      features: ['Expressive', 'Fun animations', 'Kid-friendly']
    },
    {
      id: 'professional',
      name: 'Professional Avatar',
      description: 'Business-appropriate character',
      preview: '👔',
      features: ['Formal appearance', 'Professional gestures', 'Workplace suitable']
    }
  ];

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    if (onAvatarSelect) {
      onAvatarSelect(avatarId);
    }
  };

  const handlePreview = (avatarId: string) => {
    setIsPlaying(avatarId);
    setTimeout(() => setIsPlaying(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen mx-auto overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 max-w-[430px] mx-auto pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-primary/3 blur-3xl" />
        </div>

        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-4 m-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                  ← Back
                </Button>
              )}
              <h1 className="text-lg font-semibold text-foreground">Choose Avatar</h1>
            </div>
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-accent-subtle">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`bg-card border rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-95 hover:shadow-md ${
                  selectedAvatar === avatar.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleAvatarSelect(avatar.id)}
              >
                {/* Preview */}
                <div className="text-center mb-3">
                  <div className={`w-16 h-16 mx-auto rounded-xl bg-background/50 flex items-center justify-center text-2xl ${
                    isPlaying === avatar.id ? 'animate-pulse' : ''
                  }`}>
                    {avatar.preview}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground text-sm text-center">
                    {avatar.name}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center leading-tight">
                    {avatar.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  {avatar.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      {feature.length > 15 ? feature.substring(0, 15) + '...' : feature}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-primary text-primary hover:bg-accent-subtle text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(avatar.id);
                    }}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  {selectedAvatar === avatar.id && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-accent-subtle text-primary rounded-full text-xs">
                      <User className="w-3 h-3" />
                      Selected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Avatar Details */}
          {selectedAvatar && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground text-sm">
                  Selected: {avatars.find(a => a.id === selectedAvatar)?.name}
                </h3>
                <Button onClick={() => onAvatarSelect?.(selectedAvatar)} className="bg-primary text-primary-foreground hover:bg-primary-hover text-sm">
                  Use This Avatar
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Preview Area */}
                <div className="bg-background/50 rounded-xl p-6 text-center">
                  <div className="w-20 h-20 mx-auto rounded-xl bg-gray-700/50 flex items-center justify-center text-4xl">
                    {avatars.find(a => a.id === selectedAvatar)?.preview}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Avatar preview
                  </p>
                </div>

                {/* Settings */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground text-sm">Avatar Settings</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Animation Speed</span>
                      <select className="px-2 py-1 bg-background/50 border border-gray-700/50 rounded-md text-xs text-foreground">
                        <option>Normal</option>
                        <option>Slow</option>
                        <option>Fast</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Sign Size</span>
                      <select className="px-2 py-1 bg-background/50 border border-gray-700/50 rounded-md text-xs text-foreground">
                        <option>Medium</option>
                        <option>Small</option>
                        <option>Large</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Background</span>
                      <select className="px-2 py-1 bg-background/50 border border-gray-700/50 rounded-md text-xs text-foreground">
                        <option>Studio</option>
                        <option>Outdoor</option>
                        <option>Plain</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
