import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Settings, Camera, CameraOff, Mic, MicOff } from "lucide-react";
import { useAccessibility } from "@/accessibility/AccessibilityProvider";

interface Props {
  onBack: () => void;
  onSettings: () => void;
}

// MediaPipe hand landmark indices for ASL recognition
const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
};

// ASL letter recognition patterns (simplified)
const ASL_PATTERNS = {
  'A': { thumbUp: true, fingersDown: ['index', 'middle', 'ring', 'pinky'] },
  'B': { thumbUp: false, fingersUp: ['index', 'middle', 'ring', 'pinky'] },
  'C': { thumbUp: false, curved: ['index', 'middle', 'ring', 'pinky'] },
  'D': { thumbUp: false, fingersUp: ['index'], othersDown: ['middle', 'ring', 'pinky'] },
  'E': { thumbUp: false, fingersDown: ['index', 'middle', 'ring', 'pinky'] },
  'F': { thumbUp: true, fingersUp: ['index'], thumbTouchingIndex: true },
  'I': { thumbUp: false, fingersUp: ['pinky'] },
  'L': { thumbUp: true, fingersUp: ['index'] },
  'O': { thumbUp: false, curved: ['index', 'middle', 'ring', 'pinky'], touchingThumb: true },
  'V': { thumbUp: false, fingersUp: ['index', 'middle'] },
  'W': { thumbUp: false, fingersUp: ['index', 'middle', 'ring'] },
  'Y': { thumbUp: true, fingersUp: ['pinky'] },
};

export default function SignToVoiceEnhanced({ onBack, onSettings }: Props) {
  const { settings } = useAccessibility();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedSign, setDetectedSign] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [handLandmarks, setHandLandmarks] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  // Simulated hand tracking (replace with actual MediaPipe integration)
  const simulateHandTracking = () => {
    // Simulate random hand landmarks for demo
    const simulatedLandmarks = Array.from({ length: 21 }, (_, i) => ({
      x: Math.random() * 0.5 + 0.25,
      y: Math.random() * 0.5 + 0.25,
      z: Math.random() * 0.1 - 0.05,
    }));
    setHandLandmarks(simulatedLandmarks);
    
    // Simulate ASL recognition
    const letters = Object.keys(ASL_PATTERNS);
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomConfidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    setDetectedSign(randomLetter);
    setConfidence(randomConfidence);
    
    // Build translated text
    setTranslatedText(prev => {
      const newText = prev + (prev ? " " : "") + randomLetter;
      return newText.length > 50 ? newText.slice(-50) : newText; // Keep last 50 chars
    });
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      // Fallback to simulation
      setIsCameraActive(true);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsRecording(false);
  };

  // Toggle recording
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Start recognition loop
      const recognizeLoop = () => {
        if (isRecording) {
          simulateHandTracking();
          animationRef.current = requestAnimationFrame(recognizeLoop);
        }
      };
      recognizeLoop();
    } else {
      setIsRecording(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if (!settings.voiceGuidance || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Number(getComputedStyle(document.documentElement).getPropertyValue("--a11y-speech-rate")) || 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Auto-speak when new text is detected
  useEffect(() => {
    if (translatedText && settings.voiceGuidance) {
      speakText(translatedText);
    }
  }, [translatedText, settings.voiceGuidance]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Camera preview area */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0a15] to-[#080810]">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(hsl(272 76% 53% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(272 76% 53% / 0.3) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        
        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isCameraActive ? "block" : "none" }}
        />
        
        {/* Canvas for hand tracking visualization */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: isCameraActive ? "block" : "none" }}
        />
        
        {/* Hand landmarks overlay */}
        {isRecording && handLandmarks.length > 0 && (
          <svg className="absolute inset-0 w-full h-full">
            {handLandmarks.map((landmark, i) => (
              <circle
                key={i}
                cx={`${landmark.x * 100}%`}
                cy={`${landmark.y * 100}%`}
                r="4"
                fill={confidence >= 80 ? "#00ffff" : "#8b5cf6"}
                opacity="0.8"
              />
            ))}
            {/* Draw connections */}
            {[
              [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
              [0, 5], [5, 6], [6, 7], [7, 8], // Index
              [0, 9], [9, 10], [10, 11], [11, 12], // Middle
              [0, 13], [13, 14], [14, 15], [15, 16], // Ring
              [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            ].map(([start, end], i) => (
              <line
                key={i}
                x1={`${handLandmarks[start]?.x * 100}%`}
                y1={`${handLandmarks[start]?.y * 100}%`}
                x2={`${handLandmarks[end]?.x * 100}%`}
                y2={`${handLandmarks[end]?.y * 100}%`}
                stroke={confidence >= 80 ? "#00ffff" : "#8b5cf6"}
                strokeWidth="2"
                opacity="0.6"
              />
            ))}
          </svg>
        )}
        
        {/* Scan line effect */}
        {isRecording && (
          <div
            className="absolute left-0 right-0 h-px opacity-30"
            style={{
              background: "hsl(183 100% 50%)",
              boxShadow: "0 0 10px hsl(183 100% 50%)",
              animation: "scan-line 3s linear infinite",
              top: "40%",
            }}
          />
        )}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-glow-pulse" />
          <span className="font-display text-sm font-bold gradient-text-purple-cyan">NEUROSIGN</span>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-xl glass neon-border-purple flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Mode indicator */}
      <div className="relative z-10 flex justify-center mb-2">
        <div className="glass rounded-full px-4 py-1.5 neon-border-purple flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="1" width="2.5" height="8" rx="1.25" fill="hsl(272 76% 53%)" />
            <rect x="5.5" y="2.5" width="2.5" height="6.5" rx="1.25" fill="hsl(272 76% 53%)" opacity="0.8" />
            <rect x="9" y="0.5" width="2.5" height="9" rx="1.25" fill="hsl(272 76% 53%)" opacity="0.6" />
          </svg>
          <span className="text-xs font-semibold text-neon-purple tracking-wider">SIGN → VOICE</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Detection results */}
      {detectedSign && (
        <div className="relative z-10 mx-5 mb-3 glass neon-border-cyan rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-glow-pulse" />
              <span className="text-xs text-neon-cyan tracking-wider font-medium">DETECTED SIGN</span>
            </div>
            <span className="text-xs font-bold text-neon-cyan">{confidence}%</span>
          </div>
          <div className="text-3xl font-bold text-center text-neon-cyan mb-2">
            {detectedSign}
          </div>
        </div>
      )}

      {/* Translated text */}
      {translatedText && (
        <div className="relative z-10 mx-5 mb-3 glass neon-border-purple rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-purple animate-glow-pulse" />
              <span className="text-xs text-neon-purple tracking-wider font-medium">TRANSLATED TEXT</span>
            </div>
            <button
              onClick={() => speakText(translatedText)}
              disabled={isSpeaking}
              className="text-xs font-medium px-2 py-1 rounded-full transition-all disabled:opacity-30"
              style={{
                background: "hsl(240 10% 10%)",
                border: "1px solid hsl(240 10% 16%)",
                color: "hsl(272 76% 53%)",
              }}
            >
              {isSpeaking ? <MicOff size={12} /> : <Mic size={12} />}
            </button>
          </div>
          <p className="text-foreground font-medium text-base leading-relaxed">
            {translatedText}
          </p>
        </div>
      )}

      {/* Control panel */}
      <div className="relative z-10 mx-3 mb-6 glass-strong rounded-3xl p-5" style={{ boxShadow: "0 -10px 40px hsl(272 76% 53% / 0.1)" }}>
        <div className="flex items-center justify-center gap-6">
          {/* Camera toggle */}
          <div className="text-center">
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
              style={{
                background: isCameraActive
                  ? "hsl(316 80% 60% / 0.15)"
                  : "hsl(240 10% 20%)",
                border: `1px solid ${isCameraActive ? "hsl(316 80% 60% / 0.3)" : "hsl(240 10% 30%)"}`,
                color: isCameraActive ? "hsl(316 80% 60%)" : "hsl(240 5% 55%)",
              }}
            >
              {isCameraActive ? <CameraOff size={18} /> : <Camera size={18} />}
            </button>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {isCameraActive ? "Camera Off" : "Camera On"}
            </span>
          </div>

          {/* Record button */}
          <div className="relative">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "hsl(272 76% 53%)", transform: "scale(1.5)" }} />
                <div className="absolute inset-0 rounded-full" style={{
                  width: "88px", height: "88px", top: "-12px", left: "-12px",
                  border: "2px solid hsl(272 76% 53% / 0.4)",
                  borderRadius: "50%",
                  animation: "pulse-purple 1.5s ease-in-out infinite",
                }} />
              </>
            )}
            <button
              onClick={toggleRecording}
              disabled={!isCameraActive}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90 relative z-10 disabled:opacity-30"
              style={{
                background: isRecording
                  ? "linear-gradient(135deg, hsl(316 80% 60%), hsl(272 76% 53%))"
                  : "linear-gradient(135deg, hsl(272 76% 53%), hsl(272 76% 40%))",
                boxShadow: isRecording
                  ? "0 0 30px hsl(316 80% 60% / 0.6), 0 0 60px hsl(316 80% 60% / 0.3)"
                  : "0 0 25px hsl(272 76% 53% / 0.5)",
              }}
            >
              {isRecording ? (
                <div className="w-5 h-5 rounded bg-white" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="8" y="3" width="8" height="14" rx="4" fill="white" />
                  <path d="M4 12a8 8 0 0016 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <line x1="12" y1="20" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="9" y1="23" x2="15" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Clear button */}
          <div className="text-center">
            <button
              onClick={() => {
                setTranslatedText("");
                setDetectedSign("");
                setConfidence(0);
              }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
              style={{
                background: "hsl(240 10% 20%)",
                border: "1px solid hsl(240 10% 30%)",
                color: "hsl(240 5% 55%)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-[10px] text-muted-foreground mt-1 block">Clear</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {!isCameraActive ? "Enable camera to start" : 
           isRecording ? "Detecting hand signs..." : 
           "Tap to start recognition"}
        </p>
      </div>
    </div>
  );
}
