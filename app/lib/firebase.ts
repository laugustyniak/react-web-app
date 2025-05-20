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

// Google Ads ID from environment variables
export const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || '';

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

// Type definition for global gtag function
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Ads Tag
export const initializeGoogleAds = () => {
  // Skip if already initialized or if in server environment
  if (typeof window === 'undefined' || !GOOGLE_ADS_ID) {
    return;
  }
  
  // Check if script already exists
  if (window.document.querySelector(`script[src*="${GOOGLE_ADS_ID}"]`)) {
    return;
  }

  // Create and append Google Ads script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  document.head.appendChild(script);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  
  // Add to window for use elsewhere in the app
  window.gtag = gtag;
  
  // Configure Google Ads
  gtag('js', new Date());
  gtag('config', GOOGLE_ADS_ID);
};
