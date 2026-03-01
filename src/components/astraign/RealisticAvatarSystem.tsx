import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import RealisticHand from "./RealisticHand";
import { AvatarType } from "./AvatarSelector";

interface RealisticAvatarSystemProps {
  currentLetter?: string;
  currentWord?: string;
  isAnimating?: boolean;
  position?: [number, number, number];
  avatarType: AvatarType;
}

export default function RealisticAvatarSystem({ 
  currentLetter, 
  currentWord,
  isAnimating = false, 
  position = [0, 0, 0],
  avatarType = 'person'
}: RealisticAvatarSystemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [gesture, setGesture] = useState<string>('idle');
  
  useEffect(() => {
    const input = (currentLetter || currentWord || '').toUpperCase();
    console.log('RealisticAvatarSystem input:', input, 'avatar:', avatarType);
    setGesture(input || 'idle');
  }, [currentLetter, currentWord, avatarType]);

  // Avatar-specific configurations
  const getAvatarConfig = (type: AvatarType) => {
    switch (type) {
      case 'person':
        return {
          bodyColor: '#2d3748',
          headColor: '#f4c2a1',
          handColor: '#f4c2a1',
          bodySize: [0.2, 0.7],
          headSize: 0.15,
          armRadius: 0.06,
          glowColor: '#00ffff'
        };
      case 'astronaut':
        return {
          bodyColor: '#e0e7ff',
          headColor: '#f0f4ff',
          handColor: '#ffffff',
          bodySize: [0.22, 0.75],
          headSize: 0.18,
          armRadius: 0.07,
          glowColor: '#00ffff'
        };
      case 'wizard':
        return {
          bodyColor: '#4c1d95',
          headColor: '#f4c2a1',
          handColor: '#f4c2a1',
          bodySize: [0.18, 0.65],
          headSize: 0.14,
          armRadius: 0.05,
          glowColor: '#9333ea'
        };
      case 'robot':
        return {
          bodyColor: '#6b7280',
          headColor: '#9ca3af',
          handColor: '#d1d5db',
          bodySize: [0.21, 0.72],
          headSize: 0.16,
          armRadius: 0.065,
          glowColor: '#10b981'
        };
      default:
        return {
          bodyColor: '#2d3748',
          headColor: '#f4c2a1',
          handColor: '#f4c2a1',
          bodySize: [0.2, 0.7],
          headSize: 0.15,
          armRadius: 0.06,
          glowColor: '#00ffff'
        };
    }
  };

  const config = getAvatarConfig(avatarType);

  // Enhanced animations
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Gentle floating
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
    
    // Gesture-specific animations
    if (gesture === 'HELLO') {
      const rightHand = groupRef.current.children.find((_, index) => index === 2);
      if (rightHand) {
        rightHand.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.8;
      }
    }
    
    if (gesture === 'THANK') {
      const rightHand = groupRef.current.children.find((_, index) => index === 2);
      if (rightHand) {
        rightHand.position.x = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  const createAvatarHead = () => {
    if (avatarType === 'astronaut') {
      return (
        <group position={[0, 1.3, 0]}>
          {/* Helmet */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <sphereGeometry args={[config.headSize * 1.2, 32, 32]} />
            <meshStandardMaterial 
              color={config.headColor} 
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Helmet visor */}
          <mesh position={[0, 0.05, config.headSize * 0.8]} castShadow receiveShadow>
            <sphereGeometry args={[config.headSize * 0.7, 16, 16]} />
            <meshStandardMaterial 
              color="#1e293b" 
              roughness={0.1}
              metalness={0.9}
              transparent
              opacity={0.7}
            />
          </mesh>
          {/* Head inside */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <sphereGeometry args={[config.headSize * 0.8, 32, 32]} />
            <meshStandardMaterial 
              color="#f4c2a1" 
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        </group>
      );
    } else if (avatarType === 'wizard') {
      return (
        <group position={[0, 1.3, 0]}>
          {/* Wizard hat */}
          <mesh position={[0, config.headSize * 0.8, 0]} castShadow receiveShadow>
            <coneGeometry args={[config.headSize * 0.6, config.headSize * 1.5, 8]} />
            <meshStandardMaterial 
              color="#4c1d95" 
              roughness={0.6}
              metalness={0.3}
            />
          </mesh>
          {/* Beard */}
          <mesh position={[0, -config.headSize * 0.3, config.headSize * 0.6]} castShadow receiveShadow>
            <coneGeometry args={[config.headSize * 0.4, config.headSize * 0.6, 8]} />
            <meshStandardMaterial 
              color="#e5e7eb" 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <sphereGeometry args={[config.headSize, 32, 32]} />
            <meshStandardMaterial 
              color={config.headColor} 
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        </group>
      );
    } else if (avatarType === 'robot') {
      return (
        <group position={[0, 1.3, 0]}>
          {/* Robot head */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[config.headSize * 1.5, config.headSize * 1.5, config.headSize * 1.2]} />
            <meshStandardMaterial 
              color={config.headColor} 
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          {/* Robot eyes */}
          <mesh position={[-config.headSize * 0.3, config.headSize * 0.2, config.headSize * 0.7]} castShadow>
            <sphereGeometry args={[config.headSize * 0.15, 8, 8]} />
            <meshStandardMaterial 
              color="#ef4444" 
              emissive="#ef4444"
              emissiveIntensity={isAnimating ? 0.5 : 0.1}
            />
          </mesh>
          <mesh position={[config.headSize * 0.3, config.headSize * 0.2, config.headSize * 0.7]} castShadow>
            <sphereGeometry args={[config.headSize * 0.15, 8, 8]} />
            <meshStandardMaterial 
              color="#ef4444" 
              emissive="#ef4444"
              emissiveIntensity={isAnimating ? 0.5 : 0.1}
            />
          </mesh>
          {/* Antenna */}
          <mesh position={[0, config.headSize * 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
          <mesh position={[0, config.headSize * 0.9, 0]} castShadow>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial 
              color="#ef4444" 
              emissive="#ef4444"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      );
    } else {
      // Person
      return (
        <group position={[0, 1.3, 0]}>
          {/* Head */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <sphereGeometry args={[config.headSize, 32, 32]} />
            <meshStandardMaterial 
              color={config.headColor} 
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          {/* Eyes */}
          <mesh position={[-config.headSize * 0.3, config.headSize * 0.1, config.headSize * 0.8]} castShadow>
            <sphereGeometry args={[config.headSize * 0.1, 8, 8]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>
          <mesh position={[config.headSize * 0.3, config.headSize * 0.1, config.headSize * 0.8]} castShadow>
            <sphereGeometry args={[config.headSize * 0.1, 8, 8]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -config.headSize * 0.1, config.headSize * 0.8]} castShadow>
            <capsuleGeometry args={[config.headSize * 0.05, config.headSize * 0.1, 4, 8]} />
            <meshStandardMaterial color="#e53e3e" />
          </mesh>
        </group>
      );
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Enhanced Body */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[config.bodySize[0], config.bodySize[1], 8, 16]} />
        <meshStandardMaterial 
          color={config.bodyColor} 
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      
      {/* Avatar-specific Head */}
      {createAvatarHead()}
      
      {/* Enhanced Arms */}
      <mesh position={[-0.25, 0.9, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[config.armRadius, 0.4, 8, 16]} />
        <meshStandardMaterial 
          color={config.bodyColor} 
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0.25, 0.9, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[config.armRadius, 0.4, 8, 16]} />
        <meshStandardMaterial 
          color={config.bodyColor} 
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      
      {/* Realistic Hands with Detailed Fingers */}
      <RealisticHand
        gesture={gesture}
        isRight={false}
        isAnimating={isAnimating}
        position={[0, 0, 0]}
        scale={1.5}
      />
      <RealisticHand
        gesture={gesture}
        isRight={true}
        isAnimating={isAnimating}
        position={[0, 0, 0]}
        scale={1.5}
      />
      
      {/* Enhanced lighting effects */}
      {isAnimating && gesture !== 'idle' && (
        <>
          <pointLight
            position={[0, 1.5, 0.5]}
            color={config.glowColor}
            intensity={1.5}
            distance={3}
          />
          <pointLight
            position={[0, 1.5, -0.5]}
            color={config.glowColor}
            intensity={1.0}
            distance={2}
          />
          <spotLight
            position={[0, 2, 1]}
            angle={0.6}
            penumbra={0.3}
            intensity={1.2}
            color={config.glowColor}
            castShadow
          />
        </>
      )}
      
      {/* Gesture indicator */}
      {gesture !== 'idle' && (
        <group position={[0, 1.8, 0]}>
          <mesh position={[0, 0, 0.01]} castShadow>
            <boxGeometry args={[0.8, 0.3, 0.05]} />
            <meshStandardMaterial 
              color="#1a1a2e" 
              emissive={config.glowColor}
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[0.75, 0.25]} />
            <meshBasicMaterial color={config.glowColor} />
          </mesh>
        </group>
      )}
    </group>
  );
}
