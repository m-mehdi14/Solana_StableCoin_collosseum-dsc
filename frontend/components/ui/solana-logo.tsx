import React from 'react';
import { cn } from '@/lib/utils';

interface SolanaLogoProps {
  className?: string;
}

export function SolanaLogo({ className }: SolanaLogoProps) {
  return (
    <svg
      className={cn("h-8 w-8", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 16.5L18.5 3.5H14L5.5 12V16.5Z"
        fill="currentColor"
      />
      <path
        d="M5.5 20.5L18.5 7.5H14L5.5 16V20.5Z"
        fill="currentColor"
      />
      <path
        d="M5.5 12.5L18.5 -0.5H14L5.5 8V12.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
