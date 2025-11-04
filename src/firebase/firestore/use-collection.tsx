
'use client';

import { useState, useEffect } from 'react';

// This hook is now a no-op that returns an empty state.
// It prevents crashes in components that still use it.

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCollection<T = any>(
    memoizedTargetRefOrQuery: any,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Since there's no Firestore, we immediately return an empty array.
    // We can simulate a brief loading period if desired.
    setIsLoading(true);
    setTimeout(() => {
        setData([]);
        setIsLoading(false);
    }, 200);
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}

    