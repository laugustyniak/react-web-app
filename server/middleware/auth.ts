import type { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '../config/firebase';

interface UserData {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  isAdmin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserData;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Bearer token required'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format'
      });
      return;
    }

    const { adminAuth } = getFirebaseAdmin();
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
    
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      });
      return;
    }
    
    if (error.code === 'auth/id-token-revoked') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token revoked'
      });
      return;
    }
    
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.uid) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const { adminFirestore } = getFirebaseAdmin();
    const userDoc = await adminFirestore.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'User profile not found'
      });
      return;
    }
    
    const userData = userDoc.data();
    const isAdmin = userData?.isAdmin === true;
    
    if (!isAdmin) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
      return;
    }
    
    if (req.user) {
      req.user.isAdmin = true;
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify admin status'
    });
  }
};

export const requireAuthAndAdmin = [requireAuth, requireAdmin];
