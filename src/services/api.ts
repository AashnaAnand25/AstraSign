import { restructureToASLGrammar } from '@/data/aslGrammar';

/**
 * Backend origin. Empty in dev so requests stay relative and hit the Vite
 * `/api` proxy. Set VITE_API_URL when the FastAPI backend is deployed
 * somewhere else (e.g. "https://astrasign-api.onrender.com").
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // ElevenLabs "Rachel"

export interface SignResponse {
  found: boolean;
  word: string;
  type?: string;
  video_url?: string;
  description?: string;
  letters?: string[];
}

export interface BatchSignRequest {
  words: string[];
}

export interface BatchSignResponse {
  results: SignResponse[];
  found: number;
  total: number;
}

/**
 * A static host (Aedify, Netlify, GitHub Pages…) answers unknown paths with
 * `index.html` and a 200, so `response.ok` is not enough to prove a backend
 * exists — without this check an HTML body gets handed to `resp.blob()` or
 * `resp.json()` and callers silently play/parse garbage instead of falling
 * back. Throwing here is what makes every caller's fallback path fire.
 */
async function apiPost(
  path: string,
  body: unknown,
  expect: 'json' | 'audio',
): Promise<Response> {
  const accept = expect === 'audio' ? 'audio/mpeg' : 'application/json';
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: accept },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const matches = expect === 'audio'
    ? contentType.startsWith('audio/')
    : contentType.includes('json');
  if (!matches) {
    throw new Error(
      `${path} returned "${contentType || 'unknown'}" — backend not reachable`,
    );
  }

  return response;
}

/**
 * Text-to-speech via the backend (ElevenLabs). Returns an object URL the
 * caller owns and must `URL.revokeObjectURL` when done, or null when no
 * backend is reachable — callers should fall back to {@link speakNative}.
 */
export async function fetchSpeechUrl(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID,
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    // Trailing slash is deliberate: the backend mounts these routers at
    // prefix + "/", and omitting it costs a 307 that needs its own CORS
    // preflight once VITE_API_URL points at another origin.
    const response = await apiPost('/api/speak/', { text: trimmed, voice_id: voiceId }, 'audio');
    return URL.createObjectURL(await response.blob());
  } catch (error) {
    console.warn('[api] TTS unavailable, using native speech:', error);
    return null;
  }
}

/** Speak with the browser's built-in voice. No-op where unsupported. */
export function speakNative(text: string, rate = 1): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

/**
 * English → ASL gloss. Uses the backend's Gemini-backed endpoint when one is
 * reachable and the local rule-based restructurer otherwise, so this works on
 * a static deploy with no backend at all.
 */
export async function toAslGloss(text: string): Promise<string[]> {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    const response = await apiPost('/api/grammar/', { text: trimmed }, 'json');
    const data = await response.json();
    const words: unknown = data?.asl_ordered;
    if (Array.isArray(words) && words.length > 0) {
      return words.map(String);
    }
  } catch (error) {
    console.warn('[api] grammar endpoint unavailable, using local rules:', error);
  }

  return restructureToASLGrammar(trimmed).split(' ').filter(Boolean);
}

export const api = {
  // Get sign for a single word
  async getSign(word: string): Promise<SignResponse> {
    const response = await fetch(`${API_BASE_URL}/api/signs/${encodeURIComponent(word)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sign for word: ${word}`);
    }
    return response.json();
  },

  // Get signs for multiple words
  async getSignsBatch(words: string[]): Promise<BatchSignResponse> {
    const response = await apiPost('/api/signs/batch', { words }, 'json');
    return response.json();
  },

  // Check API health
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    return response.json();
  },
};
