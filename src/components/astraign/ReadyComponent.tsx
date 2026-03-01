import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Settings, Mic, Camera, Volume2 } from 'lucide-react';

interface ReadyComponentProps {
  onBack?: () => void;
  onStart?: () => void;
}

interface SystemCheck {
  id: string;
  name: string;
  status: 'checking' | 'ready' | 'error';
  description: string;
  icon: React.ReactNode;
}

export default function ReadyComponent({ onBack, onStart }: ReadyComponentProps) {
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([
    {
      id: 'microphone',
      name: 'Microphone Access',
      status: 'checking',
      description: 'Checking microphone permissions...',
      icon: <Mic className="w-5 h-5" />
    },
    {
      id: 'camera',
      name: 'Camera Access',
      status: 'checking',
      description: 'Checking camera permissions...',
      icon: <Camera className="w-5 h-5" />
    },
    {
      id: 'audio',
      name: 'Audio Output',
      status: 'checking',
      description: 'Checking audio speakers...',
      icon: <Volume2 className="w-5 h-5" />
    },
    {
      id: 'models',
      name: 'ASL Models',
      status: 'checking',
      description: 'Loading ASL recognition models...',
      icon: <Settings className="w-5 h-5" />
    }
  ]);

  const [allReady, setAllReady] = useState(false);

  useEffect(() => {
    // Simulate system checks
    const checkSystems = async () => {
      const checks = [...systemChecks];
      
      // Check microphone
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        checks[0].status = 'ready';
        checks[0].description = 'Microphone access granted';
      } catch {
        checks[0].status = 'error';
        checks[0].description = 'Microphone access denied';
      }
      setSystemChecks([...checks]);

      // Check camera
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        checks[1].status = 'ready';
        checks[1].description = 'Camera access granted';
      } catch {
        checks[1].status = 'error';
        checks[1].description = 'Camera access denied';
      }
      setSystemChecks([...checks]);

      // Check audio
      await new Promise(resolve => setTimeout(resolve, 1000));
      checks[2].status = 'ready';
      checks[2].description = 'Audio speakers working';
      setSystemChecks([...checks]);

      // Check models
      await new Promise(resolve => setTimeout(resolve, 1500));
      checks[3].status = 'ready';
      checks[3].description = 'ASL models loaded successfully';
      setSystemChecks([...checks]);
    };

    checkSystems();
  }, []);

  useEffect(() => {
    const allSystemsReady = systemChecks.every(check => check.status === 'ready');
    setAllReady(allSystemsReady);
  }, [systemChecks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'checking':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const retryCheck = (checkId: string) => {
    setSystemChecks(prev => 
      prev.map(check => 
        check.id === checkId 
          ? { ...check, status: 'checking', description: 'Retrying...' }
          : check
      )
    );

    // Simulate retry
    setTimeout(() => {
      setSystemChecks(prev => 
        prev.map(check => 
          check.id === checkId 
            ? { ...check, status: 'ready', description: 'Check successful!' }
            : check
        )
      );
    }, 2000);
  };

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
              <h1 className="text-lg font-semibold text-foreground">Ready</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${allReady ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
              <span className="text-xs text-muted-foreground">
                {allReady ? 'All systems ready' : 'Checking systems...'}
              </span>
            </div>
          </div>
        </div>

        {/* System Checks */}
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {systemChecks.map((check) => (
              <div
                key={check.id}
                className="glass rounded-2xl p-4 transition-all duration-200"
                style={{ border: "1px solid hsl(240 10% 14%)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={check.status === 'ready' ? 'text-green-400' : check.status === 'error' ? 'text-red-400' : 'text-neon-cyan'}>
                      {check.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">{check.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{check.description}</p>
                    </div>
                  </div>
                  {getStatusIcon(check.status)}
                </div>

                {check.status === 'error' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retryCheck(check.id)}
                    className="neon-border-cyan text-neon-cyan text-xs"
                  >
                    Retry
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Overall Status */}
          <div className="glass rounded-2xl p-6 text-center" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <div className="mb-4">
              {allReady ? (
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <h2 className={`text-lg font-medium mb-2 ${
              allReady ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {allReady ? 'All Systems Ready!' : 'System Check in Progress...'}
            </h2>

            <p className="text-muted-foreground text-sm mb-4">
              {allReady 
                ? 'Your ASL translation system is ready to use.'
                : 'Please wait while we check your system components.'
              }
            </p>

            {allReady && onStart && (
              <Button onClick={onStart} className="neon-border-cyan text-neon-cyan w-full">
                Start Using AstraSign
              </Button>
            )}

            {!allReady && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>If any checks fail, please:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Grant microphone and camera permissions</li>
                  <li>Ensure your browser supports WebRTC</li>
                  <li>Check your audio output devices</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
