/**
 * AslEngine.ts — AstraSign v3.5 Pro (TypeScript Port)
 * 
 * Port of the high-performance geometric rule-based engine from Python.
 * Handles adaptive smoothing, motion-based signatures, and emergency vocabulary.
 */

export interface Landmark {
    x: number;
    y: number;
    z: number;
}

export class LandmarkSmoother {
    private prevPts: Landmark[] | null = null;
    private alpha: number = 0.3;

    smooth(landmarks: Landmark[], velocity: number): Landmark[] {
        // Adaptive Alpha: Scale with velocity (0.2 slow/stable, 0.8 fast/zero-lag)
        const adaptiveAlpha = Math.max(0.2, Math.min(0.8, velocity * 10.0));

        if (!this.prevPts) {
            this.prevPts = landmarks;
            return landmarks;
        }

        const smoothed = landmarks.map((curr, i) => {
            const prev = this.prevPts![i];
            return {
                x: adaptiveAlpha * curr.x + (1 - adaptiveAlpha) * prev.x,
                y: adaptiveAlpha * curr.y + (1 - adaptiveAlpha) * prev.y,
                z: adaptiveAlpha * curr.z + (1 - adaptiveAlpha) * prev.z,
            };
        });

        this.prevPts = smoothed;
        return smoothed;
    }
}

export class HandHistory {
    private buffer: Landmark[][] = [];
    private maxLen: number = 30;

    add(pts: Landmark[]): void {
        this.buffer.push(pts);
        if (this.buffer.length > this.maxLen) {
            this.buffer.shift();
        }
    }

    getVelocity(): number {
        if (this.buffer.length < 2) return 0.005;
        const last = this.buffer[this.buffer.length - 1][0];
        const prev = this.buffer[this.buffer.length - 2][0];
        return Math.sqrt(Math.pow(last.x - prev.x, 2) + Math.pow(last.y - prev.y, 2));
    }

    countVerticalPeaks(): number {
        if (this.buffer.length < 15) return 0;
        const yVals = this.buffer.map(p => p[0].y);
        let peaks = 0;
        for (let i = 1; i < yVals.length - 1; i++) {
            if ((yVals[i] > yVals[i - 1] && yVals[i] > yVals[i + 1]) ||
                (yVals[i] < yVals[i - 1] && yVals[i] < yVals[i + 1])) {
                if (Math.abs(yVals[i] - yVals[i - 1]) > 0.008) {
                    peaks++;
                }
            }
        }
        return peaks;
    }
}

function getFingerStates(pts: Landmark[]): boolean[] {
    const wrist = pts[0];
    const states: boolean[] = [];

    // Thumb: distance from palm center (indices 0, 5, 17)
    const palmCenterX = (pts[0].x + pts[5].x + pts[17].x) / 3;
    const palmCenterY = (pts[0].y + pts[5].y + pts[17].y) / 3;
    const palmCenterZ = (pts[0].z + pts[5].z + pts[17].z) / 3;

    const tipDist = Math.sqrt(Math.pow(pts[4].x - palmCenterX, 2) + Math.pow(pts[4].y - palmCenterY, 2));
    const ipDist = Math.sqrt(Math.pow(pts[3].x - palmCenterX, 2) + Math.pow(pts[3].y - palmCenterY, 2));
    states.push(tipDist > ipDist * 1.1);

    // Other fingers
    const connections: [number, number][] = [[8, 6], [12, 10], [16, 14], [20, 18]];
    for (const [tipIdx, pipIdx] of connections) {
        const tipDistWrist = Math.sqrt(Math.pow(pts[tipIdx].x - wrist.x, 2) + Math.pow(pts[tipIdx].y - wrist.y, 2));
        const pipDistWrist = Math.sqrt(Math.pow(pts[pipIdx].x - wrist.x, 2) + Math.pow(pts[pipIdx].y - wrist.y, 2));
        states.push(tipDistWrist > pipDistWrist);
    }

    return states;
}

export interface RecognitionResult {
    word: string;
    confidence: number;
    allScores: Record<string, number>;
}

export function classifyAslSign(pts: Landmark[], history: HandHistory): RecognitionResult {
    const states = getFingerStates(pts);
    const [thumb, index, middle, ring, pinky] = states;

    const peaks = history.countVerticalPeaks();
    const vel = history.getVelocity();
    const distTI = Math.sqrt(Math.pow(pts[4].x - pts[8].x, 2) + Math.pow(pts[4].y - pts[8].y, 2));
    const distTM = Math.sqrt(Math.pow(pts[4].x - pts[12].x, 2) + Math.pow(pts[4].y - pts[12].y, 2));

    const scores: Record<string, number> = {
        "YES": (!index && !middle && !ring && !pinky && thumb && peaks >= 2) ? 0.98 : 0,
        "NO": (distTI < 0.08 && distTM < 0.08 && !ring && !pinky && peaks >= 3) ? 0.95 : 0,
        "HELP": (thumb && !index && !middle && !ring && !pinky && vel > 0.015) ? 0.95 : 0,
        "STOP": (thumb && index && middle && ring && pinky) ? 0.95 : 0,
        "WATER / WE": (!thumb && index && middle && ring && !pinky) ? 0.95 : 0,
        "I / ME": (!thumb && !index && !middle && !ring && pinky) ? 0.95 : 0,
        "YOU": (!thumb && index && !middle && !ring && !pinky) ? 0.95 : 0,
        "HURT / PAIN": (!thumb && !index && middle && !ring && !pinky) ? 0.95 : 0,
        "LOVE": (thumb && index && !middle && !ring && pinky) ? 0.98 : 0,
        "OK": (distTI < 0.05 && middle && ring && pinky) ? 0.95 : 0,
    };

    // Find the best match
    let bestWord = "NONE";
    let bestConf = 0.0;

    for (const [word, conf] of Object.entries(scores)) {
        if (conf > bestConf) {
            bestConf = conf;
            bestWord = word;
        }
    }

    // Default if nothing matches
    if (bestConf < 0.5) {
        const fingerCount = states.filter(s => s).length;
        bestWord = `(${fingerCount} fingers)`;
    }

    return {
        word: bestWord,
        confidence: bestConf,
        allScores: scores
    };
}

/**
 * Normalizes landmarks into a 63-dimension vector [x1, y1, z1, ... x21, y21, z21]
 * centered at the wrist for future GCN/Neural integration.
 */
export function getFeatureVector(pts: Landmark[]): number[] {
    const wrist = pts[0];
    const vector: number[] = [];
    for (const p of pts) {
        vector.push(p.x - wrist.x);
        vector.push(p.y - wrist.y);
        vector.push(p.z - wrist.z);
    }
    return vector;
}
