
'use client';

import { useState, useEffect } from 'react';
import { Timer as TimerIcon } from 'lucide-react';
import { useAccessibilityPanel } from './accessibility/accessibility-panel-provider';
import { cn } from '@/lib/utils';

interface TimerProps {
  durationInMinutes: number;
  onTimeUp: () => void;
}

export function Timer({ durationInMinutes, onTimeUp }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationInMinutes * 60);
  const { userProfile } = useAccessibilityPanel();
  const accessibility = userProfile?.accessibility_profile || {};

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft(secondsLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const isLowTime = secondsLeft < 300; // 5 minutes
  const useVisualAlert = accessibility.visualAlerts || accessibility.timeReminders;

  return (
    <div className={cn(`flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg text-sm font-semibold border`, 
        isLowTime ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-muted-foreground',
        isLowTime && useVisualAlert && 'animate-pulse'
    )}>
      <TimerIcon className="h-4 w-4" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
