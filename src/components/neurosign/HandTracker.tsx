import { useRef, useEffect, useState, useCallback } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";
import { aslClassifier } from "@/ml/aslClassifier";

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
      // Classify the gesture using ML model
      const prediction = await aslClassifier.classify(formattedLandmarks);
      
      setCurrentGesture(prediction.label);
      setConfidence(prediction.confidence);
      
      // Only notify if confidence is high enough
      if (prediction.confidence > 0.5) {
        onGestureDetected(prediction.label, prediction.confidence);
      }
    } catch (error) {
      console.error('Gesture classification failed:', error);
    }
  }, [onGestureDetected]);

  const startCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });

      videoRef.current.srcObject = stream;

      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results) => {
        // Draw hand landmarks on canvas
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
        processHandResults(results);
      });

      // Start camera
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480
      });
      
      camera.start();
      
    } catch (error) {
      console.error('Camera initialization failed:', error);
      setIsLoading(false);
    }
  }, [processHandResults]);

  const stopCamera = useCallback(() => {
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
    <div className="relative">
      {/* Video element (hidden) */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />
      
      {/* Canvas for visualization */}
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ maxHeight: '300px' }}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Initializing Hand Tracker...</p>
          </div>
        </div>
      )}
      
      {/* Gesture indicator */}
      {currentGesture && confidence > 0.5 && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
          <div className="text-xs text-gray-300">Detected:</div>
          <div className="font-bold text-neon-cyan">{currentGesture}</div>
          <div className="text-xs text-gray-400">Confidence: {(confidence * 100).toFixed(0)}%</div>
        </div>
      )}
      
      {/* Status indicator */}
      <div className="absolute bottom-4 right-4">
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
      </div>
    </div>
  );
}
