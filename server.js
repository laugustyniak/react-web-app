import express from 'express';
import { createRequestHandler } from '@react-router/express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// API Configuration
const API_CONFIG = {
  BACKEND_URL: process.env.BACKEND_API_URL || 'http://localhost:8000',
  API_KEY: process.env.INSBUY_API_KEY_1 || '',
};

// API Proxy Middleware
function createAPIProxy() {
  return async (req, res, next) => {
    // Only handle /api/ routes
    if (!req.path.startsWith('/api/')) {
      return next();
    }

    try {
      // Extract the API endpoint (remove /api prefix)
      const endpoint = req.path.replace('/api', '');
      const targetUrl = `${API_CONFIG.BACKEND_URL}${endpoint}`;

      // Prepare headers with API key
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_CONFIG.API_KEY,
        ...Object.fromEntries(
          Object.entries(req.headers).filter(([key]) => 
            !['host', 'content-length', 'x-api-key'].includes(key.toLowerCase())
          )
        )
      };

      // Prepare request options
      const options = {
        method: req.method,
        headers,
      };

      // Add body for POST, PUT, PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (req.is('application/json')) {
          const body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                resolve(data);
              }
            });
            req.on('error', reject);
          });
          options.body = JSON.stringify(body);
        }
      }

      // Forward request to backend
      const response = await fetch(targetUrl, options);
      
      // Set response headers
      res.status(response.status);
      
      // Copy relevant headers from backend response
      ['content-type', 'cache-control', 'etag'].forEach(header => {
        const value = response.headers.get(header);
        if (value) {
          res.set(header, value);
        }
      });

      // Handle different response types
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        res.json(data);
      } else {
        const text = await response.text();
        res.send(text);
      }

    } catch (error) {
      console.error('API Proxy Error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}

async function createServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';

  // Parse JSON bodies
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve API documentation
  app.get('/api-docs', (req, res) => {
    try {
      const apiDocsPath = path.resolve(__dirname, 'api-docs.json');
      const apiDocs = JSON.parse(fs.readFileSync(apiDocsPath, 'utf8'));
      
      // Update server URL based on request
      apiDocs.servers = [
        {
          url: `${req.protocol}://${req.get('host')}`,
          description: isProduction ? 'Production server' : 'Development server'
        }
      ];
      
      res.json(apiDocs);
    } catch (error) {
      res.status(500).json({ error: 'Could not load API documentation' });
    }
  });

  // Serve Swagger UI for API documentation
  app.get('/docs', (req, res) => {
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Express SSR API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      try {
        const ui = SwaggerUIBundle({
          url: '/api-docs',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          tryItOutEnabled: true,
          validatorUrl: null, // Disable online validator
          onComplete: function() {
            console.log('Swagger UI loaded successfully');
          },
          onFailure: function(error) {
            console.error('Swagger UI failed to load:', error);
            document.getElementById('swagger-ui').innerHTML = 
              '<div style="padding: 20px; color: red;">Failed to load API documentation: ' + 
              (error.message || error) + '</div>';
          },
          requestInterceptor: function(request) {
            console.log('Request:', request);
            return request;
          },
          responseInterceptor: function(response) {
            console.log('Response:', response);
            return response;
          }
        });
      } catch (error) {
        console.error('Error initializing Swagger UI:', error);
        document.getElementById('swagger-ui').innerHTML = 
          '<div style="padding: 20px; color: red;">Error initializing API documentation: ' + 
          error.message + '</div>';
      }
    };
  </script>
</body>
</html>`;
    res.send(swaggerHtml);
  });

  // Debug endpoint with minimal API spec
  app.get('/api-docs-debug', (req, res) => {
    const minimalSpec = {
      "openapi": "3.0.3",
      "info": {
        "title": "Express SSR API Proxy",
        "version": "1.0.0",
        "description": "A simple API proxy"
      },
      "servers": [
        {
          "url": `${req.protocol}://${req.get('host')}`,
          "description": "Development server"
        }
      ],
      "paths": {
        "/": {
          "get": {
            "summary": "Health check",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "message": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    res.json(minimalSpec);
  });

  // Debug docs page with minimal spec
  app.get('/docs-debug', (req, res) => {
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Debug API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      try {
        console.log('Initializing Swagger UI...');
        const ui = SwaggerUIBundle({
          url: '/api-docs-debug',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          validatorUrl: null,
          onComplete: function() {
            console.log('Swagger UI loaded successfully');
          },
          onFailure: function(error) {
            console.error('Swagger UI failed to load:', error);
          }
        });
      } catch (error) {
        console.error('Error initializing Swagger UI:', error);
        document.getElementById('swagger-ui').innerHTML = 
          '<div style="padding: 20px; color: red;">Error: ' + error.message + '</div>';
      }
    };
  </script>
</body>
</html>`;
    res.send(swaggerHtml);
  });

  // Add API proxy middleware for all environments
  app.use(createAPIProxy());

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

      app.all('*', requestHandler);
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
    console.log('� API documentation at /docs');
    console.log('📋 API spec at /api-docs');
    console.log('�📡 Backend:', API_CONFIG.BACKEND_URL);
  });
}

createServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
