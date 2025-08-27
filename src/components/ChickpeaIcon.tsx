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
      <path
        d="M12 2C8.5 2 7 4 7 6.5C7 8 7.5 9.2 8.2 10.1C8.5 10.5 8.8 10.8 9 11.2C9.5 12.1 9.8 13.1 9.9 14.2C10 15.8 10.5 17.2 11.3 18.4C11.7 19 12.3 19 12.7 18.4C13.5 17.2 14 15.8 14.1 14.2C14.2 13.1 14.5 12.1 15 11.2C15.2 10.8 15.5 10.5 15.8 10.1C16.5 9.2 17 8 17 6.5C17 4 15.5 2 12 2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? "0" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small indentation to make it more chickpea-like */}
      <circle
        cx="10.5"
        cy="7"
        r="1"
        fill={filled ? "white" : "currentColor"}
        opacity={filled ? "0.3" : "0.5"}
      />
    </svg>
  );
};