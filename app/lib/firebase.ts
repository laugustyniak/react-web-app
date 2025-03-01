import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'apiKey',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'authDomain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'projectId',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'storageBucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'messagingSenderId',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'appId',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'measurementId',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const analytics = (async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
})();
