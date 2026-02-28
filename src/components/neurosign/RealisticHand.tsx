import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RealisticHandProps {
  gesture: string;
  isRight?: boolean;
  isAnimating?: boolean;
  position?: [number, number, number];
  scale?: number;
}

interface FingerConfig {
  thumb: { bend: number; spread: number; rotation: number };
  index: { bend: number; spread: number; rotation: number };
  middle: { bend: number; spread: number; rotation: number };
  ring: { bend: number; spread: number; rotation: number };
  pinky: { bend: number; spread: number; rotation: number };
}

export default function RealisticHand({ 
  gesture, 
  isRight = false, 
  isAnimating = false,
  position = [0, 0, 0],
  scale = 1
}: RealisticHandProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [targetConfig, setTargetConfig] = useState<FingerConfig | null>(null);
  const [currentConfig, setCurrentConfig] = useState<FingerConfig>({
    thumb: { bend: 0.5, spread: 0.5, rotation: 0.5 },
    index: { bend: 0.5, spread: 0.5, rotation: 0.5 },
    middle: { bend: 0.5, spread: 0.5, rotation: 0.5 },
    ring: { bend: 0.5, spread: 0.5, rotation: 0.5 },
    pinky: { bend: 0.5, spread: 0.5, rotation: 0.5 },
  });

  // Realistic ASL finger configurations
  const getRealisticGestureConfig = (gestureType: string): FingerConfig => {
    switch (gestureType.toUpperCase()) {
      case 'A':
        return {
          thumb: { bend: 0.9, spread: 0.1, rotation: 0.2 },
          index: { bend: 0.95, spread: 0.1, rotation: 0.1 },
          middle: { bend: 0.95, spread: 0.1, rotation: 0.1 },
          ring: { bend: 0.95, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.95, spread: 0.1, rotation: 0.1 },
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
          middle: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          ring: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.85, spread: 0.1, rotation: 0.1 },
        };
      case 'E':
        return {
          thumb: { bend: 0.6, spread: 0.2, rotation: 0.1 },
          index: { bend: 0.7, spread: 0.3, rotation: 0.1 },
          middle: { bend: 0.7, spread: 0.3, rotation: 0.1 },
          ring: { bend: 0.7, spread: 0.3, rotation: 0.1 },
          pinky: { bend: 0.7, spread: 0.3, rotation: 0.1 },
        };
      case 'F':
        return {
          thumb: { bend: 0.2, spread: 0.1, rotation: 0.1 },
          index: { bend: 0.2, spread: 0.1, rotation: 0.1 },
          middle: { bend: 0.0, spread: 0.2, rotation: 0.0 },
          ring: { bend: 0.0, spread: 0.2, rotation: 0.0 },
          pinky: { bend: 0.0, spread: 0.2, rotation: 0.0 },
        };
      case 'G':
        return {
          thumb: { bend: 0.0, spread: 0.3, rotation: 0.0 },
          index: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          middle: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          ring: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.85, spread: 0.1, rotation: 0.1 },
        };
      case 'H':
        return {
          thumb: { bend: 0.3, spread: 0.2, rotation: 0.1 },
          index: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          middle: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          ring: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.85, spread: 0.1, rotation: 0.1 },
        };
      case 'I':
        return {
          thumb: { bend: 0.3, spread: 0.2, rotation: 0.1 },
          index: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          middle: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          ring: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.0, spread: 0.1, rotation: 0.0 },
        };
      case 'L':
        return {
          thumb: { bend: 0.0, spread: 0.4, rotation: 0.0 },
          index: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          middle: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          ring: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.85, spread: 0.1, rotation: 0.1 },
        };
      case 'V':
        return {
          thumb: { bend: 0.3, spread: 0.2, rotation: 0.1 },
          index: { bend: 0.0, spread: 0.3, rotation: 0.0 },
          middle: { bend: 0.0, spread: 0.3, rotation: 0.0 },
          ring: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.85, spread: 0.1, rotation: 0.1 },
        };
      case 'W':
        return {
          thumb: { bend: 0.3, spread: 0.2, rotation: 0.1 },
          index: { bend: 0.0, spread: 0.4, rotation: 0.0 },
          middle: { bend: 0.0, spread: 0.4, rotation: 0.0 },
          ring: { bend: 0.0, spread: 0.4, rotation: 0.0 },
          pinky: { bend: 0.85, spread: 0.1, rotation: 0.1 },
        };
      case 'Y':
        return {
          thumb: { bend: 0.0, spread: 0.4, rotation: 0.0 },
          index: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          middle: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          ring: { bend: 0.85, spread: 0.1, rotation: 0.1 },
          pinky: { bend: 0.0, spread: 0.1, rotation: 0.0 },
        };
      case 'HELLO':
        return {
          thumb: { bend: 0.2, spread: 0.4, rotation: 0.3 },
          index: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          middle: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          ring: { bend: 0.0, spread: 0.1, rotation: 0.0 },
          pinky: { bend: 0.0, spread: 0.1, rotation: 0.0 },
        };
      case 'THANK':
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

  useEffect(() => {
    const config = getRealisticGestureConfig(gesture);
    setTargetConfig(config);
  }, [gesture]);

  // Smooth interpolation for finger movements
  useFrame((state) => {
    if (!groupRef.current || !targetConfig) return;

    // Interpolate each finger configuration
    Object.keys(targetConfig).forEach((fingerName) => {
      const target = targetConfig[fingerName as keyof FingerConfig];
      const current = currentConfig[fingerName as keyof FingerConfig];
      
      // Smooth interpolation
      const interpolated = {
        bend: THREE.MathUtils.lerp(current.bend, target.bend, 0.1),
        spread: THREE.MathUtils.lerp(current.spread, target.spread, 0.1),
        rotation: THREE.MathUtils.lerp(current.rotation, target.rotation, 0.1),
      };
      
      setCurrentConfig(prev => ({
        ...prev,
        [fingerName]: interpolated
      }));
    });

    // Gesture-specific animations
    if (gesture.toUpperCase() === 'HELLO') {
      const waveAmount = Math.sin(state.clock.elapsedTime * 4) * 0.8;
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        waveAmount,
        0.1
      );
    }
  });

  const createRealisticFinger = (
    fingerName: keyof FingerConfig,
    basePosition: [number, number, number],
    lengths: [number, number, number],
    radii: [number, number, number]
  ) => {
    const config = currentConfig[fingerName];
    const [proximalLength, middleLength, distalLength] = lengths;
    const [proximalRadius, middleRadius, distalRadius] = radii;

    return (
      <group position={basePosition}>
        {/* Proximal phalanx */}
        <group rotation={[config.bend * 1.2, 0, config.rotation]}>
          <mesh position={[0, proximalLength / 2, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[proximalRadius, proximalLength, 8, 16]} />
            <meshStandardMaterial 
              color={isAnimating ? "#00ffff" : "#f4c2a1"} 
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
          
          {/* Middle phalanx */}
          <group position={[0, proximalLength, 0]} rotation={[config.bend * 1.0, 0, 0]}>
            <mesh position={[0, middleLength / 2, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[middleRadius, middleLength, 8, 16]} />
              <meshStandardMaterial 
                color={isAnimating ? "#00ffff" : "#f4c2a1"} 
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
            
            {/* Distal phalanx */}
            <group position={[0, middleLength, 0]} rotation={[config.bend * 0.8, 0, 0]}>
              <mesh position={[0, distalLength / 2, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[distalRadius, distalLength, 8, 16]} />
                <meshStandardMaterial 
                  color={isAnimating ? "#00ffff" : "#f4c2a1"} 
                  roughness={0.3}
                  metalness={0.1}
                />
              </mesh>
              
              {/* Fingertip */}
              <mesh position={[0, distalLength, 0]} castShadow receiveShadow>
                <sphereGeometry args={[distalRadius * 0.8, 8, 8]} />
                <meshStandardMaterial 
                  color={isAnimating ? "#00ffff" : "#f4c2a1"} 
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    );
  };

  const handPosition = isRight ? [0.4, 0.7, 0.3] : [-0.4, 0.7, 0.3];

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <group position={handPosition as [number, number, number]}>
        {/* Palm */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.18, 0.04]} />
          <meshStandardMaterial 
            color={isAnimating ? "#00ffff" : "#f4c2a1"} 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Thumb */}
        {createRealisticFinger('thumb', [0.09, 0.03, 0], [0.045, 0.0375, 0.03], [0.012, 0.0105, 0.009])}
        
        {/* Index Finger */}
        {createRealisticFinger('index', [0.045, 0.12, 0], [0.06, 0.045, 0.0375], [0.0135, 0.012, 0.0105])}
        
        {/* Middle Finger */}
        {createRealisticFinger('middle', [0, 0.12, 0], [0.0675, 0.0525, 0.045], [0.0135, 0.012, 0.0105])}
        
        {/* Ring Finger */}
        {createRealisticFinger('ring', [-0.045, 0.12, 0], [0.06, 0.045, 0.0375], [0.012, 0.0105, 0.009])}
        
        {/* Pinky */}
        {createRealisticFinger('pinky', [-0.09, 0.105, 0], [0.0525, 0.0375, 0.03], [0.0105, 0.009, 0.0075])}
        
        {/* Wrist */}
        <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.06, 0.09, 8, 16]} />
          <meshStandardMaterial 
            color="#4a5568" 
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        
        {/* Hand glow effect when animating */}
        {isAnimating && (
          <pointLight
            position={[0, 0.1, 0.1]}
            color="#00ffff"
            intensity={0.5}
            distance={0.3}
          />
        )}
      </group>
    </group>
  );
}
