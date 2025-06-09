#!/bin/bash
set -e

echo "🔨 Building Docker image for testing..."
docker build -t react-web-app-test .

echo "🧪 Testing Docker image..."
# Run container in background
CONTAINER_ID=$(docker run -d -p 8080:8080 --env NODE_ENV=production react-web-app-test)

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -f http://localhost:8080/health || (echo "❌ Health check failed"; docker logs $CONTAINER_ID; docker stop $CONTAINER_ID; exit 1)

# Test API health endpoint (expected to fail without API key)
echo "🔍 Testing API health endpoint..."
if curl -s http://localhost:8080/api/health | grep -q "401\|503\|unhealthy"; then
  echo "✅ API health endpoint responding (401/503 expected without API key)"
else
  echo "⚠️ API health endpoint returned unexpected response"
fi

# Test root endpoint
echo "🌐 Testing root endpoint..."
curl -f http://localhost:8080/ || (echo "❌ Root endpoint failed"; docker logs $CONTAINER_ID; docker stop $CONTAINER_ID; exit 1)

echo "✅ All tests passed!"

# Clean up
echo "🧹 Cleaning up..."
docker stop $CONTAINER_ID
docker rm $CONTAINER_ID

echo "🎉 Docker image is ready for deployment!"