import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, User, Settings, Sparkles } from 'lucide-react';

interface PremiumAvatarProps {
  signs?: string[];
  autoPlay?: boolean;
  onSignComplete?: (sign: string) => void;
}

// Premium animated avatar with smooth animations
function AnimatedAvatar({ isPlaying, currentSign }: { isPlaying: boolean; currentSign: string | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying || !currentSign) return;

    const t = state.clock.getElapsedTime();
    setTime(t);
    
    // Smooth, professional animations based on sign
    switch (currentSign.toLowerCase()) {
      case 'hello':
        // Elegant waving motion
        groupRef.current.rotation.y = Math.sin(t * 2) * 0.3;
        groupRef.current.position.x = Math.sin(t * 1.5) * 0.05;
        groupRef.current.position.y = Math.abs(Math.sin(t * 1.5)) * 0.05;
        break;
      case 'thank':
        // Respectful bowing motion
        groupRef.current.rotation.x = Math.sin(t * 1.5) * 0.2;
        groupRef.current.position.y = Math.abs(Math.sin(t * 1.5)) * 0.1;
        break;
      case 'please':
        // Smooth circular motion
        groupRef.current.position.x = Math.cos(t * 1.2) * 0.15;
        groupRef.current.position.z = Math.sin(t * 1.2) * 0.15;
        groupRef.current.rotation.y = t * 0.5;
        break;
      case 'yes':
        // Gentle nodding
        groupRef.current.rotation.x = Math.sin(t * 3) * 0.15;
        break;
      case 'no':
        // Smooth head shake
        groupRef.current.rotation.y = Math.sin(t * 3) * 0.2;
        break;
      case 'love':
        // Heart gesture - arms cross
        groupRef.current.rotation.z = Math.sin(t * 2) * 0.1;
        break;
      default:
        // Subtle floating motion
        groupRef.current.position.y = Math.sin(t * 0.8) * 0.08;
        break;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body - sleek and modern */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.1, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.28]} />
        <meshStandardMaterial color="#f4c2a1" metalness={0.1} roughness={0.8} />
      </mesh>
      
      {/* Arms with smooth joints */}
      <group position={[0, 0.2, 0]}>
        {/* Left arm */}
        <group position={[-0.5, 0, 0]}>
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.12, 0.6]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.2} roughness={0.5} />
          </mesh>
          {/* Left hand */}
          <mesh position={[-0.4, -0.35, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial color="#f4c2a1" metalness={0.1} roughness={0.8} />
          </mesh>
        </group>
        
        {/* Right arm */}
        <group position={[0.5, 0, 0]}>
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.12, 0.6]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.2} roughness={0.5} />
          </mesh>
          {/* Right hand */}
          <mesh position={[0.4, -0.35, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial color="#f4c2a1" metalness={0.1} roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function PremiumAvatar({ 
  signs = ['hello', 'thank', 'please'], 
  autoPlay = false,
  onSignComplete 
}: PremiumAvatarProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState<'minimal' | 'sleek' | 'modern'>('minimal');

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
      }, 3000); // 3 seconds per sign for better viewing
      
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

  const getSignDescription = (sign: string) => {
    const descriptions: { [key: string]: string } = {
      'HELLO': 'Friendly wave from forehead',
      'THANK': 'Hand moves from heart forward',
      'PLEASE': 'Circular motion on chest',
      'YES': 'Gentle nodding motion',
      'NO': 'Smooth head shake',
      'LOVE': 'Arms crossed over heart',
      'HELP': 'Hand supporting gesture',
      'SORRY': 'Respectful circular motion'
    };
    
    return descriptions[sign] || 'ASL sign demonstration';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light text-gray-900 tracking-tight">
              3D Avatar
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Interactive ASL sign demonstrations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* 3D Avatar Display */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-3xl p-8">
              <div className="aspect-video bg-white rounded-2xl overflow-hidden shadow-sm">
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 2, 6]} />
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
                  <AnimatedAvatar isPlaying={isPlaying} currentSign={currentSign} />
                  <OrbitControls 
                    enablePan={false} 
                    minDistance={3} 
                    maxDistance={12}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 6}
                  />
                  <Environment preset="studio" />
                  {/* Floor */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                    <planeGeometry args={[20, 20]} />
                    <meshStandardMaterial color="#f8f8f8" />
                  </mesh>
                </Canvas>
              </div>
              
              {/* Current Sign Display */}
              {currentSign && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-black text-white rounded-full">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">{currentSign.toUpperCase()}</span>
                  </div>
                  <p className="mt-2 text-gray-500">{getSignDescription(currentSign)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-8">
            {/* Avatar Selection */}
            <div className="bg-gray-50 rounded-3xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Avatar Style</h3>
              <div className="space-y-2">
                {['minimal', 'sleek', 'modern'].map((style) => (
                  <Button
                    key={style}
                    variant={selectedAvatar === style ? "default" : "ghost"}
                    className="w-full justify-start rounded-xl"
                    onClick={() => setSelectedAvatar(style as any)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="bg-gray-50 rounded-3xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Playback</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handlePlay}
                    disabled={signs.length === 0 || isPlaying}
                    className="flex-1 rounded-xl"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <Button
                    onClick={handlePause}
                    disabled={!isPlaying}
                    variant="outline"
                    className="flex-1 rounded-xl"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="rounded-xl px-4"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {signs.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Progress</span>
                      <span>{currentSignIndex + 1} / {signs.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sign Sequence */}
            {signs.length > 0 && (
              <div className="bg-gray-50 rounded-3xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sign Sequence</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {signs.map((sign, index) => (
                    <Button
                      key={index}
                      variant={index === currentSignIndex ? "default" : "ghost"}
                      className="w-full justify-start rounded-xl"
                      onClick={() => handleSignSelect(index)}
                    >
                      <span className="mr-3 text-gray-400">{index + 1}.</span>
                      {sign.toUpperCase()}
                      {index === currentSignIndex && isPlaying && (
                        <div className="ml-auto w-2 h-2 bg-black rounded-full animate-pulse" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
