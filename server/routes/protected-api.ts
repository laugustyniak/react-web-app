import type { Application } from 'express';
import { requireAuthAndAdmin } from '../middleware/index.js';
import { handleFindImage, handleGetProductDescription, handleInpaint } from './api.js';

export const setupProtectedRoutes = (app: Application): void => {
  // Protected API endpoints - require authentication and admin access
  app.post('/api/protected/get_product_description', requireAuthAndAdmin, handleGetProductDescription);
  app.post('/api/protected/find_image', requireAuthAndAdmin, handleFindImage);
  app.post('/api/protected/inpaint', requireAuthAndAdmin, handleInpaint);
};
