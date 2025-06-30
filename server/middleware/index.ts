import { createRequire } from 'module';
import express, { type Request, type Response, type NextFunction } from 'express';
import { CORS_CONFIG, isProduction } from '../config/index';

const require = createRequire(import.meta.url);
const cors = require('cors/lib');

export const corsMiddleware = cors({
  origin: CORS_CONFIG.ALLOWED_ORIGINS,
  credentials: CORS_CONFIG.CREDENTIALS,
  methods: CORS_CONFIG.METHODS,
  allowedHeaders: CORS_CONFIG.ALLOWED_HEADERS,
});

export const logRequest = (req: Request, res: Response, next: NextFunction): void => {
  if (!isProduction) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
};

export const jsonParser = express.json({ limit: '10mb' });
export const urlEncodedParser = express.urlencoded({ extended: true, limit: '10mb' });

export { requireAuth, requireAdmin, requireAuthAndAdmin } from './auth';
