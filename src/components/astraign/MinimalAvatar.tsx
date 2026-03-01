import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface MinimalAvatarProps {
  signs?: string[];
  autoPlay?: boolean;
  onSignComplete?: (sign: string) => void;
}

// Simple animated avatar
function AnimatedAvatar({ isPlaying, currentSign }: { isPlaying: boolean; currentSign: string | null }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying || !currentSign) return;

    const time = state.clock.getElapsedTime();
    
    switch (currentSign.toLowerCase()) {
      case 'hello':
        groupRef.current.rotation.y = Math.sin(time * 2) * 0.3;
        break;
      case 'thank':
        groupRef.current.rotation.x = Math.sin(time * 1.5) * 0.2;
        break;
      case 'please':
        groupRef.current.position.x = Math.cos(time * 1.2) * 0.1;
        break;
      default:
        groupRef.current.position.y = Math.sin(time * 0.8) * 0.05;
        break;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 1, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#f4c2a1" />
      </mesh>
      
      {/* Arms */}
      <group position={[0, 0.1, 0]}>
        <mesh position={[-0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>
    </group>
  );
}

export default function MinimalAvatar({ 
  signs = ['hello', 'thank', 'please'], 
  autoPlay = false,
  onSignComplete 
}: MinimalAvatarProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);

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
      }, 3000);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Simple Header */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-2xl font-light text-gray-900">3D Avatar</h1>
        </div>

        {/* 3D Avatar */}
        <div className="mb-16">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="aspect-video bg-white rounded-lg overflow-hidden">
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 2, 6]} />
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                <AnimatedAvatar isPlaying={isPlaying} currentSign={currentSign} />
                <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
                <Environment preset="studio" />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
                  <planeGeometry args={[20, 20]} />
                  <meshStandardMaterial color="#f8f8f8" />
                </mesh>
              </Canvas>
            </div>
            
            {currentSign && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-sm">
                  {currentSign.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-8">
          {/* Playback Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePlay}
              disabled={signs.length === 0 || isPlaying}
              className="px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Play
            </button>
            <button
              onClick={handlePause}
              disabled={!isPlaying}
              className="px-6 py-2 border border-gray-300 text-gray-900 rounded-full text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-900 rounded-full text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Progress */}
          {signs.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span>{currentSignIndex + 1} / {signs.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div
                  className="bg-black h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Sign Sequence */}
          {signs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sign Sequence
              </h2>
              <div className="space-y-2">
                {signs.map((sign, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSignIndex(index);
                      setIsPlaying(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      index === currentSignIndex
                        ? 'bg-black text-white'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {sign.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
