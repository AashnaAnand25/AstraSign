import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ASLGesture, FingerPositions } from "@/data/aslGestures";

interface AdvancedHandProps {
  gesture?: ASLGesture;
  isRight?: boolean;
  isAnimating?: boolean;
  position?: [number, number, number];
  scale?: number;
}

interface FingerJoints {
  proximal: THREE.Mesh;
  middle: THREE.Mesh;
  distal: THREE.Mesh;
}

export default function AdvancedHand({ 
  gesture, 
  isRight = false, 
  isAnimating = false,
  position = [0, 0, 0],
  scale = 1
}: AdvancedHandProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [targetPositions, setTargetPositions] = useState<FingerPositions | null>(null);
  const [currentPositions, setCurrentPositions] = useState<FingerPositions>({
    thumb: [0.5, 0.5, 0.5],
    index: [0.5, 0.5, 0.5],
    middle: [0.5, 0.5, 0.5],
    ring: [0.5, 0.5, 0.5],
    pinky: [0.5, 0.5, 0.5],
  });

  // Create finger joints with proper anatomy
  const createFinger = (name: string, basePosition: [number, number, number]) => {
    const finger = useMemo(() => {
      const group = new THREE.Group();
      
      // Proximal phalanx (closest to palm)
      const proximal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.01, 0.04, 8),
        new THREE.MeshStandardMaterial({
          color: isAnimating ? "#00ffff" : "#f4c2a1",
          roughness: 0.8,
          metalness: 0.1,
        })
      );
      proximal.position.set(...basePosition);
      proximal.castShadow = true;
      group.add(proximal);

      // Middle phalanx
      const middle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.008, 0.03, 8),
        new THREE.MeshStandardMaterial({
          color: isAnimating ? "#00ffff" : "#f4c2a1",
          roughness: 0.8,
          metalness: 0.1,
        })
      );
      middle.position.set(basePosition[0], basePosition[1] + 0.035, basePosition[2]);
      middle.castShadow = true;
      group.add(middle);

      // Distal phalanx (fingertip)
      const distal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.007, 0.025, 8),
        new THREE.MeshStandardMaterial({
          color: isAnimating ? "#00ffff" : "#f4c2a1",
          roughness: 0.8,
          metalness: 0.1,
        })
      );
      distal.position.set(basePosition[0], basePosition[1] + 0.065, basePosition[2]);
      distal.castShadow = true;
      group.add(distal);

      // Fingertip pad
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.006, 8, 8),
        new THREE.MeshStandardMaterial({
          color: isAnimating ? "#00ffff" : "#f4c2a1",
          roughness: 0.3,
          metalness: 0.2,
        })
      );
      tip.position.set(basePosition[0], basePosition[1] + 0.08, basePosition[2]);
      group.add(tip);

      return { proximal, middle, distal, group, tip };
    }, [isAnimating]);

    return finger;
  };

  // Create all fingers
  const fingers = useMemo(() => {
    const thumbBase: [number, number, number] = isRight ? [0.04, 0.02, 0] : [-0.04, 0.02, 0];
    const indexBase: [number, number, number] = isRight ? [0.02, 0.08, 0] : [-0.02, 0.08, 0];
    const middleBase: [number, number, number] = [0, 0.08, 0];
    const ringBase: [number, number, number] = isRight ? [-0.02, 0.08, 0] : [0.02, 0.08, 0];
    const pinkyBase: [number, number, number] = isRight ? [-0.04, 0.07, 0] : [0.04, 0.07, 0];

    return {
      thumb: createFinger('thumb', thumbBase),
      index: createFinger('index', indexBase),
      middle: createFinger('middle', middleBase),
      ring: createFinger('ring', ringBase),
      pinky: createFinger('pinky', pinkyBase),
    };
  }, [isRight, isAnimating]);

  // Create palm
  const palm = useMemo(() => {
    const geometry = new THREE.BoxGeometry(0.08, 0.1, 0.02);
    const material = new THREE.MeshStandardMaterial({
      color: isAnimating ? "#00ffff" : "#f4c2a1",
      roughness: 0.8,
      metalness: 0.1,
    });
    return new THREE.Mesh(geometry, material);
  }, [isAnimating]);

  // Create wrist
  const wrist = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.03, 0.04, 0.06, 8);
    const material = new THREE.MeshStandardMaterial({
      color: "#4a5568",
      roughness: 0.8,
      metalness: 0.2,
    });
    return new THREE.Mesh(geometry, material);
  }, []);

  // Update target positions when gesture changes
  useEffect(() => {
    if (gesture) {
      setTargetPositions(gesture.fingerPositions);
    }
  }, [gesture]);

  // Animate finger positions
  useFrame((state) => {
    if (!groupRef.current || !targetPositions) return;

    // Smooth interpolation for each finger
    Object.keys(targetPositions).forEach((fingerName) => {
      const finger = fingers[fingerName as keyof typeof fingers];
      const target = targetPositions[fingerName as keyof FingerPositions];
      
      // Animate each joint based on gesture parameters
      const [bend, spread, rotation] = target;
      
      // Proximal joint (knuckle)
      finger.proximal.rotation.x = THREE.MathUtils.lerp(
        finger.proximal.rotation.x,
        bend * Math.PI * 0.8,
        0.1
      );
      finger.proximal.rotation.z = THREE.MathUtils.lerp(
        finger.proximal.rotation.z,
        spread * 0.3,
        0.1
      );

      // Middle joint
      finger.middle.rotation.x = THREE.MathUtils.lerp(
        finger.middle.rotation.x,
        bend * Math.PI * 0.6,
        0.1
      );

      // Distal joint (fingertip)
      finger.distal.rotation.x = THREE.MathUtils.lerp(
        finger.distal.rotation.x,
        bend * Math.PI * 0.4,
        0.1
      );

      // Apply rotation for gestures like 'R' (crossed fingers)
      if (rotation !== 0) {
        finger.group.rotation.z = THREE.MathUtils.lerp(
          finger.group.rotation.z,
          rotation,
          0.1
        );
      }
    });

    // Apply gesture-specific movements
    if (gesture?.movement === 'wave' && gesture.name === 'HELLO') {
      const waveAmount = Math.sin(state.clock.elapsedTime * 4) * 0.5;
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        waveAmount,
        0.1
      );
    }

    if (gesture?.movement === 'circle' && gesture.name === 'PLEASE') {
      const circleTime = state.clock.elapsedTime * 2;
      groupRef.current.position.x = Math.cos(circleTime) * 0.1;
      groupRef.current.position.y = Math.sin(circleTime) * 0.1;
    }

    if (gesture?.movement === 'bounce' && gesture.name === 'YES') {
      const bounceAmount = Math.abs(Math.sin(state.clock.elapsedTime * 3)) * 0.1;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        position[1] + bounceAmount,
        0.1
      );
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Palm */}
      <primitive object={palm} position={[0, 0.05, 0]} castShadow receiveShadow />
      
      {/* Wrist */}
      <primitive object={wrist} position={[0, -0.05, 0]} castShadow />
      
      {/* All fingers */}
      {Object.values(fingers).map((finger) => (
        <primitive key={finger.group.uuid} object={finger.group} />
      ))}
      
      {/* Glow effect when animating */}
      {isAnimating && (
        <pointLight
          position={[0, 0.1, 0.1]}
          color="#00ffff"
          intensity={0.5}
          distance={0.3}
        />
      )}
    </group>
  );
}
