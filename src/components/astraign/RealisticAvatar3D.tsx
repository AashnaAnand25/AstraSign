import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RealisticAvatar3DProps {
  currentLetter?: string;
  currentWord?: string;
  isAnimating?: boolean;
  position?: [number, number, number];
}

export default function RealisticAvatar3D({ 
  currentLetter, 
  currentWord,
  isAnimating = false, 
  position = [0, 0, 0]
}: RealisticAvatar3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [gesture, setGesture] = useState<string>('idle');
  
  // Enhanced ASL gestures with realistic hand positions
  const getHandConfiguration = (gestureType: string) => {
    switch (gestureType) {
      case 'A':
        return {
          thumb: { bend: 0.9, spread: 0.1, rotation: 0.2 },
          index: { bend: 0.9, spread: 0.1, rotation: 0.1 },
          middle: { bend: 0.9, spread: 0.1, rotation: 0.1 },
          ring: { bend: 0.9, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.9, spread: 0.1, rotation: 0.1 },
        };
      case 'B':
        return {
          thumb: { bend: 0.2, spread: 0.4, rotation: 0.3 },
          index: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          middle: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          ring: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          pinky: { bend: 0.0, spread: 0.1, rotation: 0.0 },
        };
      case 'C':
        return {
          thumb: { bend: 0.4, spread: 0.3, rotation: 0.2 },
          index: { bend: 0.5, spread: 0.2, rotation: 0.1 },
          middle: { bend: 0.5, spread: 0.2, rotation: 0.1 },
          ring: { bend: 0.5, spread: 0.2, rotation: 0.1 },
          pinky: { bend: 0.5, spread: 0.2, rotation: 0.1 },
        };
      case 'D':
        return {
          thumb: { bend: 0.3, spread: 0.2, rotation: 0.1 },
          index: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          middle: { bend: 0.8, spread: 0.1, rotation: 0.1 },
          ring: { bend: 0.8, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.8, spread: 0.1, rotation: 0.1 },
        };
      case 'HELLO':
        return {
          thumb: { bend: 0.2, spread: 0.4, rotation: 0.3 },
          index: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          middle: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          ring: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          pinky: { bend: 0.0, spread: 0.1, rotation: 0.0 },
        };
      default:
        return {
          thumb: { bend: 0.5, spread: 0.5, rotation: 0.5 },
          index: { bend: 0.5, spread: 0.5, rotation: 0.5 },
          middle: { bend: 0.5, spread: 0.5, rotation: 0.5 },
          ring: { bend: 0.5, spread: 0.5, rotation: 0.5 },
          pinky: { bend: 0.5, spread: 0.5, rotation: 0.5 },
        };
    }
  };

  // Handle gesture changes
  useEffect(() => {
    const input = (currentLetter || currentWord || '').toUpperCase();
    console.log('RealisticAvatar3D input:', input);
    setGesture(input || 'idle');
  }, [currentLetter, currentWord]);

  // Create realistic hand with detailed anatomy
  const createRealisticHand = (isRight: boolean, gestureType: string) => {
    const handPosition = isRight ? [0.35, 0.6, 0] : [-0.35, 0.6, 0];
    const config = getHandConfiguration(gestureType);
    
    return (
      <group position={handPosition as [number, number, number]}>
        {/* Palm */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color={isAnimating ? "#00ffff" : "#f4c2a1"} 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Thumb */}
        <group position={[0.06, 0.02, 0]} rotation={[config.thumb.bend * 1.2, 0, config.thumb.rotation]}>
          <mesh position={[0.02, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.01, 0.03, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0.04, 0, 0]} castShadow>
            <cylinderGeometry args={[0.007, 0.008, 0.025, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0.06, 0, 0]} castShadow>
            <sphereGeometry args={[0.006, 8, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        </group>
        
        {/* Index Finger */}
        <group position={[0.03, 0.08, 0]} rotation={[config.index.bend * 1.5, 0, config.index.rotation]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.009, 0.01, 0.04, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.009, 0.03, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.07, 0]} castShadow>
            <sphereGeometry args={[0.006, 8, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        </group>
        
        {/* Middle Finger */}
        <group position={[0, 0.08, 0]} rotation={[config.middle.bend * 1.5, 0, config.middle.rotation]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.009, 0.01, 0.045, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.045, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.009, 0.035, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <sphereGeometry args={[0.006, 8, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        </group>
        
        {/* Ring Finger */}
        <group position={[-0.03, 0.08, 0]} rotation={[config.ring.bend * 1.5, 0, config.ring.rotation]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.009, 0.04, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.007, 0.008, 0.03, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.07, 0]} castShadow>
            <sphereGeometry args={[0.005, 8, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        </group>
        
        {/* Pinky */}
        <group position={[-0.06, 0.07, 0]} rotation={[config.pinky.bend * 1.5, 0, config.pinky.rotation]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.007, 0.008, 0.035, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.035, 0]} castShadow>
            <cylinderGeometry args={[0.006, 0.007, 0.025, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.06, 0]} castShadow>
            <sphereGeometry args={[0.005, 8, 8]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        </group>
        
        {/* Wrist */}
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.06, 8]} />
          <meshStandardMaterial 
            color="#4a5568" 
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      </group>
    );
  };

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

  return (
    <group ref={groupRef} position={position}>
      {/* Enhanced Body */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.2, 0.7, 8, 16]} />
        <meshStandardMaterial 
          color="#2d3748" 
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      
      {/* Enhanced Head */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial 
          color="#f4c2a1" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Detailed Face */}
      <mesh position={[-0.04, 1.32, 0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.04, 1.32, 0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0, 1.28, 0.14]} castShadow>
        <capsuleGeometry args={[0.03, 0.02, 4, 8]} />
        <meshStandardMaterial color="#e53e3e" />
      </mesh>
      
      {/* Enhanced Arms */}
      <mesh position={[-0.25, 0.9, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
        <meshStandardMaterial 
          color="#2d3748" 
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0.25, 0.9, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
        <meshStandardMaterial 
          color="#2d3748" 
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      
      {/* Realistic Hands */}
      {createRealisticHand(false, gesture)}
      {createRealisticHand(true, gesture)}
      
      {/* Enhanced lighting effects */}
      {isAnimating && gesture !== 'idle' && (
        <>
          <pointLight
            position={[0, 1.5, 0.5]}
            color="#00ffff"
            intensity={1.5}
            distance={3}
          />
          <pointLight
            position={[0, 1.5, -0.5]}
            color="#8b5cf6"
            intensity={1.0}
            distance={2}
          />
          <spotLight
            position={[0, 2, 1]}
            angle={0.6}
            penumbra={0.3}
            intensity={1.2}
            color="#00ffff"
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
              emissive="#00ffff"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[0.75, 0.25]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
        </group>
      )}
    </group>
  );
}
