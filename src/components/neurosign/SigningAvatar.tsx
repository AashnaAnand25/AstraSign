import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ASLAnimationId } from "@/data/aslAnimationMap";

interface SigningAvatarProps {
  currentAnimation: ASLAnimationId;
  animationQueue: ASLAnimationId[];
  queueIndex: number;
  isAnimating: boolean;
  position?: [number, number, number];
}

const ANIMATION_DURATION = 1.8; // seconds per sign

export default function SigningAvatar({
  currentAnimation,
  animationQueue,
  queueIndex,
  isAnimating,
  position = [0, 0, 0],
}: SigningAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const [animProgress, setAnimProgress] = useState(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (currentAnimation && currentAnimation !== "idle") {
      startTimeRef.current = performance.now() / 1000;
    }
  }, [currentAnimation, queueIndex]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime - (startTimeRef.current || 0);
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
    setAnimProgress(progress);

    if (!leftArmRef.current || !rightArmRef.current || !leftHandRef.current || !rightHandRef.current) return;

    const t = progress;
    const easeOut = 1 - Math.pow(1 - t, 2);

    // Base rest pose
    let leftArmRot = new THREE.Euler(-0.3, 0, 0.2);
    let rightArmRot = new THREE.Euler(-0.3, 0, -0.2);
    let leftHandRot = new THREE.Euler(0, 0, 0);
    let rightHandRot = new THREE.Euler(0, 0, 0);

    switch (currentAnimation) {
      case "hello":
        // Wave from forehead - right hand up, wave side to side
        rightArmRot = new THREE.Euler(-1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.15, 0, -0.3);
        rightHandRot = new THREE.Euler(0, 0, Math.sin(state.clock.elapsedTime * 5) * 0.4);
        break;
      case "yes":
        // Fist bounce - both arms, nodding motion
        const bounce = Math.sin(state.clock.elapsedTime * 6) * 0.15;
        leftArmRot = new THREE.Euler(-0.5 + bounce, 0, 0.3);
        rightArmRot = new THREE.Euler(-0.5 + bounce, 0, -0.3);
        break;
      case "no":
        // Side-to-side - index/middle wiggle
        const wiggle = Math.sin(state.clock.elapsedTime * 8) * 0.25;
        leftArmRot = new THREE.Euler(-0.6, wiggle, 0.4);
        rightArmRot = new THREE.Euler(-0.6, -wiggle, -0.4);
        rightHandRot = new THREE.Euler(0, wiggle * 0.5, 0);
        break;
      case "thank":
      case "thank_you":
        // Hand forward from chest
        rightArmRot = new THREE.Euler(-0.4 - easeOut * 0.5, 0, -0.2 - easeOut * 0.2);
        rightHandRot = new THREE.Euler(0, 0, 0);
        break;
      case "help":
        // Both arms up
        leftArmRot = new THREE.Euler(-1.4 - easeOut * 0.2, 0.1, 0.5);
        rightArmRot = new THREE.Euler(-1.4 - easeOut * 0.2, -0.1, -0.5);
        break;
      case "please":
        // Circular motion on chest
        const circle = state.clock.elapsedTime * 2;
        rightArmRot = new THREE.Euler(-0.6, Math.cos(circle) * 0.3, -0.2 + Math.sin(circle) * 0.2);
        break;
      case "sorry":
        // Fist on chest, circular
        const sorryCircle = state.clock.elapsedTime * 1.5;
        rightArmRot = new THREE.Euler(-0.8, Math.cos(sorryCircle) * 0.15, -0.4);
        break;
      case "love":
        // Arms crossed over chest
        leftArmRot = new THREE.Euler(-0.5, 0.5, 0.8);
        rightArmRot = new THREE.Euler(-0.5, -0.5, -0.8);
        break;
      case "emergency":
        // Both arms waving
        const wave = Math.sin(state.clock.elapsedTime * 5) * 0.6;
        leftArmRot = new THREE.Euler(-1.2, wave, 0.6);
        rightArmRot = new THREE.Euler(-1.2, -wave, -0.6);
        break;
      case "deaf":
        // Point to ear then mouth
        const phase = (state.clock.elapsedTime * 0.8) % 2;
        if (phase < 1) {
          rightArmRot = new THREE.Euler(-0.9, 0, -0.6);
        } else {
          rightArmRot = new THREE.Euler(-0.6, 0, -0.3);
        }
        break;
      case "assistance":
        // Similar to help
        leftArmRot = new THREE.Euler(-1.3, 0.1, 0.4);
        rightArmRot = new THREE.Euler(-1.3, -0.1, -0.4);
        break;
      case "nice":
      case "meet":
      case "how":
      case "you":
      default:
        // Subtle attention pose
        leftArmRot = new THREE.Euler(-0.4, 0, 0.25);
        rightArmRot = new THREE.Euler(-0.4, 0, -0.25);
        break;
    }

    leftArmRef.current.rotation.copy(leftArmRot);
    rightArmRef.current.rotation.copy(rightArmRot);
    leftHandRef.current.rotation.copy(leftHandRot);
    rightHandRef.current.rotation.copy(rightHandRot);

    // Subtle idle sway
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
    }
  });

  const handColor = isAnimating && currentAnimation !== "idle" ? "#00ffff" : "#f4c2a1";

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.2, 0.7, 8, 16]} />
        <meshStandardMaterial color="#2d3748" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#f4c2a1" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.04, 1.32, 0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.04, 1.32, 0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Left Arm - pivot at shoulder */}
      <group ref={leftArmRef} position={[-0.22, 1.05, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.05, 0.32, 8, 16]} />
          <meshStandardMaterial color="#2d3748" roughness={0.6} metalness={0.3} />
        </mesh>
        <group ref={leftHandRef} position={[0, -0.38, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color={handColor} roughness={0.3} metalness={0.1} />
          </mesh>
        </group>
      </group>

      {/* Right Arm - pivot at shoulder */}
      <group ref={rightArmRef} position={[0.22, 1.05, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.05, 0.32, 8, 16]} />
          <meshStandardMaterial color="#2d3748" roughness={0.6} metalness={0.3} />
        </mesh>
        <group ref={rightHandRef} position={[0, -0.38, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color={handColor} roughness={0.3} metalness={0.1} />
          </mesh>
        </group>
      </group>

      {/* Glow when signing */}
      {isAnimating && currentAnimation !== "idle" && (
        <>
          <pointLight position={[0, 1.5, 0.5]} color="#00ffff" intensity={1.2} distance={3} />
          <pointLight position={[0, 1.5, -0.5]} color="#8b5cf6" intensity={0.8} distance={2} />
        </>
      )}
    </group>
  );
}
