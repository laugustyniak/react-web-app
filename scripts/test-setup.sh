#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Express + Vite Setup${NC}"
echo "=================================="

# Function to wait for server to be ready
wait_for_server() {
    local url=$1
    local timeout=30
    local count=0
    
    echo -e "${YELLOW}Waiting for server at $url...${NC}"
    while ! curl -s -f "$url" > /dev/null 2>&1; do
        sleep 1
        count=$((count + 1))
        if [ $count -ge $timeout ]; then
            echo -e "${RED}❌ Server at $url failed to start within $timeout seconds${NC}"
            return 1
        fi
    done
    echo -e "${GREEN}✅ Server at $url is ready${NC}"
    return 0
}

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $description${NC}"
        return 0
    else
        echo -e "${RED}❌ $description${NC}"
        return 1
    fi
}

# Test 1: Check if required files exist
echo -e "\n${BLUE}1️⃣ Checking required files...${NC}"
test -f "package.json" && echo -e "${GREEN}✅ package.json exists${NC}" || echo -e "${RED}❌ package.json missing${NC}"
test -f "server.js" && echo -e "${GREEN}✅ server.js exists${NC}" || echo -e "${RED}❌ server.js missing${NC}"
test -f "vite.config.ts" && echo -e "${GREEN}✅ vite.config.ts exists${NC}" || echo -e "${RED}❌ vite.config.ts missing${NC}"
test -f "Dockerfile" && echo -e "${GREEN}✅ Dockerfile exists${NC}" || echo -e "${RED}❌ Dockerfile missing${NC}"

# Test 2: Production build
echo -e "\n${BLUE}2️⃣ Testing production build...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
    test -d "build" && echo -e "${GREEN}✅ Build directory created${NC}" || echo -e "${RED}❌ Build directory missing${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
fi

# Test 3: Production mode
echo -e "\n${BLUE}3️⃣ Testing production mode...${NC}"
npm run start:prod > /tmp/prod-server.log 2>&1 &
PROD_PID=$!
echo "Started production server (PID: $PROD_PID)"

if wait_for_server "http://localhost:8080/health"; then
    test_endpoint "http://localhost:8080/health" "Production health endpoint"
    test_endpoint "http://localhost:8080/api/healthcheck" "Production API endpoint"
    
    # Test if it serves HTML for root path
    if curl -s "http://localhost:8080/" | grep -q "html\|HTML"; then
        echo -e "${GREEN}✅ Production serves HTML content${NC}"
    else
        echo -e "${RED}❌ Production not serving HTML content${NC}"
    fi
else
    echo -e "${RED}❌ Production server failed to start${NC}"
fi

# Cleanup production server
kill $PROD_PID 2>/dev/null
sleep 2

# Test 4: Container mode (if Docker is available)
echo -e "\n${BLUE}4️⃣ Testing container mode...${NC}"
if command -v docker-compose &> /dev/null; then
    echo "Building and starting container..."
    if docker-compose up -d --build > /tmp/docker-build.log 2>&1; then
        echo -e "${GREEN}✅ Container started successfully${NC}"
        
        if wait_for_server "http://localhost:8080/health"; then
            test_endpoint "http://localhost:8080/health" "Container health endpoint"
            test_endpoint "http://localhost:8080/api/healthcheck" "Container API endpoint"
            
            # Check container logs
            echo -e "${YELLOW}Container logs (last 10 lines):${NC}"
            docker-compose logs --tail=10 app
        else
            echo -e "${RED}❌ Container server failed to start${NC}"
            echo -e "${YELLOW}Container logs:${NC}"
            docker-compose logs app
        fi
        
        # Cleanup container
        echo "Stopping container..."
        docker-compose down > /dev/null 2>&1
    else
        echo -e "${RED}❌ Container failed to build/start${NC}"
        echo -e "${YELLOW}Build logs:${NC}"
        cat /tmp/docker-build.log
    fi
else
    echo -e "${YELLOW}⚠️ Docker not available, skipping container tests${NC}"
fi

# Test 5: Development mode (quick test)
echo -e "\n${BLUE}5️⃣ Testing development API server...${NC}"
NODE_ENV=development node server.js > /tmp/dev-server.log 2>&1 &
DEV_PID=$!
echo "Started development API server (PID: $DEV_PID)"

if wait_for_server "http://localhost:8080/health"; then
    test_endpoint "http://localhost:8080/health" "Development health endpoint"
    test_endpoint "http://localhost:8080/api/healthcheck" "Development API endpoint"
else
    echo -e "${RED}❌ Development server failed to start${NC}"
fi

# Cleanup development server
kill $DEV_PID 2>/dev/null
sleep 2

# Summary
echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================================="
echo -e "${GREEN}✅ Tests completed!${NC}"
echo ""
echo -e "${YELLOW}To run full development mode:${NC}"
echo "  npm run dev:start"
echo ""
echo -e "${YELLOW}To run production mode:${NC}"
echo "  npm run build && npm run start:prod"
echo ""
echo -e "${YELLOW}To run in container:${NC}"
echo "  docker-compose up --build"
echo ""
echo -e "${YELLOW}Check logs if any tests failed:${NC}"
echo "  /tmp/prod-server.log"
echo "  /tmp/dev-server.log"
echo "  /tmp/docker-build.log"

# Cleanup temp files
rm -f /tmp/prod-server.log /tmp/dev-server.log /tmp/docker-build.log
