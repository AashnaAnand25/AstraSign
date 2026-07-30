/**
 * useLetterTrackingPipeline.ts
 *
 * Designed to rapidly track and concatenate individual letters into full words.
 */

import { useCallback, useRef, useState, useEffect, Dispatch, SetStateAction, RefObject } from "react";
import { Landmark, LandmarkSmoother, HandHistory } from "@/services/AslEngine";
import { classifyAslLetter } from "@/services/AslLetterEngine";
import { fetchSpeechUrl, speakNative } from "@/services/api";

export interface LetterTrackingPipelineResult {
    spelledPhrase: string;
    isDetectingSign: boolean;
    status: string;
    detectedLetter: string | null;
    suggestions: string[];
    beginSpelling: () => void;
    commitSegment: () => void;
    triggerTranslate: () => Promise<void>;
    undoLastLetter: () => void;
    clearSpelling: () => void;
    setSpelledPhrase: Dispatch<SetStateAction<string>>;
    isTranslating: boolean;
    audioUrl: string | null;
}

export function useLetterTrackingPipeline(
    videoRef: RefObject<HTMLVideoElement>,
    landmarks: Landmark[][] | null
): LetterTrackingPipelineResult {
    const [spelledPhrase, setSpelledPhrase] = useState("");
    const [isDetectingSign, setIsDetectingSign] = useState(false);
    const [status, setStatus] = useState("Awaiting hand sign…");
    const [detectedLetter, setDetectedLetter] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    const smootherRef = useRef<LandmarkSmoother>(new LandmarkSmoother());
    const historyRef = useRef<HandHistory>(new HandHistory());
    const confidenceAccumulator = useRef<Record<string, number>>({});

    // Lower threshold for letters since they transition quickly
    const COMMIT_THRESHOLD = 2.0;

    useEffect(() => {
        if (!landmarks || landmarks.length === 0 || !isDetectingSign) {
            if (!landmarks || landmarks.length === 0) setDetectedLetter(null);
            return;
        }

        // Process primary hand only for spelling
        const handLms = landmarks[0];
        const vel = historyRef.current.getVelocity();
        const smoothed = smootherRef.current.smooth(handLms, vel);
        historyRef.current.add(smoothed);

        const { word, allScores } = classifyAslLetter(smoothed, historyRef.current);

        let currentBestWord = "NONE";
        let currentBestScore = 0;

        for (const [letter, score] of Object.entries(allScores)) {
            if (score > 0.4) {
                confidenceAccumulator.current[letter] = (confidenceAccumulator.current[letter] || 0) + score;
            } else {
                confidenceAccumulator.current[letter] = Math.max(0, (confidenceAccumulator.current[letter] || 0) - 0.5); // Fast decay
            }

            if (confidenceAccumulator.current[letter] > currentBestScore) {
                currentBestScore = confidenceAccumulator.current[letter];
                currentBestWord = letter;
            }
        }

        setDetectedLetter(currentBestWord !== "NONE" ? currentBestWord : null);

        const tops = Object.entries(confidenceAccumulator.current as Record<string, number>)
            .filter(([_, score]) => score > 0.5)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 3)
            .map(([letter]) => letter);
        setSuggestions(tops);

        if (currentBestScore >= COMMIT_THRESHOLD) {
            const finalLetter = currentBestWord;

            setSpelledPhrase((prev) => {
                // Add letter. Automatically space after 1.5 seconds of NO hands / low confidence?
                // Instead, user adds space manually or we detect a "Swish" / drop hand for space.
                // For now, just concatenate if it's different from the very last committed letter to avoid machine-gunning AAAAA

                if (prev.length > 0 && prev.endsWith(finalLetter)) {
                    return prev;
                }
                return prev + finalLetter;
            });

            setStatus(`✓ ${finalLetter}`);

            // Flash reset 
            confidenceAccumulator.current = {};

            // Introduce cooldown before next commit
            setIsDetectingSign(false);
            setTimeout(() => setIsDetectingSign(true), 1500);
        }

    }, [landmarks, isDetectingSign]);

    const beginSpelling = useCallback(() => {
        setIsDetectingSign(true);
        setDetectedLetter(null);
        setStatus("Position hand and start spelling…");
        confidenceAccumulator.current = {};
    }, []);

    const commitSegment = useCallback(() => {
        // Treat as space bar
        setSpelledPhrase((prev) => prev.endsWith(" ") ? prev : prev + " ");
        setStatus("Space added.");
    }, []);

    const undoLastLetter = useCallback(() => {
        setSpelledPhrase((prev) => prev.slice(0, -1));
        setStatus("Letter removed.");
    }, []);

    const clearSpelling = useCallback(() => {
        setSpelledPhrase("");
        setAudioUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setStatus("Ready");
    }, []);

    const triggerTranslate = useCallback(async () => {
        if (spelledPhrase.length === 0) return;
        setIsTranslating(true);
        setStatus("Converting to speech…");
        try {
            const url = await fetchSpeechUrl(spelledPhrase);
            if (url) {
                setAudioUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                });
                setStatus("Done!");
            } else {
                // No backend (or TTS failed) — speak with the browser's own voice.
                speakNative(spelledPhrase);
                setStatus("Done (using native voice)");
            }
        } finally {
            setIsTranslating(false);
        }
    }, [spelledPhrase]);

    return {
        spelledPhrase,
        isDetectingSign,
        status,
        detectedLetter,
        suggestions,
        beginSpelling,
        commitSegment,
        triggerTranslate,
        undoLastLetter,
        clearSpelling,
        setSpelledPhrase,
        isTranslating,
        audioUrl
    };
}
