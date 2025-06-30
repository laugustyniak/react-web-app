import { createRequestHandler } from '@react-router/express';
import express, { type Request, type Response, type NextFunction, type Application } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { isProduction, API_CONFIG, SERVER_CONFIG } from './server/config/index.js';
import { initializeFirebaseAdmin } from './server/config/firebase.js';
import { corsMiddleware, logRequest, jsonParser, urlEncodedParser } from './server/middleware/index.js';
import { setupRoutes } from './server/routes/index.js';
import { validateEnvironment, createHttpsServer, setupHttpsRedirect, checkSslCerts } from './server/helpers/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

validateEnvironment();

// Initialize Firebase Admin
try {
  initializeFirebaseAdmin();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error: any) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  if (isProduction) {
    process.exit(1);
  } else {
    console.warn('⚠️  Continuing without Firebase Admin - auth middleware will fail');
  }
}

async function createServer(): Promise<void> {
  const app: Application = express();

  app.use(corsMiddleware);
  app.use(logRequest);
  app.use(jsonParser);
  app.use(urlEncodedParser);

  setupRoutes(app);

  if (isProduction) {
    // Production mode
    app.use(express.static(path.resolve(__dirname, 'build/client')));

    try {
      // Load the production server build
      // @ts-ignore - Build file is generated at runtime and doesn't have types
      const build = await import('./build/server/index.js');
      const requestHandler = createRequestHandler({
        build,
        mode: 'production',
      });

      // Only handle non-API routes with React Router
      app.all('*', (req: Request, res: Response, next: NextFunction) => {
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
    // Development mode - serve static files from public directory
    app.use(express.static(path.resolve(__dirname, 'public')));
    
    console.log('🔧 Development mode: API proxy enabled at /api/*');
    console.log('📡 Backend URL:', API_CONFIG.BACKEND_URL);
    console.log('🔑 API Key configured:', !!API_CONFIG.API_KEY);

    app.get('*', (_: Request, res: Response) => {
      res.json({
        message: 'Express server running in development mode',
        api_proxy: 'Available at /api/*',
        documentation: 'Available at /docs',
        api_spec: 'Available at /api-docs',
        note: 'For full app development, use: npm run dev'
      });
    });
  }

  const httpsServer = createHttpsServer(app);
  if (httpsServer) {
    httpsServer.listen(SERVER_CONFIG.HTTPS_PORT, () => {
      console.log(`🔒 HTTPS Express server with SSR running at https://localhost:${SERVER_CONFIG.HTTPS_PORT}`);
      console.log('📱 Your React app is server-side rendered with SSL!');
      console.log('🔗 API proxy available at /api/*');
      console.log('📡 Backend:', API_CONFIG.BACKEND_URL);
      console.log('⚠️  Accept the self-signed certificate in your browser');
    });

    setupHttpsRedirect(app);
  }

  app.listen(SERVER_CONFIG.HTTP_PORT, () => {
    console.log(`🚀 HTTP Express server with SSR running at http://localhost:${SERVER_CONFIG.HTTP_PORT}`);
    if (!checkSslCerts()) {
      console.log('💡 To enable HTTPS, run: chmod +x generate-certs.sh && ./generate-certs.sh');
    }
    console.log('📱 Your React app is server-side rendered!');
    console.log('🔗 API proxy available at /api/*');
    console.log('📡 Backend:', API_CONFIG.BACKEND_URL);
  });
}

createServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
