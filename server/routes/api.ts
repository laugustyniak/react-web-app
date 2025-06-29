import type { Request, Response } from 'express';
import { API_CONFIG } from '../config/index';

type ApiHandler = (req: Request, res: Response) => Promise<void>;

const createApiHandler = (endpoint: string): ApiHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const targetUrl = `${API_CONFIG.BACKEND_URL}${endpoint}`;
      const body = req.body;
      const headers = {
        'content-type': 'application/json',
        'x-api-key': API_CONFIG.API_KEY
      };
      const options = {
        method: req.method,
        headers,
        body: JSON.stringify(body)
      };
      const response = await fetch(targetUrl, options);
      res.status(response.status);
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        res.json(data);
      } else {
        const text = await response.text();
        res.send(text);
      }
    } catch (error: any) {
      console.error('Direct endpoint error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

export const handleFindImage = createApiHandler('/find_image');
export const handleGetProductDescription = createApiHandler('/get_product_description');
export const handleInpaint = createApiHandler('/inpaint');
