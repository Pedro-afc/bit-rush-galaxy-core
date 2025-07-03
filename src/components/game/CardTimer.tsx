
import React from 'react';
import { Timer } from 'lucide-react';

interface CardTimerProps {
  timeLeft: number;
}

export const CardTimer: React.FC<CardTimerProps> = ({ timeLeft }) => {
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Timer className="h-3 w-3" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};
