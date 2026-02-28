import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import RealisticAvatarSystem from "./RealisticAvatarSystem";
import { AvatarType } from "./AvatarSelector";
import SigningAvatar from "./SigningAvatar";
import AstronautModel from "./AstronautModel";
import HeroModel from "./HeroModel";
import type { ASLAnimationId } from "@/data/aslAnimationMap";

interface AvatarSceneProps {
  currentLetter?: string;
  currentWord?: string;
  isAnimating?: boolean;
  animationQueue?: ASLAnimationId[];
  queueIndex?: number;
  signMode?: "letters" | "words";
  avatarType?: AvatarType;
}

export default function AvatarScene({
  currentLetter,
  currentWord,
  isAnimating = false,
  avatarType = 'person'
}: AvatarSceneProps) {
  console.log('AvatarScene rendering:', { currentLetter, currentWord, isAnimating, avatarType });

  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "300px" }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 2.5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Suspense fallback={null}>
          <RealisticAvatarSystem
            currentLetter={currentLetter}
            currentWord={currentWord}
            isAnimating={isAnimating}
            position={[0, -0.3, 0]}
            avatarType={avatarType}
          />
        </Suspense>
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.3}
          scale={5}
          blur={2}
          far={10}
        />
        <Environment preset="city" />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial
            color="#1a1a2e"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
