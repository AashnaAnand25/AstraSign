/**
 * ASL Word → Animation Mapping
 * Maps normalized text/words to animation identifiers for the signing avatar.
 * Architecture: Text → Split words → Match to animation IDs → Queue → Play sequentially
 */

export type ASLAnimationId =
  | "hello"
  | "help"
  | "yes"
  | "no"
  | "thank"
  | "thank_you"
  | "please"
  | "sorry"
  | "love"
  | "nice"
  | "meet"
  | "how"
  | "you"
  | "emergency"
  | "deaf"
  | "assistance"
  | "me"
  | "go"
  | "class"
  | "name"
  | "need"
  | "good"
  | "morning"
  | "night"
  | "your"
  | "school"
  | "work"
  | "idle";

export const ANIMATION_DURATION_MS = 1800;

/** Words that map to known ASL animations (demo vocabulary: 10–15 signs + grammar words) */
export const WORD_TO_ANIMATION: Record<string, ASLAnimationId> = {
  hello: "hello",
  hi: "hello",
  hey: "hello",
  help: "help",
  yes: "yes",
  yeah: "yes",
  no: "no",
  nope: "no",
  thank: "thank",
  thanks: "thank",
  please: "please",
  sorry: "sorry",
  love: "love",
  nice: "nice",
  meet: "meet",
  how: "how",
  you: "you",
  emergency: "emergency",
  deaf: "deaf",
  assistance: "assistance",
  help_me: "help",
  me: "me",
  go: "go",
  class: "class",
  name: "name",
  need: "need",
  good: "good",
  morning: "morning",
  night: "night",
  your: "your",
  school: "school",
  work: "work",
};

/** Phrase-level overrides (longer phrases first for matching) */
export const PHRASE_TO_ANIMATION: Record<string, ASLAnimationId[]> = {
  "thank you very much": ["thank", "you"],
  "nice to meet you": ["nice", "meet", "you"],
  "how are you": ["how", "you"],
  "my name is": ["name", "me"],
  "me go class": ["me", "go", "class"],
  "i need help": ["help"],
  "i am deaf": ["deaf"],
  "i need assistance": ["assistance"],
  "thank you": ["thank", "you"],
  emergency: ["emergency"],
};

/**
 * Normalize text: lowercase, remove punctuation
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

/**
 * Split text into words for animation lookup
 */
export function textToWords(text: string): string[] {
  return normalizeText(text).split(/\s+/).filter(Boolean);
}

/**
 * Map text to a queue of ASL animation IDs
 * Uses phrase mapping for exact matches, otherwise word-by-word
 */
export function textToAnimationQueue(text: string): ASLAnimationId[] {
  const normalized = normalizeText(text);
  if (!normalized) return ["idle"];

  // Exact phrase match (e.g. "thank you", "how are you")
  const phraseAnims = PHRASE_TO_ANIMATION[normalized];
  if (phraseAnims && phraseAnims.length > 0) {
    return phraseAnims;
  }

  // Word-by-word mapping for mixed input (e.g. "hello thank you")
  const words = textToWords(text);
  const queue: ASLAnimationId[] = [];
  for (const word of words) {
    const anim = WORD_TO_ANIMATION[word] ?? null;
    if (anim && anim !== "idle") {
      queue.push(anim);
    }
  }

  return queue.length > 0 ? queue : ["idle"];
}
