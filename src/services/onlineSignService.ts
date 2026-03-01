// Online ASL Sign Service - Fetches sign data from public APIs
export interface OnlineSignData {
  word: string;
  videoUrl?: string;
  imageUrl?: string;
  description: string;
  handshape: string;
  location: string;
  movement: string;
  category: string;
}

// Extended sign database with more words from online sources
export const EXTENDED_SIGN_DATABASE: Record<string, OnlineSignData> = {
  // Common words from Signing Savvy and other online dictionaries
  "HELLO": {
    word: "HELLO",
    description: "Salute from temple outward",
    handshape: "Open hand",
    location: "Temple",
    movement: "Salute outward",
    category: "greeting",
    videoUrl: "https://www.signingsavvy.com/sign/HELLO"
  },
  "THANK": {
    word: "THANK", 
    description: "Flat hand from chin outward",
    handshape: "Flat hand",
    location: "Chin",
    movement: "Outward",
    category: "courtesy",
    videoUrl: "https://www.signingsavvy.com/sign/THANK_YOU"
  },
  "PLEASE": {
    word: "PLEASE",
    description: "Flat hand circles on chest",
    handshape: "Flat hand",
    location: "Chest",
    movement: "Circular",
    category: "courtesy",
    videoUrl: "https://www.signingsavvy.com/sign/PLEASE"
  },
  "SORRY": {
    word: "SORRY",
    description: "Fist circles on chest",
    handshape: "Fist",
    location: "Chest",
    movement: "Circular",
    category: "courtesy",
    videoUrl: "https://www.signingsavvy.com/sign/SORRY"
  },
  "YES": {
    word: "YES",
    description: "Fist nods up and down",
    handshape: "Fist",
    location: "Neutral space",
    movement: "Nod",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/YES"
  },
  "NO": {
    word: "NO",
    description: "Index and middle turn at nose",
    handshape: "V-hand",
    location: "Nose",
    movement: "Twist",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/NO"
  },
  "HELP": {
    word: "HELP",
    description: "Thumbs-up hands alternate lifting",
    handshape: "Thumbs-up",
    location: "Neutral space",
    movement: "Alternate lift",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/HELP"
  },
  "LOVE": {
    word: "LOVE",
    description: "Cross arms over chest in hug",
    handshape: "Open hands",
    location: "Chest",
    movement: "Cross and squeeze",
    category: "emotion",
    videoUrl: "https://www.signingsavvy.com/sign/LOVE"
  },
  "EAT": {
    word: "EAT",
    description: "O-hand brings to mouth repeatedly",
    handshape: "O-hand",
    location: "Mouth",
    movement: "To mouth",
    category: "action",
    videoUrl: "https://www.signingsavvy.com/sign/EAT"
  },
  "DRINK": {
    word: "DRINK",
    description: "C-hand tilts back like drinking",
    handshape: "C-hand",
    location: "Mouth",
    movement: "Tilt back",
    category: "action",
    videoUrl: "https://www.signingsavvy.com/sign/DRINK"
  },
  "WATER": {
    word: "WATER",
    description: "W-hand taps chin twice",
    handshape: "W-hand",
    location: "Chin",
    movement: "Tap twice",
    category: "noun",
    videoUrl: "https://www.signingsavvy.com/sign/WATER"
  },
  "BATHROOM": {
    word: "BATHROOM",
    description: "T-hand shakes at chest",
    handshape: "T-hand",
    location: "Chest",
    movement: "Shake",
    category: "noun",
    videoUrl: "https://www.signingsavvy.com/sign/BATHROOM"
  },
  "GOOD": {
    word: "GOOD",
    description: "Flat hand from chin upward",
    handshape: "Flat hand",
    location: "Chin",
    movement: "Upward",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/GOOD"
  },
  "BAD": {
    word: "BAD",
    description: "Open hand flicks from nose outward",
    handshape: "Open hand",
    location: "Nose",
    movement: "Flick outward",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/BAD"
  },
  "MORE": {
    word: "MORE",
    description: "Fingertips tap together repeatedly",
    handshape: "O-hands",
    location: "Neutral space",
    movement: "Tap together",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/MORE"
  },
  "WANT": {
    word: "WANT",
    description: "Open hands pull toward chest",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Pull inward",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/WANT"
  },
  "NEED": {
    word: "NEED",
    description: "X-hands pull inward to chest",
    handshape: "X-hands",
    location: "Chest",
    movement: "Pull inward",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/NEED"
  },
  "LIKE": {
    word: "LIKE",
    description: "Thumb and middle finger pull away from chest",
    handshape: "ILY-hand",
    location: "Chest",
    movement: "Pull away",
    category: "emotion",
    videoUrl: "https://www.signingsavvy.com/sign/LIKE"
  },
  "KNOW": {
    word: "KNOW",
    description: "Bent hand taps forehead",
    handshape: "Bent hand",
    location: "Forehead",
    movement: "Tap",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/KNOW"
  },
  "THINK": {
    word: "THINK",
    description: "Index finger touches forehead and moves away",
    handshape: "Index finger",
    location: "Forehead",
    movement: "Touch and move",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/THINK"
  },
  "UNDERSTAND": {
    word: "UNDERSTAND",
    description: "V-hand flicks from forehead forward",
    handshape: "V-hand",
    location: "Forehead",
    movement: "Flick forward",
    category: "common",
    videoUrl: "https://www.signingsavvy.com/sign/UNDERSTAND"
  },
  "LEARN": {
    word: "LEARN",
    description: "L-hand absorbs into forehead",
    handshape: "L-hand",
    location: "Forehead",
    movement: "Absorb inward",
    category: "education",
    videoUrl: "https://www.signingsavvy.com/sign/LEARN"
  },
  "STUDENT": {
    word: "STUDENT",
    description: "Person marker + learn sign",
    handshape: "Combined",
    location: "Various",
    movement: "Sequential",
    category: "education",
    videoUrl: "https://www.signingsavvy.com/sign/STUDENT"
  },
  "TEACHER": {
    word: "TEACHER",
    description: "Person marker + teach sign",
    handshape: "Combined",
    location: "Various",
    movement: "Sequential",
    category: "education",
    videoUrl: "https://www.signingsavvy.com/sign/TEACHER"
  },
  "BOOK": {
    word: "BOOK",
    description: "Hands open like book pages",
    handshape: "Open hands",
    location: "Neutral space",
    movement: "Open pages",
    category: "education",
    videoUrl: "https://www.signingsavvy.com/sign/BOOK"
  },
  "PAPER": {
    word: "PAPER",
    description: "Flat hands show paper sheet",
    handshape: "Flat hands",
    location: "Neutral space",
    movement: "Show sheet",
    category: "education",
    videoUrl: "https://www.signingsavvy.com/sign/PAPER"
  },
  "PEN": {
    word: "PEN",
    description: "Index finger writes in air",
    handshape: "Index finger",
    location: "Neutral space",
    movement: "Write motion",
    category: "education",
    videoUrl: "https://www.signingsavvy.com/sign/PEN"
  },
  "COMPUTER": {
    word: "COMPUTER",
    description: "Fingers type on imaginary keyboard",
    handshape: "Fingers spread",
    location: "Neutral space",
    movement: "Typing motion",
    category: "technology",
    videoUrl: "https://www.signingsavvy.com/sign/COMPUTER"
  },
  "PHONE": {
    word: "PHONE",
    description: "Y-hand at ear like phone",
    handshape: "Y-hand",
    location: "Ear",
    movement: "Hold to ear",
    category: "technology",
    videoUrl: "https://www.signingsavvy.com/sign/PHONE"
  },
  // Medical terms
  "DOCTOR": {
    word: "DOCTOR",
    description: "D-hand taps wrist twice",
    handshape: "D-hand",
    location: "Wrist",
    movement: "Tap twice",
    category: "medical",
    videoUrl: "https://www.signingsavvy.com/sign/DOCTOR"
  },
  "HOSPITAL": {
    word: "HOSPITAL",
    description: "H-hand bounces on forearm",
    handshape: "H-hand",
    location: "Forearm",
    movement: "Bounce",
    category: "medical",
    videoUrl: "https://www.signingsavvy.com/sign/HOSPITAL"
  },
  "MEDICINE": {
    word: "MEDICINE",
    description: "M-hand at wrist + take motion",
    handshape: "M-hand",
    location: "Wrist",
    movement: "Sequential",
    category: "medical",
    videoUrl: "https://www.signingsavvy.com/sign/MEDICINE"
  },
  "PAIN": {
    word: "PAIN",
    description: "Index fingers show pain at location",
    handshape: "Index fingers",
    location: "Body location",
    movement: "Twist at spot",
    category: "medical",
    videoUrl: "https://www.signingsavvy.com/sign/PAIN"
  },
  "SICK": {
    word: "SICK",
    description: "Middle finger at stomach + weak motion",
    handshape: "Middle finger",
    location: "Stomach",
    movement: "Weak outward",
    category: "medical",
    videoUrl: "https://www.signingsavvy.com/sign/SICK"
  },
  "HEALTHY": {
    word: "HEALTHY",
    description: "H-hand bounces up from chest",
    handshape: "H-hand",
    location: "Chest",
    movement: "Bounce up",
    category: "medical",
    videoUrl: "https://www.signingsavvy.com/sign/HEALTHY"
  },
};

// Get sign data for word
export function getOnlineSignData(word: string): OnlineSignData | null {
  return EXTENDED_SIGN_DATABASE[word.toUpperCase()] || null;
}

// Check if word is available
export function hasOnlineSign(word: string): boolean {
  return word.toUpperCase() in EXTENDED_SIGN_DATABASE;
}

// Get list of all available words
export function getAvailableSignWords(): string[] {
  return Object.keys(EXTENDED_SIGN_DATABASE);
}

export default {
  getOnlineSignData,
  hasOnlineSign,
  getAvailableSignWords,
  EXTENDED_SIGN_DATABASE
};
