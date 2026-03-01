import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Person2DHandsProps {
  signs?: string[];
  onBack?: () => void;
}

interface HandPosition {
  left: { x: number; y: number; rotation: number };
  right: { x: number; y: number; rotation: number };
}

export default function Person2DHands({ signs = ['HELLO', 'THANK', 'PLEASE'], onBack }: Person2DHandsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [handPositions, setHandPositions] = useState<HandPosition>({
    left: { x: 100, y: 200, rotation: 0 },
    right: { x: 300, y: 200, rotation: 0 }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const getSignHandPositions = (sign: string): HandPosition => {
    // Define hand positions for different ASL signs
    const positions: { [key: string]: HandPosition } = {
      'HELLO': {
        left: { x: 80, y: 150, rotation: -30 },
        right: { x: 320, y: 150, rotation: 30 }
      },
      'THANK': {
        left: { x: 100, y: 180, rotation: 0 },
        right: { x: 300, y: 120, rotation: -45 }
      },
      'PLEASE': {
        left: { x: 120, y: 200, rotation: 15 },
        right: { x: 280, y: 200, rotation: -15 }
      },
      'YES': {
        left: { x: 200, y: 160, rotation: 0 },
        right: { x: 200, y: 160, rotation: 0 }
      },
      'NO': {
        left: { x: 150, y: 180, rotation: 0 },
        right: { x: 250, y: 180, rotation: 0 }
      },
      'HELP': {
        left: { x: 100, y: 200, rotation: 0 },
        right: { x: 300, y: 200, rotation: 0 }
      }
    };
    
    return positions[sign] || positions['HELP'];
  };

  const drawHand = (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number, isLeft: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw arm
    ctx.strokeStyle = '#fdbcb4';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, isLeft ? 60 : -60);
    ctx.stroke();
    
    // Draw hand
    ctx.fillStyle = '#fdbcb4';
    ctx.beginPath();
    ctx.arc(0, isLeft ? 60 : -60, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw fingers
    ctx.strokeStyle = '#fdbcb4';
    ctx.lineWidth = 4;
    const fingerLength = 20;
    const fingerSpacing = 8;
    
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * fingerSpacing, isLeft ? 60 : -60);
      ctx.lineTo(i * fingerSpacing, isLeft ? 60 + fingerLength : -60 - fingerLength);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawPerson = (ctx: CanvasRenderingContext2D) => {
    // Draw head
    ctx.fillStyle = '#fdbcb4';
    ctx.beginPath();
    ctx.arc(200, 80, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw body
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(170, 110, 60, 80);
    
    // Draw hands
    const positions = getSignHandPositions(signs[currentSignIndex]);
    drawHand(ctx, positions.left.x, positions.left.y, positions.left.rotation, true);
    drawHand(ctx, positions.right.x, positions.right.y, positions.right.rotation, false);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw person with current sign
    drawPerson(ctx);
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentSignIndex, isPlaying]);

  const playAnimation = () => {
    if (signs.length === 0) return;
    
    setIsPlaying(true);
    setCurrentSignIndex(0);
    
    const interval = setInterval(() => {
      setCurrentSignIndex(prev => {
        if (prev >= signs.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 3000);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
  };

  const resetAnimation = () => {
    setCurrentSignIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen mx-auto overflow-hidden">
        {/* Ambient glow */}
        <div className="fixed inset-0 max-w-[430px] mx-auto pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-48 h-48 rounded-full bg-neon-purple/[0.06] blur-[90px]" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-neon-cyan/[0.04] blur-[90px]" />
        </div>

        {/* Header */}
        <div className="glass rounded-2xl p-4 m-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                  ← Back
                </Button>
              )}
              <h1 className="text-lg font-semibold text-foreground">Person</h1>
            </div>
            <div className="text-xs text-muted-foreground">
              2D · Our pipeline (text → ASL → hands)
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="px-4 pb-4 space-y-4">
          <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="w-full border border-gray-700/50 rounded-xl bg-background/50"
            />
            
            {/* Current Sign Display */}
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full">
                <span className="font-medium text-sm">{signs[currentSignIndex]}</span>
                {isPlaying && (
                  <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="glass rounded-2xl p-4" style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <div className="space-y-4">
              {/* Playback Controls */}
              <div className="flex justify-center gap-3">
                <Button
                  onClick={playAnimation}
                  disabled={signs.length === 0 || isPlaying}
                  className="neon-border-cyan text-neon-cyan text-sm"
                >
                  <Play className="w-4 h-4" />
                  Play
                </Button>
                <Button
                  onClick={stopAnimation}
                  disabled={!isPlaying}
                  variant="outline"
                  className="neon-border-purple text-neon-purple text-sm"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
                <Button
                  onClick={resetAnimation}
                  variant="outline"
                  className="neon-border-purple text-neon-purple text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>

              {/* Sign Sequence */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground text-sm">Sign Sequence</h3>
                <div className="flex flex-wrap gap-2">
                  {signs.map((sign, index) => (
                    <Button
                      key={index}
                      variant={index === currentSignIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCurrentSignIndex(index);
                        setIsPlaying(false);
                      }}
                      className={index === currentSignIndex ? "neon-border-cyan text-neon-cyan" : "neon-border-purple text-neon-purple"}
                    >
                      {sign}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {signs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{currentSignIndex + 1} / {signs.length}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-neon-cyan h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentSignIndex + 1) / signs.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
