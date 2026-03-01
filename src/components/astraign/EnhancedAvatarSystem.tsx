import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Settings, User } from 'lucide-react';
import { aslSignsDatabase } from '@/data/ASLSignsDatabase';

interface AvatarConfig {
  model: 'astronaut' | 'avatar' | 'spiderman';
  environment: 'studio' | 'city' | 'forest' | 'sunset';
  autoRotate: boolean;
  showControls: boolean;
  animationSpeed: number;
}

interface ASLAnimation {
  signId: string;
  duration: number;
  keyframes: THREE.KeyframeTrack[];
  loop?: boolean;
}

interface EnhancedAvatarSystemProps {
  signs?: string[];
  onSignComplete?: (signId: string) => void;
  onAllSignsComplete?: () => void;
  autoPlay?: boolean;
}

// Avatar model component
function AvatarModel({ 
  model, 
  animations, 
  currentSign, 
  isPlaying, 
  animationSpeed 
}: {
  model: string;
  animations: ASLAnimation[];
  currentSign: string | null;
  isPlaying: boolean;
  animationSpeed: number;
}) {
  const gltf = useGLTF(`/models/${model}.glb`);
  const { actions, names } = useAnimations(gltf.animations, gltf.scene);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (gltf.scene) {
      mixerRef.current = new THREE.AnimationMixer(gltf.scene);
    }
  }, [gltf.scene]);

  useEffect(() => {
    if (!currentSign || !isPlaying || !mixerRef.current) return;

    // Stop all current animations
    Object.values(actions).forEach(action => action?.stop());

    // Find animation for current sign
    const signAnimation = animations.find(anim => anim.signId === currentSign);
    
    if (signAnimation) {
      // Create custom animation for the sign
      const animationClip = new THREE.AnimationClip(
        `sign_${currentSign}`,
        signAnimation.duration,
        signAnimation.keyframes
      );
      
      const action = mixerRef.current.clipAction(animationClip);
      action.setLoop(signAnimation.loop ? THREE.LoopRepeat : THREE.LoopOnce, 1);
      action.timeScale = animationSpeed;
      action.play();
    } else {
      // Fallback to existing GLTF animation if available
      const fallbackAction = actions[currentSign] || actions[names[0]];
      if (fallbackAction) {
        fallbackAction.setLoop(THREE.LoopOnce, 1);
        fallbackAction.timeScale = animationSpeed;
        fallbackAction.play();
      }
    }
  }, [currentSign, isPlaying, animations, actions, names, animationSpeed]);

  useFrame((state, delta) => {
    if (mixerRef.current && isPlaying) {
      mixerRef.current.update(delta);
    }
  });

  return <primitive object={gltf.scene} scale={1} />;
}

// Predefined ASL animations
const ASL_ANIMATIONS: ASLAnimation[] = [
  {
    signId: 'hello',
    duration: 1.5,
    keyframes: [
      new THREE.NumberKeyframeTrack('.bones[RightHand].position', [0, 0.5, 1.0, 1.5], [0, 0.2, 0.1, 0]),
      new THREE.NumberKeyframeTrack('.bones[RightHand].rotation', [0, 0.5, 1.0, 1.5], [0, 0.5, -0.5, 0])
    ]
  },
  {
    signId: 'thank',
    duration: 2.0,
    keyframes: [
      new THREE.NumberKeyframeTrack('.bones[RightHand].position', [0, 0.5, 1.0, 1.5, 2.0], [0, 0.1, 0.3, 0.1, 0]),
      new THREE.NumberKeyframeTrack('.bones[RightForeArm].rotation', [0, 1.0, 2.0], [0, 0.8, 0])
    ]
  },
  {
    signId: 'please',
    duration: 2.5,
    keyframes: [
      new THREE.NumberKeyframeTrack('.bones[RightHand].position', [0, 0.6, 1.2, 1.8, 2.5], [0, 0.1, 0.2, 0.1, 0]),
      new THREE.NumberKeyframeTrack('.bones[RightHand].rotation', [0, 0.6, 1.2, 1.8, 2.5], [0, 0.3, 0.6, 0.3, 0])
    ]
  },
  {
    signId: 'yes',
    duration: 1.0,
    keyframes: [
      new THREE.NumberKeyframeTrack('.bones[Head].rotation', [0, 0.25, 0.5, 0.75, 1.0], [0, 0.3, 0, -0.3, 0])
    ]
  },
  {
    signId: 'no',
    duration: 1.2,
    keyframes: [
      new THREE.NumberKeyframeTrack('.bones[Head].rotation', [0, 0.3, 0.6, 0.9, 1.2], [0, 0, 0.5, 0, 0])
    ]
  }
];

export default function EnhancedAvatarSystem({ 
  signs = [], 
  onSignComplete, 
  onAllSignsComplete,
  autoPlay = false 
}: EnhancedAvatarSystemProps) {
  const [config, setConfig] = useState<AvatarConfig>({
    model: 'avatar',
    environment: 'studio',
    autoRotate: false,
    showControls: true,
    animationSpeed: 1.0
  });
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  const currentSign = signs[currentSignIndex] || null;
  const progress = signs.length > 0 ? ((currentSignIndex + 1) / signs.length) * 100 : 0;

  useEffect(() => {
    if (autoPlay && signs.length > 0) {
      setIsPlaying(true);
    }
  }, [autoPlay, signs.length]);

  useEffect(() => {
    if (isPlaying && currentSign) {
      const signAnimation = ASL_ANIMATIONS.find(anim => anim.signId === currentSign);
      const duration = signAnimation?.duration || 2.0;
      
      const timer = setTimeout(() => {
        if (onSignComplete) {
          onSignComplete(currentSign);
        }
        
        if (currentSignIndex < signs.length - 1) {
          setCurrentSignIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          if (onAllSignsComplete) {
            onAllSignsComplete();
          }
        }
      }, (duration * 1000) / config.animationSpeed);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentSign, currentSignIndex, signs.length, config.animationSpeed, onSignComplete, onAllSignsComplete]);

  const handlePlay = () => {
    if (currentSignIndex >= signs.length) {
      setCurrentSignIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentSignIndex(0);
    setIsPlaying(false);
  };

  const handleSignSelect = (signIndex: number) => {
    setCurrentSignIndex(signIndex);
    setIsPlaying(false);
  };

  const getSignDisplay = (signId: string) => {
    const sign = aslSignsDatabase.getSign(signId);
    return sign ? sign.word : signId.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ASL Avatar System</h1>
            <p className="text-gray-600 mt-1">Interactive 3D avatar for sign language</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Avatar Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Avatar Model</Label>
                  <Select
                    value={config.model}
                    onValueChange={(value: 'astronaut' | 'avatar' | 'spiderman') =>
                      setConfig(prev => ({ ...prev, model: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avatar">Avatar</SelectItem>
                      <SelectItem value="astronaut">Astronaut</SelectItem>
                      <SelectItem value="spiderman">Spiderman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select
                    value={config.environment}
                    onValueChange={(value: 'studio' | 'city' | 'forest' | 'sunset') =>
                      setConfig(prev => ({ ...prev, environment: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="forest">Forest</SelectItem>
                      <SelectItem value="sunset">Sunset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Animation Speed</Label>
                  <Select
                    value={config.animationSpeed.toString()}
                    onValueChange={(value) =>
                      setConfig(prev => ({ ...prev, animationSpeed: parseFloat(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                      <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                      <SelectItem value="1.5">1.5x (Fast)</SelectItem>
                      <SelectItem value="2.0">2.0x (Very Fast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-rotate"
                  checked={config.autoRotate}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({ ...prev, autoRotate: checked }))
                  }
                />
                <Label htmlFor="auto-rotate">Auto Rotate Camera</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-controls"
                  checked={config.showControls}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({ ...prev, showControls: checked }))
                  }
                />
                <Label htmlFor="show-controls">Show Camera Controls</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Avatar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    3D Avatar
                  </span>
                  {currentSign && (
                    <Badge variant="default">
                      {getSignDisplay(currentSign)}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Canvas
                    camera={{ position: [0, 1.6, 3], fov: 50 }}
                    onCreated={() => setIsModelLoading(false)}
                  >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    
                    <Suspense fallback={null}>
                      <AvatarModel
                        model={config.model}
                        animations={ASL_ANIMATIONS}
                        currentSign={currentSign}
                        isPlaying={isPlaying}
                        animationSpeed={config.animationSpeed}
                      />
                    </Suspense>
                    
                    {config.showControls && (
                      <OrbitControls
                        enablePan={false}
                        minDistance={2}
                        maxDistance={10}
                        autoRotate={config.autoRotate}
                        autoRotateSpeed={2}
                      />
                    )}
                    
                    <Environment preset={config.environment} />
                  </Canvas>
                  
                  {isModelLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-gray-600">Loading avatar...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Playback Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Playback Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handlePlay}
                    disabled={signs.length === 0 || isPlaying}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <Button
                    onClick={handlePause}
                    disabled={!isPlaying}
                    variant="outline"
                    className="flex-1"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {signs.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{currentSignIndex + 1} / {signs.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sign Sequence */}
            {signs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sign Sequence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {signs.map((sign, index) => (
                      <Button
                        key={index}
                        variant={index === currentSignIndex ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleSignSelect(index)}
                      >
                        <span className="mr-2">{index + 1}.</span>
                        {getSignDisplay(sign)}
                        {index === currentSignIndex && isPlaying && (
                          <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Signs */}
            <Card>
              <CardHeader>
                <CardTitle>Available Signs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  Total signs in database: {aslSignsDatabase.getAllSigns().length}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-500">Categories:</div>
                  <div className="flex flex-wrap gap-1">
                    {['alphabet', 'common', 'emergency', 'family', 'daily'].map(category => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category} ({aslSignsDatabase.getSignsByCategory(category as any).length})
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
