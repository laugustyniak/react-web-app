# Testing Guide

## Quick Test Commands

### 1. Test Development Setup

```bash
# Start development servers
npm run dev:start

# In another terminal, test API endpoints
curl http://localhost:3000/api/healthcheck
curl http://localhost:5000/api/healthcheck
curl http://localhost:5000/health
```

### 2. Test Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start:prod

# Test production endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/healthcheck
```

### 3. Test Container Setup

```bash
# Build and run container
docker-compose up --build -d

# Test container health
curl http://localhost:5000/health
docker-compose logs -f app

# Stop container
docker-compose down
```

## Detailed Testing Steps

### Development Mode Testing

1. **Start Development Servers**
   ```bash
   npm run dev:start
   ```
   
   Expected output:
   - Express server starts on port 5000
   - Vite dev server starts on port 3000
   - Proxy configuration logs appear

2. **Test API Proxy**
   ```bash
   # Test through Vite proxy (should work)
   curl -X GET http://localhost:3000/api/healthcheck
   
   # Test direct Express (should work)
   curl -X GET http://localhost:5000/api/healthcheck
   
   # Test Express health (should work)
   curl -X GET http://localhost:5000/health
   ```

3. **Test Frontend**
   - Open browser: `http://localhost:3000`
   - Check browser console for proxy logs
   - Test API calls from frontend

### Production Mode Testing

1. **Build Application**
   ```bash
   npm run build
   ```
   
   Expected: `build/` directory created with client and server builds

2. **Start Production Server**
   ```bash
   npm run start:prod
   ```
   
   Expected: Single server on port 5000 serving both frontend and API

3. **Test Production Endpoints**
   ```bash
   # Test health endpoint
   curl -X GET http://localhost:5000/health
   
   # Test API endpoints
   curl -X GET http://localhost:5000/api/healthcheck
   
   # Test frontend (should return HTML)
   curl -X GET http://localhost:5000/
   ```

### Container Testing

1. **Build Container**
   ```bash
   docker-compose build
   ```

2. **Run Container**
   ```bash
   docker-compose up -d
   ```

3. **Test Container Health**
   ```bash
   # Check container status
   docker-compose ps
   
   # Test health endpoint
   curl -X GET http://localhost:5000/health
   
   # Check logs
   docker-compose logs app
   ```

## API Endpoint Tests

### Health Check Tests

```bash
# Express server health
curl -v http://localhost:5000/health

# Backend API health (proxied)
curl -v http://localhost:5000/api/healthcheck
```

### Product API Tests

```bash
# Test find_image endpoint
curl -X POST http://localhost:5000/api/find_image \
  -H "Content-Type: application/json" \
  -d '{"query": "test image"}'

# Test get_product_description endpoint
curl -X POST http://localhost:5000/api/get_product_description \
  -H "Content-Type: application/json" \
  -d '{"product_data": "test product"}'
```

## Troubleshooting Tests

### Port Conflicts
```bash
# Check what's running on ports
lsof -i :3000
lsof -i :5000

# Kill processes if needed
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:5000)
```

### Network Tests
```bash
# Test connectivity
ping localhost
telnet localhost 5000
telnet localhost 3000
```

### Container Network Tests
```bash
# Test container networking
docker-compose exec app wget -qO- http://localhost:5000/health
docker-compose exec app netstat -tlnp
```

## Expected Results

### Development Mode ✅
- Vite dev server: `http://localhost:3000` (frontend)
- Express server: `http://localhost:5000` (API)
- API proxy: `/api/*` requests from 3000 → 5000
- Hot reload works for frontend changes

### Production Mode ✅
- Single server: `http://localhost:5000`
- Serves both frontend and API
- SSR enabled
- Static files served efficiently

### Container Mode ✅
- Single containerized server: `http://localhost:5000`
- Health checks pass
- Environment variables loaded
- Logs accessible via docker-compose

## Performance Tests

### Load Testing
```bash
# Install apache bench
sudo apt-get install apache2-utils

# Test health endpoint
ab -n 100 -c 10 http://localhost:5000/health

# Test API endpoint
ab -n 50 -c 5 -p test-data.json -T application/json http://localhost:5000/api/healthcheck
```

### Memory and CPU Monitoring
```bash
# Monitor development servers
top -p $(pgrep -f "node.*server.js")
top -p $(pgrep -f "vite")

# Monitor container
docker stats
```

## Automated Test Script

Create a test script to run all tests:

```bash
#!/bin/bash
# test-setup.sh

echo "🧪 Testing Express + Vite Setup"

# Test 1: Development mode
echo "1️⃣ Testing development mode..."
npm run dev:start &
DEV_PID=$!
sleep 5

curl -f http://localhost:3000/api/healthcheck && echo "✅ Dev proxy works" || echo "❌ Dev proxy failed"
curl -f http://localhost:5000/health && echo "✅ Express health works" || echo "❌ Express health failed"

kill $DEV_PID

# Test 2: Production mode
echo "2️⃣ Testing production mode..."
npm run build
npm run start:prod &
PROD_PID=$!
sleep 3

curl -f http://localhost:5000/health && echo "✅ Prod health works" || echo "❌ Prod health failed"
curl -f http://localhost:5000/api/healthcheck && echo "✅ Prod API works" || echo "❌ Prod API failed"

kill $PROD_PID

# Test 3: Container mode
echo "3️⃣ Testing container mode..."
docker-compose up -d --build
sleep 10

curl -f http://localhost:5000/health && echo "✅ Container health works" || echo "❌ Container health failed"
docker-compose down

echo "🎉 Testing complete!"
```
