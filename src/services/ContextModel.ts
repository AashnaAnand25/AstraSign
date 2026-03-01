/**
 * ContextModel.ts — AstraSign v4.0 Bigram Prediction
 * 
 * Implements a lightweight ASL grammar layer. This biases recognition 
 * based on likely word pairings (e.g., "I" -> "LOVE", "HELP" -> "STOP").
 */

export const ASL_BIGRAM_WEIGHTS: Record<string, Record<string, number>> = {
    "I / ME": {
        "LOVE": 0.8,
        "HURT / PAIN": 0.6,
        "YES": 0.3,
        "OK": 0.4,
        "YOU": 0.5,
    },
    "YOU": {
        "OK": 0.7,
        "HELP": 0.6,
        "STOP": 0.5,
        "LOVE": 0.4,
    },
    "HELP": {
        "I / ME": 0.9,
        "YOU": 0.8,
        "STOP": 0.4,
    },
    "HURT / PAIN": {
        "HELP": 0.8,
        "STOP": 0.4,
    },
};

/**
 * Given the last recognized word, returns a set of weights for the next word.
 */
export function getContextBias(lastWord: string | null): Record<string, number> {
    if (!lastWord || !ASL_BIGRAM_WEIGHTS[lastWord]) {
        return {};
    }
    return ASL_BIGRAM_WEIGHTS[lastWord];
}

/**
 * Fuses geometric scores with contextual weights.
 * Resulting score = (GeoScore * 0.7) + (ContextWeight * 0.3)
 */
export function fuseScores(
    geoScores: Record<string, number>,
    contextWeights: Record<string, number>
): Record<string, number> {
    const fused: Record<string, number> = { ...geoScores };

    for (const [word, weight] of Object.entries(contextWeights)) {
        if (fused[word] !== undefined) {
            // Linear interpolation: bias existing score upward if it matches context
            fused[word] = (fused[word] * 0.7) + (weight * 0.3);
        }
    }

    return fused;
}
