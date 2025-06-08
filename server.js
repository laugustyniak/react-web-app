import express from 'express';
import { createRequestHandler } from '@react-router/express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// API Configuration
const API_CONFIG = {
  BACKEND_URL: process.env.BACKEND_API_URL || 'https://insbuy-api.augustyniak.ai',
  API_KEY: process.env.INSBUY_API_KEY_1 || '',
};

// Logging middleware for development
const logRequest = (req, res, next) => {
  if (!isProduction) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
};

// Direct endpoint for /find_image
async function handleFindImage(req, res) {
  try {
    const targetUrl = `${API_CONFIG.BACKEND_URL}/find_image`;
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
  } catch (error) {
    console.error('Direct endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Direct endpoint for /get_product_description*
async function handleGetProductDescription(req, res) {
  try {
    const targetUrl = `${API_CONFIG.BACKEND_URL}/get_product_description`;
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
  } catch (error) {
    console.error('Direct endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function createServer() {
  const app = express();

  // CORS configuration for development
  if (!isProduction) {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  // Request logging
  app.use(logRequest);

  // Parse JSON bodies
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint for this Express server
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });

  // API health check endpoint that forwards to backend's /healthcheck
  app.get('/api/healthcheck', async (req, res) => {
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
    } catch (error) {
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
  });

  // Direct endpoint for /get_product_description*
  app.post('/api/get_product_description', handleGetProductDescription);

  // Direct endpoint for /find_image
  app.post('/api/find_image', handleFindImage);

  if (isProduction) {
    // Production mode
    app.use(express.static(path.resolve(__dirname, 'build/client')));

    try {
      // Load the production server build
      const build = await import('./build/server/index.js');
      const requestHandler = createRequestHandler({
        build,
        mode: 'production',
      });

      // Only handle non-API routes with React Router
      app.all('*', (req, res, next) => {
        // Skip React Router for API routes and health endpoint
        if (req.path.startsWith('/api/') || req.path === '/health') {
          return next();
        }
        return requestHandler(req, res, next);
      });
    } catch (error) {
      console.error('Failed to load server build:', error);
      console.log('Make sure to run "npm run build" first');
      process.exit(1);
    }
  } else {
    // Development mode - still allow API proxy for testing
    console.log('🔧 Development mode: API proxy enabled at /api/*');
    console.log('📡 Backend URL:', API_CONFIG.BACKEND_URL);
    console.log('🔑 API Key configured:', !!API_CONFIG.API_KEY);

    // For development, just serve a simple message for non-API routes
    app.get('*', (req, res) => {
      res.json({
        message: 'Express server running in development mode',
        api_proxy: 'Available at /api/*',
        documentation: 'Available at /docs',
        api_spec: 'Available at /api-docs',
        note: 'For full app development, use: npm run dev'
      });
    });
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 Express server with SSR running at http://localhost:${port}`);
    console.log('📱 Your React app is server-side rendered!');
    console.log('🔗 API proxy available at /api/*');
    console.log('📡 Backend:', API_CONFIG.BACKEND_URL);
  });
}

createServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
