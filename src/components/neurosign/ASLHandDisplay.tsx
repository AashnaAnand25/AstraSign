import { useEffect, useState } from "react";
import { getASLWordAnimation, ASLWordAnimation } from "@/data/aslWordAnimations";
import { getOnlineSignData, OnlineSignData } from "@/services/onlineSignService";
import { getHamNoSysSign, HamNoSysSign, parseHamNoSys } from "@/services/hamnosysService";

interface Props {
  word: string;
  isPlaying: boolean;
  onComplete?: () => void;
}

export default function ASLHandDisplay({ word, isPlaying, onComplete }: Props) {
  const [animation, setAnimation] = useState<ASLWordAnimation | null>(null);
  const [onlineSign, setOnlineSign] = useState<OnlineSignData | null>(null);
  const [hamnosysSign, setHamnosysSign] = useState<HamNoSysSign | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [source, setSource] = useState<"local" | "hamnosys" | "online" | "none">("none");

  useEffect(() => {
    if (!word || !isPlaying) {
      setAnimation(null);
      setOnlineSign(null);
      setHamnosysSign(null);
      setProgress(0);
      setCurrentFrame(0);
      setSource("none");
      return;
    }

    const normalizedWord = word.toUpperCase().trim();
    
    // Priority: Local → HamNoSys → Online
    const localAnim = getASLWordAnimation(normalizedWord);
    if (localAnim) {
      setAnimation(localAnim);
      setSource("local");
      setHamnosysSign(null);
      setOnlineSign(null);
    } else {
      const hamno = getHamNoSysSign(normalizedWord);
      if (hamno) {
        setHamnosysSign(hamno);
        setSource("hamnosys");
        setAnimation(null);
        setOnlineSign(null);
      } else {
        const online = getOnlineSignData(normalizedWord);
        if (online) {
          setOnlineSign(online);
          setSource("online");
          setAnimation(null);
          setHamnosysSign(null);
        } else {
          setSource("none");
        }
      }
    }

    // Animation loop
    const startTime = Date.now();
    const duration = 1.5 * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const prog = Math.min(elapsed / duration, 1);
      setProgress(prog);
      
      if (localAnim) {
        const frameIndex = Math.floor(prog * (localAnim.motionSequence.length - 1));
        setCurrentFrame(frameIndex);
      }

      if (prog >= 1) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [word, isPlaying, onComplete]);

  // Render HamNoSys sign (from AudioToSignLanguageConverter model)
  if (source === "hamnosys" && hamnosysSign) {
    const instructions = parseHamNoSys(hamnosysSign.hamnosys);
    
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        {/* Word Title */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-3xl font-bold text-cyan-400">{hamnosysSign.word}</h3>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">HamNoSys</span>
          </div>
          <p className="text-white/60 text-sm mt-1">{hamnosysSign.description}</p>
          <div className="flex gap-3 justify-center mt-2 text-xs text-white/40">
            <span>{hamnosysSign.handshape}</span>
            <span>•</span>
            <span>{hamnosysSign.location}</span>
          </div>
        </div>

        {/* HamNoSys Notation Display */}
        <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
          <p className="text-purple-400 text-xs mb-1">Notation</p>
          <p className="text-white font-mono text-lg">{hamnosysSign.hamnosys}</p>
        </div>

        {/* Hand Visualization with Movement */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="text-8xl">✋</div>
          
          {/* Animated movement indicator */}
          <div 
            className="absolute w-full h-full border-2 border-purple-500/30 rounded-full"
            style={{
              animation: "pulse 2s infinite",
              transform: `scale(${0.8 + progress * 0.4})`,
            }}
          />
          
          {/* Handshape indicator */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-2">
            <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
              {hamnosysSign.handshape}
            </span>
          </div>
        </div>

        {/* Movement Details */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/40">
          <div className="bg-white/5 p-2 rounded">
            <span className="text-purple-400">Movement:</span>
            <p>{hamnosysSign.movement}</p>
          </div>
          <div className="bg-white/5 p-2 rounded">
            <span className="text-purple-400">Orientation:</span>
            <p>{hamnosysSign.orientation}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mt-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>0%</span>
            <span>{Math.round(progress * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Parsed Symbols Count */}
        <div className="mt-2 text-white/30 text-xs">
          {instructions.length} HamNoSys symbols
        </div>
      </div>
    );
  }

  // Render online sign (from external source)
  if (source === "online" && onlineSign) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        {/* Word Title */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-3xl font-bold text-cyan-400">{onlineSign.word}</h3>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Online</span>
          </div>
          <p className="text-white/60 text-sm mt-1">{onlineSign.description}</p>
          <div className="flex gap-3 justify-center mt-2 text-xs text-white/40">
            <span>{onlineSign.handshape}</span>
            <span>•</span>
            <span>{onlineSign.location}</span>
          </div>
        </div>

        {/* Static Hand Representation */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="text-8xl">✋</div>
          
          {/* Finger indicators */}
          <div className="absolute top-0 left-1/2 flex flex-col items-center -translate-x-1/2">
            <div className="w-3 h-16 bg-blue-500 rounded-full mb-1" /> {/* Index */}
            <div className="w-3 h-20 bg-green-500 rounded-full" /> {/* Middle */}
          </div>
          <div className="absolute top-4 right-4">
            <div className="w-2 h-14 bg-purple-500 rounded-full" /> {/* Ring */}
          </div>
          <div className="absolute top-8 right-0">
            <div className="w-2 h-12 bg-red-500 rounded-full" /> {/* Pinky */}
          </div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2">
            <div className="w-6 h-10 bg-yellow-500 rounded-full rotate-[-30deg]" /> {/* Thumb */}
          </div>
        </div>

        {/* External Link */}
        {onlineSign.videoUrl && (
          <a 
            href={onlineSign.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
          >
            📺 View Video Reference
          </a>
        )}

        {/* Progress Bar */}
        <div className="w-full max-w-xs mt-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-cyan-500 transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>0%</span>
            <span>{Math.round(progress * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    );
  }

  // No sign found
  if (source === "none") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/50">
        <div className="text-6xl mb-4">❓</div>
        <p className="text-lg">No sign found for "{word}"</p>
        <p className="text-sm mt-2 text-white/30">Try: HELLO, THANK, PLEASE, YES, NO</p>
      </div>
    );
  }

  const frame = animation?.motionSequence[currentFrame] || animation?.motionSequence[0];
  if (!frame || !animation) return null;
  
  const { fingers, handPosition, handRotation } = frame;

  // Calculate finger positions (0=curled, 1=extended)
  const fingerAngles = {
    thumb: (1 - fingers.thumb) * 70,
    index: (1 - fingers.index) * 80,
    middle: (1 - fingers.middle) * 85,
    ring: (1 - fingers.ring) * 80,
    pinky: (1 - fingers.pinky) * 75,
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4">
      {/* Word Title */}
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-3xl font-bold text-cyan-400">{animation.word}</h3>
          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">Local</span>
        </div>
        <p className="text-white/60 text-sm mt-1">{animation.description}</p>
        <div className="flex gap-3 justify-center mt-2 text-xs text-white/40">
          <span>{animation.handshape}</span>
          <span>•</span>
          <span>{animation.location}</span>
        </div>
      </div>

      {/* Simple Hand Visualization */}
      <div 
        className="relative w-48 h-48"
        style={{
          transform: `
            rotateX(${handRotation.x * 45}deg)
            rotateY(${handRotation.y * 45}deg)
            rotateZ(${handRotation.z * 45}deg)
            translateX(${handPosition.x * 20}px)
            translateY(${handPosition.y * -20}px)
          `,
          transition: "transform 0.1s ease-out"
        }}
      >
        {/* Palm */}
        <div className="absolute top-1/2 left-1/2 w-20 h-24 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
          <span className="text-2xl">✋</span>
        </div>

        {/* Thumb */}
        <div 
          className="absolute top-1/2 left-0 w-8 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-md origin-bottom-right"
          style={{
            transform: `rotate(${-30 + fingerAngles.thumb}deg)`,
            transformOrigin: "100% 100%",
          }}
        />

        {/* Index Finger */}
        <div 
          className="absolute top-0 left-1/2 w-6 h-20 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-md -translate-x-1/2"
          style={{
            transform: `translateX(-50%) rotateX(${fingerAngles.index}deg)`,
            transformOrigin: "bottom center",
          }}
        />

        {/* Middle Finger */}
        <div 
          className="absolute -top-4 left-1/2 w-6 h-24 bg-gradient-to-b from-green-400 to-green-600 rounded-full shadow-md -translate-x-1/2"
          style={{
            transform: `translateX(-50%) rotateX(${fingerAngles.middle}deg)`,
            transformOrigin: "bottom center",
          }}
        />

        {/* Ring Finger */}
        <div 
          className="absolute top-0 right-1/4 w-6 h-20 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full shadow-md"
          style={{
            transform: `rotateX(${fingerAngles.ring}deg)`,
            transformOrigin: "bottom center",
          }}
        />

        {/* Pinky */}
        <div 
          className="absolute top-4 right-0 w-5 h-16 bg-gradient-to-b from-red-400 to-red-600 rounded-full shadow-md"
          style={{
            transform: `rotateX(${fingerAngles.pinky}deg)`,
            transformOrigin: "bottom center",
          }}
        />
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mt-6">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>0%</span>
          <span>{Math.round(progress * 100)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Frame Counter */}
      <div className="mt-2 text-white/30 text-xs">
        Frame {currentFrame + 1} / {animation.motionSequence.length}
      </div>
    </div>
  );
}
