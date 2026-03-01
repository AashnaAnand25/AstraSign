import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeftRight,
  Mic,
  Camera,
  User,
  Settings
} from 'lucide-react';
import AstraSignLogo from '@/components/AstraSignLogo';
import ChooseAvatar from './ChooseAvatar';
import AccessibilitySettings from './AccessibilitySettings';
import { useAccessibility } from './GlobalAccessibilityProvider';

type NavigationScreen = 'home' | 'audio-to-asl' | 'asl-to-audio' | 'choose-avatar';

export type TranslateModeForHub = 'audio-to-asl' | 'asl-to-audio';

interface MainNavigationHubProps {
  onBack?: () => void;
  onHome?: () => void;
  /** When set, Audio → ASL / ASL → Audio / Flip Screen use the main app Translate tab (same as Home). */
  onGoToTranslate?: (mode?: TranslateModeForHub) => void;
}

export default function MainNavigationHub({ onBack, onHome, onGoToTranslate }: MainNavigationHubProps) {
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('home');
  const { settings } = useAccessibility();

  const handleNavClick = (item: { id: string; screen: NavigationScreen }) => {
    if (item.id === 'flip-screen' && onGoToTranslate) {
      onGoToTranslate(); // Open Translate tab; user can use Flip button there
      return;
    }
    if (item.id === 'audio-to-asl' && onGoToTranslate) {
      onGoToTranslate('audio-to-asl');
      return;
    }
    if (item.id === 'asl-to-audio' && onGoToTranslate) {
      onGoToTranslate('asl-to-audio');
      return;
    }
    setCurrentScreen(item.screen);
  };

  const navigationItems = [
    {
      id: 'flip-screen',
      title: 'Flip Screen',
      description: 'Switch between front and back views',
      icon: <ArrowLeftRight className="w-6 h-6" />,
      color: 'purple',
      screen: 'home' as NavigationScreen
    },
    {
      id: 'audio-to-asl',
      title: 'Audio → ASL',
      description: 'Speak and see ASL translation',
      icon: <Mic className="w-6 h-6" />,
      color: 'blue',
      screen: 'audio-to-asl' as NavigationScreen
    },
    {
      id: 'asl-to-audio',
      title: 'ASL → Audio',
      description: 'Show signs and hear translation',
      icon: <Camera className="w-6 h-6" />,
      color: 'green',
      screen: 'asl-to-audio' as NavigationScreen
    },
    {
      id: 'choose-avatar',
      title: 'Choose Avatar',
      description: 'Select your 3D character',
      icon: <User className="w-6 h-6" />,
      color: 'purple',
      screen: 'choose-avatar' as NavigationScreen
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; border: string; text: string } } = {
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
      gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' }
    };
    return colors[color] || colors.gray;
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'choose-avatar':
        return <ChooseAvatar onBack={() => setCurrentScreen('home')} />;
      default:
        return null;
    }
  };

  if (currentScreen !== 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {renderCurrentScreen()}
      </div>
    );
  }

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
                <button
                  onClick={onBack}
                  className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200 text-sm"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              )}
              <AstraSignLogo size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onHome}
                className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200 text-sm"
              >
                Home
              </button>
              <button className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200 text-sm">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 pb-20">
          <div className="grid grid-cols-2 gap-3">
            {navigationItems.map((item) => {
              const colors = getColorClasses(item.color);
              
              return (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-95 hover:shadow-md hover:border-primary/50"
                  onClick={() => handleNavClick(item)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-lg bg-accent-subtle flex items-center justify-center text-primary">
                      {item.icon}
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground text-xs">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-lg">
          <div className="p-4">
            <div className="flex justify-around">
              <button
                onClick={onHome}
                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <div className="w-6 h-6 rounded-lg bg-accent-subtle flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </div>
                <span className="text-xs">Home</span>
              </button>
              <button
                onClick={() => onGoToTranslate?.()}
                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <div className="w-6 h-6 rounded-lg bg-accent-subtle flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </div>
                <span className="text-xs">Translate</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200">
                <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full" />
                </div>
                <span className="text-xs">Quick</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200">
                <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full" />
                </div>
                <span className="text-xs">History</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200">
                <div className="w-6 h-6 rounded-lg bg-accent-subtle flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </div>
                <span className="text-xs">A11y</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
