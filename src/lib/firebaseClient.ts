
// src/lib/firebaseClient.ts
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingEnvVars.join(', ')}. Please check your .env.local file.`);
}

/**
 * The initialized Firebase App instance.
 * It is initialized only once.
 */
const firebaseApp: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

/**
 * The Firebase Authentication service instance.
 */
const auth: Auth = getAuth(firebaseApp);

/**
 * The Cloud Firestore service instance.
 */
const db: Firestore = getFirestore(firebaseApp);

/**
 * The Firebase Storage service instance.
 */
const storage: FirebaseStorage = getStorage(firebaseApp);

export { firebaseApp, auth, db, storage };
