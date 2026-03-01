import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { Suspense, ReactNode } from "react";

interface AvatarSceneProps {
  children?: ReactNode;
}

export default function AvatarScene({ children }: AvatarSceneProps) {

  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden shrink-0"
      style={{ height: "100%", minHeight: 0, maxHeight: "100%" }}
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
          {children}
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
