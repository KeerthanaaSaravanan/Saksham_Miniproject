'use client';

import { useEffect, useRef } from 'react';

const VIOLATION_LIMIT = 2;

interface ProctoringOptions {
  isActive: boolean;
  onLeave: (reason: 'visibility' | 'fullscreen') => void;
  onViolationLimitReached: () => void;
}

export function useProctoring({ isActive, onLeave, onViolationLimitReached }: ProctoringOptions) {
  const violationCount = useRef(0);
  const isEnforcing = useRef(true);

  useEffect(() => {
    if (!isActive) {
      violationCount.current = 0;
      isEnforcing.current = true;
      return;
    }

    const handleViolation = (reason: 'visibility' | 'fullscreen') => {
        if (!isEnforcing.current) return;

        violationCount.current += 1;
        
        if (violationCount.current >= VIOLATION_LIMIT) {
          isEnforcing.current = false; // Prevent multiple submissions
          onViolationLimitReached();
        } else {
          onLeave(reason);
        }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('visibility');
      }
    };

    const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
            // This event fires when entering AND exiting, so we only care when it's null (exited)
            handleViolation('fullscreen');
        }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isActive, onLeave, onViolationLimitReached]);
}
