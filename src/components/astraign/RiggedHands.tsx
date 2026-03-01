import React, { useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ASL_LETTERS, ASL_WORDS } from "@/data/aslGestures";
import { LeftHandModel } from "./LeftHandModel";
import { RightHandModel } from "./RightHandModel";

interface RiggedHandsProps {
    currentWord?: string;
    currentLetter?: string;
    isAnimating: boolean;
    position?: [number, number, number];
    scale?: number;
}

const DEFAULT_REST_POSE = {
    thumb: { bend: 0.1, spread: 0.8, rotation: 0.5 },
    index: { bend: 0.1, spread: 0.5, rotation: 0.5 },
    middle: { bend: 0.1, spread: 0.5, rotation: 0.5 },
    ring: { bend: 0.1, spread: 0.5, rotation: 0.5 },
    pinky: { bend: 0.1, spread: 0.5, rotation: 0.5 },
};

export default function RiggedHands({
    currentWord,
    currentLetter,
    isAnimating,
    position = [0, 0, 0],
    scale = 1.0,
}: RiggedHandsProps) {
    // Extract gesture configuration based on current input
    const gestureConfig = useMemo(() => {
        if (!isAnimating) {
            return {
                rightHand: DEFAULT_REST_POSE,
                leftHand: DEFAULT_REST_POSE,
                rightPosition: [0.5, 0, 0] as [number, number, number],
                leftPosition: [-0.5, 0, 0] as [number, number, number],
            };
        }

        let config = null;

        if (currentWord) {
            const upperWord = currentWord.toUpperCase();
            config = ASL_WORDS[upperWord];
            if (!config) {
                // Fallback to first letter if word isn't mapped
                const firstLetter = upperWord.charAt(0);
                config = ASL_LETTERS[firstLetter];
            }
        } else if (currentLetter) {
            config = ASL_LETTERS[currentLetter.toUpperCase()];
        }

        if (!config) {
            return {
                rightHand: DEFAULT_REST_POSE,
                leftHand: DEFAULT_REST_POSE,
                rightPosition: [0.5, 0, 0] as [number, number, number],
                leftPosition: [-0.5, 0, 0] as [number, number, number],
            };
        }

        // Default right hand position to slightly forward and right
        const rightPosition = config.rightHandPosition || [0.5, 0, 0];
        const leftPositionOffset = config.leftHandPosition || [-0.5, 0, 0];

        return {
            rightHand: config.rightHand || config || DEFAULT_REST_POSE,
            leftHand: config.leftHand || (config.twoHanded ? config : DEFAULT_REST_POSE), // if twoHanded and no leftHand defined, mirror right
            rightPosition,
            leftPosition: leftPositionOffset,
            twoHanded: config.twoHanded || false
        };
    }, [currentWord, currentLetter, isAnimating]);

    return (
        <group position={position} scale={[scale, scale, scale]} rotation={[-Math.PI / 2, Math.PI, 0]}>
            {/* Right Hand (Primary) */}
            <group position={gestureConfig.rightPosition} scale={[8, 8, 8]}>
                <RightHandModel config={gestureConfig.rightHand} />
            </group>

            {/* Left Hand (Optional depending on gesture) */}
            {(gestureConfig.twoHanded || !isAnimating) && (
                <group position={gestureConfig.leftPosition} scale={[8, 8, 8]}>
                    <LeftHandModel config={gestureConfig.leftHand} />
                </group>
            )}
        </group>
    );
}
