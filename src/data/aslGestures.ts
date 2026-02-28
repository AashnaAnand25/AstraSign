// Comprehensive ASL Hand Gesture Database
// Based on ASL-LEX and linguistic research

export interface ASLGesture {
  id: string;
  name: string;
  handshape: Handshape;
  orientation: Orientation;
  location: Location;
  movement: Movement;
  description: string;
  fingerPositions: FingerPositions;
}

export interface FingerPositions {
  thumb: [number, number, number]; // [bend, spread, rotation]
  index: [number, number, number];
  middle: [number, number, number];
  ring: [number, number, number];
  pinky: [number, number, number];
}

export type Handshape = 
  | 'fist' // A, S, T
  | 'flat' // B, 5
  | 'claw' // C, O
  | 'point' // D, I, G, H, P, Q, R, U, V, X, Y
  | 'thumb_up' // L
  | 'bent' // E, M, N, W
  | 'curved' // F
  | 'hooked' // K
  | 'crossed' // R
  | 'spread_three' // W
  | 'gun' // H, P, Q
  | 'peace' // V, 2
  | 'three_up' // W, 3
  | 'pinky_up' // I, Y
  | 'thumb_pinky' // Y
  | 'index_thumb' // F
  | 'circle' // O, C;

export type Orientation = 
  | 'palm_up' | 'palm_down' | 'palm_left' | 'palm_right'
  | 'palm_in' | 'palm_out' | 'diagonal_up' | 'diagonal_down';

export type Location = 
  | 'neutral_space' | 'forehead' | 'chin' | 'chest' | 'shoulder'
  | 'mouth' | 'nose' | 'eye' | 'ear' | 'cheek';

export type Movement = 
  | 'static' | 'wave' | 'circle' | 'tap' | 'slide' | 'bounce'
  | 'wiggle' | 'fingers_cross' | 'fingers_uncross' | 'twist';

// Comprehensive ASL Letter Gestures
export const ASL_LETTERS: Record<string, ASLGesture> = {
  'A': {
    id: 'asl_a',
    name: 'A',
    handshape: 'fist',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Fist with thumb on side',
    fingerPositions: {
      thumb: [0.2, 0.1, 0.1], // Slightly bent, close to index
      index: [0.9, 0.1, 0.1], // Fully bent
      middle: [0.9, 0.1, 0.1], // Fully bent
      ring: [0.9, 0.1, 0.1], // Fully bent
      pinky: [0.9, 0.1, 0.1], // Fully bent
    }
  },
  'B': {
    id: 'asl_b',
    name: 'B',
    handshape: 'flat',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Flat hand with fingers together',
    fingerPositions: {
      thumb: [0.1, 0.3, 0.2], // Straight, slightly spread
      index: [0.0, 0.1, 0.0], // Straight, together
      middle: [0.0, 0.1, 0.0], // Straight, together
      ring: [0.0, 0.1, 0.0], // Straight, together
      pinky: [0.0, 0.1, 0.0], // Straight, together
    }
  },
  'C': {
    id: 'asl_c',
    name: 'C',
    handshape: 'claw',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Curved hand like holding a cup',
    fingerPositions: {
      thumb: [0.3, 0.4, 0.2], // Bent, spread
      index: [0.4, 0.2, 0.1], // Curved
      middle: [0.4, 0.2, 0.1], // Curved
      ring: [0.4, 0.2, 0.1], // Curved
      pinky: [0.4, 0.2, 0.1], // Curved
    }
  },
  'D': {
    id: 'asl_d',
    name: 'D',
    handshape: 'point',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Index finger pointing up, others bent',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent, slightly spread
      index: [0.0, 0.1, 0.0], // Straight, pointing
      middle: [0.8, 0.1, 0.1], // Bent
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'E': {
    id: 'asl_e',
    name: 'E',
    handshape: 'claw',
    orientation: 'palm_down',
    location: 'neutral_space',
    movement: 'static',
    description: 'Claw hand with fingers bent',
    fingerPositions: {
      thumb: [0.6, 0.2, 0.1], // Bent down
      index: [0.7, 0.3, 0.1], // Bent, spread
      middle: [0.7, 0.3, 0.1], // Bent, spread
      ring: [0.7, 0.3, 0.1], // Bent, spread
      pinky: [0.7, 0.3, 0.1], // Bent, spread
    }
  },
  'F': {
    id: 'asl_f',
    name: 'F',
    handshape: 'index_thumb',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Thumb touches index finger, others up',
    fingerPositions: {
      thumb: [0.2, 0.1, 0.1], // Touching index
      index: [0.2, 0.1, 0.1], // Thumb touching
      middle: [0.0, 0.2, 0.0], // Straight, spread
      ring: [0.0, 0.2, 0.0], // Straight, spread
      pinky: [0.0, 0.2, 0.0], // Straight, spread
    }
  },
  'G': {
    id: 'asl_g',
    name: 'G',
    handshape: 'point',
    orientation: 'palm_left',
    location: 'neutral_space',
    movement: 'static',
    description: 'Index and thumb pointing parallel',
    fingerPositions: {
      thumb: [0.0, 0.3, 0.0], // Straight, spread
      index: [0.0, 0.1, 0.0], // Straight, pointing
      middle: [0.8, 0.1, 0.1], // Bent
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'H': {
    id: 'asl_h',
    name: 'H',
    handshape: 'gun',
    orientation: 'palm_down',
    location: 'neutral_space',
    movement: 'static',
    description: 'Index and middle pointing together',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent
      index: [0.0, 0.1, 0.0], // Straight, together
      middle: [0.0, 0.1, 0.0], // Straight, together
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'I': {
    id: 'asl_i',
    name: 'I',
    handshape: 'pinky_up',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Only pinky finger up',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent
      index: [0.8, 0.1, 0.1], // Bent
      middle: [0.8, 0.1, 0.1], // Bent
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.0, 0.1, 0.0], // Straight, up
    }
  },
  'J': {
    id: 'asl_j',
    name: 'J',
    handshape: 'pinky_up',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'wiggle',
    description: 'Pinky up with J-shaped motion',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent
      index: [0.8, 0.1, 0.1], // Bent
      middle: [0.8, 0.1, 0.1], // Bent
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.0, 0.1, 0.0], // Straight, up
    }
  },
  'K': {
    id: 'asl_k',
    name: 'K',
    handshape: 'hooked',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Index and middle up, thumb between',
    fingerPositions: {
      thumb: [0.2, 0.1, 0.1], // Between fingers
      index: [0.0, 0.3, 0.0], // Straight, spread
      middle: [0.0, 0.3, 0.0], // Straight, spread
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'L': {
    id: 'asl_l',
    name: 'L',
    handshape: 'thumb_up',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Thumb and index finger forming L',
    fingerPositions: {
      thumb: [0.0, 0.4, 0.0], // Straight, spread
      index: [0.0, 0.1, 0.0], // Straight, up
      middle: [0.8, 0.1, 0.1], // Bent
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'M': {
    id: 'asl_m',
    name: 'M',
    handshape: 'bent',
    orientation: 'palm_in',
    location: 'neutral_space',
    movement: 'static',
    description: 'Three fingers down over thumb',
    fingerPositions: {
      thumb: [0.2, 0.1, 0.1], // Bent under
      index: [0.6, 0.1, 0.1], // Bent over thumb
      middle: [0.6, 0.1, 0.1], // Bent over thumb
      ring: [0.6, 0.1, 0.1], // Bent over thumb
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'N': {
    id: 'asl_n',
    name: 'N',
    handshape: 'bent',
    orientation: 'palm_in',
    location: 'neutral_space',
    movement: 'static',
    description: 'Two fingers down over thumb',
    fingerPositions: {
      thumb: [0.2, 0.1, 0.1], // Bent under
      index: [0.6, 0.1, 0.1], // Bent over thumb
      middle: [0.6, 0.1, 0.1], // Bent over thumb
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'O': {
    id: 'asl_o',
    name: 'O',
    handshape: 'circle',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Fingers and thumb forming circle',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Curved
      index: [0.3, 0.2, 0.1], // Curved
      middle: [0.3, 0.2, 0.1], // Curved
      ring: [0.3, 0.2, 0.1], // Curved
      pinky: [0.3, 0.2, 0.1], // Curved
    }
  },
  'P': {
    id: 'asl_p',
    name: 'P',
    handshape: 'gun',
    orientation: 'palm_down',
    location: 'neutral_space',
    movement: 'static',
    description: 'K shape pointing down',
    fingerPositions: {
      thumb: [0.2, 0.1, 0.1], // Between fingers
      index: [0.0, 0.3, 0.0], // Straight, spread
      middle: [0.0, 0.3, 0.0], // Straight, spread
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'Q': {
    id: 'asl_q',
    name: 'Q',
    handshape: 'gun',
    orientation: 'palm_down',
    location: 'neutral_space',
    movement: 'static',
    description: 'G shape pointing down',
    fingerPositions: {
      thumb: [0.0, 0.3, 0.0], // Straight, spread
      index: [0.0, 0.1, 0.0], // Straight, pointing
      middle: [0.8, 0.1, 0.1], // Bent
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'R': {
    id: 'asl_r',
    name: 'R',
    handshape: 'crossed',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Index and middle crossed',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent
      index: [0.0, 0.2, 0.1], // Straight, crossed
      middle: [0.0, 0.2, -0.1], // Straight, crossed
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'S': {
    id: 'asl_s',
    name: 'S',
    handshape: 'fist',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Fist with thumb over fingers',
    fingerPositions: {
      thumb: [0.3, 0.1, 0.1], // Over fingers
      index: [0.9, 0.1, 0.1], // Fully bent
      middle: [0.9, 0.1, 0.1], // Fully bent
      ring: [0.9, 0.1, 0.1], // Fully bent
      pinky: [0.9, 0.1, 0.1], // Fully bent
    }
  },
  'T': {
    id: 'asl_t',
    name: 'T',
    handshape: 'fist',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Fist with thumb between index and middle',
    fingerPositions: {
      thumb: [0.2, 0.1, 0.1], // Between fingers
      index: [0.9, 0.1, 0.1], // Fully bent
      middle: [0.9, 0.1, 0.1], // Fully bent
      ring: [0.9, 0.1, 0.1], // Fully bent
      pinky: [0.9, 0.1, 0.1], // Fully bent
    }
  },
  'U': {
    id: 'asl_u',
    name: 'U',
    handshape: 'gun',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Index and middle pointing up',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent
      index: [0.0, 0.1, 0.0], // Straight, together
      middle: [0.0, 0.1, 0.0], // Straight, together
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'V': {
    id: 'asl_v',
    name: 'V',
    handshape: 'peace',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Peace sign',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent
      index: [0.0, 0.3, 0.0], // Straight, spread
      middle: [0.0, 0.3, 0.0], // Straight, spread
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'W': {
    id: 'asl_w',
    name: 'W',
    handshape: 'spread_three',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Three fingers spread',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent
      index: [0.0, 0.4, 0.0], // Straight, spread
      middle: [0.0, 0.4, 0.0], // Straight, spread
      ring: [0.0, 0.4, 0.0], // Straight, spread
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'X': {
    id: 'asl_x',
    name: 'X',
    handshape: 'point',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Bent index finger',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent
      index: [0.4, 0.1, 0.0], // Bent at knuckle
      middle: [0.8, 0.1, 0.1], // Bent
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  },
  'Y': {
    id: 'asl_y',
    name: 'Y',
    handshape: 'thumb_pinky',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'static',
    description: 'Thumb and pinky up',
    fingerPositions: {
      thumb: [0.0, 0.4, 0.0], // Straight, spread
      index: [0.8, 0.1, 0.1], // Bent
      middle: [0.8, 0.1, 0.1], // Bent
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.0, 0.1, 0.0], // Straight, up
    }
  },
  'Z': {
    id: 'asl_z',
    name: 'Z',
    handshape: 'point',
    orientation: 'palm_out',
    location: 'neutral_space',
    movement: 'circle',
    description: 'Index finger drawing Z in air',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1], // Bent
      index: [0.0, 0.1, 0.0], // Straight, pointing
      middle: [0.8, 0.1, 0.1], // Bent
      ring: [0.8, 0.1, 0.1], // Bent
      pinky: [0.8, 0.1, 0.1], // Bent
    }
  }
};

// Common ASL Words/Phrases
export const ASL_WORDS: Record<string, ASLGesture> = {
  'HELLO': {
    id: 'asl_hello',
    name: 'HELLO',
    handshape: 'flat',
    orientation: 'palm_out',
    location: 'forehead',
    movement: 'wave',
    description: 'Hand moves from forehead outward in wave',
    fingerPositions: {
      thumb: [0.1, 0.3, 0.2],
      index: [0.0, 0.1, 0.0],
      middle: [0.0, 0.1, 0.0],
      ring: [0.0, 0.1, 0.0],
      pinky: [0.0, 0.1, 0.0],
    }
  },
  'THANK': {
    id: 'asl_thank',
    name: 'THANK',
    handshape: 'flat',
    orientation: 'palm_in',
    location: 'chest',
    movement: 'slide',
    description: 'Hand moves forward from chest',
    fingerPositions: {
      thumb: [0.1, 0.3, 0.2],
      index: [0.0, 0.1, 0.0],
      middle: [0.0, 0.1, 0.0],
      ring: [0.0, 0.1, 0.0],
      pinky: [0.0, 0.1, 0.0],
    }
  },
  'PLEASE': {
    id: 'asl_please',
    name: 'PLEASE',
    handshape: 'flat',
    orientation: 'palm_in',
    location: 'chest',
    movement: 'circle',
    description: 'Circular motion on chest',
    fingerPositions: {
      thumb: [0.1, 0.3, 0.2],
      index: [0.0, 0.1, 0.0],
      middle: [0.0, 0.1, 0.0],
      ring: [0.0, 0.1, 0.0],
      pinky: [0.0, 0.1, 0.0],
    }
  },
  'LOVE': {
    id: 'asl_love',
    name: 'LOVE',
    handshape: 'flat',
    orientation: 'palm_in',
    location: 'chest',
    movement: 'static',
    description: 'Arms crossed over chest',
    fingerPositions: {
      thumb: [0.1, 0.3, 0.2],
      index: [0.0, 0.1, 0.0],
      middle: [0.0, 0.1, 0.0],
      ring: [0.0, 0.1, 0.0],
      pinky: [0.0, 0.1, 0.0],
    }
  },
  'YES': {
    id: 'asl_yes',
    name: 'YES',
    handshape: 'fist',
    orientation: 'palm_up',
    location: 'neutral_space',
    movement: 'bounce',
    description: 'Fist bounces up and down',
    fingerPositions: {
      thumb: [0.2, 0.1, 0.1],
      index: [0.9, 0.1, 0.1],
      middle: [0.9, 0.1, 0.1],
      ring: [0.9, 0.1, 0.1],
      pinky: [0.9, 0.1, 0.1],
    }
  },
  'NO': {
    id: 'asl_no',
    name: 'NO',
    handshape: 'gun',
    orientation: 'palm_down',
    location: 'neutral_space',
    movement: 'wiggle',
    description: 'Index and middle wiggle',
    fingerPositions: {
      thumb: [0.3, 0.2, 0.1],
      index: [0.0, 0.1, 0.0],
      middle: [0.0, 0.1, 0.0],
      ring: [0.8, 0.1, 0.1],
      pinky: [0.8, 0.1, 0.1],
    }
  }
};

// Gesture recognition utilities
export function getGestureForCharacter(char: string): ASLGesture | null {
  return ASL_LETTERS[char.toUpperCase()] || null;
}

export function getGestureForWord(word: string): ASLGesture | null {
  return ASL_WORDS[word.toUpperCase()] || null;
}

export function getAllGestures(): ASLGesture[] {
  return [...Object.values(ASL_LETTERS), ...Object.values(ASL_WORDS)];
}
