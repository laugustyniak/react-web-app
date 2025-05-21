import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Define a type for our runtime config
interface RuntimeConfig {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID: string;
  GOOGLE_ADS_ID: string;
}

// Declare global runtime config
declare global {
  interface Window {
    RUNTIME_CONFIG?: RuntimeConfig;
  }
}

// First try to get config from runtime, fall back to build-time env vars
const getRuntimeConfig = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.RUNTIME_CONFIG) {
    return {
      apiKey: window.RUNTIME_CONFIG.FIREBASE_API_KEY,
      authDomain: window.RUNTIME_CONFIG.FIREBASE_AUTH_DOMAIN,
      projectId: window.RUNTIME_CONFIG.FIREBASE_PROJECT_ID,
      storageBucket: window.RUNTIME_CONFIG.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.RUNTIME_CONFIG.FIREBASE_MESSAGING_SENDER_ID,
      appId: window.RUNTIME_CONFIG.FIREBASE_APP_ID,
      measurementId: window.RUNTIME_CONFIG.FIREBASE_MEASUREMENT_ID
    };
  }

  // Fall back to build-time environment variables
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
};

// Get config
const config = getRuntimeConfig();

// Only initialize Firebase if required config values are available
const hasRequiredConfig = config.apiKey && config.authDomain && config.projectId && config.appId;

const firebaseConfig: FirebaseOptions = {
  apiKey: config.apiKey || '',
  authDomain: config.authDomain || '',
  projectId: config.projectId || '',
  storageBucket: config.storageBucket || '',
  messagingSenderId: config.messagingSenderId || '',
  appId: config.appId || '',
  measurementId: config.measurementId || '',
};

// Google Ads ID from runtime config or environment variables
export const GOOGLE_ADS_ID = 
  (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.GOOGLE_ADS_ID) || 
  import.meta.env.VITE_GOOGLE_ADS_ID || 
  '';

// Initialize Firebase only if we have the required configuration
let app = getApps()[0];
if (!app && hasRequiredConfig) {
  app = initializeApp(firebaseConfig);
}

// Export Firebase services only if initialization was successful
export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : null;

export const analytics = (async () => {
  if (app && await isSupported()) {
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
  if (typeof window === 'undefined') {
    return;
  }

  // Use GOOGLE_ADS_ID which now checks runtime config first
  if (!GOOGLE_ADS_ID) {
    console.warn('Google Ads ID not found in configuration');
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
