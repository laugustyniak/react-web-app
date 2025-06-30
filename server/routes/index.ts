import type { Application } from 'express';
import { healthCheck, apiHealthCheck } from './health';
import { handleFindImage, handleGetProductDescription, handleInpaint } from './api';
import { setupProtectedRoutes } from './protected-api';
import { setupAuthTestRoutes } from './auth-test';
import { requireAuthAndAdmin } from '../middleware/index';

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
