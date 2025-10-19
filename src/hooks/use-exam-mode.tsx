'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { usePathname } from 'next/navigation';

interface ExamModeContextType {
  isExamMode: boolean;
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
  // This could be made more robust, e.g. checking for an active exam state
  const isExamMode = pathname.includes('/assessment') || pathname.includes('/practice');

  const value = useMemo(() => ({
    isExamMode
  }), [isExamMode]);

  return (
    <ExamModeContext.Provider value={value}>
      {children}
    </ExamModeContext.Provider>
  );
}
