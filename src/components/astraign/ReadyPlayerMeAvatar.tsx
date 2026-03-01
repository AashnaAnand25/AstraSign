import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface ReadyPlayerMeAvatarProps {
  currentLetter?: string;
  currentWord?: string;
  isAnimating?: boolean;
  position?: [number, number, number];
  avatarUrl?: string;
}

export default function ReadyPlayerMeAvatar({ 
  currentLetter, 
  currentWord,
  isAnimating = false, 
  position = [0, 0, 0],
  avatarUrl = "https://models.readyplayer.me/632a20a5c6d66a0c6b5c8f7f.glb" // Default avatar URL
}: ReadyPlayerMeAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [gesture, setGesture] = useState<string>('idle');
  
  // Load the Ready Player Me avatar
  const gltf = useGLTF(avatarUrl);
  const { animations } = useAnimations(gltf.animations, gltf.scene);
  
  useEffect(() => {
    const input = (currentLetter || currentWord || '').toUpperCase();
    console.log('ReadyPlayerMeAvatar input:', input);
    setGesture(input || 'idle');
  }, [currentLetter, currentWord]);

  // Enhanced animations
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Gentle floating
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
    
    // Gesture-specific animations
    if (gesture === 'HELLO') {
      const rightHand = groupRef.current.children.find((_, index) => index === 0)?.children.find((_, index) => index === 1);
      if (rightHand) {
        rightHand.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.8;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[1.5, 1.5, 1.5]}>
      <primitive object={gltf.scene} />
      
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

// Preload the avatar
useGLTF.preload("https://models.readyplayer.me/632a20a5c6d66a0c6b5c8f7f.glb");
