'use client';

import { useEffect, useRef } from 'react';

const VIOLATION_LIMIT = 3;

interface ProctoringOptions {
  isActive: boolean;
  onLeave: () => void;
  onViolationLimitReached: () => void;
}

export function useProctoring({ isActive, onLeave, onViolationLimitReached }: ProctoringOptions) {
  const violationCount = useRef(0);

  useEffect(() => {
    if (!isActive) {
      violationCount.current = 0; // Reset count when exam is not active
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        violationCount.current += 1;
        onLeave();
        
        if (violationCount.current >= VIOLATION_LIMIT) {
          onViolationLimitReached();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, onLeave, onViolationLimitReached]);
}
