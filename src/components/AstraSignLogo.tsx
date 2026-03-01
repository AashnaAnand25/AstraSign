import React from 'react';

interface AstraSignLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Show only the icon (no "AstraSign" / "ASL Translation" text) */
  iconOnly?: boolean;
}

export default function AstraSignLogo({ size = 'md', className = '', iconOnly = false }: AstraSignLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center gap-2 ${iconOnly ? 'flex-col' : ''} ${className}`}>
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
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
          
          {/* ASL hand shapes — cyan so they pop on dark */}
          <path
            d="M30 35 L30 65 M30 35 L40 40 M30 50 L40 45 M30 65 L40 60"
            stroke="hsl(183, 100%, 50%)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M70 35 Q60 40 60 50 Q60 60 70 65 M60 50 Q70 50 70 50"
            stroke="hsl(183, 100%, 50%)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Stars — theme cyan */}
          <circle cx="25" cy="25" r="2" fill="hsl(183, 100%, 50%)" opacity="0.9" />
          <circle cx="75" cy="25" r="2" fill="hsl(183, 100%, 50%)" opacity="0.9" />
          <circle cx="50" cy="20" r="1.5" fill="hsl(272, 76%, 53%)" opacity="0.9" />
          <circle cx="25" cy="75" r="1.5" fill="hsl(272, 76%, 53%)" opacity="0.8" />
          <circle cx="75" cy="75" r="1.5" fill="hsl(272, 76%, 53%)" opacity="0.8" />
          
          {/* Gradients — theme purple/cyan to match site */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(272, 76%, 53%)" />
              <stop offset="50%" stopColor="hsl(280, 70%, 55%)" />
              <stop offset="100%" stopColor="hsl(183, 100%, 50%)" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(272, 76%, 53%)" />
              <stop offset="100%" stopColor="hsl(183, 100%, 50%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text logo — theme aligned (hidden when iconOnly) */}
      {!iconOnly && (
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg leading-tight gradient-text-purple-cyan">
            AstraSign
          </span>
          <span className="text-xs text-muted-foreground leading-tight">
            ASL Translation
          </span>
        </div>
      )}
    </div>
  );
}
