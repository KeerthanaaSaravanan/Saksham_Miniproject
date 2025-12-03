
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { detectAnomalies } from '@/lib/actions/fraud-detection';

const VIOLATION_LIMIT = 2;

interface ProctoringOptions {
  isActive: boolean;
  onLeave: (reason: 'visibility' | 'fullscreen', ttsText: string) => void;
  onViolationLimitReached: () => void;
}

export function useProctoring({ isActive, onLeave, onViolationLimitReached }: ProctoringOptions) {
  const violationCount = useRef(0);
  const isEnforcing = useRef(true);
  const { toast } = useToast();

  const handleViolation = useCallback(async (reason: 'visibility' | 'fullscreen') => {
      if (!isEnforcing.current) return;

      violationCount.current += 1;
      
      const anomalyResult = await detectAnomalies({
        event_type: reason === 'visibility' ? 'focus_lost' : 'focus_lost', // Treat both as focus lost for now
        details: {
          timestamp: new Date().toISOString(),
          metadata: {
            violation_count: violationCount.current
          }
        }
      });

      let ttsText = "You have left the exam window. Please return to continue.";

      if ('error' in anomalyResult) {
        console.error("Proctoring AI Error:", anomalyResult.error);
        toast({
          variant: 'destructive',
          title: `Warning: Left Exam Tab (Violation ${violationCount.current})`,
          description: "This is a warning. Leaving again may automatically submit your exam.",
        });
      } else {
        ttsText = anomalyResult.tts_text;
        toast({
          variant: 'destructive',
          title: `Proctoring Alert (Violation ${violationCount.current})`,
          description: ttsText,
        });
      }

      if (violationCount.current >= VIOLATION_LIMIT) {
        isEnforcing.current = false; // Prevent multiple submissions
        onViolationLimitReached();
      } else {
        onLeave(reason, ttsText);
      }
  }, [onLeave, onViolationLimitReached, toast]);

  useEffect(() => {
    if (!isActive) {
      violationCount.current = 0;
      isEnforcing.current = true;
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('visibility');
      }
    };

    const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
            handleViolation('fullscreen');
        }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isActive, handleViolation]);
}
