import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { aslClassifier } from "@/ml/aslClassifier";

// Enhanced ASL gestures with ML support
const ASL_GESTURES: Record<string, { handshape: string, movement: string, location: string }> = {
  'A': { handshape: 'fist', movement: 'static', location: 'neutral_space' },
  'B': { handshape: 'flat', movement: 'static', location: 'neutral_space' },
  'C': { handshape: 'curved', movement: 'static', location: 'neutral_space' },
  'D': { handshape: 'point', movement: 'static', location: 'neutral_space' },
  'E': { handshape: 'claw', movement: 'static', location: 'neutral_space' },
  'F': { handshape: 'hooked', movement: 'static', location: 'neutral_space' },
  'G': { handshape: 'gun', movement: 'static', location: 'neutral_space' },
  'H': { handshape: 'gun', movement: 'static', location: 'neutral_space' },
  'I': { handshape: 'pinky_up', movement: 'static', location: 'neutral_space' },
  'J': { handshape: 'pinky_up', movement: 'wiggle', location: 'neutral_space' },
  'K': { handshape: 'hooked', movement: 'static', location: 'neutral_space' },
  'L': { handshape: 'thumb_up', movement: 'static', location: 'neutral_space' },
  'M': { handshape: 'bent', movement: 'static', location: 'neutral_space' },
  'N': { handshape: 'bent', movement: 'static', location: 'neutral_space' },
  'O': { handshape: 'circle', movement: 'static', location: 'neutral_space' },
  'P': { handshape: 'gun', movement: 'static', location: 'neutral_space' },
  'Q': { handshape: 'gun', movement: 'static', location: 'neutral_space' },
  'R': { handshape: 'crossed', movement: 'static', location: 'neutral_space' },
  'S': { handshape: 'fist', movement: 'static', location: 'neutral_space' },
  'T': { handshape: 'fist', movement: 'static', location: 'neutral_space' },
  'U': { handshape: 'gun', movement: 'static', location: 'neutral_space' },
  'V': { handshape: 'peace', movement: 'static', location: 'neutral_space' },
  'W': { handshape: 'spread_three', movement: 'static', location: 'neutral_space' },
  'X': { handshape: 'point', movement: 'static', location: 'neutral_space' },
  'Y': { handshape: 'thumb_pinky', movement: 'static', location: 'neutral_space' },
  'Z': { handshape: 'point', movement: 'circle', location: 'neutral_space' },
  'HELLO': { handshape: 'flat', movement: 'wave', location: 'forehead' },
  'THANK': { handshape: 'flat', movement: 'slide', location: 'chest' },
  'PLEASE': { handshape: 'flat', movement: 'circle', location: 'chest' },
  'LOVE': { handshape: 'flat', movement: 'static', location: 'chest' },
  'YES': { handshape: 'fist', movement: 'bounce', location: 'neutral_space' },
  'NO': { handshape: 'gun', movement: 'wiggle', location: 'neutral_space' },
};

interface Avatar3DProps {
  currentLetter?: string;
  currentWord?: string;
  isAnimating?: boolean;
  position?: [number, number, number];
}

export default function Avatar3D({ 
  currentLetter, 
  currentWord,
  isAnimating = false, 
  position = [0, 0, 0]
}: Avatar3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [gesture, setGesture] = useState<string>('idle');
  
  // Handle gesture changes with ML support
  useEffect(() => {
    const input = (currentLetter || currentWord || '').toUpperCase();
    console.log('Avatar3D input:', input);
    
    if (input && ASL_GESTURES[input]) {
      setGesture(ASL_GESTURES[input].handshape);
      console.log('Setting gesture:', ASL_GESTURES[input].handshape);
    } else {
      setGesture('idle');
    }
  }, [currentLetter, currentWord]);

  // Create simple hand with finger positions
  const createHand = (isRight: boolean, gesture: string) => {
    const handPosition = isRight ? [0.3, 0.5, 0] : [-0.3, 0.5, 0];
    
    // Finger positions based on gesture
    const fingerConfig = {
      thumb: { pos: [0.04, 0.02, 0], size: 0.015 },
      index: { pos: [0.02, 0.08, 0], size: 0.012 },
      middle: { pos: [0, 0.08, 0], size: 0.012 },
      ring: { pos: [-0.02, 0.08, 0], size: 0.012 },
      pinky: { pos: [-0.04, 0.07, 0], size: 0.01 },
    };

    // Modify finger positions based on gesture
    if (gesture === 'fist') {
      // All fingers bent
      fingerConfig.index.pos = [0.02, 0.04, 0];
      fingerConfig.middle.pos = [0, 0.04, 0];
      fingerConfig.ring.pos = [-0.02, 0.04, 0];
      fingerConfig.pinky.pos = [-0.04, 0.03, 0];
    } else if (gesture === 'flat') {
      // All fingers straight
      fingerConfig.index.pos = [0.02, 0.12, 0];
      fingerConfig.middle.pos = [0, 0.12, 0];
      fingerConfig.ring.pos = [-0.02, 0.12, 0];
      fingerConfig.pinky.pos = [-0.04, 0.11, 0];
    } else if (gesture === 'curved') {
      // All fingers curved
      fingerConfig.index.pos = [0.02, 0.08, 0.02];
      fingerConfig.middle.pos = [0, 0.08, 0.02];
      fingerConfig.ring.pos = [-0.02, 0.08, 0.02];
      fingerConfig.pinky.pos = [-0.04, 0.07, 0.02];
    }

    return (
      <group position={handPosition as [number, number, number]}>
        {/* Palm */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.02]} />
          <meshStandardMaterial 
            color={isAnimating ? "#00ffff" : "#f4c2a1"} 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {/* Fingers */}
        {Object.entries(fingerConfig).map(([name, config]) => (
          <mesh key={name} position={config.pos as [number, number, number]}>
            <cylinderGeometry args={[config.size * 0.8, config.size, 0.04]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        ))}
        
        {/* Wrist */}
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.04]} />
          <meshStandardMaterial color="#4a5568" roughness={0.8} />
        </mesh>
      </group>
    );
  };

  // Animation
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Gentle floating
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
    
    // Gesture animations
    const input = (currentLetter || currentWord || '').toUpperCase();
    if (input === 'HELLO' && gesture === 'flat') {
      // Wave animation for HELLO
      const rightHand = groupRef.current.children.find((child, index) => index === 2);
      if (rightHand) {
        rightHand.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.5;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Enhanced Body */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.9, 0.25]} />
        <meshStandardMaterial 
          color="#2d3748" 
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Enhanced Head */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial 
          color="#f4c2a1" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.05, 1.32, 0.15]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.05, 1.32, 0.15]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      {/* Enhanced Arms */}
      <mesh position={[-0.28, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.5]} />
        <meshStandardMaterial 
          color="#2d3748" 
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0.28, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.5]} />
        <meshStandardMaterial 
          color="#2d3748" 
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Hands with gestures */}
      {createHand(false, gesture)}
      {createHand(true, gesture)}
      
      {/* Enhanced glow effects */}
      {isAnimating && gesture !== 'idle' && (
        <>
          <pointLight
            position={[0, 1.5, 0.5]}
            color="#00ffff"
            intensity={1.2}
            distance={3}
          />
          <pointLight
            position={[0, 1.5, -0.5]}
            color="#8b5cf6"
            intensity={0.8}
            distance={2}
          />
        </>
      )}
      
      {/* Gesture indicator */}
      {gesture !== 'idle' && (
        <mesh position={[0, 1.8, 0]} castShadow>
          <planeGeometry args={[0.8, 0.3]} />
          <meshStandardMaterial 
            color="#1a1a2e" 
            emissive="#00ffff"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}
