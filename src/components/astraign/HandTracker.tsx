import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";
import SimpleHandClassifier from "@/ml/simpleHandClassifier";
import { gestureToWord } from "@/utils/aslStaticPoses";

interface HandTrackerProps {
  onGestureDetected?: (gesture: string, confidence: number) => void;
  onLandmarks?: (landmarks: any[][]) => void;
  isActive: boolean;
}

export default function HandTracker({ onGestureDetected, onLandmarks, isActive }: HandTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentGesture, setCurrentGesture] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const firstFrameRef = useRef(false);
  const videoDrawLoopRef = useRef(false);
  const rafIdRef = useRef<number>(0);
  const cameraRef = useRef<Camera | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const isStartingRef = useRef(false);
  const handClassifier = useMemo(() => new SimpleHandClassifier(), []);

  useEffect(() => {
    // Initialize the classifier when component mounts
    handClassifier.initialize();
  }, [handClassifier]);

  const processHandResults = useCallback(async (results: Results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    // Convert MediaPipe landmarks to our format
    const formattedLandmarks = landmarks.map(landmark => [
      landmark.x,
      landmark.y,
      landmark.z || 0
    ]);

    try {
      // Classify gesture using simple rules
      const result = handClassifier.classifyHand(formattedLandmarks);

      if (result.confidence > 0.5 && onGestureDetected) {
        setCurrentGesture(result.gesture);
        setConfidence(result.confidence);
        onGestureDetected(result.gesture, result.confidence);
      }
    } catch (error) {
      console.error('Gesture classification failed:', error);
    }
  }, [onGestureDetected, handClassifier]);

  const startCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (streamRef.current) return; // Already started
    if (isStartingRef.current) return; // Already in progress

    isStartingRef.current = true;
    setIsLoading(true);
    setCameraError(null);

    try {
      // Secure context required (HTTPS or localhost) — especially on Android
      if (!window.isSecureContext) {
        setCameraError("Camera requires HTTPS. Use https:// or localhost.");
        setIsLoading(false);
        isStartingRef.current = false;
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera not supported in this browser.");
        setIsLoading(false);
        isStartingRef.current = false;
        return;
      }

      console.log("[HandTracker] Requesting camera access...");
      // Android-friendly: facingMode 'user' (front cam), flexible resolution
      const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
      const videoConstraints: MediaTrackConstraints = isMobile
        ? {
            facingMode: { ideal: "user" },
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
          }
        : { width: { ideal: 640 }, height: { ideal: 480 } };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });
      console.log("[HandTracker] Camera access granted.");
      streamRef.current = stream;

      videoRef.current.srcObject = stream;
      // Mobile: play() must be in user gesture context; playsInline prevents fullscreen takeover
      await videoRef.current.play().catch((e) => {
        console.warn("[HandTracker] video.play() failed (common on mobile):", e);
      });

      // Draw video to canvas immediately so user sees themselves while MediaPipe loads (avoids grey screen)
      videoDrawLoopRef.current = true;
      const drawVideoLoop = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!videoDrawLoopRef.current || !video || !canvas || !video.videoWidth) {
          rafIdRef.current = 0;
          return;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        rafIdRef.current = requestAnimationFrame(drawVideoLoop);
      };
      rafIdRef.current = requestAnimationFrame(drawVideoLoop);

      // Hide loading overlay quickly so user sees video (we're drawing it to canvas now)
      setTimeout(() => setIsLoading(false), 600);

      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          const fileName = file.includes('/') ? file.split('/').pop() : file;
          const url = `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${fileName}`;
          return url;
        }
      });

      hands.setOptions({
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      handsRef.current = hands;

      hands.onResults((results) => {
        if (!firstFrameRef.current) {
          firstFrameRef.current = true;
          videoDrawLoopRef.current = false; // Stop our video-only loop; MediaPipe takes over
          console.log("[HandTracker] First MediaPipe frame received.");
        }

        const canvasCtx = canvasRef.current?.getContext('2d');
        if (!canvasCtx || !canvasRef.current || !videoRef.current) return;

        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw video frame
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw hand landmarks
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          for (const landmarks of results.multiHandLandmarks) {
            const connections = [
              [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
              [0, 5], [5, 6], [6, 7], [7, 8], // Index
              [5, 9], [9, 10], [10, 11], [11, 12], // Middle
              [9, 13], [13, 14], [14, 15], [15, 16], // Ring
              [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
              [0, 17] // Palm
            ];

            // Draw connections with neon glow
            canvasCtx.shadowBlur = 10;
            canvasCtx.shadowColor = '#00ffff';
            canvasCtx.strokeStyle = '#00ffff';
            canvasCtx.lineWidth = 3;
            connections.forEach(([start, end]) => {
              const startPoint = landmarks[start];
              const endPoint = landmarks[end];
              canvasCtx.beginPath();
              canvasCtx.moveTo(startPoint.x * canvasRef.current!.width, startPoint.y * canvasRef.current!.height);
              canvasCtx.lineTo(endPoint.x * canvasRef.current!.width, endPoint.y * canvasRef.current!.height);
              canvasCtx.stroke();
            });

            // Draw landmarks
            landmarks.forEach((landmark, index) => {
              const x = landmark.x * canvasRef.current!.width;
              const y = landmark.y * canvasRef.current!.height;

              canvasCtx.beginPath();
              canvasCtx.arc(x, y, 6, 0, 2 * Math.PI);
              canvasCtx.fillStyle = index === 0 ? '#ff006e' : '#ffffff';
              canvasCtx.fill();
              canvasCtx.strokeStyle = '#00ffff';
              canvasCtx.lineWidth = 1;
              canvasCtx.stroke();
            });
          }
        }

        canvasCtx.restore();

        // Expose raw 3D coordinates for fast sign pipeline
        if (onLandmarks && results.multiHandLandmarks) {
          onLandmarks(results.multiHandLandmarks);
        }

        // Process for simple gesture recognition (fallback/legacy)
        try {
          processHandResults(results);
        } catch (err) {
          console.error("[HandTracker] processHandResults error:", err);
        }
      });

      // Start camera (MediaPipe Camera handles requestAnimationFrame loop)
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      cameraRef.current = camera;

      camera.start()
        .then(() => {
          console.log("[HandTracker] MediaPipe Camera started successfully.");
        })
        .catch((err) => {
          console.error("[HandTracker] MediaPipe Camera start failed:", err);
          setIsLoading(false);
        });

      isStartingRef.current = false;

    } catch (error) {
      console.error("Camera initialization failed:", error);
      videoDrawLoopRef.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      setIsLoading(false);
      isStartingRef.current = false;
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("Permission") || msg.includes("NotAllowed") || msg.includes("denied")) {
        setCameraError("Camera access denied. Allow camera in browser or device settings.");
      } else if (msg.includes("NotFound") || msg.includes("Devices")) {
        setCameraError("No camera found.");
      } else if (msg.includes("NotReadable") || msg.includes("in use")) {
        setCameraError("Camera in use. Close other apps using the camera.");
      } else {
        setCameraError("Camera couldn't open. Use HTTPS and allow camera access.");
      }
    }
  }, [processHandResults]);

  const stopCamera = useCallback(() => {
    console.log("[HandTracker] Stopping camera...");
    setCameraError(null);
    firstFrameRef.current = false;
    videoDrawLoopRef.current = false;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = 0;
    isStartingRef.current = false;

    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (handsRef.current) {
      handsRef.current.close().catch(() => { });
      handsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`[HandTracker] Stopped track: ${track.label}`);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  return (
    <div className="relative w-full h-full min-h-[200px]">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg object-cover block"
        style={{ maxHeight: "100%", display: "block" }}
      />
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-background/95 p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">{cameraError}</p>
          <p className="text-xs text-muted-foreground/80 mb-3">On Android: allow camera in Chrome → Site settings</p>
          <button
            type="button"
            onClick={() => {
              setCameraError(null);
              stopCamera();
              setTimeout(() => startCamera(), 100);
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            Try again
          </button>
        </div>
      )}
      {isLoading && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Initializing camera…</p>
          </div>
        </div>
      )}
      {currentGesture && confidence > 0.5 && (
        <div className="absolute top-3 left-3 px-3 py-2 rounded-xl bg-card/95 border border-border backdrop-blur-sm">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Detected</div>
          <div className="font-bold text-primary">{gestureToWord(currentGesture) ?? currentGesture}</div>
          <div className="text-xs text-muted-foreground">{(confidence * 100).toFixed(0)}%</div>
        </div>
      )}
      <div className="absolute bottom-3 right-3 w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" title={isActive ? "Live" : "Off"} />
    </div>
  );
}
