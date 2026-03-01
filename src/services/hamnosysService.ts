// HamNoSys Sign Language Notation System
// Based on AudioToSignLanguageConverter - International Sign Language notation

// HamNoSys (Hamburg Notation System) is the international standard for sign language
export interface HamNoSysSign {
  word: string;
  hamnosys: string; // HamNoSys notation string
  description: string;
  handshape: string;
  location: string;
  movement: string;
  orientation: string;
  avatarUrl?: string;
}

// HamNoSys symbol mappings for common signs
// Based on: https://github.com/sahilkhoslaa/AudioToSignLanguageConverter
export const HAMNOSYS_DATABASE: Record<string, HamNoSysSign> = {
  // Greetings
  "HELLO": {
    word: "HELLO",
    hamnosys: "", // Open hand at temple, salute motion
    description: "Open hand salutes from temple outward",
    handshape: "Flat hand (B-hand)",
    location: "Temple",
    movement: "Salute outward",
    orientation: "Palm facing out"
  },
  "HI": {
    word: "HI",
    hamnosys: "",
    description: "Waving hand greeting",
    handshape: "Flat hand (B-hand)",
    location: "Neutral space",
    movement: "Wave side to side",
    orientation: "Palm facing out"
  },
  "GOODBYE": {
    word: "GOODBYE",
    hamnosys: "",
    description: "Waving hand farewell",
    handshape: "Flat hand (B-hand)",
    location: "Neutral space",
    movement: "Wave repeatedly",
    orientation: "Palm facing out"
  },
  
  // Thanks
  "THANK": {
    word: "THANK",
    hamnosys: "", // Flat hand from chin outward
    description: "Flat hand moves from chin forward",
    handshape: "Flat hand (B-hand)",
    location: "Chin",
    movement: "Move forward and down",
    orientation: "Palm facing up"
  },
  "THANKS": {
    word: "THANKS",
    hamnosys: "",
    description: "Flat hand moves from chin forward",
    handshape: "Flat hand (B-hand)",
    location: "Chin",
    movement: "Move forward and down",
    orientation: "Palm facing up"
  },
  "PLEASE": {
    word: "PLEASE",
    hamnosys: "", // Flat hand rubs chest circularly
    description: "Flat hand rubs chest in circular motion",
    handshape: "Flat hand (B-hand)",
    location: "Chest",
    movement: "Circular rubbing",
    orientation: "Palm facing body"
  },
  "SORRY": {
    word: "SORRY",
    hamnosys: "", // Fist rubs chest
    description: "Fist rubs chest in circular motion",
    handshape: "Fist (S-hand)",
    location: "Chest",
    movement: "Circular rubbing",
    orientation: "Palm facing body"
  },
  
  // Yes/No
  "YES": {
    word: "YES",
    hamnosys: "", // Fist nods
    description: "Fist nods up and down",
    handshape: "Fist (S-hand)",
    location: "Neutral space",
    movement: "Nod up-down",
    orientation: "Palm facing side"
  },
  "NO": {
    word: "NO",
    hamnosys: "", // V-hand twists at nose
    description: "Index and middle finger twist at nose",
    handshape: "V-hand",
    location: "Nose",
    movement: "Twist side to side",
    orientation: "Palm facing face"
  },
  
  // Common actions
  "EAT": {
    word: "EAT",
    hamnosys: "", // O-hand to mouth repeatedly
    description: "O-hand touches mouth repeatedly",
    handshape: "O-hand (fingers touch thumb)",
    location: "Mouth",
    movement: "Touch repeatedly",
    orientation: "Palm facing face"
  },
  "DRINK": {
    word: "DRINK",
    hamnosys: "", // C-hand tilts at mouth
    description: "C-hand tilts back as if drinking",
    handshape: "C-hand",
    location: "Mouth",
    movement: "Tilt backward",
    orientation: "Palm facing face"
  },
  "SLEEP": {
    word: "SLEEP",
    hamnosys: "", // Flat hand tilts at cheek
    description: "Flat hand tilts against cheek",
    handshape: "Flat hand (B-hand)",
    location: "Cheek",
    movement: "Tilt and hold",
    orientation: "Palm facing face"
  },
  "WAKE": {
    word: "WAKE",
    hamnosys: "",
    description: "Flat hand moves away from face",
    handshape: "Flat hand (B-hand)",
    location: "Face",
    movement: "Move away",
    orientation: "Palm facing face"
  },
  
  // Emotions
  "LOVE": {
    word: "LOVE",
    hamnosys: "", // Crossed arms hug
    description: "Arms cross over chest in hug",
    handshape: "Crossed arms",
    location: "Chest",
    movement: "Cross and squeeze",
    orientation: "Arms crossed"
  },
  "LIKE": {
    word: "LIKE",
    hamnosys: "", // Thumb pulls from chest
    description: "Thumb and middle finger pull away from chest",
    handshape: "ILY-hand",
    location: "Chest",
    movement: "Pull away",
    orientation: "Palm facing body"
  },
  "HAPPY": {
    word: "HAPPY",
    hamnosys: "", // Flat hand brushes chest upward
    description: "Flat hand brushes upward on chest",
    handshape: "Flat hand (B-hand)",
    location: "Chest",
    movement: "Brush upward",
    orientation: "Palm facing body"
  },
  "SAD": {
    word: "SAD",
    hamnosys: "", // Flat hand brushes face downward
    description: "Flat hand brushes downward on face",
    handshape: "Flat hand (B-hand)",
    location: "Face",
    movement: "Brush downward",
    orientation: "Palm facing face"
  },
  
  // People
  "ME": {
    word: "ME",
    hamnosys: "", // Point to self
    description: "Point to oneself",
    handshape: "Index finger",
    location: "Chest",
    movement: "Point",
    orientation: "Palm facing body"
  },
  "YOU": {
    word: "YOU",
    hamnosys: "", // Point forward
    description: "Point at other person",
    handshape: "Index finger",
    location: "Neutral space",
    movement: "Point forward",
    orientation: "Palm facing down"
  },
  "FRIEND": {
    word: "FRIEND",
    hamnosys: "", // Linked index fingers
    description: "Linked index fingers rock back and forth",
    handshape: "Hooked index fingers",
    location: "Neutral space",
    movement: "Rock back and forth",
    orientation: "Fingers linked"
  },
  
  // Questions
  "WHAT": {
    word: "WHAT",
    hamnosys: "", // Hands flip up
    description: "Hands flip up in questioning gesture",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Flip up",
    orientation: "Palms facing up"
  },
  "WHERE": {
    word: "WHERE",
    hamnosys: "", // Questioning where motion
    description: "Hands move in questioning where motion",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Side to side",
    orientation: "Palms facing up"
  },
  "HOW": {
    word: "HOW",
    hamnosys: "", // Hands show method
    description: "Hands demonstrate method or way",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Show motion",
    orientation: "Palms facing each other"
  },
  "WHY": {
    word: "WHY",
    hamnosys: "", // Why gesture at forehead
    description: "Why questioning gesture at forehead",
    handshape: "Bent hand",
    location: "Forehead",
    movement: "Questioning motion",
    orientation: "Palm facing face"
  },
  
  // Medical
  "DOCTOR": {
    word: "DOCTOR",
    hamnosys: "", // D-hand taps wrist
    description: "D-hand taps wrist twice",
    handshape: "D-hand",
    location: "Wrist",
    movement: "Tap twice",
    orientation: "Palm facing down"
  },
  "HOSPITAL": {
    word: "HOSPITAL",
    hamnosys: "", // H-hand bounces on arm
    description: "H-hand bounces on forearm",
    handshape: "H-hand",
    location: "Forearm",
    movement: "Bounce repeatedly",
    orientation: "Palm facing down"
  },
  "SICK": {
    word: "SICK",
    hamnosys: "", // Middle finger at stomach weak
    description: "Middle finger at stomach moves weakly outward",
    handshape: "Middle finger",
    location: "Stomach",
    movement: "Weak outward",
    orientation: "Palm facing body"
  },
  "HEALTHY": {
    word: "HEALTHY",
    hamnosys: "", // H-hand bounces up
    description: "H-hand bounces upward from chest",
    handshape: "H-hand",
    location: "Chest",
    movement: "Bounce up",
    orientation: "Palm facing down"
  },
  "PAIN": {
    word: "PAIN",
    hamnosys: "", // Fingers show pain spot
    description: "Index fingers twist at pain location",
    handshape: "Index fingers",
    location: "Body location",
    movement: "Twist at spot",
    orientation: "Fingers pointing"
  },
  "HELP": {
    word: "HELP",
    hamnosys: "", // Thumbs-up alternate
    description: "Thumbs-up hands alternate lifting",
    handshape: "Thumbs-up (A-hand)",
    location: "Neutral space",
    movement: "Alternate lifting",
    orientation: "Thumbs pointing up"
  },
  
  // Time
  "NOW": {
    word: "NOW",
    hamnosys: "", // Y-hand shakes
    description: "Y-hand shakes for emphasis",
    handshape: "Y-hand",
    location: "Neutral space",
    movement: "Shake",
    orientation: "Palm facing out"
  },
  "LATER": {
    word: "LATER",
    hamnosys: "", // L-hand moves forward
    description: "L-hand moves forward in time",
    handshape: "L-hand",
    location: "Neutral space",
    movement: "Move forward",
    orientation: "Palm facing side"
  },
  "BEFORE": {
    word: "BEFORE",
    hamnosys: "", // B-hand moves back
    description: "B-hand moves backward in time",
    handshape: "B-hand",
    location: "Neutral space",
    movement: "Move backward",
    orientation: "Palm facing side"
  },
  
  // Common
  "WANT": {
    word: "WANT",
    hamnosys: "", // Hands pull to chest
    description: "Open hands pull inward toward chest",
    handshape: "Open hands (5-hands)",
    location: "Neutral space to chest",
    movement: "Pull inward",
    orientation: "Palms facing up"
  },
  "NEED": {
    word: "NEED",
    hamnosys: "", // X-hands pull to chest
    description: "X-hands pull inward toward chest",
    handshape: "X-hands",
    location: "Neutral space to chest",
    movement: "Pull inward",
    orientation: "Palms facing body"
  },
  "KNOW": {
    word: "KNOW",
    hamnosys: "", // Bent hand taps forehead
    description: "Bent hand taps forehead",
    handshape: "Bent hand",
    location: "Forehead",
    movement: "Tap",
    orientation: "Palm facing face"
  },
  "THINK": {
    word: "THINK",
    hamnosys: "", // Index finger at forehead
    description: "Index finger touches forehead and moves away",
    handshape: "Index finger",
    location: "Forehead",
    movement: "Touch and move",
    orientation: "Palm facing side"
  },
  "UNDERSTAND": {
    word: "UNDERSTAND",
    hamnosys: "", // V-hand flicks from forehead
    description: "V-hand flicks outward from forehead",
    handshape: "V-hand",
    location: "Forehead",
    movement: "Flick outward",
    orientation: "Palm facing face"
  },
  "LEARN": {
    word: "LEARN",
    hamnosys: "", // L-hand absorbs into forehead
    description: "L-hand moves into forehead (knowledge absorption)",
    handshape: "L-hand",
    location: "Forehead",
    movement: "Absorb inward",
    orientation: "Palm facing face"
  },
  
  // Education
  "STUDENT": {
    word: "STUDENT",
    hamnosys: "", // Person + learn
    description: "Person marker followed by learn sign",
    handshape: "Sequential",
    location: "Various",
    movement: "Sequential",
    orientation: "Various"
  },
  "TEACHER": {
    word: "TEACHER",
    hamnosys: "", // Person + teach
    description: "Person marker followed by teach sign",
    handshape: "Sequential",
    location: "Various",
    movement: "Sequential",
    orientation: "Various"
  },
  "SCHOOL": {
    word: "SCHOOL",
    hamnosys: "", // Hands clap together
    description: "Open hands clap together repeatedly",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Clap",
    orientation: "Palms facing each other"
  },
  "BOOK": {
    word: "BOOK",
    hamnosys: "", // Hands open like book
    description: "Hands open like book pages",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Open pages",
    orientation: "Palms facing up"
  },
  
  // Technology
  "PHONE": {
    word: "PHONE",
    hamnosys: "", // Y-hand at ear
    description: "Y-hand held to ear like phone",
    handshape: "Y-hand",
    location: "Ear",
    movement: "Hold to ear",
    orientation: "Palm facing side"
  },
  "COMPUTER": {
    word: "COMPUTER",
    hamnosys: "", // Hands type
    description: "Fingers type on imaginary keyboard",
    handshape: "Wiggling fingers",
    location: "Neutral space",
    movement: "Typing motion",
    orientation: "Palms facing down"
  },
  "INTERNET": {
    word: "INTERNET",
    hamnosys: "", // Hands show web/network
    description: "Hands show interconnected web",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Interconnect",
    orientation: "Palms facing each other"
  },
  
  // Numbers
  "ONE": {
    word: "ONE",
    hamnosys: "", // Index finger up
    description: "Index finger points up",
    handshape: "1-hand",
    location: "Neutral space",
    movement: "Hold",
    orientation: "Palm facing in"
  },
  "TWO": {
    word: "TWO",
    hamnosys: "", // V-hand
    description: "V-hand shape",
    handshape: "2-hand (V-hand)",
    location: "Neutral space",
    movement: "Hold",
    orientation: "Palm facing out"
  },
  "THREE": {
    word: "THREE",
    hamnosys: "", // 3-hand
    description: "Three fingers extended",
    handshape: "3-hand",
    location: "Neutral space",
    movement: "Hold",
    orientation: "Palm facing out"
  },
  "MORE": {
    word: "MORE",
    hamnosys: "", // Fingertips tap
    description: "Fingertips of both hands tap together",
    handshape: "Flattened O-hands",
    location: "Neutral space",
    movement: "Tap repeatedly",
    orientation: "Palms facing each other"
  },
};

// Parse HamNoSys notation into animation instructions
export function parseHamNoSys(hamnosys: string): HamNoSysAnimationInstruction[] {
  const instructions: HamNoSysAnimationInstruction[] = [];
  
  // HamNoSys symbols are Unicode characters in the range U+E000-U+EFFF
  for (const char of hamnosys) {
    const code = char.charCodeAt(0);
    if (code >= 0xE000 && code <= 0xEFFF) {
      instructions.push(decodeHamNoSysSymbol(char));
    }
  }
  
  return instructions;
}

export interface HamNoSysAnimationInstruction {
  type: 'handshape' | 'location' | 'movement' | 'orientation' | 'other';
  symbol: string;
  description: string;
  parameters?: Record<string, number>;
}

// Decode individual HamNoSys symbols
function decodeHamNoSysSymbol(symbol: string): HamNoSysAnimationInstruction {
  const code = symbol.charCodeAt(0);
  
  // HamNoSys symbol ranges (simplified mapping)
  // Based on HamNoSys 4.0 specification
  
  if (code >= 0xE000 && code <= 0xE00F) {
    return { type: 'handshape', symbol, description: 'Handshape variant ' + (code - 0xE000) };
  } else if (code >= 0xE010 && code <= 0xE01F) {
    return { type: 'location', symbol, description: 'Location variant ' + (code - 0xE010) };
  } else if (code >= 0xE020 && code <= 0xE02F) {
    return { type: 'movement', symbol, description: 'Movement variant ' + (code - 0xE020) };
  } else if (code >= 0xE030 && code <= 0xE03F) {
    return { type: 'orientation', symbol, description: 'Orientation variant ' + (code - 0xE030) };
  } else {
    return { type: 'other', symbol, description: 'Other HamNoSys symbol' };
  }
}

// Get sign data
export function getHamNoSysSign(word: string): HamNoSysSign | null {
  return HAMNOSYS_DATABASE[word.toUpperCase().trim()] || null;
}

// Check if sign exists
export function hasHamNoSysSign(word: string): boolean {
  return word.toUpperCase().trim() in HAMNOSYS_DATABASE;
}

// Get all available words
export function getAllHamNoSysWords(): string[] {
  return Object.keys(HAMNOSYS_DATABASE);
}

export default {
  HAMNOSYS_DATABASE,
  parseHamNoSys,
  getHamNoSysSign,
  hasHamNoSysSign,
  getAllHamNoSysWords
};
