import { useRef, useEffect, useState, useCallback } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";
import SimpleHandClassifier from "@/ml/simpleHandClassifier";
import { gestureToWord } from "@/utils/aslStaticPoses";

interface HandTrackerProps {
  onGestureDetected: (gesture: string, confidence: number) => void;
  isActive: boolean;
}

export default function HandTracker({ onGestureDetected, isActive }: HandTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const firstFrameRef = useRef(false);

  const handClassifier = new SimpleHandClassifier();

  useEffect(() => {
    // Initialize the classifier when component mounts
    handClassifier.initialize();
  }, []);

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

      if (result.confidence > 0.5) {
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

    setIsLoading(true);

    try {
      console.log("[HandTracker] Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      console.log("[HandTracker] Camera access granted.");

      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => { });

      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          // If the file is requested with a path (e.g. /third_party/...), just use the filename
          // to ensure it points correctly to the CDN asset root.
          const fileName = file.includes('/') ? file.split('/').pop() : file;
          const url = `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${fileName}`;
          console.log(`[HandTracker] MediaPipe locateFile: ${file} -> ${url}`);
          return url;
        }
      });

      hands.setOptions({
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results) => {
        if (!firstFrameRef.current) {
          firstFrameRef.current = true;
          setIsLoading(false);
        }
        const canvasCtx = canvasRef.current?.getContext('2d');
        if (!canvasCtx) return;

        canvasRef.current!.width = videoRef.current!.videoWidth;
        canvasRef.current!.height = videoRef.current!.videoHeight;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

        // Draw video frame
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

        // Draw hand landmarks
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          for (const landmarks of results.multiHandLandmarks) {
            // Draw connections
            const connections = [
              [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
              [0, 5], [5, 6], [6, 7], [7, 8], // Index
              [5, 9], [9, 10], [10, 11], [11, 12], // Middle
              [9, 13], [13, 14], [14, 15], [15, 16], // Ring
              [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
              [0, 17] // Palm
            ];

            // Draw connections
            canvasCtx.strokeStyle = '#00ffff';
            canvasCtx.lineWidth = 2;
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
              canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
              canvasCtx.fillStyle = index === 0 ? '#ff006e' : '#00ffff'; // Wrist in different color
              canvasCtx.fill();
            });
          }
        }

        canvasCtx.restore();

        // Process for gesture recognition
        try {
          processHandResults(results);
        } catch (err) {
          console.error("[HandTracker] processHandResults error:", err);
        }
      });

      hands.onResults((results) => {
        // Redundant log for first frame
        if (!firstFrameRef.current) {
          console.log("[HandTracker] MediaPipe Hands first results received.");
        }
      });

      // Start camera (MediaPipe Camera handles video.play and requestAnimationFrame loop)
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480
      });

      camera.start()
        .then(() => console.log("[HandTracker] MediaPipe Camera started successfully."))
        .catch((err) => console.error("[HandTracker] MediaPipe Camera start failed:", err));

      // Clear loading once video is running; also fallback in case first frame is slow (e.g. model load)
      setTimeout(() => {
        setIsLoading(false);
        console.log("[HandTracker] Loading state cleared via timeout.");
      }, 3000);
    } catch (error) {
      console.error('Camera initialization failed:', error);
      setIsLoading(false);
    }
  }, [processHandResults]);

  const stopCamera = useCallback(() => {
    firstFrameRef.current = false;
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  return (
    <div className="relative w-full h-full min-h-[200px]">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg object-cover"
        style={{ maxHeight: "100%", display: "block" }}
      />
      {isLoading && (
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
