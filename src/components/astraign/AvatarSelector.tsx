import { useState } from "react";
import { User, Sparkles, Bot, UserCircle } from "lucide-react";

export type AvatarType = 'person' | 'astronaut' | 'wizard' | 'robot';

interface AvatarSelectorProps {
  selectedAvatar: AvatarType;
  onAvatarChange: (avatar: AvatarType) => void;
}

export default function AvatarSelector({ selectedAvatar, onAvatarChange }: AvatarSelectorProps) {
  const avatars: { type: AvatarType; name: string; icon: React.ReactNode; color: string }[] = [
    { type: 'person', name: 'Person', icon: <User size={24} />, color: '#f4c2a1' },
    { type: 'astronaut', name: 'Astronaut', icon: <UserCircle size={24} />, color: '#e0e7ff' },
    { type: 'wizard', name: 'Wizard', icon: <Sparkles size={24} />, color: '#9333ea' },
    { type: 'robot', name: 'Robot', icon: <Bot size={24} />, color: '#6b7280' },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs text-muted-foreground font-medium">Choose Avatar</div>
      <div className="flex gap-2">
        {avatars.map((avatar) => (
          <button
            key={avatar.type}
            onClick={() => onAvatarChange(avatar.type)}
            className={`p-3 rounded-lg transition-all ${
              selectedAvatar === avatar.type
                ? 'bg-neon-cyan/20 border-2 border-neon-cyan shadow-lg shadow-neon-cyan/30'
                : 'bg-background/50 border-2 border-border hover:border-neon-cyan/50'
            }`}
            title={avatar.name}
          >
            <div 
              className="transition-colors"
              style={{ color: selectedAvatar === avatar.type ? '#00ffff' : avatar.color }}
            >
              {avatar.icon}
            </div>
          </button>
        ))}
      </div>
      <div className="text-xs text-neon-cyan font-medium">
        {avatars.find(a => a.type === selectedAvatar)?.name}
      </div>
    </div>
  );
}
