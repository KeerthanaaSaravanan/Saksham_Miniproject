'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ExamModeContextType {
  isExamMode: boolean;
  setIsExamMode: (isExam: boolean) => void;
}

const ExamModeContext = createContext<ExamModeContextType | undefined>(undefined);

export function useExamMode() {
  const context = useContext(ExamModeContext);
  if (context === undefined) {
    throw new Error('useExamMode must be used within an ExamModeProvider');
  }
  return context;
}

export function ExamModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isExamMode, setIsExamMode] = useState(pathname.includes('/assessment'));

  useEffect(() => {
    // This logic covers navigation-based exam mode detection.
    // The assessment page itself will override this for active sessions.
    const isCurrentlyInExamPath = pathname.includes('/assessment') || pathname.includes('/practice');
    setIsExamMode(isCurrentlyInExamPath);
  }, [pathname]);


  const value = useMemo(() => ({
    isExamMode,
    setIsExamMode
  }), [isExamMode]);

  return (
    <ExamModeContext.Provider value={value}>
      {children}
    </ExamModeContext.Provider>
  );
}
