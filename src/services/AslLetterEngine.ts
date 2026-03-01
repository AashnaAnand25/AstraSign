/**
 * AslLetterEngine.ts — AstraSign Fingerspelling
 * 
 * High-performance geometric rule-based engine for all 26 ASL alphabet letters.
 */

import { Landmark, HandHistory } from "./AslEngine";

export interface RecognitionResult {
    word: string;
    confidence: number;
    allScores: Record<string, number>;
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
        // A bit of a stricter threshold here to separate bent fingers vs straight fingers
        states.push(tipDistWrist > pipDistWrist * 0.9);
    }

    return states;
}

// Distance helper
function d(p1: Landmark, p2: Landmark): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function classifyAslLetter(pts: Landmark[], history: HandHistory): RecognitionResult {
    const states = getFingerStates(pts);
    const [thumb, index, middle, ring, pinky] = states;

    // We rely heavily on exact keypoint relationships for the 26 letters.
    // Index mapping (MediaPipe Hand):
    // 0: wrist
    // 4: thumb tip, 3: thumb ip, 2: thumb mcp
    // 8: index tip, 6: index pip, 5: index mcp
    // 12: middle tip, 10: middle pip, 9: middle mcp
    // 16: ring tip, 14: ring pip, 13: ring mcp
    // 20: pinky tip, 18: pinky pip, 17: pinky mcp

    const tTip = pts[4];
    const iTip = pts[8];
    const mTip = pts[12];
    const rTip = pts[16];
    const pTip = pts[20];

    const iPip = pts[6];
    const mPip = pts[10];

    const distTI = d(tTip, iTip);
    const distTM = d(tTip, mTip);
    const distTR = d(tTip, rTip);

    // Relative heights (remember y is down usually, but let's assume standard camera coords)
    // Actually, smaller Y is "higher" in standard image coordinates.
    // Thumb crosses over index/middle for letters like M, N, T, S. Let's define thumb crossing:
    const thumbX = tTip.x;
    const indexX = iTip.x;
    const middleX = mTip.x;
    const ringX = rTip.x;

    // Movement (J, Z)
    const vel = history.getVelocity();
    const isMoving = vel > 0.02;

    const scores: Record<string, number> = {};

    // A: Thumb out, ALL fingers curled. Thumb is adjacent to index side.
    scores["A"] = (thumb && !index && !middle && !ring && !pinky && tTip.y < iPip.y) ? 0.9 : 0;

    // B: Thumb across palm, ALL fingers straight up and together
    scores["B"] = (!thumb && index && middle && ring && pinky && d(iTip, mTip) < 0.05) ? 0.9 : 0;

    // C: Semi-circle shape. Thumb and all fingers slightly curved open.
    // Hard to detect curve with just booleans, but roughly index & thumb are apart and forming a C.
    // Usually distTI is large, and all fingers are somewhat bent.
    scores["C"] = (distTI > 0.1 && !thumb && !index && !middle && !ring && !pinky /* they are strictly curved */ && d(iTip, pTip) > 0.05) ? 0.7 : 0;

    // D: Index straight, thumb touches middle+ring+pinky
    scores["D"] = (index && distTM < 0.06 && !middle && !ring && !pinky) ? 0.9 : 0;

    // E: All fingers curled tightly, thumb touches below them
    scores["E"] = (!thumb && !index && !middle && !ring && !pinky && tTip.y > iPip.y) ? 0.8 : 0;

    // F: Index tip touches thumb tip (OK sign), other 3 straight
    scores["F"] = (distTI < 0.05 && middle && ring && pinky) ? 0.9 : 0;

    // G: Index and thumb straight out horizontally. Other fingers curled.
    // Simplification: index and thumb straight, distance between them is medium
    scores["G"] = (thumb && index && !middle && !ring && !pinky && d(iTip, iPip) < 0.05 /* meaning pointing horizontally, x distance is more than y */) ? 0.8 : 0;

    // H: Index and middle straight out horizontally, together. Thumb alongside.
    scores["H"] = (index && middle && !ring && !pinky && d(iTip, mTip) < 0.05) ? 0.8 : 0;

    // I: Only pinky is straight
    scores["I"] = (!thumb && !index && !middle && !ring && pinky) ? 0.9 : 0;

    // J: I-shape, sweeping motion
    scores["J"] = (scores["I"] > 0 && isMoving) ? 0.95 : 0;

    // K: Thumb between index and middle, which are both straight and spread
    scores["K"] = (index && middle && !ring && !pinky && d(iTip, mTip) > 0.05 && tTip.y < iPip.y) ? 0.9 : 0;

    // L: Thumb and index straight, forming L (perpendicular).
    scores["L"] = (thumb && index && !middle && !ring && !pinky && distTI > 0.1) ? 0.9 : 0;

    // M: Thumb under index, middle, ring. All fingers curled.
    scores["M"] = (!thumb && !index && !middle && !ring && !pinky && tTip.x > rTip.x) ? 0.7 : 0;

    // N: Thumb under index and middle. All fingers curled.
    scores["N"] = (!thumb && !index && !middle && !ring && !pinky && tTip.x > mTip.x && tTip.x < rTip.x) ? 0.7 : 0;

    // O: Thumb tip touches all finger tips (round O shape).
    scores["O"] = (distTI < 0.06 && distTM < 0.06 && !index && !middle && !ring && !pinky) ? 0.8 : 0;

    // P: Like K but pointing down. (Y coordinate of tips > pip)
    scores["P"] = (index && middle && !ring && !pinky && iTip.y > iPip.y) ? 0.8 : 0;

    // Q: Like G but pointing down.
    scores["Q"] = (thumb && index && !middle && !ring && !pinky && iTip.y > iPip.y && distTI > 0.05) ? 0.8 : 0;

    // R: Index and middle straight and crossed.
    scores["R"] = (index && middle && !ring && !pinky && (iTip.x > mTip.x)) ? 0.9 : 0;

    // S: Fist. Thumb wraps OVER middle/index.
    scores["S"] = (!index && !middle && !ring && !pinky && d(tTip, mPip) < 0.05) ? 0.9 : 0;

    // T: Thumb under index only.
    scores["T"] = (!thumb && !index && !middle && !ring && !pinky && tTip.x > iTip.x && tTip.x < mTip.x) ? 0.7 : 0;

    // U: Index and middle straight, kept close together.
    scores["U"] = (index && middle && !ring && !pinky && d(iTip, mTip) < 0.05 && iTip.y < iPip.y) ? 0.9 : 0;

    // V: Index and middle straight, spread in V.
    scores["V"] = (index && middle && !ring && !pinky && d(iTip, mTip) > 0.05 && iTip.y < iPip.y) ? 0.9 : 0;

    // W: Index, middle, ring straight and spread.
    scores["W"] = (!thumb && index && middle && ring && !pinky) ? 0.9 : 0;

    // X: Index hooked (pip high, tip low). Thumb tucked.
    scores["X"] = (!thumb && !middle && !ring && !pinky && iPip.y < iTip.y && iPip.y < pts[5].y) ? 0.8 : 0;

    // Y: Thumb and pinky straight.
    scores["Y"] = (thumb && !index && !middle && !ring && pinky) ? 0.9 : 0;

    // Z: Index traces Z. Fast motion with index out.
    scores["Z"] = (index && !middle && !ring && !pinky && isMoving) ? 0.95 : 0;

    // Find best match
    let bestWord = "NONE";
    let bestConf = 0.0;

    for (const [word, conf] of Object.entries(scores)) {
        if (conf > bestConf) {
            bestConf = conf;
            bestWord = word;
        }
    }

    // Default if nothing matches at all
    if (bestConf < 0.4) {
        bestWord = "NONE";
    }

    return {
        word: bestWord,
        confidence: bestConf,
        allScores: scores
    };
}
