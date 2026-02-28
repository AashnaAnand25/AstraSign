import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Procedural hero-style avatar - red/blue suit, no external loading */
interface HeroModelProps {
  isAnimating?: boolean;
  position?: [number, number, number];
}

export default function HeroModel({
  isAnimating = false,
  position = [0, 0, 0],
}: HeroModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    if (isAnimating) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    }
  });

  const red = "#c0392b";
  const blue = "#2980b9";
  const accent = isAnimating ? "#ff4444" : "#e74c3c";

  return (
    <group ref={groupRef} position={position}>
      {/* Head / mask */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={red} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.04, 1.34, 0.13]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.04, 1.34, 0.13]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Body - red suit */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.2, 0.65, 8, 16]} />
        <meshStandardMaterial color={red} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Blue chest */}
      <mesh position={[0, 0.85, 0.2]} castShadow>
        <boxGeometry args={[0.25, 0.25, 0.06]} />
        <meshStandardMaterial
          color={blue}
          emissive={isAnimating ? accent : "#000"}
          emissiveIntensity={isAnimating ? 0.2 : 0}
        />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.26, 0.92, 0]} castShadow>
        <capsuleGeometry args={[0.055, 0.35, 6, 12]} />
        <meshStandardMaterial color={red} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.26, 0.92, 0]} castShadow>
        <capsuleGeometry args={[0.055, 0.35, 6, 12]} />
        <meshStandardMaterial color={red} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.26, 0.68, 0.12]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#f4c2a1" roughness={0.6} />
      </mesh>
      <mesh position={[0.26, 0.68, 0.12]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#f4c2a1" roughness={0.6} />
      </mesh>

      {isAnimating && (
        <pointLight position={[0, 1.5, 0.5]} color="#ff4444" intensity={1.2} distance={4} />
      )}
    </group>
  );
}
