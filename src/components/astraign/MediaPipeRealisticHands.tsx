import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ASL_LETTERS, ASL_WORDS } from "@/data/aslGestures";

interface MediaPipeRealisticHandsProps {
  gesture: string;
  isAnimating?: boolean;
  scale?: number;
}

// MediaPipe hand landmark indices (21 landmarks total)
const MEDIAPIPE_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20
};

// Realistic hand proportions based on MediaPipe data
const HAND_PROPORTIONS = {
  palmWidth: 0.08,
  palmHeight: 0.1,
  fingerLengths: {
    thumb: { proximal: 0.025, distal: 0.02, tip: 0.008 },
    index: { proximal: 0.035, middle: 0.025, distal: 0.02, tip: 0.006 },
    middle: { proximal: 0.04, middle: 0.03, distal: 0.025, tip: 0.006 },
    ring: { proximal: 0.038, middle: 0.028, distal: 0.022, tip: 0.005 },
    pinky: { proximal: 0.025, middle: 0.02, distal: 0.015, tip: 0.004 }
  }
};

export default function MediaPipeRealisticHands({ 
  gesture, 
  isAnimating = false,
  scale = 1
}: MediaPipeRealisticHandsProps) {
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const [targetLandmarks, setTargetLandmarks] = useState<number[][]>([]);
  const [currentLandmarks, setCurrentLandmarks] = useState<number[][]>([]);

  // Get MediaPipe landmarks for gesture
  const getMediaPipeLandmarks = (gestureType: string): number[][] => {
    const gestureData = ASL_WORDS[gestureType.toUpperCase()] || ASL_LETTERS[gestureType.toUpperCase()];
    
    if (!gestureData) {
      return getNeutralLandmarks();
    }

    // Convert finger positions to MediaPipe landmarks
    const fingerPositions = gestureData.fingerPositions;
    const landmarks: number[][] = [];

    // Base hand position
    const baseX = 0;
    const baseY = 0;
    const baseZ = 0;

    // Wrist (landmark 0)
    landmarks.push([baseX, baseY - 0.05, baseZ]);

    // Thumb landmarks (1-4)
    const thumbBend = 1 - fingerPositions.thumb[0];
    landmarks.push([baseX + 0.02, baseY - 0.03, baseZ]); // CMC
    landmarks.push([baseX + 0.03, baseY - 0.01, baseZ]); // MCP
    landmarks.push([baseX + 0.04, baseY + 0.01, baseZ]); // IP
    landmarks.push([baseX + 0.05, baseY + 0.02 + (thumbBend * 0.02), baseZ]); // TIP

    // Index finger landmarks (5-8)
    const indexBend = 1 - fingerPositions.index[0];
    const indexSpread = fingerPositions.index[1];
    landmarks.push([baseX + 0.01 * indexSpread, baseY + 0.01, baseZ]); // MCP
    landmarks.push([baseX + 0.02 * indexSpread, baseY + 0.035, baseZ]); // PIP
    landmarks.push([baseX + 0.03 * indexSpread, baseY + 0.06, baseZ]); // DIP
    landmarks.push([baseX + 0.04 * indexSpread, baseY + 0.08 + (indexBend * 0.03), baseZ]); // TIP

    // Middle finger landmarks (9-12)
    const middleBend = 1 - fingerPositions.middle[0];
    const middleSpread = fingerPositions.middle[1];
    landmarks.push([baseX + 0.005 * middleSpread, baseY + 0.01, baseZ]); // MCP
    landmarks.push([baseX + 0.01 * middleSpread, baseY + 0.04, baseZ]); // PIP
    landmarks.push([baseX + 0.015 * middleSpread, baseY + 0.07, baseZ]); // DIP
    landmarks.push([baseX + 0.02 * middleSpread, baseY + 0.1 + (middleBend * 0.04), baseZ]); // TIP

    // Ring finger landmarks (13-16)
    const ringBend = 1 - fingerPositions.ring[0];
    const ringSpread = fingerPositions.ring[1];
    landmarks.push([baseX - 0.005 * ringSpread, baseY + 0.01, baseZ]); // MCP
    landmarks.push([baseX - 0.01 * ringSpread, baseY + 0.035, baseZ]); // PIP
    landmarks.push([baseX - 0.015 * ringSpread, baseY + 0.06, baseZ]); // DIP
    landmarks.push([baseX - 0.02 * ringSpread, baseY + 0.08 + (ringBend * 0.03), baseZ]); // TIP

    // Pinky finger landmarks (17-20)
    const pinkyBend = 1 - fingerPositions.pinky[0];
    const pinkySpread = fingerPositions.pinky[1];
    landmarks.push([baseX - 0.01 * pinkySpread, baseY + 0.005, baseZ]); // MCP
    landmarks.push([baseX - 0.02 * pinkySpread, baseY + 0.025, baseZ]); // PIP
    landmarks.push([baseX - 0.025 * pinkySpread, baseY + 0.045, baseZ]); // DIP
    landmarks.push([baseX - 0.03 * pinkySpread, baseY + 0.06 + (pinkyBend * 0.02), baseZ]); // TIP

    return landmarks;
  };

  const getNeutralLandmarks = (): number[][] => {
    const landmarks: number[][] = [];
    const baseX = 0;
    const baseY = 0;
    const baseZ = 0;

    // Wrist
    landmarks.push([baseX, baseY - 0.05, baseZ]);

    // Thumb
    landmarks.push([baseX + 0.02, baseY - 0.03, baseZ]);
    landmarks.push([baseX + 0.03, baseY - 0.01, baseZ]);
    landmarks.push([baseX + 0.04, baseY + 0.01, baseZ]);
    landmarks.push([baseX + 0.05, baseY + 0.02, baseZ]);

    // Other fingers (slightly bent)
    for (let finger = 0; finger < 4; finger++) {
      const xOffset = (finger - 1.5) * 0.01;
      landmarks.push([baseX + xOffset, baseY + 0.01, baseZ]); // MCP
      landmarks.push([baseX + xOffset * 1.2, baseY + 0.035, baseZ]); // PIP
      landmarks.push([baseX + xOffset * 1.4, baseY + 0.06, baseZ]); // DIP
      landmarks.push([baseX + xOffset * 1.6, baseY + 0.08, baseZ]); // TIP
    }

    return landmarks;
  };

  useEffect(() => {
    const landmarks = getMediaPipeLandmarks(gesture);
    setTargetLandmarks(landmarks);
  }, [gesture]);

  // Smooth animation to target landmarks
  useFrame((state) => {
    if (!leftHandRef.current || !rightHandRef.current || targetLandmarks.length === 0) return;

    // Smooth interpolation for landmarks
    const updatedLandmarks: number[][] = [];
    
    for (let i = 0; i < targetLandmarks.length; i++) {
      const target = targetLandmarks[i];
      const current = currentLandmarks[i] || [0, 0, 0];
      
      const interpolated: number[] = [
        THREE.MathUtils.lerp(current[0], target[0], 0.1),
        THREE.MathUtils.lerp(current[1], target[1], 0.1),
        THREE.MathUtils.lerp(current[2], target[2], 0.1),
      ];
      
      updatedLandmarks.push(interpolated);
    }
    
    setCurrentLandmarks(updatedLandmarks);

    // Apply gesture-specific animations while keeping hands centered
    if (gesture.toUpperCase() === 'HELLO') {
      const waveAmount = Math.sin(state.clock.elapsedTime * 3) * 0.3;
      rightHandRef.current.rotation.z = THREE.MathUtils.lerp(
        rightHandRef.current.rotation.z,
        waveAmount,
        0.1
      );
    } else if (gesture.toUpperCase() === 'THANK') {
      const slideAmount = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      rightHandRef.current.position.x = THREE.MathUtils.lerp(
        rightHandRef.current.position.x,
        0.15 + slideAmount,
        0.1
      );
    } else if (gesture.toUpperCase() === 'PLEASE') {
      const circleAmount = Math.sin(state.clock.elapsedTime * 2.5) * 0.05;
      rightHandRef.current.position.x = THREE.MathUtils.lerp(
        rightHandRef.current.position.x,
        0.15 + circleAmount,
        0.1
      );
      rightHandRef.current.position.y = THREE.MathUtils.lerp(
        rightHandRef.current.position.y,
        Math.cos(state.clock.elapsedTime * 2.5) * 0.05,
        0.1
      );
    } else if (gesture.toUpperCase() === 'NO') {
      const wiggleAmount = Math.sin(state.clock.elapsedTime * 8) * 0.2;
      rightHandRef.current.rotation.z = THREE.MathUtils.lerp(
        rightHandRef.current.rotation.z,
        wiggleAmount,
        0.1
      );
    }
  });

  const createRealisticHandFromLandmarks = (
    handRef: React.RefObject<THREE.Group>,
    isRight: boolean,
    landmarks: number[][]
  ) => {
    if (landmarks.length === 0) return null;

    const handScale = scale * 1.2;
    // Center the hands in the middle of the screen
    const handPosition = isRight ? [0.15, 0, 0] : [-0.15, 0, 0];

    return (
      <group 
        ref={handRef} 
        position={handPosition as [number, number, number]} 
        scale={[handScale, handScale, handScale]}
      >
        {/* Palm */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[HAND_PROPORTIONS.palmWidth, HAND_PROPORTIONS.palmHeight, 0.02]} />
          <meshStandardMaterial 
            color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>

        {/* Draw connections between landmarks */}
        {landmarks.map((landmark, index) => {
          if (index === 0) return null; // Skip wrist for individual spheres
          
          return (
            <mesh 
              key={index}
              position={[landmark[0], landmark[1], landmark[2]]} 
              castShadow receiveShadow
            >
              <sphereGeometry args={[0.003, 8, 8]} />
              <meshStandardMaterial 
                color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
          );
        })}

        {/* Draw finger connections */}
        {(() => {
          const connections: [number, number][] = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [5, 9], [9, 10], [10, 11], [11, 12], // Middle
            [9, 13], [13, 14], [14, 15], [15, 16], // Ring
            [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
          ];

          return connections.map(([start, end], index) => {
            if (start >= landmarks.length || end >= landmarks.length) return null;
            
            const startPos = landmarks[start];
            const endPos = landmarks[end];
            const midX = (startPos[0] + endPos[0]) / 2;
            const midY = (startPos[1] + endPos[1]) / 2;
            const midZ = (startPos[2] + endPos[2]) / 2;
            const length = Math.sqrt(
              Math.pow(endPos[0] - startPos[0], 2) + 
              Math.pow(endPos[1] - startPos[1], 2) + 
              Math.pow(endPos[2] - startPos[2], 2)
            );

            return (
              <mesh key={index} position={[midX, midY, midZ]} castShadow receiveShadow>
                <capsuleGeometry args={[0.002, length, 6, 12]} />
                <meshStandardMaterial 
                  color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                  roughness={0.85}
                  metalness={0.05}
                />
              </mesh>
            );
          });
        })()}

        {/* Subtle glow effect when animating */}
        {isAnimating && (
          <pointLight
            position={[0, 0.05, 0.05]}
            color="#ff6b6b"
            intensity={0.2}
            distance={0.15}
          />
        )}
      </group>
    );
  };

  return (
    <group scale={[scale, scale, scale]}>
      {/* Left Hand */}
      {createRealisticHandFromLandmarks(leftHandRef, false, currentLandmarks)}
      
      {/* Right Hand */}
      {createRealisticHandFromLandmarks(rightHandRef, true, currentLandmarks)}
      
      {/* Gesture indicator */}
      {gesture !== 'idle' && (
        <group position={[0, 0.8, 0]}>
          <mesh position={[0, 0, 0.01]} castShadow>
            <boxGeometry args={[0.6, 0.2, 0.03]} />
            <meshStandardMaterial 
              color="#1a1a2e" 
              emissive="#ff6b6b"
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.55, 0.15]} />
            <meshBasicMaterial color="#ff6b6b" />
          </mesh>
        </group>
      )}
      
      {/* Ambient lighting */}
      {isAnimating && (
        <>
          <pointLight
            position={[0, 0.5, 0.3]}
            color="#ff6b6b"
            intensity={0.8}
            distance={2}
          />
          <pointLight
            position={[0, 0.5, -0.3]}
            color="#4ecdc4"
            intensity={0.6}
            distance={1.5}
          />
        </>
      )}
    </group>
  );
}
