import React from 'react';
import { cn } from '@/lib/utils';

interface ChickpeaIconProps {
  className?: string;
  filled?: boolean;
}

export const ChickpeaIcon: React.FC<ChickpeaIconProps> = ({ className, filled = false }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      className={cn("inline-block", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Beautiful chickpea from the SVG - scaled and centered */}
      <path
        d="M5.2 9.8c-0.78-0.29-1.88-0.83-2.34-1.37-0.18-0.25-0.45-0.41-0.75-0.44-0.51 0-0.72 0.58-0.81 0.84-0.07 0.21-0.16 0.41-0.26 0.60-0.32 0.46-0.69 0.88-1.10 1.25-0.30 0.29-0.59 0.59-0.85 0.91-0.45 0.63-0.76 1.34-0.92 2.09-0.16 0.75-0.16 1.53 0.004 2.29 0.43 1.34 1.79 3.34 3.75 3.34 0.25 0 0.51-0.04 0.75-0.10 0.59-0.13 1.10-0.50 1.42-1.02 0.32 0.18 0.68 0.27 1.04 0.27 0.23 0 0.47-0.03 0.69-0.09 0.44-0.12 0.86-0.32 1.21-0.60 0.36-0.28 0.65-0.64 0.87-1.04 0.25-0.47 0.41-0.98 0.46-1.51 0.05-0.53-0.001-1.06-0.15-1.57-0.42-1.42-1.51-3.28-3.02-3.85z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? "0" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(7, 0) scale(1.1)"
      />
      
      {/* Interior details for filled state */}
      {filled && (
        <path
          d="M9 13c0.25 0.83 0.16 1.72-0.25 2.48-0.34 0.64-0.92 1.10-1.62 1.28-0.16 0.05-0.33 0.07-0.50 0.07-0.34 0.01-0.67-0.11-0.91-0.35-0.35-0.42-0.75-1.09-0.62-1.58 0.03-0.10 0.01-0.20-0.04-0.29"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};