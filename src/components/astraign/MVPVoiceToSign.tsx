import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Mic, MicOff, Type, ArrowLeft } from "lucide-react";
import { restructureToASLGrammar } from "@/data/aslGrammar";
import { getSpeechRecognition } from "@/lib/speechRecognition";

// The Map the user requested
const ANIMATION_MAP: Record<string, string> = {
    "HELLO": "/animations/HELLO.glb",
    "HOW": "/animations/HOW.glb",
    "ARE": "/animations/ARE.glb",
    "YOU": "/animations/YOU.glb",
    "THANK": "/animations/THANK.glb",
    "PLEASE": "/animations/PLEASE.glb",
    "YES": "/animations/YES.glb",
    "NO": "/animations/NO.glb",
};

// Cool Green primary color (matching new theme)
const PRIMARY_GREEN = "#2F9E6F";
const PRIMARY_LIGHT = "#40C48D";

function useGradientTexture() {
    return React.useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        const g = ctx.createLinearGradient(0, 0, 128, 128);
        g.addColorStop(0, PRIMARY_GREEN);
        g.addColorStop(0.5, "#369E7A");
        g.addColorStop(1, PRIMARY_LIGHT);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, []);
}

// Hand material: green gradient + subtle glow
function HandMaterial({ gradientTex }: { gradientTex: THREE.CanvasTexture | null }) {
    return (
        <meshStandardMaterial
            map={gradientTex || undefined}
            color={gradientTex ? "#ffffff" : PRIMARY_GREEN}
            emissive={PRIMARY_GREEN}
            emissiveIntensity={0.12}
            roughness={0.35}
            metalness={0.1}
        />
    );
}

// Curl amount -> rotation (radians) for finger bend. One rotation per finger (whole finger curls).
const CURL_STRENGTH = 1.1;

// One hand: palm + 5 fingers; finger groups get rotation from fingerCurlsRef for folding
function HandMesh({
    isLeft,
    gradientTex,
    fingerCurlsRef,
}: {
    isLeft: boolean;
    gradientTex: THREE.CanvasTexture | null;
    fingerCurlsRef?: React.MutableRefObject<FingerCurls>;
}) {
    const s = isLeft ? -1 : 1;
    const thumbRef = useRef<THREE.Group>(null);
    const indexRef = useRef<THREE.Group>(null);
    const middleRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Group>(null);
    const pinkyRef = useRef<THREE.Group>(null);

    useFrame(() => {
        const curls = fingerCurlsRef?.current ?? FLAT;
        const setCurl = (ref: React.RefObject<THREE.Group | null>, c: number) => {
            if (ref.current) ref.current.rotation.x = -c * CURL_STRENGTH;
        };
        setCurl(thumbRef, curls[0]);
        setCurl(indexRef, curls[1]);
        setCurl(middleRef, curls[2]);
        setCurl(ringRef, curls[3]);
        setCurl(pinkyRef, curls[4]);
    });

    return (
        <group scale={[s, 1, 1]}>
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.14, 0.08, 0.04]} />
                <HandMaterial gradientTex={gradientTex} />
            </mesh>
            <group ref={thumbRef} position={[s * 0.06, -0.02, 0.02]}>
                <mesh castShadow>
                    <boxGeometry args={[0.04, 0.035, 0.025]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
                <mesh position={[s * 0.022, -0.02, 0]} castShadow>
                    <boxGeometry args={[0.025, 0.04, 0.02]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
            </group>
            <group ref={indexRef} position={[s * 0.055, 0.055, 0.01]}>
                <mesh castShadow>
                    <boxGeometry args={[0.022, 0.045, 0.02]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
                <mesh position={[0, 0.048, 0]} castShadow>
                    <boxGeometry args={[0.018, 0.04, 0.016]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
            </group>
            <group ref={middleRef} position={[s * 0.02, 0.07, 0.01]}>
                <mesh castShadow>
                    <boxGeometry args={[0.022, 0.05, 0.02]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
                <mesh position={[0, 0.052, 0]} castShadow>
                    <boxGeometry args={[0.018, 0.044, 0.016]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
            </group>
            <group ref={ringRef} position={[s * -0.02, 0.065, 0.01]}>
                <mesh castShadow>
                    <boxGeometry args={[0.02, 0.046, 0.018]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
                <mesh position={[0, 0.046, 0]} castShadow>
                    <boxGeometry args={[0.016, 0.038, 0.014]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
            </group>
            <group ref={pinkyRef} position={[s * -0.055, 0.05, 0.01]}>
                <mesh castShadow>
                    <boxGeometry args={[0.018, 0.038, 0.016]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
                <mesh position={[0, 0.036, 0]} castShadow>
                    <boxGeometry args={[0.014, 0.03, 0.012]} />
                    <HandMaterial gradientTex={gradientTex} />
                </mesh>
            </group>
        </group>
    );
}

// Hands lower in view, palms facing camera (rotY 0 = face +Z)
const HAND_X = 0.36;
const HAND_Z = 0.08;
const Y_DOWN = -0.12;
const Y_CHEST = 0.02;
const Y_FOREHEAD = 0.12;
const FACE_CAMERA_Y_LEFT = 0;
const FACE_CAMERA_Y_RIGHT = 0;

// Finger curl 0 = flat, 1 = curled. [thumb, index, middle, ring, pinky]
const FLAT = [0, 0, 0, 0, 0] as const;
const FIST = [1, 1, 1, 1, 1] as const;
const POINT = [1, 0, 1, 1, 1] as const; // index extended (YOU)
const NO_HAND = [0.8, 0, 0, 0.6, 0.6] as const; // index+middle out, thumb tap
const OK_HAND = [0.9, 0.9, 1, 1, 1] as const; // index touches thumb (O)

type FingerCurls = readonly [number, number, number, number, number];

type HandPose = {
    y: number;
    x: number;
    z: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    fingerCurls: FingerCurls;
};

function hand(y: number, z: number, rotX: number, rotY: number, rotZ: number, fingerCurls: FingerCurls = FLAT): HandPose {
    return { y, x: HAND_X, z, rotX, rotY, rotZ, fingerCurls };
}

// Hardcoded ASL: handshape (finger curls) + motion per MVP list
function getSignPose(word: string, t: number, motion: number): { left: HandPose; right: HandPose } {
    const w = word.toUpperCase();
    const lift = Math.min(1, t * 2.2);

    switch (w) {
        case "HELLO": {
            // Flat hand, small wave from forehead
            const y = Y_DOWN + lift * (Y_FOREHEAD - Y_DOWN);
            const wave = motion > 0 ? Math.sin(motion * 4) * 0.6 : 0;
            return { left: { ...hand(y, HAND_Z, 0, 0, 0), x: -HAND_X }, right: hand(y, HAND_Z, -0.15, 0, wave, FLAT) };
        }
        case "YES": {
            // Fist, nod up and down
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const nod = Math.sin(motion * 3) * 0.08;
            const thumbsUp = Math.min(1, motion * 2) * -0.65; // tilt back for "thumbs up"
            return { left: { ...hand(y + nod, HAND_Z, thumbsUp, 0, 0), x: -HAND_X }, right: hand(y + nod, HAND_Z, thumbsUp, 0, 0, FIST) };
        }
        case "NO": {
            // Index+middle tap thumb (simplified: slight curl), shake
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const shake = Math.sin(motion * 12) * 0.28;
            return { left: { ...hand(y, HAND_Z, 0, 0, shake), x: -HAND_X }, right: hand(y, HAND_Z, 0, 0, shake, NO_HAND) };
        }
        case "THANK":
        case "THANKYOU": {
            // Flat hand, from chin outward
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const out = Math.min(1, motion * 1.5) * 0.35;
            return { left: { ...hand(y, HAND_Z, 0, 0, 0), x: -HAND_X }, right: hand(y, HAND_Z + out * 0.3, 0.2, 0, out, FLAT) };
        }
        case "PLEASE": {
            // Flat hand, circular on chest
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const circle = motion * Math.PI * 1.2;
            return { left: { ...hand(y, HAND_Z, 0, circle * 0.4, 0), x: -HAND_X }, right: hand(y, HAND_Z, 0, circle, 0, FLAT) };
        }
        case "HELP": {
            // Flat palm up, lift slightly
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const up = Math.min(1, motion * 1.5) * 0.4;
            return { left: { ...hand(y, HAND_Z, 0, 0, 0), x: -HAND_X }, right: hand(y + up * 0.15, HAND_Z, up, 0, 0, FLAT) };
        }
        case "STOP": {
            // Flat palm forward, hold
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            return { left: { ...hand(y, HAND_Z, 0, 0, 0), x: -HAND_X }, right: hand(y, HAND_Z, -0.1, 0, 0, FLAT) };
        }
        case "OK": {
            // Index touches thumb (O), slight bounce
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const bounce = Math.sin(motion * 4) * 0.04;
            return { left: { ...hand(y + bounce, HAND_Z, 0, 0, 0), x: -HAND_X }, right: hand(y + bounce, HAND_Z, 0, 0, 0, OK_HAND) };
        }
        case "SORRY": {
            // Fist, circular on chest
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const circle = motion * Math.PI * 1.2;
            return { left: { ...hand(y, HAND_Z, 0, circle * 0.4, 0), x: -HAND_X }, right: hand(y, HAND_Z, 0, circle, 0, FIST) };
        }
        case "WAIT": {
            // W-shape (3 fingers up) simplified as slight curl ring+pinky, small shake
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const shake = Math.sin(motion * 8) * 0.2;
            const curls: FingerCurls = [0, 0, 0, 0.4, 0.5];
            return { left: { ...hand(y, HAND_Z, 0, 0, shake), x: -HAND_X }, right: hand(y, HAND_Z, 0, 0, shake, curls) };
        }
        case "YOU": {
            // Point (index extended)
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const point = Math.min(1, motion * 1.2) * 0.5;
            return { left: { ...hand(y, HAND_Z, 0, 0, 0), x: -HAND_X }, right: hand(y, HAND_Z + point * 0.2, -point, 0, 0, POINT) };
        }
        case "HOW": {
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const palmsUp = Math.min(1, motion * 1.2) * 0.5;
            return { left: { ...hand(y, HAND_Z, palmsUp, 0, 0), x: -HAND_X - Math.sin(motion * 2) * 0.06 }, right: hand(y, HAND_Z, palmsUp, 0, 0, FLAT) };
        }
        case "ARE": {
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const wave = Math.sin(motion * 3) * 0.3;
            return { left: { ...hand(y, HAND_Z, 0, 0, 0), x: -HAND_X }, right: hand(y, HAND_Z, 0, 0, wave, FLAT) };
        }
        default: {
            const y = Y_DOWN + lift * (Y_CHEST - Y_DOWN);
            const wave = Math.sin(motion * 3) * 0.4;
            return { left: { ...hand(y, HAND_Z, 0, 0, 0), x: -HAND_X }, right: hand(y, HAND_Z, 0, 0, wave, FLAT) };
        }
    }
}

// One hand (dominant right), hardcoded ASL signs per word; finger curls passed via ref for per-frame pose
function AnimatedHands({ word, gradientTex }: { word: string; gradientTex: THREE.CanvasTexture | null }) {
    const handRef = useRef<THREE.Group>(null);
    const startRef = useRef<number | null>(null);
    const fingerCurlsRef = useRef<FingerCurls>(FLAT);

    useFrame((state) => {
        if (startRef.current === null) startRef.current = state.clock.elapsedTime;
        const t = state.clock.elapsedTime - startRef.current;
        if (t > 2.2) return;

        const motion = t > 0.3 ? t - 0.3 : 0;
        const pose = getSignPose(word, t, motion);
        const h = pose.right;

        fingerCurlsRef.current = h.fingerCurls;
        if (handRef.current) {
            handRef.current.position.set(0, h.y, h.z);
            handRef.current.rotation.set(h.rotX, h.rotY + FACE_CAMERA_Y_RIGHT, h.rotZ);
        }
    });

    return (
        <group ref={handRef} position={[0, Y_DOWN, HAND_Z]} scale={2.2}>
            <HandMesh isLeft={false} gradientTex={gradientTex} fingerCurlsRef={fingerCurlsRef} />
        </group>
    );
}

// Hands-only scene: no astronaut, hands are the main focus
function HandsScene({ currentWord, gradientTex }: { currentWord: string | null; gradientTex: THREE.CanvasTexture | null }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {currentWord && <AnimatedHands key={currentWord} word={currentWord} gradientTex={gradientTex} />}
        </group>
    );
}

interface Props {
    onBack?: () => void;
    embedded?: boolean;
}

const QUICK_PHRASES = ["Hello", "Thank you", "How are you", "Yes", "No"];

export default function MVPVoiceToSign({ onBack, embedded }: Props) {
    const [inputText, setInputText] = useState("");
    const [gloss, setGloss] = useState<string[]>([]);
    const [currentWord, setCurrentWord] = useState<string | null>(null);
    const [currentAnimUrl, setCurrentAnimUrl] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const gradientTex = useGradientTexture();

    // Web Speech API for voice input
    useEffect(() => {
        if (!isListening) return;

        const SpeechRecognition = getSpeechRecognition();
        if (!SpeechRecognition) {
            alert("Browser speech recognition not supported in this browser.");
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setInputText(text);
            handleTranslate(text);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();

        return () => {
            recognition.stop();
        };
    }, [isListening]);

    // Text -> Gloss. Rule-based and local, so this works with no backend.
    // Falls back to a plain uppercase split if every word got dropped.
    const textToGloss = (text: string) => {
        const gloss = restructureToASLGrammar(text).split(/\s+/).filter(Boolean);
        return gloss.length > 0 ? gloss : text.toUpperCase().split(/\s+/).filter(Boolean);
    };

    // Playback Loop
    const playGloss = async (glossArray: string[]) => {
        setIsPlaying(true);
        for (const word of glossArray) {
            setCurrentWord(word);
            const animFile = ANIMATION_MAP[word];
            if (animFile) {
                setCurrentAnimUrl(animFile);
                // Wait for the animation duration (approx 2s per sign for MVP)
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } else {
                // If no animation, just show the word for 1 second
                setCurrentAnimUrl(null);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        setCurrentWord(null);
        setCurrentAnimUrl(null);
        setIsPlaying(false);
    };

    const handleTranslate = (textToProcess: string = inputText) => {
        if (!textToProcess.trim() || isPlaying) return;
        const glossArray = textToGloss(textToProcess);
        setGloss(glossArray);
        playGloss(glossArray);
    };

    return (
        <div className={`w-full min-h-screen bg-background flex flex-col pt-16 pb-24 ${!embedded ? "px-6" : ""}`}>
            {!embedded && (
                <div className="flex items-center justify-between mb-8 shrink-0">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-2xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="font-display text-sm font-bold gradient-text-purple-cyan uppercase tracking-widest text-center">Translation</h1>
                        <p className="text-[10px] text-muted-foreground uppercase opacity-70">Voice → ASL</p>
                    </div>
                    <div className="w-10" />
                </div>
            )}

            {/* 3D Canvas — hands lower, centered, palms facing camera */}
            <div className="relative mx-4 mt-4 mb-2 bg-card border border-border rounded-2xl h-[320px] flex-shrink-0 shadow-lg overflow-hidden">
                <Canvas
                    camera={{ position: [0, 0, 1.5], fov: 48 }}
                    style={{ width: "100%", height: 320 }}
                    onCreated={({ gl }) => {
                        // Attempt to prevent context loss on mobile by explicitly disposing when done
                        const cleanup = () => {
                            gl.dispose();
                            gl.forceContextLoss();
                        };
                        window.addEventListener('beforeunload', cleanup);
                        return () => window.removeEventListener('beforeunload', cleanup);
                    }}
                >
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[2, 3, 4]} intensity={1.3} />
                    <Suspense fallback={null}>
                        <HandsScene currentWord={currentWord} gradientTex={gradientTex} />
                    </Suspense>
                    <OrbitControls target={[0, 0, 0.08]} enablePan={false} minDistance={1} maxDistance={3} />
                    <Environment preset="city" />
                </Canvas>

                {/* Gloss Subtitles Overlay */}
                {gloss.length > 0 && (
                    <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
                        <div className="bg-card/95 backdrop-blur-sm border border-primary/50 px-4 py-2.5 rounded-2xl flex flex-wrap justify-center gap-2 max-w-[90%] shadow-md">
                            {gloss.map((word, i) => (
                                <span
                                    key={i}
                                    className={`text-sm font-bold transition-all duration-200 ${word === currentWord
                                        ? "text-primary scale-110"
                                        : "text-muted-foreground"
                                        }`}
                                >
                                    {word}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Try a phrase — compact, moved down a little */}
            <div className="shrink-0 pt-4 px-4 py-3 flex flex-col items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground">Quick phrases</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_PHRASES.map((phrase) => (
                        <button
                            key={phrase}
                            type="button"
                            onClick={() => {
                                if (isPlaying) return;
                                setInputText(phrase);
                                handleTranslate(phrase);
                            }}
                            disabled={isPlaying}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-secondary text-foreground border border-border hover:border-primary hover:bg-accent-subtle transition-all duration-200 disabled:opacity-50 active:scale-95"
                        >
                            {phrase}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 pt-3 pb-6 bg-background shrink-0">
                <div className="flex gap-3 max-w-lg mx-auto">
                    <button
                        onClick={() => setIsListening(!isListening)}
                        disabled={isPlaying}
                        className={`p-4 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 ${isListening
                            ? "bg-destructive/20 text-destructive animate-pulse border-2 border-destructive shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent-subtle border border-border hover:border-primary"
                            } disabled:opacity-50`}
                    >
                        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleTranslate()}
                            disabled={isPlaying}
                            placeholder="Type or speak a phrase..."
                            className="w-full h-full bg-secondary text-foreground placeholder-muted-foreground px-5 pr-14 rounded-2xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                        <button
                            onClick={() => handleTranslate()}
                            disabled={!inputText.trim() || isPlaying}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 hover:bg-primary-hover transition-all duration-200 active:scale-95 shadow-sm"
                        >
                            <Type size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
