import type { Application } from 'express';
import { healthCheck, apiHealthCheck } from './health.js';
import { handleFindImage, handleGetProductDescription, handleInpaint } from './api.js';
import { setupProtectedRoutes } from './protected-api.js';
import { setupAuthTestRoutes } from './auth-test.js';
import { requireAuthAndAdmin } from '../middleware/index.js';

export const setupRoutes = (app: Application): void => {
  // Health check endpoints
  app.get('/health', healthCheck);
  app.get('/api/healthcheck', apiHealthCheck);

  // Auth test routes (for development/testing)
  setupAuthTestRoutes(app);

  // Protected API endpoints (require authentication and admin access)
  app.post('/api/get_product_description', requireAuthAndAdmin, handleGetProductDescription);
  app.post('/api/find_image', requireAuthAndAdmin, handleFindImage);
  app.post('/api/inpaint', requireAuthAndAdmin, handleInpaint);

  // Additional protected routes
  setupProtectedRoutes(app);
};
