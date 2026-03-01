import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeftRight, 
  Mic, 
  Camera, 
  Volume2, 
  User, 
  CheckCircle,
  Type,
  PersonStanding,
  Hand,
  Settings
} from 'lucide-react';
import AstraSignLogo from '@/components/AstraSignLogo';
import DefaultASLSigning from './DefaultASLSigning';
import Person2DHands from './Person2DHands';
import ChooseAvatar from './ChooseAvatar';
import ReadyComponent from './ReadyComponent';
import MinimalAudioToASL from './MinimalAudioToASL';
import MinimalASLToAudio from './MinimalASLToAudio';
import MinimalAvatar from './MinimalAvatar';

type NavigationScreen = 'home' | 'audio-to-asl' | 'asl-to-audio' | 'avatar' | 'ready' | 'default-signing' | 'person-2d' | 'choose-avatar';

interface MainNavigationHubProps {
  onBack?: () => void;
  onHome?: () => void;
}

export default function MainNavigationHub({ onBack, onHome }: MainNavigationHubProps) {
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('home');

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
      id: 'ready',
      title: 'Ready',
      description: 'System status and checks',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'emerald',
      screen: 'ready' as NavigationScreen
    },
    {
      id: 'avatar',
      title: 'Avatar',
      description: '3D character animations',
      icon: <User className="w-6 h-6" />,
      color: 'pink',
      screen: 'avatar' as NavigationScreen
    },
    {
      id: 'default-signing',
      title: 'Default (ASL Signing)',
      description: 'Text and voice to ASL',
      icon: <Type className="w-6 h-6" />,
      color: 'indigo',
      screen: 'default-signing' as NavigationScreen
    },
    {
      id: 'text',
      title: 'Text',
      description: 'Type text for translation',
      icon: <Type className="w-6 h-6" />,
      color: 'gray',
      screen: 'default-signing' as NavigationScreen
    },
    {
      id: 'voice',
      title: 'Voice',
      description: 'Speak for translation',
      icon: <Volume2 className="w-6 h-6" />,
      color: 'orange',
      screen: 'default-signing' as NavigationScreen
    },
    {
      id: 'person',
      title: 'Person',
      description: '2D hand animations',
      icon: <PersonStanding className="w-6 h-6" />,
      color: 'teal',
      screen: 'person-2d' as NavigationScreen
    },
    {
      id: '2d-pipeline',
      title: '2D · Our pipeline',
      description: 'Text → ASL → hands',
      icon: <Hand className="w-6 h-6" />,
      color: 'cyan',
      screen: 'person-2d' as NavigationScreen
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
      case 'audio-to-asl':
        return <MinimalAudioToASL onBack={() => setCurrentScreen('home')} />;
      case 'asl-to-audio':
        return <MinimalASLToAudio onBack={() => setCurrentScreen('home')} />;
      case 'avatar':
        return <MinimalAvatar />;
      case 'ready':
        return <ReadyComponent onBack={() => setCurrentScreen('home')} />;
      case 'default-signing':
        return <DefaultASLSigning onBack={() => setCurrentScreen('home')} onAvatar={() => setCurrentScreen('choose-avatar')} />;
      case 'person-2d':
        return <Person2DHands onBack={() => setCurrentScreen('home')} />;
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
                <button 
                  onClick={onBack}
                  className="w-8 h-8 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors text-sm"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              )}
              <AstraSignLogo size="sm" />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={onHome}
                className="w-8 h-8 rounded-xl glass neon-border-cyan flex items-center justify-center text-muted-foreground hover:text-neon-cyan transition-colors text-sm"
              >
                Home
              </button>
              <button className="w-8 h-8 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors text-sm">
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
                  className="glass rounded-2xl p-4 cursor-pointer transition-all active:scale-95 hover:scale-105"
                  style={{ border: "1px solid hsl(240 10% 14%)" }}
                  onClick={() => setCurrentScreen(item.screen)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      item.color === 'purple' ? 'bg-neon-purple/20 text-neon-purple' :
                      item.color === 'blue' ? 'bg-neon-cyan/20 text-neon-cyan' :
                      item.color === 'green' ? 'bg-green-500/20 text-green-400' :
                      item.color === 'pink' ? 'bg-pink-500/20 text-pink-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
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
        <div className="absolute bottom-0 left-0 right-0 glass rounded-t-3xl" style={{ border: "1px solid hsl(240 10% 14%)" }}>
          <div className="p-4">
            <div className="flex justify-around">
              <button 
                onClick={onHome}
                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-neon-purple rounded-full" />
                </div>
                <span className="text-xs">Home</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-6 h-6 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-neon-cyan rounded-full" />
                </div>
                <span className="text-xs">Translate</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-6 h-6 rounded-lg bg-gray-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                </div>
                <span className="text-xs">Quick</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-6 h-6 rounded-lg bg-gray-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                </div>
                <span className="text-xs">History</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-6 h-6 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-neon-purple rounded-full" />
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
