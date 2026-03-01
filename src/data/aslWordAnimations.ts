// Word-level ASL Animations Database
// Contains motion sequences for complete ASL signs (not letter-by-letter)

export interface MotionFrame {
  time: number; // 0.0 to 1.0
  handPosition: { x: number; y: number; z: number }; // -1 to 1
  handRotation: { x: number; y: number; z: number }; // -1 to 1
  fingers: { thumb: number; index: number; middle: number; ring: number; pinky: number }; // 0 (curled) to 1 (extended)
}

export interface ASLWordAnimation {
  word: string;
  description: string;
  handshape: string;
  location: string;
  movement: string;
  category: string;
  duration: number; // seconds
  motionSequence: MotionFrame[];
}

// Word-level ASL animations database
export const ASL_WORD_ANIMATIONS: ASLWordAnimation[] = [
  {
    word: "WANT",
    description: "Open hands pull toward chest",
    handshape: "Open hands",
    location: "Neutral space to chest",
    movement: "Pull inward",
    category: "common",
    duration: 1.5,
    motionSequence: [
      { time: 0.0, handPosition: { x: 0.5, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
      { time: 0.5, handPosition: { x: 0.2, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
      { time: 1.0, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
    ]
  },
  {
    word: "EAT",
    description: "O-hand brings to mouth repeatedly",
    handshape: "O-hand",
    location: "Mouth",
    movement: "To mouth",
    category: "action",
    duration: 2.0,
    motionSequence: [
      { time: 0.0, handPosition: { x: 0, y: 0.5, z: 0.5 }, handRotation: { x: -0.5, y: 0, z: 0 }, fingers: { thumb: 0.2, index: 0.2, middle: 0.2, ring: 0.2, pinky: 0.2 } },
      { time: 0.5, handPosition: { x: 0, y: 0.3, z: 0.3 }, handRotation: { x: -0.5, y: 0, z: 0 }, fingers: { thumb: 0.2, index: 0.2, middle: 0.2, ring: 0.2, pinky: 0.2 } },
      { time: 1.0, handPosition: { x: 0, y: 0.5, z: 0.5 }, handRotation: { x: -0.5, y: 0, z: 0 }, fingers: { thumb: 0.2, index: 0.2, middle: 0.2, ring: 0.2, pinky: 0.2 } },
      { time: 1.5, handPosition: { x: 0, y: 0.3, z: 0.3 }, handRotation: { x: -0.5, y: 0, z: 0 }, fingers: { thumb: 0.2, index: 0.2, middle: 0.2, ring: 0.2, pinky: 0.2 } },
      { time: 2.0, handPosition: { x: 0, y: 0.5, z: 0.5 }, handRotation: { x: -0.5, y: 0, z: 0 }, fingers: { thumb: 0.2, index: 0.2, middle: 0.2, ring: 0.2, pinky: 0.2 } },
    ]
  },
  {
    word: "DRINK",
    description: "C-hand tilts back like drinking",
    handshape: "C-hand",
    location: "Mouth",
    movement: "Tilt back",
    category: "action",
    duration: 2.0,
    motionSequence: [
      { time: 0.0, handPosition: { x: 0, y: 0.3, z: 0.3 }, handRotation: { x: -0.5, y: 0, z: 0 }, fingers: { thumb: 0.8, index: 0.8, middle: 0.8, ring: 0.8, pinky: 0.8 } },
      { time: 0.5, handPosition: { x: 0, y: 0.3, z: 0.3 }, handRotation: { x: -0.5, y: 0, z: 0 }, fingers: { thumb: 0.8, index: 0.8, middle: 0.8, ring: 0.8, pinky: 0.8 } },
      { time: 1.0, handPosition: { x: 0, y: 0.3, z: 0.3 }, handRotation: { x: 0.5, y: 0, z: 0 }, fingers: { thumb: 0.8, index: 0.8, middle: 0.8, ring: 0.8, pinky: 0.8 } },
      { time: 1.5, handPosition: { x: 0, y: 0.3, z: 0.3 }, handRotation: { x: 0.5, y: 0, z: 0 }, fingers: { thumb: 0.8, index: 0.8, middle: 0.8, ring: 0.8, pinky: 0.8 } },
      { time: 2.0, handPosition: { x: 0, y: 0.3, z: 0.3 }, handRotation: { x: -0.5, y: 0, z: 0 }, fingers: { thumb: 0.8, index: 0.8, middle: 0.8, ring: 0.8, pinky: 0.8 } },
    ]
  },
  {
    word: "LOCK",
    description: "X-hand twists like turning key",
    handshape: "X-hand",
    location: "Neutral space",
    movement: "Twist",
    category: "common",
    duration: 1.5,
    motionSequence: [
      { time: 0.0, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: -0.5 }, fingers: { thumb: 1, index: 0.2, middle: 1, ring: 1, pinky: 1 } },
      { time: 0.5, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 0.2, middle: 1, ring: 1, pinky: 1 } },
      { time: 1.0, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0.5 }, fingers: { thumb: 1, index: 0.2, middle: 1, ring: 1, pinky: 1 } },
      { time: 1.5, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: -0.5 }, fingers: { thumb: 1, index: 0.2, middle: 1, ring: 1, pinky: 1 } },
    ]
  },
  {
    word: "KEY",
    description: "X-hand twist motion",
    handshape: "X-hand",
    location: "Neutral space",
    movement: "Twist",
    category: "common",
    duration: 1.0,
    motionSequence: [
      { time: 0.0, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: -0.5 }, fingers: { thumb: 1, index: 0.2, middle: 1, ring: 1, pinky: 1 } },
      { time: 0.5, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0.5 }, fingers: { thumb: 1, index: 0.2, middle: 1, ring: 1, pinky: 1 } },
      { time: 1.0, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: -0.5 }, fingers: { thumb: 1, index: 0.2, middle: 1, ring: 1, pinky: 1 } },
    ]
  },
  {
    word: "DOOR",
    description: "Hands open outward",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Open outward",
    category: "common",
    duration: 2.0,
    motionSequence: [
      { time: 0.0, handPosition: { x: -0.2, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
      { time: 1.0, handPosition: { x: 0.2, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
      { time: 2.0, handPosition: { x: 0.5, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
    ]
  },
  {
    word: "OPEN",
    description: "Hands separate",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Separate",
    category: "common",
    duration: 1.5,
    motionSequence: [
      { time: 0.0, handPosition: { x: -0.1, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
      { time: 0.75, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
      { time: 1.5, handPosition: { x: 0.3, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
    ]
  },
  {
    word: "CLOSE",
    description: "Hands come together",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Come together",
    category: "common",
    duration: 1.5,
    motionSequence: [
      { time: 0.0, handPosition: { x: 0.3, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
      { time: 0.75, handPosition: { x: 0, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
      { time: 1.5, handPosition: { x: -0.1, y: 0, z: 0 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 } },
    ]
  },
  {
    word: "WATER",
    description: "W-hand taps chin twice",
    handshape: "W-hand",
    location: "Chin",
    movement: "Tap twice",
    category: "noun",
    duration: 2.0,
    motionSequence: [
      { time: 0.0, handPosition: { x: 0, y: 0.2, z: 0.2 }, handRotation: { x: -0.3, y: 0, z: 0 }, fingers: { thumb: 1, index: 0.2, middle: 0.2, ring: 1, pinky: 1 } },
      { time: 0.5, handPosition: { x: 0, y: 0.2, z: 0.2 }, handRotation: { x: -0.3, y: 0, z: 0 }, fingers: { thumb: 1, index: 0.2, middle: 0.2, ring: 1, pinky: 1 } },
      { time: 1.0, handPosition: { x: 0, y: 0.2, z: 0.2 }, handRotation: { x: -0.3, y: 0, z: 0 }, fingers: { thumb: 1, index: 0.2, middle: 0.2, ring: 1, pinky: 1 } },
      { time: 1.5, handPosition: { x: 0, y: 0.2, z: 0.2 }, handRotation: { x: -0.3, y: 0, z: 0 }, fingers: { thumb: 1, index: 0.2, middle: 0.2, ring: 1, pinky: 1 } },
      { time: 2.0, handPosition: { x: 0, y: 0.2, z: 0.2 }, handRotation: { x: -0.3, y: 0, z: 0 }, fingers: { thumb: 1, index: 0.2, middle: 0.2, ring: 1, pinky: 1 } },
    ]
  },
  {
    word: "BATHROOM",
    description: "T-hand shakes at chest",
    handshape: "T-hand",
    location: "Chest",
    movement: "Shake",
    category: "noun",
    duration: 2.0,
    motionSequence: [
      { time: 0.0, handPosition: { x: 0, y: 0.1, z: 0.1 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 0.2, ring: 1, pinky: 1 } },
      { time: 0.5, handPosition: { x: 0, y: 0.1, z: 0.1 }, handRotation: { x: 0, y: 0, z: 0.2 }, fingers: { thumb: 1, index: 1, middle: 0.2, ring: 1, pinky: 1 } },
      { time: 1.0, handPosition: { x: 0, y: 0.1, z: 0.1 }, handRotation: { x: 0, y: 0, z: -0.2 }, fingers: { thumb: 1, index: 1, middle: 0.2, ring: 1, pinky: 1 } },
      { time: 1.5, handPosition: { x: 0, y: 0.1, z: 0.1 }, handRotation: { x: 0, y: 0, z: 0.2 }, fingers: { thumb: 1, index: 1, middle: 0.2, ring: 1, pinky: 1 } },
      { time: 2.0, handPosition: { x: 0, y: 0.1, z: 0.1 }, handRotation: { x: 0, y: 0, z: 0 }, fingers: { thumb: 1, index: 1, middle: 0.2, ring: 1, pinky: 1 } },
    ]
  },
];

// Helper functions
export function getASLWordAnimation(word: string): ASLWordAnimation | null {
  return ASL_WORD_ANIMATIONS.find(anim => anim.word === word.toUpperCase()) || null;
}

export function hasASLAnimation(word: string): boolean {
  return ASL_WORD_ANIMATIONS.some(anim => anim.word === word.toUpperCase());
}

export function getWordsByCategory(category: string): ASLWordAnimation[] {
  return ASL_WORD_ANIMATIONS.filter(anim => anim.category === category);
}

export function getAllASLWords(): string[] {
  return ASL_WORD_ANIMATIONS.map(anim => anim.word);
}

export default {
  ASL_WORD_ANIMATIONS,
  getASLWordAnimation,
  hasASLAnimation,
  getWordsByCategory,
  getAllASLWords
};
