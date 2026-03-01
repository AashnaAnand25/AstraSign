import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, User, Settings } from 'lucide-react';

interface Working3DAvatarProps {
  signs?: string[];
  autoPlay?: boolean;
  onSignComplete?: (sign: string) => void;
}

// Simple animated avatar that works without external models
function AnimatedAvatar({ isPlaying, currentSign }: { isPlaying: boolean; currentSign: string | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying || !currentSign) return;

    // Simple animation based on sign
    const time = state.clock.getElapsedTime();
    
    switch (currentSign.toLowerCase()) {
      case 'hello':
        // Waving motion
        groupRef.current.rotation.y = Math.sin(time * 3) * 0.5;
        groupRef.current.position.x = Math.sin(time * 2) * 0.1;
        break;
      case 'thank':
        // Bowing motion
        groupRef.current.rotation.x = Math.sin(time * 2) * 0.3;
        groupRef.current.position.y = Math.abs(Math.sin(time * 2)) * 0.2 - 0.1;
        break;
      case 'please':
        // Circular motion
        groupRef.current.position.x = Math.cos(time * 2) * 0.2;
        groupRef.current.position.z = Math.sin(time * 2) * 0.2;
        break;
      case 'yes':
        // Nodding motion
        groupRef.current.rotation.x = Math.sin(time * 4) * 0.2;
        break;
      case 'no':
        // Head shake
        groupRef.current.rotation.y = Math.sin(time * 4) * 0.3;
        break;
      default:
        // Gentle floating for unknown signs
        groupRef.current.position.y = Math.sin(time) * 0.1;
        break;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Arms */}
      <group position={[0, 0.3, 0]}>
        {/* Left arm */}
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
        {/* Right arm */}
        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      </group>
      
      {/* Simple hands that move for signing */}
      <group position={[0, -0.1, 0]}>
        {/* Left hand */}
        <mesh position={[-0.8, 0, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#fdbcb4" />
        </mesh>
        {/* Right hand */}
        <mesh position={[0.8, 0, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#fdbcb4" />
        </mesh>
      </group>
    </group>
  );
}

export default function Working3DAvatar({ 
  signs = ['hello', 'thank', 'please'], 
  autoPlay = false,
  onSignComplete 
}: Working3DAvatarProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState<'simple' | 'astronaut' | 'spiderman'>('simple');

  const currentSign = signs[currentSignIndex] || null;
  const progress = signs.length > 0 ? ((currentSignIndex + 1) / signs.length) * 100 : 0;

  useEffect(() => {
    if (isPlaying && currentSign) {
      const timer = setTimeout(() => {
        if (onSignComplete) {
          onSignComplete(currentSign);
        }
        
        if (currentSignIndex < signs.length - 1) {
          setCurrentSignIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 2000); // 2 seconds per sign
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentSign, currentSignIndex, signs.length, onSignComplete]);

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

  const handleSignSelect = (index: number) => {
    setCurrentSignIndex(index);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">3D ASL Avatar</h1>
            <p className="text-gray-600 mt-1">Interactive sign language demonstration</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Avatar Display */}
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
                      {currentSign.toUpperCase()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 2, 5]} />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <AnimatedAvatar isPlaying={isPlaying} currentSign={currentSign} />
                    <OrbitControls enablePan={false} minDistance={2} maxDistance={10} />
                    <Environment preset="studio" />
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
                      <planeGeometry args={[50, 50]} />
                      <meshStandardMaterial color="#f0f0f0" />
                    </mesh>
                  </Canvas>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['simple', 'astronaut', 'spiderman'].map((model) => (
                  <Button
                    key={model}
                    variant={selectedModel === model ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedModel(model as any)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {model.charAt(0).toUpperCase() + model.slice(1)}
                  </Button>
                ))}
              </CardContent>
            </Card>

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
                        {sign.toUpperCase()}
                        {index === currentSignIndex && isPlaying && (
                          <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
