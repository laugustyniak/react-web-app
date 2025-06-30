# Development Setup Guide

## Architecture Overview

This project uses a **dual-server architecture** for development:

- **Express Server** (Port 5000): Handles API routes (`/api/*`) and serves production builds
- **Vite Dev Server** (Port 3000): Serves the React frontend with hot reload and proxies API calls to Express

## Development Scripts

### Recommended Development Workflow

```bash
# Start both servers with proper sequencing and colored output
npm run dev:start
```

This will:
1. Start the Express API server on `http://localhost:5000`
2. Wait 2 seconds for API server to initialize
3. Start the Vite dev server on `http://localhost:3000`
4. Proxy all `/api/*` requests from Vite to Express

### Alternative Development Scripts

```bash
# Start both servers concurrently (may have timing issues)
npm run dev:full

# Start servers individually
npm run dev:api    # Express server only
npm run dev        # Vite dev server only (requires API server running)
```

## How API Routing Works

### Development Mode
1. Frontend makes request to `http://localhost:3000/api/endpoint`
2. Vite proxy forwards request to `http://localhost:5000/api/endpoint`
3. Express server handles the API logic
4. Response is sent back through the proxy to frontend

### Production Mode
1. Express server serves both static files and API routes
2. All requests go directly to Express on the production port
3. Non-API routes are handled by React Router SSR

## API Endpoints

- `GET /api/healthcheck` - Backend health check (proxied)
- `POST /api/find_image` - Image search functionality
- `POST /api/get_product_description` - Product description extraction
- `GET /health` - Express server health check (direct)

## Configuration Files

- `vite.config.ts` - Vite configuration with proxy setup
- `server.js` - Express server with API routes and SSR
- `package.json` - Scripts for development and production

## Environment Variables

Create a `.env` file with:
```env
BACKEND_API_URL=https://your-backend-api.com
PRODUCT_API_KEY_1=your-api-key
NODE_ENV=development
PORT=5000
```

## Troubleshooting

### Port Conflicts
- Express server uses port 5000
- Vite dev server uses port 3000
- Change ports in `vite.config.ts` and `server.js` if needed

### CORS Issues
- CORS is configured in Express server for development
- Allows requests from `http://localhost:3000`

### Proxy Errors
- Check that Express server is running before starting Vite
- Look for proxy logs in Vite dev server console
- Verify API endpoints are correctly defined in Express

### Build Issues
```bash
# Clean build and restart
rm -rf build/ node_modules/.vite/
npm install
npm run build
```

## Production Container Setup

### Docker Configuration

The project includes a multi-stage Dockerfile optimized for production:

1. **Development Dependencies Stage**: Installs all dependencies for building
2. **Production Dependencies Stage**: Installs only production dependencies
3. **Build Stage**: Builds the React Router application
4. **Production Stage**: Creates minimal production image

### Running with Docker

#### Option 1: Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

#### Option 2: Docker Commands

```bash
# Build the image
docker build -t react-web-app .

# Run the container
docker run -p 5000:5000 --env-file .env react-web-app

# Run with custom environment variables
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e BACKEND_API_URL=https://your-api.com \
  -e PRODUCT_API_KEY_1=your-key \
  react-web-app
```

### Container Environment Variables

Create a `.env` file for container deployment:

```env
NODE_ENV=production
PORT=5000
BACKEND_API_URL=https://your-backend-api.com
PRODUCT_API_KEY_1=your-api-key
```

### Health Checks

The container includes health checks:
- **Endpoint**: `http://localhost:5000/health`
- **Interval**: Every 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Start Period**: 40 seconds

### Container Architecture

In production container mode:
1. **Single Server**: Only Express server runs (no Vite)
2. **Static Files**: Pre-built React app served by Express
3. **SSR**: Server-side rendering handled by React Router
4. **API Routes**: All `/api/*` routes handled directly by Express
5. **Port**: Single port (5000) for both frontend and API

### Production Deployment Commands

```bash
# Local production build and test
npm run build
npm run start:prod

# Container production deployment
docker-compose up --build -d

# Check container health
docker-compose ps
curl http://localhost:5000/health

# View container logs
docker-compose logs -f app
```

### Container Optimization

The Dockerfile uses several optimization techniques:
- **Multi-stage build**: Reduces final image size
- **Alpine Linux**: Minimal base image
- **Layer caching**: Separates dependencies from source code
- **Production dependencies only**: Excludes dev dependencies from final image
- **Health checks**: Ensures container readiness

### Scaling and Load Balancing

For production scaling, consider:
```yaml
# docker-compose.yml scaling example
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000-5002:5000"
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

### Container Troubleshooting

```bash
# Check container status
docker-compose ps

# View real-time logs
docker-compose logs -f app

# Execute commands inside container
docker-compose exec app sh

# Check health endpoint
curl http://localhost:5000/health

# Restart container
docker-compose restart app
