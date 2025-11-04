
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// This file is simplified to only provide Firebase Auth, as Firestore is removed.
export function initializeFirebase() {
  let firebaseApp;
  if (!getApps().length) {
    try {
      // For App Hosting
      firebaseApp = initializeApp();
    } catch (e) {
      // For local development
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: null // Explicitly null
  };
}

// We need a modified provider that doesn't expect Firestore
interface SimplifiedFirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: null;
}

export function getSdks(firebaseApp: FirebaseApp): SimplifiedFirebaseServices {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: null,
  };
}

export * from './provider';
export * from './client-provider';
// Exclude firestore hooks
// export * from './firestore/use-collection';
// export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

    