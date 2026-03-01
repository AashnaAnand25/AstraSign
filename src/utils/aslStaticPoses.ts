/**
 * Hackathon-safe: map MediaPipe/classifier gesture labels to spoken words.
 * Static poses only: Thumbs up, Fist, Flat palm, Index up, Peace.
 */

export const GESTURE_TO_WORD: Record<string, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  I: "I",
  L: "L",
  O: "O",
  P: "P",
  U: "U",
  V: "V",
  W: "W",
  Y: "Y",
  S: "No",
  "5": "Stop",
  HELLO: "Hello",
  THANK: "Thank you",
};

export const STATIC_POSE_WORDS = ["Yes", "No", "Stop", "One", "Two"] as const;

export function gestureToWord(gesture: string): string | null {
  const g = gesture?.trim().toUpperCase();
  return GESTURE_TO_WORD[g] ?? null;
}
