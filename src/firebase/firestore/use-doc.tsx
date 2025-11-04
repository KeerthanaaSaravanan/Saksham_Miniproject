
'use client';
    
import { useState, useEffect } from 'react';

// This hook is now a no-op that returns an empty state.
// It prevents crashes in components that still use it.

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDoc<T = any>(
  memoizedDocRef: any,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // No-op, just simulate loading and then return null.
    setIsLoading(true);
    setTimeout(() => {
        setData(null);
        setIsLoading(false);
    }, 200);
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}

    