import { createRequestHandler } from '@react-router/express';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// Environment variable validation
function validateEnvironment() {
  const requiredVars = {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    BUY_IT_API_KEY_1: process.env.BUY_IT_API_KEY_1
  };

  const missing = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('Please check your .env file or environment configuration');
    if (isProduction) {
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in development mode with default values');
    }
  }
}

// Validate environment on startup
validateEnvironment();

// API Configuration
const API_CONFIG = {
  BACKEND_URL: process.env.BACKEND_API_URL || 'https://buy-it-api.augustyniak.ai',
  API_KEY: process.env.BUY_IT_API_KEY_1 || '',
};

// CORS Origins Configuration
const getCorsOrigins = () => {
  if (isProduction) {
    const origins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://dev.buy-it.ai',
      'https://prod.buy-it.ai',
      'https://buy-it.ai',
    ];
    return origins.map(origin => origin.trim());
  }
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://localhost:3000',
    'https://localhost:5173',
    'https://localhost:8080'
  ];
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
    console.error('Find image endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: isProduction ? 'An error occurred processing your request' : error.message,
      timestamp: new Date().toISOString()
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
    console.error('Get product description endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: isProduction ? 'An error occurred processing your request' : error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Direct endpoint for /inpaint
async function handleInpaint(req, res) {
  try {
    const targetUrl = `${API_CONFIG.BACKEND_URL}/inpaint`;
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
    console.error('Inpaint endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: isProduction ? 'An error occurred processing your request' : error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function createServer() {
  const app = express();

  // Security headers middleware
  app.use((req, res, next) => {
    // Basic security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Remove server signature
    res.removeHeader('X-Powered-By');

    // Permissions Policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');

    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://buy-it-api.augustyniak.ai wss: ws:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    res.setHeader('Content-Security-Policy', csp);

    // HTTPS enforcement in production
    if (isProduction && req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }

    next();
  });

  // Rate limiting for API endpoints
  const apiLimiter = (req, res, next) => {
    // Simple in-memory rate limiting
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100; // Max requests per window

    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }

    const clientData = global.rateLimitStore.get(clientIP) || { count: 0, resetTime: now + windowMs };

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count++;
    }

    global.rateLimitStore.set(clientIP, clientData);

    if (clientData.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientData.count));
    res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());

    next();
  };

  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);

  // CORS configuration using cors package
  const allowedOrigins = getCorsOrigins();

  console.log('🔒 CORS allowed origins:', allowedOrigins);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn('🚫 Blocked CORS request from:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-api-key'],
    optionsSuccessStatus: 200
  }));

  // Request logging
  app.use(logRequest);

  // Parse JSON bodies
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint for this Express server
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });

  // API health check endpoint that forwards to backend's /healthcheck
  app.get('/api/healthcheck', async (_req, res) => {
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

  // Direct endpoint for /inpaint
  app.post('/api/inpaint', handleInpaint);

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
    app.get('*', (_req, res) => {
      res.json({
        message: 'Express server running in development mode',
        api_proxy: 'Available at /api/*',
        documentation: 'Available at /docs',
        api_spec: 'Available at /api-docs',
        note: 'For full app development, use: npm run dev'
      });
    });
  }

  const port = process.env.PORT || 8080;
  const httpsPort = process.env.HTTPS_PORT || 8443;

  // Check if SSL certificates exist
  const certPath = path.join(__dirname, 'certs', 'localhost.crt');
  const keyPath = path.join(__dirname, 'certs', 'localhost.key');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    // HTTPS server
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    const httpsServer = https.createServer(httpsOptions, app);

    httpsServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.warn(`⚠️  HTTPS port ${httpsPort} is already in use, skipping HTTPS server`);
      } else {
        console.error('HTTPS server error:', error);
      }
    });

    httpsServer.listen(httpsPort, () => {
      console.log(`🔒 HTTPS Express server with SSR running at https://localhost:${httpsPort}`);
      console.log('📱 Your React app is server-side rendered with SSL!');
      console.log('🔗 API proxy available at /api/*');
      console.log('📡 Backend:', API_CONFIG.BACKEND_URL);
      console.log('⚠️  Accept the self-signed certificate in your browser');
    });

    // Optional: Also run HTTP server that redirects to HTTPS
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
        next();
      }
    });
  }

  // HTTP server (always available as fallback)
  const httpServer = app.listen(port, () => {
    console.log(`🚀 HTTP Express server with SSR running at http://localhost:${port}`);
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      console.log('💡 To enable HTTPS, run: chmod +x generate-certs.sh && ./generate-certs.sh');
    }
    console.log('📱 Your React app is server-side rendered!');
    console.log('🔗 API proxy available at /api/*');
    console.log('📡 Backend:', API_CONFIG.BACKEND_URL);
    console.log('🔒 Security features enabled: headers, CORS, rate limiting, CSP');
  });

  httpServer.on('error', (error) => {
    console.error('HTTP server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Please use a different port or stop the existing server.`);
      process.exit(1);
    }
  });
}

createServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
