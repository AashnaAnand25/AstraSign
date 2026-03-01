import React, { useState, useEffect } from 'react';
import { ASL_GIF_DICTIONARY } from '@/data/aslGifs';
import { ASL_ALPHABET_IMAGES } from '@/data/aslAlphabetImages';
import { Loader2 } from 'lucide-react';

interface ASLGifPlayerProps {
    currentWord?: string;
    currentLetter?: string;
    isAnimating: boolean;
}

export default function ASLGifPlayer({ currentWord, currentLetter, isAnimating }: ASLGifPlayerProps) {
    const [loading, setLoading] = useState(false);

    // Decide what media to show
    let mediaUrl = '';
    let uiText = '';
    let isImage = false; // true if static image (alphabet), false if GIF

    if (!isAnimating) {
        mediaUrl = '';
        uiText = 'Waiting for input...';
    } else if (currentWord) {
        // Try to find exact match
        const upperWord = currentWord.toUpperCase();
        const gifData = ASL_GIF_DICTIONARY[upperWord];

        if (gifData) {
            mediaUrl = gifData.url;
            uiText = upperWord;
        } else {
            // Fallback if no GIF exists for this word
            uiText = `[No video for: ${upperWord}]`;
        }
    } else if (currentLetter) {
        const upperLetter = currentLetter.toUpperCase();
        const imgData = ASL_ALPHABET_IMAGES[upperLetter];

        if (imgData) {
            mediaUrl = imgData;
            uiText = `Letter: ${upperLetter}`;
            isImage = true;
        } else {
            // Spaces or unknown punctuation
            uiText = upperLetter === ' ' ? '[Space]' : upperLetter;
        }
    }

    // Effect to briefly show loader when URL changes
    useEffect(() => {
        if (mediaUrl) {
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 300); // Fake load time / actual load time buffer
            return () => clearTimeout(timer);
        }
    }, [mediaUrl]);

    return (
        <div className="relative w-full h-[300px] sm:h-[400px] w-full rounded-2xl overflow-hidden bg-black/60 border border-[hsl(183,100%,50%,0.3)] shadow-[0_0_20px_rgba(0,255,255,0.1)] flex flex-col items-center justify-center">

            {/* Background ambient glow matching the aesthetic */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[hsl(272,76%,53%,0.1)] to-transparent pointer-events-none" />

            {/* Main Media Viewer */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                {!isAnimating ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-[hsl(183,100%,50%,0.5)] flex items-center justify-center text-[hsl(183,100%,50%,0.5)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                        </div>
                        <p className="text-[hsl(183,100%,70%)] font-medium tracking-wide">Ready for Translation</p>
                        <p className="text-xs text-[hsl(272,76%,70%)] opacity-70">Real Humans • Real ASL</p>
                    </div>
                ) : mediaUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 rounded-xl backdrop-blur-sm">
                                <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
                            </div>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={mediaUrl}
                            alt={uiText}
                            className={`max-w-full max-h-full object-contain rounded-xl shadow-lg transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'} ${!isImage && 'mix-blend-screen'}`}
                            style={{
                                filter: isImage ? 'drop-shadow(0 0 10px rgba(255,255,255,0.8)) invert(1)' : 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.2))'
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-4xl font-bold text-white tracking-widest" style={{ textShadow: "0 0 15px rgba(255,255,255,0.8)" }}>{uiText}</p>
                    </div>
                )}
            </div>

            {/* Gloss Subtitle Glass Pane */}
            {isAnimating && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-6 py-2 rounded-full border border-[hsl(183,100%,50%,0.4)] bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                    <p className="text-sm font-bold tracking-widest uppercase text-[hsl(183,100%,60%)]">
                        {uiText}
                    </p>
                </div>
            )}
        </div>
    );
}
