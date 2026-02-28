import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Procedural astronaut - no external GLB, always renders */
interface AstronautModelProps {
  isAnimating?: boolean;
  position?: [number, number, number];
}

export default function AstronautModel({
  isAnimating = false,
  position = [0, 0, 0],
}: AstronautModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    if (isAnimating) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  const suitColor = "#2c3e50";
  const visorColor = "#1a5276";
  const accentColor = isAnimating ? "#00ffff" : "#3498db";

  return (
    <group ref={groupRef} position={position}>
      {/* Helmet */}
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color={suitColor}
          roughness={0.3}
          metalness={0.6}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 1.38, 0.14]} castShadow>
        <sphereGeometry args={[0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={visorColor}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Body / suit */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.22, 0.6, 8, 16]} />
        <meshStandardMaterial
          color={suitColor}
          roughness={0.5}
          metalness={0.4}
        />
      </mesh>
      {/* Chest panel */}
      <mesh position={[0, 0.85, 0.22]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.05]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={isAnimating ? accentColor : "#000"}
          emissiveIntensity={isAnimating ? 0.3 : 0}
        />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.28, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.35, 6, 12]} />
        <meshStandardMaterial color={suitColor} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.28, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.35, 6, 12]} />
        <meshStandardMaterial color={suitColor} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Gloves */}
      <mesh position={[-0.28, 0.7, 0.15]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ecf0f1" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.28, 0.7, 0.15]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ecf0f1" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Backpack */}
      <mesh position={[0, 0.5, -0.2]} castShadow>
        <boxGeometry args={[0.25, 0.4, 0.15]} />
        <meshStandardMaterial color="#34495e" roughness={0.6} metalness={0.3} />
      </mesh>

      {isAnimating && (
        <pointLight position={[0, 1.5, 0.5]} color="#00ffff" intensity={1.5} distance={4} />
      )}
    </group>
  );
}
