import React, { useState } from 'react';
import { Mic, Camera, User, Home, ArrowLeftRight } from 'lucide-react';
import AstraSignLogo from '@/components/AstraSignLogo';
import MinimalAudioToASL from './MinimalAudioToASL';
import MinimalASLToAudio from './MinimalASLToAudio';
import MinimalAvatar from './MinimalAvatar';

interface MinimalTranslationHubProps {
  onBack?: () => void;
  onHome?: () => void;
}

type TranslationMode = 'audio-to-asl' | 'asl-to-audio' | 'avatar';

export default function MinimalTranslationHub({ onBack, onHome }: MinimalTranslationHubProps) {
  const [activeMode, setActiveMode] = useState<TranslationMode>('audio-to-asl');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Simple Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="text-gray-500 hover:text-gray-900 text-sm flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Flip Screen
                </button>
              )}
              <AstraSignLogo size="sm" />
            </div>
            
            <button 
              onClick={onHome}
              className="text-gray-500 hover:text-gray-900 text-sm flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Simple Navigation */}
        <div className="flex gap-2 mb-12 p-1 bg-gray-50 rounded-lg">
          <button
            onClick={() => setActiveMode('audio-to-asl')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
              activeMode === 'audio-to-asl'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            Audio → ASL
          </button>
          <button
            onClick={() => setActiveMode('asl-to-audio')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
              activeMode === 'asl-to-audio'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            ASL → Audio
          </button>
          <button
            onClick={() => setActiveMode('avatar')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
              activeMode === 'avatar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            Avatar
          </button>
        </div>

        {/* Content */}
        {activeMode === 'audio-to-asl' && (
          <MinimalAudioToASL onBack={onBack} />
        )}
        
        {activeMode === 'asl-to-audio' && (
          <MinimalASLToAudio onBack={onBack} />
        )}
        
        {activeMode === 'avatar' && (
          <MinimalAvatar />
        )}
      </div>
    </div>
  );
}
