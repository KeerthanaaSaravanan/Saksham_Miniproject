/**
 * @file This file is the single, centralized entry point for initializing the Firebase Admin SDK.
 * All Cloud Functions and other server-side scripts MUST import their admin-level
 * Firebase services (auth, firestore, etc.) from this file. This ensures the Admin SDK
 * is initialized only once, preventing resource leaks and performance issues.
 *
 * DO NOT initialize the Admin SDK in any other file.
 */

import * as admin from 'firebase-admin';

// Check if the admin app has already been initialized to prevent errors.
if (!admin.apps.length) {
  // Initialize the app with default credentials.
  // This automatically uses the service account credentials from the Cloud Functions environment.
  admin.initializeApp();
}

/**
 * The Firebase Admin Authentication service instance.
 */
const adminAuth = admin.auth();

/**
 * The Firebase Admin Firestore service instance.
 */
const adminDb = admin.firestore();

/**
 * The Firebase Admin Cloud Storage service instance.
 */
const adminStorage = admin.storage();

export { admin, adminAuth, adminDb, adminStorage };
