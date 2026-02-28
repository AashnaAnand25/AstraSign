const API_BASE_URL = 'http://localhost:8000';

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
    const response = await fetch(`${API_BASE_URL}/api/signs/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ words }),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch signs batch');
    }
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
