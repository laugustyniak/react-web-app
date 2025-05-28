#!/bin/bash

echo "🧪 Testing API Documentation Endpoints"
echo "======================================="

# Test main API docs endpoint
echo ""
echo "📋 Testing /api-docs endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api-docs)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ /api-docs returns 200 OK"
    # Check if it's valid JSON with openapi field
    OPENAPI_VERSION=$(curl -s http://localhost:5000/api-docs | jq -r '.openapi // "missing"')
    echo "   OpenAPI Version: $OPENAPI_VERSION"
else
    echo "❌ /api-docs returns $RESPONSE"
fi

# Test debug API docs endpoint
echo ""
echo "🔍 Testing /api-docs-debug endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api-docs-debug)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ /api-docs-debug returns 200 OK"
    # Check if it's valid JSON with openapi field
    OPENAPI_VERSION=$(curl -s http://localhost:5000/api-docs-debug | jq -r '.openapi // "missing"')
    echo "   OpenAPI Version: $OPENAPI_VERSION"
else
    echo "❌ /api-docs-debug returns $RESPONSE"
fi

# Test main docs page
echo ""
echo "📚 Testing /docs endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/docs)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ /docs returns 200 OK"
else
    echo "❌ /docs returns $RESPONSE"
fi

# Test debug docs page
echo ""
echo "🔍 Testing /docs-debug endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/docs-debug)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ /docs-debug returns 200 OK"
else
    echo "❌ /docs-debug returns $RESPONSE"
fi

echo ""
echo "🌐 Open these URLs in your browser:"
echo "   Main docs: http://localhost:5000/docs"
echo "   Debug docs: http://localhost:5000/docs-debug"
echo "   API spec: http://localhost:5000/api-docs"
echo "   Debug spec: http://localhost:5000/api-docs-debug"
