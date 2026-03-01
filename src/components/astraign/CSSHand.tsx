import { useEffect, useRef } from "react";
import SimpleHandAnimator from "./SimpleHandAnimator";

interface Props {
  sign?: string;
  isActive?: boolean;
}

export default function CSSHand({ sign, isActive = false }: Props) {
  const handRef = useRef<HTMLDivElement>(null);
  const animatorRef = useRef<SimpleHandAnimator | null>(null);

  useEffect(() => {
    if (handRef.current) {
      animatorRef.current = new SimpleHandAnimator('css-hand');
      
      if (sign && isActive) {
        setTimeout(() => {
          animatorRef.current?.applyASLPose(sign);
        }, 100);
      }
    }
  }, [sign, isActive]);

  return (
    <div className="flex justify-center items-center p-8">
      <div 
        ref={handRef}
        id="css-hand"
        className="relative w-32 h-32"
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Palm */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full shadow-lg" />
        </div>
        
        {/* Thumb */}
        <div className="absolute thumb" style={{ 
          left: '50%', 
          top: '20%',
          transform: 'translateX(-50%)'
        }}>
          <div className="w-3 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-md" />
        </div>
        
        {/* Index Finger */}
        <div className="absolute index" style={{ 
          left: '50%', 
          top: '10%',
          transform: 'translateX(-50%)'
        }}>
          <div className="w-3 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md" />
        </div>
        
        {/* Middle Finger */}
        <div className="absolute middle" style={{ 
          left: '50%', 
          top: '0%',
          transform: 'translateX(-50%)'
        }}>
          <div className="w-3 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-md" />
        </div>
        
        {/* Ring Finger */}
        <div className="absolute ring" style={{ 
          left: '50%', 
          top: '-10%',
          transform: 'translateX(-50%)'
        }}>
          <div className="w-3 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md" />
        </div>
        
        {/* Pinky Finger */}
        <div className="absolute pinky" style={{ 
          left: '50%', 
          top: '-20%',
          transform: 'translateX(-50%)'
        }}>
          <div className="w-3 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-md" />
        </div>
        
        {/* Wrist */}
        <div className="absolute wrist" style={{ 
          left: '50%', 
          bottom: '20%',
          transform: 'translateX(-50%)'
        }}>
          <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-md" />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        #css-hand {
          transform-style: preserve-3d;
        }
        
        #css-hand .thumb {
          position: absolute;
          transform-origin: bottom center;
        }
        
        #css-hand .index {
          position: absolute;
          transform-origin: bottom center;
        }
        
        #css-hand .middle {
          position: absolute;
          transform-origin: bottom center;
        }
        
        #css-hand .ring {
          position: absolute;
          transform-origin: bottom center;
        }
        
        #css-hand .pinky {
          position: absolute;
          transform-origin: bottom center;
        }
        
        #css-hand .wrist {
          position: absolute;
          transform-origin: center;
        }
      `}} />
    </div>
  );
}
