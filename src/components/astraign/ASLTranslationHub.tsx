import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Camera, 
  Volume2, 
  User, 
  ArrowLeftRight, 
  Settings, 
  Home,
  History,
  Accessibility
} from 'lucide-react';
import AstraSignLogo from '@/components/AstraSignLogo';
import PremiumAudioToASL from './PremiumAudioToASL';
import PremiumASLToAudio from './PremiumASLToAudio';
import PremiumAvatar from './PremiumAvatar';
import { aslSignsDatabase } from '@/data/ASLSignsDatabase';

interface ASLTranslationHubProps {
  onBack?: () => void;
  onSettings?: () => void;
  onHome?: () => void;
}

type TranslationMode = 'audio-to-asl' | 'asl-to-audio' | 'avatar' | 'settings';

export default function ASLTranslationHub({ 
  onBack, 
  onSettings, 
  onHome 
}: ASLTranslationHubProps) {
  const [activeMode, setActiveMode] = useState<TranslationMode>('audio-to-asl');
  const [recentTranslations, setRecentTranslations] = useState<string[]>([]);
  const [selectedSigns, setSelectedSigns] = useState<string[]>([]);

  const handleTranslationComplete = (translation: string) => {
    setRecentTranslations(prev => [translation, ...prev.slice(0, 9)]);
  };

  const handleSignSelect = (signs: string[]) => {
    setSelectedSigns(signs);
  };

  const getModeIcon = (mode: TranslationMode) => {
    switch (mode) {
      case 'audio-to-asl':
        return <Mic className="w-4 h-4" />;
      case 'asl-to-audio':
        return <Camera className="w-4 h-4" />;
      case 'avatar':
        return <User className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getModeTitle = (mode: TranslationMode) => {
    switch (mode) {
      case 'audio-to-asl':
        return 'Audio → ASL';
      case 'asl-to-audio':
        return 'ASL → Audio';
      case 'avatar':
        return 'Avatar System';
      case 'settings':
        return 'Settings';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-600">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Flip Screen
                </Button>
              )}
              <AstraSignLogo size="sm" />
            </div>
            
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" onClick={onHome} className="text-gray-600">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" size="sm" onClick={onSettings} className="text-gray-600">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Accessibility className="w-4 h-4 mr-2" />
                Accessibility
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as TranslationMode)}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-2xl p-1">
            <TabsTrigger 
              value="audio-to-asl" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-2 px-4 py-2">
                <Mic className="w-4 h-4" />
                <span className="font-medium">Audio → ASL</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="asl-to-audio"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-2 px-4 py-2">
                <Camera className="w-4 h-4" />
                <span className="font-medium">ASL → Audio</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="avatar"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-2 px-4 py-2">
                <User className="w-4 h-4" />
                <span className="font-medium">Avatar</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-2 px-4 py-2">
                <Settings className="w-4 h-4" />
                <span className="font-medium">Settings</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audio-to-asl" className="mt-6">
            <PremiumAudioToASL
              onBack={onBack}
              onSettings={onSettings}
            />
          </TabsContent>

          <TabsContent value="asl-to-audio" className="mt-6">
            <PremiumASLToAudio
              onBack={onBack}
              onSettings={onSettings}
            />
          </TabsContent>

          <TabsContent value="avatar" className="mt-6">
            <PremiumAvatar
              signs={selectedSigns}
              onSignComplete={(signId) => {
                console.log(`Completed sign: ${signId}`);
              }}
              autoPlay={false}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-3xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Database Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Signs</span>
                    <span className="font-medium text-gray-900">
                      {aslSignsDatabase.getAllSigns().length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">By Category:</span>
                    {['alphabet', 'common', 'emergency', 'family', 'daily'].map(category => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{category}</span>
                        <span className="text-gray-900">
                          {aslSignsDatabase.getSignsByCategory(category as any).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-3xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Translations
                </h3>
                {recentTranslations.length > 0 ? (
                  <div className="space-y-2">
                    {recentTranslations.map((translation, index) => (
                      <div key={index} className="p-3 bg-white rounded-xl text-sm text-gray-700">
                        {translation}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent translations</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-3xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl"
                    onClick={() => {
                      const commonSigns = ['hello', 'thank', 'please', 'yes', 'no'];
                      setSelectedSigns(commonSigns);
                      setActiveMode('avatar');
                    }}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Play Common Signs
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl"
                    onClick={() => {
                      const alphabetSigns = aslSignsDatabase.getSignsByCategory('alphabet').slice(0, 5).map(s => s.id);
                      setSelectedSigns(alphabetSigns);
                      setActiveMode('avatar');
                    }}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Practice Alphabet
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl"
                    onClick={() => setActiveMode('audio-to-asl')}
                  >
                    <Mic className="w-4 h-4 mr-3" />
                    Quick Voice Input
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl"
                    onClick={() => setActiveMode('asl-to-audio')}
                  >
                    <Camera className="w-4 h-4 mr-3" />
                    Quick Sign Detection
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button for Quick Mode Switch */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => {
            // Cycle through modes
            const modes: TranslationMode[] = ['audio-to-asl', 'asl-to-audio', 'avatar'];
            const currentIndex = modes.indexOf(activeMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            setActiveMode(nextMode);
          }}
        >
          {getModeIcon(activeMode)}
        </Button>
      </div>
    </div>
  );
}
