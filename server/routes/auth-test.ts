import type { Application, Request, Response } from 'express';
import { requireAuth, requireAdmin, requireAuthAndAdmin } from '../middleware/index';

export const setupAuthTestRoutes = (app: Application): void => {
  // Test route for authentication only
  app.get('/api/auth/test', requireAuth, (req: Request, res: Response) => {
    res.json({
      message: 'Authentication successful',
      user: {
        uid: req.user?.uid,
        email: req.user?.email,
        name: req.user?.name,
        emailVerified: req.user?.emailVerified
      }
    });
  });

  // Test route for admin access
  app.get('/api/auth/admin-test', requireAuthAndAdmin, (req: Request, res: Response) => {
    res.json({
      message: 'Admin authentication successful',
      user: {
        uid: req.user?.uid,
        email: req.user?.email,
        name: req.user?.name,
        emailVerified: req.user?.emailVerified,
        isAdmin: req.user?.isAdmin
      }
    });
  });

  // Public test route
  app.get('/api/auth/public-test', (req: Request, res: Response) => {
    res.json({
      message: 'Public endpoint - no authentication required',
      timestamp: new Date().toISOString()
    });
  });
};
