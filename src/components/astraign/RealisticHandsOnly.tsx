import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ASL_LETTERS, ASL_WORDS } from "@/data/aslGestures";

interface RealisticHandsOnlyProps {
  gesture: string;
  isAnimating?: boolean;
  scale?: number;
}

interface FingerConfig {
  thumb: { bend: number; spread: number; rotation: number };
  index: { bend: number; spread: number; rotation: number };
  middle: { bend: number; spread: number; rotation: number };
  ring: { bend: number; spread: number; rotation: number };
  pinky: { bend: number; spread: number; rotation: number };
}

interface HandPosition {
  x: number;
  y: number;
  z: number;
  rotation: number;
  tilt: number;
}

export default function RealisticHandsOnly({ 
  gesture, 
  isAnimating = false,
  scale = 1
}: RealisticHandsOnlyProps) {
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const [targetConfig, setTargetConfig] = useState<FingerConfig | null>(null);
  const [currentConfig, setCurrentConfig] = useState<FingerConfig>({
    thumb: { bend: 0.5, spread: 0.5, rotation: 0.5 },
    index: { bend: 0.5, spread: 0.5, rotation: 0.5 },
    middle: { bend: 0.5, spread: 0.5, rotation: 0.5 },
    ring: { bend: 0.5, spread: 0.5, rotation: 0.5 },
    pinky: { bend: 0.5, spread: 0.5, rotation: 0.5 },
  });
  const [leftHandPosition, setLeftHandPosition] = useState<HandPosition>({ x: -0.4, y: 0.3, z: 0.2, rotation: 0, tilt: 0 });
  const [rightHandPosition, setRightHandPosition] = useState<HandPosition>({ x: 0.4, y: 0.3, z: 0.2, rotation: 0, tilt: 0 });

  // Get gesture configuration from complete database
  const getGestureConfig = (gestureType: string): FingerConfig => {
    // First check if it's a word
    const wordGesture = ASL_WORDS[gestureType.toUpperCase()];
    if (wordGesture) {
      return {
        thumb: { bend: wordGesture.fingerPositions.thumb[0], spread: wordGesture.fingerPositions.thumb[1], rotation: wordGesture.fingerPositions.thumb[2] },
        index: { bend: wordGesture.fingerPositions.index[0], spread: wordGesture.fingerPositions.index[1], rotation: wordGesture.fingerPositions.index[2] },
        middle: { bend: wordGesture.fingerPositions.middle[0], spread: wordGesture.fingerPositions.middle[1], rotation: wordGesture.fingerPositions.middle[2] },
        ring: { bend: wordGesture.fingerPositions.ring[0], spread: wordGesture.fingerPositions.ring[1], rotation: wordGesture.fingerPositions.ring[2] },
        pinky: { bend: wordGesture.fingerPositions.pinky[0], spread: wordGesture.fingerPositions.pinky[1], rotation: wordGesture.fingerPositions.pinky[2] },
      };
    }
    
    // Then check if it's a letter
    const letterGesture = ASL_LETTERS[gestureType.toUpperCase()];
    if (letterGesture) {
      return {
        thumb: { bend: letterGesture.fingerPositions.thumb[0], spread: letterGesture.fingerPositions.thumb[1], rotation: letterGesture.fingerPositions.thumb[2] },
        index: { bend: letterGesture.fingerPositions.index[0], spread: letterGesture.fingerPositions.index[1], rotation: letterGesture.fingerPositions.index[2] },
        middle: { bend: letterGesture.fingerPositions.middle[0], spread: letterGesture.fingerPositions.middle[1], rotation: letterGesture.fingerPositions.middle[2] },
        ring: { bend: letterGesture.fingerPositions.ring[0], spread: letterGesture.fingerPositions.ring[1], rotation: letterGesture.fingerPositions.ring[2] },
        pinky: { bend: letterGesture.fingerPositions.pinky[0], spread: letterGesture.fingerPositions.pinky[1], rotation: letterGesture.fingerPositions.pinky[2] },
      };
    }
    
    // Fallback to default
    return {
      thumb: { bend: 0.5, spread: 0.5, rotation: 0.5 },
      index: { bend: 0.5, spread: 0.5, rotation: 0.5 },
      middle: { bend: 0.5, spread: 0.5, rotation: 0.5 },
      ring: { bend: 0.5, spread: 0.5, rotation: 0.5 },
      pinky: { bend: 0.5, spread: 0.5, rotation: 0.5 },
    };
  };

  // Get hand positions based on gesture
  const getHandPositions = (gestureType: string): { left: HandPosition; right: HandPosition } => {
    const gestureUpper = gestureType.toUpperCase();
    
    // Default positions
    let leftPos: HandPosition = { x: -0.4, y: 0.3, z: 0.2, rotation: -0.2, tilt: 0.1 };
    let rightPos: HandPosition = { x: 0.4, y: 0.3, z: 0.2, rotation: 0.2, tilt: -0.1 };
    
    // Adjust positions based on gesture
    switch (gestureUpper) {
      case 'HELLO':
        leftPos = { x: -0.5, y: 0.4, z: 0.3, rotation: -0.3, tilt: 0.2 };
        rightPos = { x: 0.5, y: 0.4, z: 0.3, rotation: 0.3, tilt: -0.2 };
        break;
      case 'THANK':
        leftPos = { x: -0.3, y: 0.2, z: 0.1, rotation: -0.1, tilt: 0.0 };
        rightPos = { x: 0.3, y: 0.2, z: 0.1, rotation: 0.1, tilt: 0.0 };
        break;
      case 'PLEASE':
        leftPos = { x: -0.4, y: 0.1, z: 0.2, rotation: -0.2, tilt: 0.1 };
        rightPos = { x: 0.4, y: 0.1, z: 0.2, rotation: 0.2, tilt: -0.1 };
        break;
      case 'LOVE':
        leftPos = { x: -0.3, y: 0.0, z: 0.1, rotation: -0.1, tilt: 0.0 };
        rightPos = { x: 0.3, y: 0.0, z: 0.1, rotation: 0.1, tilt: 0.0 };
        break;
      case 'YES':
        leftPos = { x: -0.4, y: 0.3, z: 0.2, rotation: -0.2, tilt: 0.1 };
        rightPos = { x: 0.4, y: 0.3, z: 0.2, rotation: 0.2, tilt: -0.1 };
        break;
      case 'NO':
        leftPos = { x: -0.4, y: 0.3, z: 0.2, rotation: -0.2, tilt: 0.1 };
        rightPos = { x: 0.4, y: 0.3, z: 0.2, rotation: 0.2, tilt: -0.1 };
        break;
      case 'YOU':
        leftPos = { x: -0.3, y: 0.3, z: 0.2, rotation: -0.1, tilt: 0.0 };
        rightPos = { x: 0.5, y: 0.3, z: 0.2, rotation: 0.3, tilt: -0.1 };
        break;
      case 'HOW':
        leftPos = { x: -0.4, y: 0.3, z: 0.2, rotation: -0.2, tilt: 0.1 };
        rightPos = { x: 0.4, y: 0.3, z: 0.2, rotation: 0.2, tilt: -0.1 };
        break;
      case 'ARE':
        leftPos = { x: -0.4, y: 0.3, z: 0.2, rotation: -0.2, tilt: 0.1 };
        rightPos = { x: 0.4, y: 0.3, z: 0.2, rotation: 0.2, tilt: -0.1 };
        break;
      default:
        // For letters, adjust based on handshape complexity
        if (['A', 'S', 'T'].includes(gestureUpper)) {
          // Fist gestures - hands closer together
          leftPos = { x: -0.3, y: 0.3, z: 0.2, rotation: -0.1, tilt: 0.0 };
          rightPos = { x: 0.3, y: 0.3, z: 0.2, rotation: 0.1, tilt: 0.0 };
        } else if (['B', '5'].includes(gestureUpper)) {
          // Open hands - wider spread
          leftPos = { x: -0.5, y: 0.3, z: 0.2, rotation: -0.3, tilt: 0.1 };
          rightPos = { x: 0.5, y: 0.3, z: 0.2, rotation: 0.3, tilt: -0.1 };
        } else if (['V', '2'].includes(gestureUpper)) {
          // Peace signs - hands angled outward
          leftPos = { x: -0.4, y: 0.3, z: 0.2, rotation: -0.4, tilt: 0.2 };
          rightPos = { x: 0.4, y: 0.3, z: 0.2, rotation: 0.4, tilt: -0.2 };
        } else if (['Y'].includes(gestureUpper)) {
          // Y sign - hands spread wide
          leftPos = { x: -0.5, y: 0.3, z: 0.2, rotation: -0.3, tilt: 0.1 };
          rightPos = { x: 0.5, y: 0.3, z: 0.2, rotation: 0.3, tilt: -0.1 };
        }
        break;
    }
    
    return { left: leftPos, right: rightPos };
  };

  useEffect(() => {
    const config = getGestureConfig(gesture);
    setTargetConfig(config);
    
    const positions = getHandPositions(gesture);
    setLeftHandPosition(positions.left);
    setRightHandPosition(positions.right);
  }, [gesture]);

  // Smooth animation for finger movements and hand positions
  useFrame((state) => {
    if (!leftHandRef.current || !rightHandRef.current || !targetConfig) return;

    // Smooth finger interpolation
    const updatedConfig: FingerConfig = {
      thumb: {
        bend: THREE.MathUtils.lerp(currentConfig.thumb.bend, targetConfig.thumb.bend, 0.1),
        spread: THREE.MathUtils.lerp(currentConfig.thumb.spread, targetConfig.thumb.spread, 0.1),
        rotation: THREE.MathUtils.lerp(currentConfig.thumb.rotation, targetConfig.thumb.rotation, 0.1),
      },
      index: {
        bend: THREE.MathUtils.lerp(currentConfig.index.bend, targetConfig.index.bend, 0.1),
        spread: THREE.MathUtils.lerp(currentConfig.index.spread, targetConfig.index.spread, 0.1),
        rotation: THREE.MathUtils.lerp(currentConfig.index.rotation, targetConfig.index.rotation, 0.1),
      },
      middle: {
        bend: THREE.MathUtils.lerp(currentConfig.middle.bend, targetConfig.middle.bend, 0.1),
        spread: THREE.MathUtils.lerp(currentConfig.middle.spread, targetConfig.middle.spread, 0.1),
        rotation: THREE.MathUtils.lerp(currentConfig.middle.rotation, targetConfig.middle.rotation, 0.1),
      },
      ring: {
        bend: THREE.MathUtils.lerp(currentConfig.ring.bend, targetConfig.ring.bend, 0.1),
        spread: THREE.MathUtils.lerp(currentConfig.ring.spread, targetConfig.ring.spread, 0.1),
        rotation: THREE.MathUtils.lerp(currentConfig.ring.rotation, targetConfig.ring.rotation, 0.1),
      },
      pinky: {
        bend: THREE.MathUtils.lerp(currentConfig.pinky.bend, targetConfig.pinky.bend, 0.1),
        spread: THREE.MathUtils.lerp(currentConfig.pinky.spread, targetConfig.pinky.spread, 0.1),
        rotation: THREE.MathUtils.lerp(currentConfig.pinky.rotation, targetConfig.pinky.rotation, 0.1),
      },
    };
    setCurrentConfig(updatedConfig);

    // Smooth hand position interpolation
    const currentLeftPos = {
      x: THREE.MathUtils.lerp(leftHandRef.current.position.x, leftHandPosition.x, 0.08),
      y: THREE.MathUtils.lerp(leftHandRef.current.position.y, leftHandPosition.y, 0.08),
      z: THREE.MathUtils.lerp(leftHandRef.current.position.z, leftHandPosition.z, 0.08),
    };
    const currentRightPos = {
      x: THREE.MathUtils.lerp(rightHandRef.current.position.x, rightHandPosition.x, 0.08),
      y: THREE.MathUtils.lerp(rightHandRef.current.position.y, rightHandPosition.y, 0.08),
      z: THREE.MathUtils.lerp(rightHandRef.current.position.z, rightHandPosition.z, 0.08),
    };

    leftHandRef.current.position.set(currentLeftPos.x, currentLeftPos.y, currentLeftPos.z);
    rightHandRef.current.position.set(currentRightPos.x, currentRightPos.y, currentRightPos.z);

    // Gesture-specific animations
    if (gesture.toUpperCase() === 'HELLO') {
      const waveAmount = Math.sin(state.clock.elapsedTime * 3) * 0.6;
      rightHandRef.current.rotation.z = THREE.MathUtils.lerp(
        rightHandRef.current.rotation.z,
        waveAmount,
        0.1
      );
    } else if (gesture.toUpperCase() === 'THANK') {
      const slideAmount = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      rightHandRef.current.position.x = THREE.MathUtils.lerp(
        rightHandRef.current.position.x,
        rightHandPosition.x + slideAmount,
        0.1
      );
    } else if (gesture.toUpperCase() === 'PLEASE') {
      const circleAmount = Math.sin(state.clock.elapsedTime * 2.5) * 0.1;
      rightHandRef.current.position.x = THREE.MathUtils.lerp(
        rightHandRef.current.position.x,
        rightHandPosition.x + circleAmount,
        0.1
      );
      rightHandRef.current.position.y = THREE.MathUtils.lerp(
        rightHandRef.current.position.y,
        rightHandPosition.y + Math.cos(state.clock.elapsedTime * 2.5) * 0.1,
        0.1
      );
    } else if (gesture.toUpperCase() === 'NO') {
      const wiggleAmount = Math.sin(state.clock.elapsedTime * 8) * 0.3;
      rightHandRef.current.rotation.z = THREE.MathUtils.lerp(
        rightHandRef.current.rotation.z,
        wiggleAmount,
        0.1
      );
    }
  });

  const createRealisticHand = (
    handRef: React.RefObject<THREE.Group>,
    isRight: boolean,
    config: FingerConfig
  ) => {
    const handScale = scale * 0.8; // Make hands smaller and more realistic
    
    return (
      <group ref={handRef} scale={[handScale, handScale, handScale]}>
        {/* Palm - more realistic shape */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.1, 0.025]} />
          <meshStandardMaterial 
            color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        
        {/* Thumb - more realistic */}
        <group position={[0.05, 0.02, 0]}>
          <group rotation={[config.thumb.bend * 1.0, 0, config.thumb.rotation]}>
            <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.006, 0.025, 6, 12]} />
              <meshStandardMaterial 
                color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            <group position={[0, 0.025, 0]} rotation={[config.thumb.bend * 0.8, 0, 0]}>
              <mesh position={[0, 0.018, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.005, 0.018, 6, 12]} />
                <meshStandardMaterial 
                  color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                  roughness={0.8}
                  metalness={0.05}
                />
              </mesh>
              <group position={[0, 0.018, 0]} rotation={[config.thumb.bend * 0.6, 0, 0]}>
                <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
                  <capsuleGeometry args={[0.004, 0.012, 6, 12]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.8}
                    metalness={0.05}
                  />
                </mesh>
                {/* Thumb tip - smaller */}
                <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
                  <sphereGeometry args={[0.004, 6, 6]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.6}
                    metalness={0.05}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
        
        {/* Index Finger - more slender */}
        <group position={[0.025, 0.07, 0]}>
          <group rotation={[config.index.bend * 1.1, 0, config.index.rotation]}>
            <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.006, 0.04, 6, 12]} />
              <meshStandardMaterial 
                color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            <group position={[0, 0.035, 0]} rotation={[config.index.bend * 0.9, 0, 0]}>
              <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.005, 0.03, 6, 12]} />
                <meshStandardMaterial 
                  color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                  roughness={0.8}
                  metalness={0.05}
                />
              </mesh>
              <group position={[0, 0.03, 0]} rotation={[config.index.bend * 0.7, 0, 0]}>
                <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
                  <capsuleGeometry args={[0.004, 0.025, 6, 12]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.8}
                    metalness={0.05}
                  />
                </mesh>
                {/* Index tip - smaller */}
                <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
                  <sphereGeometry args={[0.0035, 6, 6]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.6}
                    metalness={0.05}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
        
        {/* Middle Finger - longest */}
        <group position={[0, 0.07, 0]}>
          <group rotation={[config.middle.bend * 1.1, 0, config.middle.rotation]}>
            <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.006, 0.045, 6, 12]} />
              <meshStandardMaterial 
                color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            <group position={[0, 0.04, 0]} rotation={[config.middle.bend * 0.9, 0, 0]}>
              <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.005, 0.035, 6, 12]} />
                <meshStandardMaterial 
                  color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                  roughness={0.8}
                  metalness={0.05}
                />
              </mesh>
              <group position={[0, 0.035, 0]} rotation={[config.middle.bend * 0.7, 0, 0]}>
                <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
                  <capsuleGeometry args={[0.004, 0.03, 6, 12]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.8}
                    metalness={0.05}
                  />
                </mesh>
                {/* Middle tip */}
                <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
                  <sphereGeometry args={[0.0035, 6, 6]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.6}
                    metalness={0.05}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
        
        {/* Ring Finger - shorter than middle */}
        <group position={[-0.025, 0.07, 0]}>
          <group rotation={[config.ring.bend * 1.1, 0, config.ring.rotation]}>
            <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.0055, 0.04, 6, 12]} />
              <meshStandardMaterial 
                color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            <group position={[0, 0.035, 0]} rotation={[config.ring.bend * 0.9, 0, 0]}>
              <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.0045, 0.03, 6, 12]} />
                <meshStandardMaterial 
                  color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                  roughness={0.8}
                  metalness={0.05}
                />
              </mesh>
              <group position={[0, 0.03, 0]} rotation={[config.ring.bend * 0.7, 0, 0]}>
                <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
                  <capsuleGeometry args={[0.0035, 0.025, 6, 12]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.8}
                    metalness={0.05}
                  />
                </mesh>
                {/* Ring tip */}
                <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
                  <sphereGeometry args={[0.003, 6, 6]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.6}
                    metalness={0.05}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
        
        {/* Pinky - shortest finger */}
        <group position={[-0.05, 0.06, 0]}>
          <group rotation={[config.pinky.bend * 1.1, 0, config.pinky.rotation]}>
            <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.0045, 0.035, 6, 12]} />
              <meshStandardMaterial 
                color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            <group position={[0, 0.03, 0]} rotation={[config.pinky.bend * 0.9, 0, 0]}>
              <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.0035, 0.025, 6, 12]} />
                <meshStandardMaterial 
                  color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                  roughness={0.8}
                  metalness={0.05}
                />
              </mesh>
              <group position={[0, 0.025, 0]} rotation={[config.pinky.bend * 0.7, 0, 0]}>
                <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
                  <capsuleGeometry args={[0.0025, 0.02, 6, 12]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.8}
                    metalness={0.05}
                  />
                </mesh>
                {/* Pinky tip - smallest */}
                <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
                  <sphereGeometry args={[0.0025, 6, 6]} />
                  <meshStandardMaterial 
                    color={isAnimating ? "#fdbcb4" : "#f4c2a1"} 
                    roughness={0.6}
                    metalness={0.05}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
        
        {/* Wrist - smaller */}
        <mesh position={[0, -0.08, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.04, 0.06, 6, 12]} />
          <meshStandardMaterial 
            color="#d4a574" 
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        
        {/* Subtle hand glow effect when animating */}
        {isAnimating && (
          <pointLight
            position={[0, 0.03, 0.03]}
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
      {createRealisticHand(leftHandRef, false, currentConfig)}
      
      {/* Right Hand */}
      {createRealisticHand(rightHandRef, true, currentConfig)}
      
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
      
      {/* Ambient lighting for hands */}
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
