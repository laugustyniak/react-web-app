import type { Request, Response } from 'express';
import { API_CONFIG } from '../config/index.js';

export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
};

export const apiHealthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUrl = `${API_CONFIG.BACKEND_URL}/healthcheck`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
    };
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });
    res.status(response.status);
    ['content-type', 'cache-control', 'etag'].forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.set(header, value);
      }
    });
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error: any) {
    console.error('Backend health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'Express API Proxy',
      backend_status: 'unreachable',
      backend_url: API_CONFIG.BACKEND_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
