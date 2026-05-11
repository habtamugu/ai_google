import React from 'react';
import { cn } from '@/src/lib/utils';

interface LogoSelamMindProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LogoSelamMind: React.FC<LogoSelamMindProps> = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'h-8 px-2',
    md: 'h-12 px-4',
    lg: 'h-20 px-6',
  };

  return (
    <div className={cn("flex items-center justify-center select-none", sizes[size], className)}>
      <svg 
        viewBox="0 0 220 60" 
        className="h-full w-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2E7D32"/>
            <stop offset="50%" stop-color="#FBC02D"/>
            <stop offset="100%" stop-color="#C62828"/>
          </linearGradient>
        </defs>

        {/* Head Circle */}
        <circle cx="30" cy="30" r="22" fill="url(#grad)" />

        {/* Heart */}
        <path 
          d="M30 42 C20 32, 15 25, 20 20 C25 15, 30 20, 30 22 C30 20, 35 15, 40 20 C45 25, 40 32, 30 42 Z"
          fill="white"
        />

        {/* Text */}
        <text 
          x="65" 
          y="38" 
          fontFamily="Poppins, sans-serif" 
          fontSize="24" 
          fontWeight="900"
          fill="#2E7D32"
        >
          SelamMind
        </text>
      </svg>
    </div>
  );
};
