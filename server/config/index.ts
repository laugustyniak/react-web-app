import dotenv from 'dotenv';

dotenv.config();

export const isProduction = process.env.NODE_ENV === 'production';

interface ApiConfig {
  BACKEND_URL: string;
  API_KEY: string;
}

interface ServerConfig {
  HTTP_PORT: number;
  HTTPS_PORT: number;
}

interface CorsConfig {
  ALLOWED_ORIGINS: string[];
  CREDENTIALS: boolean;
  METHODS: string[];
  ALLOWED_HEADERS: string[];
}

export const API_CONFIG: ApiConfig = {
  BACKEND_URL: process.env.BACKEND_API_URL || 'https://product-api.example.com',
  API_KEY: process.env.PRODUCT_API_KEY_1 || '',
};

export const SERVER_CONFIG: ServerConfig = {
  HTTP_PORT: Number(process.env.PORT) || 8080,
  HTTPS_PORT: Number(process.env.HTTPS_PORT) || 8443,
};

export const CORS_CONFIG: CorsConfig = {
  ALLOWED_ORIGINS: isProduction
    ? [
        'https://dev.product.app',
        'https://prod.product.app',
        'https://product.app',
        'https://app-dev-wxmkjx3j4a-uc.a.run.app',
        'https://app-prod-731225278324.us-central1.run.app'
      ]
    : ['http://localhost:8080'],
  CREDENTIALS: true,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-api-key'],
};
