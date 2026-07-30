/**
 * Typed access to the Web Speech API.
 *
 * It is absent from TypeScript's DOM lib because it is still vendor-prefixed
 * in every shipping browser, which is why call sites used to reach for
 * `(window as any).webkitSpeechRecognition`. Only Chrome and Edge implement
 * it — callers must handle `undefined`.
 */

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResultLike extends ArrayLike<SpeechRecognitionAlternative> {
  isFinal: boolean;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

export interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

/** The browser's SpeechRecognition constructor, or undefined where unsupported. */
export function getSpeechRecognition(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Join every alternative in a results list into one transcript string. */
export function joinTranscript(results: ArrayLike<SpeechRecognitionResultLike>): string {
  return Array.from(results, (result) => result[0]?.transcript ?? "").join("");
}
