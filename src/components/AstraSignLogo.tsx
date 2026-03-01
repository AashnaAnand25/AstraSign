import React from 'react';

interface AstraSignLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AstraSignLogo({ size = 'md', className = '' }: AstraSignLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Logo SVG - AstraSign branding */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle representing the universe/astronomy */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#gradient1)"
            stroke="url(#gradient2)"
            strokeWidth="2"
          />
          
          {/* ASL hand shapes stylized */}
          {/* Right hand - "A" sign */}
          <path
            d="M30 35 L30 65 M30 35 L40 40 M30 50 L40 45 M30 65 L40 60"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Left hand - "S" sign */}
          <path
            d="M70 35 Q60 40 60 50 Q60 60 70 65 M60 50 Q70 50 70 50"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Stars representing astronomy/astronomy theme */}
          <circle cx="25" cy="25" r="2" fill="white" opacity="0.8" />
          <circle cx="75" cy="25" r="2" fill="white" opacity="0.8" />
          <circle cx="50" cy="20" r="1.5" fill="white" opacity="0.6" />
          <circle cx="25" cy="75" r="1.5" fill="white" opacity="0.6" />
          <circle cx="75" cy="75" r="1.5" fill="white" opacity="0.6" />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Text logo */}
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          AstraSign
        </span>
        <span className="text-xs text-gray-500 leading-tight">
          ASL Translation
        </span>
      </div>
    </div>
  );
}
