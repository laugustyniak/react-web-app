import { initializeApp, getApps, cert, applicationDefault, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { isProduction } from './index.js';

let firebaseApp: App | undefined;
let adminAuth: Auth | undefined;
let adminFirestore: Firestore | undefined;

interface FirebaseAdminServices {
  adminAuth: Auth;
  adminFirestore: Firestore;
}

export function initializeFirebaseAdmin(): FirebaseAdminServices {
  // Check if Firebase Admin is already initialized
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
  } else {
    try {
      if (isProduction) {
        // Production: Use Google Cloud default credentials
        console.log('🔧 Using Google Cloud default credentials for Firebase Admin');
        firebaseApp = initializeApp({
          credential: applicationDefault(),
        });
      } else {
        // Development: Use service account file path
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        
        if (!serviceAccountPath) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is required in development');
        }

        console.log('🔧 Using service account file for Firebase Admin:', serviceAccountPath);
        firebaseApp = initializeApp({
          credential: cert(serviceAccountPath),
        });
      }
    } catch (error: any) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw new Error(`Firebase Admin initialization failed: ${error.message}`);
    }
  }

  adminAuth = getAuth(firebaseApp);
  adminFirestore = getFirestore(firebaseApp);
  
  return { adminAuth, adminFirestore };
}

export function getFirebaseAdmin(): FirebaseAdminServices {
  if (!adminAuth || !adminFirestore) {
    return initializeFirebaseAdmin();
  }
  return { adminAuth, adminFirestore };
}
