/**
 * Hackathon-safe: map MediaPipe/classifier gesture labels to spoken words.
 * Static poses only: Thumbs up, Fist, Flat palm, Index up, Peace.
 */

export const GESTURE_TO_WORD: Record<string, string> = {
  A: "Yes",   // Thumbs up
  S: "No",    // Closed fist
  "5": "Stop", // All fingers extended
  B: "Stop",  // Flat hand (no thumb)
  I: "One",   // Index only
  V: "Two",   // Peace sign
};

export const STATIC_POSE_WORDS = ["Yes", "No", "Stop", "One", "Two"] as const;

export function gestureToWord(gesture: string): string | null {
  const g = gesture?.trim().toUpperCase();
  return GESTURE_TO_WORD[g] ?? null;
}
