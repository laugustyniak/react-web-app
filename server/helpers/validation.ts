import { isProduction } from '../config/index.js';

export function validateEnvironment(): void {
  const requiredVars: Record<string, string | undefined> = {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    PRODUCT_API_KEY_1: process.env.PRODUCT_API_KEY_1
  };

  // In development, also check for Firebase service account path
  if (!isProduction) {
    requiredVars.FIREBASE_SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  }

  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('Please check your .env file or environment configuration');
    if (isProduction) {
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in development mode with default values');
    }
  }
}
