import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ASL_LETTERS, ASL_WORDS } from "@/data/aslGestures";

interface ReadyPlayerMeHandAnimatorProps {
  gesture: string;
  isRight?: boolean;
  isAnimating?: boolean;
  position?: [number, number, number];
  scale?: number;
}

export default function ReadyPlayerMeHandAnimator({ 
  gesture, 
  isRight = false, 
  isAnimating = false,
  position = [0, 0, 0],
  scale = 1
}: ReadyPlayerMeHandAnimatorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [targetRotations, setTargetRotations] = useState<Record<string, [number, number, number]>>({});
  const [currentRotations, setCurrentRotations] = useState<Record<string, [number, number, number]>>({});

  // Get bone rotations for gesture
  useEffect(() => {
    const gestureData = ASL_LETTERS[gesture.toUpperCase()] || ASL_WORDS[gesture.toUpperCase()];
    if (gestureData?.handBoneRotations) {
      setTargetRotations(gestureData.handBoneRotations);
    } else {
      // Default idle pose
      setTargetRotations({
        'thumb_01': [0, 0, 0.3],
        'thumb_02': [0, 0, 0.2],
        'thumb_03': [0, 0, 0.1],
        'index_01': [0, 0, 0.2],
        'index_02': [0, 0, 0.2],
        'index_03': [0, 0, 0.2],
        'middle_01': [0, 0, 0.2],
        'middle_02': [0, 0, 0.2],
        'middle_03': [0, 0, 0.2],
        'ring_01': [0, 0, 0.2],
        'ring_02': [0, 0, 0.2],
        'ring_03': [0, 0, 0.2],
        'pinky_01': [0, 0, 0.2],
        'pinky_02': [0, 0, 0.2],
        'pinky_03': [0, 0, 0.2],
      });
    }
  }, [gesture]);

  // Smooth animation to target rotations
  useFrame((state) => {
    if (!groupRef.current) return;

    // Update current rotations towards target
    const updatedRotations: Record<string, [number, number, number]> = {};
    
    Object.keys(targetRotations).forEach(boneName => {
      const target = targetRotations[boneName];
      const current = currentRotations[boneName] || [0, 0, 0];
      
      // Smooth interpolation
      const interpolated: [number, number, number] = [
        THREE.MathUtils.lerp(current[0], target[0], 0.1),
        THREE.MathUtils.lerp(current[1], target[1], 0.1),
        THREE.MathUtils.lerp(current[2], target[2], 0.1),
      ];
      
      updatedRotations[boneName] = interpolated;
    });
    
    setCurrentRotations(updatedRotations);

    // Apply rotations to bones
    const avatar = groupRef.current.children[0] as THREE.Object3D;
    if (avatar) {
      const skeleton = (avatar as any).skeleton;
      if (skeleton) {
        Object.keys(updatedRotations).forEach(boneName => {
          const bone = skeleton.getBoneByName(boneName);
          if (bone) {
            const rotation = updatedRotations[boneName];
            bone.rotation.x = rotation[0];
            bone.rotation.y = rotation[1];
            bone.rotation.z = rotation[2];
          }
        });
      }
    }

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

  const handPosition = isRight ? [0.4, 0.7, 0.3] : [-0.4, 0.7, 0.3];

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <group position={handPosition as [number, number, number]}>
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
