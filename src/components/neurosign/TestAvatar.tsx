import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TestAvatarProps {
  currentLetter?: string;
  currentWord?: string;
  isAnimating?: boolean;
  position?: [number, number, number];
}

export default function TestAvatar({ 
  currentLetter, 
  currentWord,
  isAnimating = false, 
  position = [0, 0, 0]
}: TestAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [gesture, setGesture] = useState<string>('idle');
  
  useEffect(() => {
    const input = (currentLetter || currentWord || '').toUpperCase();
    console.log('TestAvatar input:', input);
    setGesture(input || 'idle');
  }, [currentLetter, currentWord]);

  // Simple but better looking hand
  const createBetterHand = (isRight: boolean) => {
    const handPosition = isRight ? [0.3, 0.6, 0] : [-0.3, 0.6, 0];
    
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
        
        {/* Simple fingers */}
        <mesh position={[0.06, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.04, 8]} />
          <meshStandardMaterial 
            color={isAnimating ? "#00ffff" : "#f4c2a1"} 
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0.03, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.05, 8]} />
          <meshStandardMaterial 
            color={isAnimating ? "#00ffff" : "#f4c2a1"} 
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.055, 8]} />
          <meshStandardMaterial 
            color={isAnimating ? "#00ffff" : "#f4c2a1"} 
            roughness={0.3}
          />
        </mesh>
        <mesh position={[-0.03, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.05, 8]} />
          <meshStandardMaterial 
            color={isAnimating ? "#00ffff" : "#f4c2a1"} 
            roughness={0.3}
          />
        </mesh>
        <mesh position={[-0.06, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.008, 0.045, 8]} />
          <meshStandardMaterial 
            color={isAnimating ? "#00ffff" : "#f4c2a1"} 
            roughness={0.3}
          />
        </mesh>
        
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

  useFrame((state) => {
    if (!groupRef.current) return;
    
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
    
    if (gesture === 'HELLO') {
      const rightHand = groupRef.current.children.find((_, index) => index === 2);
      if (rightHand) {
        rightHand.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.8;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Better Body */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.2, 0.7, 8, 16]} />
        <meshStandardMaterial 
          color="#2d3748" 
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      
      {/* Better Head */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial 
          color="#f4c2a1" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Simple Face */}
      <mesh position={[-0.04, 1.32, 0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.04, 1.32, 0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      {/* Arms */}
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
      
      {/* Better Hands */}
      {createBetterHand(false)}
      {createBetterHand(true)}
      
      {/* Lighting */}
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
        </>
      )}
    </group>
  );
}
