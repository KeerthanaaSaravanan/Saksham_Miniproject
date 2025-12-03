
"use client";
import { useMemo } from 'react';
import {
  Query,
  DocumentData,
  collection,
  query,
  where,
  doc
} from 'firebase/firestore';

/**
 * A hook that memoizes a Firestore query or document reference object.
 * This is CRITICAL for preventing infinite loops when using `useCollection` or `useDoc`
 * in components that re-render, as it ensures the query/reference object is stable
 * across renders unless its dependencies change.
 *
 * @param factory A function that returns a Firestore Query or DocumentReference.
 * @param deps The dependency array for the `useMemo` hook.
 * @returns A memoized Firestore Query or DocumentReference.
 */
export function useMemoFirebase<T extends Query<DocumentData> | ReturnType<typeof doc>>(
  factory: () => T | null,
  deps: React.DependencyList
): T | null {
  // The 'as any' is a concession to TypeScript's complexity with branded types.
  // We add a `__memo` brand to signal that this object has been properly memoized.
  return useMemo(() => {
    const obj = factory();
    if(obj) (obj as any).__memo = true;
    return obj;
  }, deps);
}
