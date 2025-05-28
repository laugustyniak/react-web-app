# API Proxy Test Suite

This directory contains comprehensive test cases to verify that your Express SSR API proxy is working correctly.

## Test Files Overview

### 1. **test-api-proxy.js** - Node.js Test Suite
Advanced programmatic tests using Node.js and fetch API.

**Features:**
- Automated server startup/shutdown
- Comprehensive API endpoint testing
- Error handling validation
- Performance testing
- Security checks

**Usage:**
```bash
node test-api-proxy.js
```

### 2. **test-api-proxy.sh** - Shell Script Tests
Quick and simple shell-based tests using curl.

**Features:**
- Basic connectivity tests
- API proxy validation
- Security checks
- Performance testing
- Colored output

**Usage:**
```bash
./test-api-proxy.sh
# or with custom port
./test-api-proxy.sh -p 3000
```

### 3. **test-api-proxy.test.js** - Jest Unit Tests
Professional unit tests for CI/CD integration.

**Features:**
- Jest-based test framework
- Concurrent request testing
- Error boundary testing
- Timeout handling

**Usage:**
```bash
npm test test-api-proxy.test.js
```

### 4. **postman-collection.json** - Postman Tests
Import into Postman for manual/automated API testing.

**Features:**
- GUI-based testing
- Request/response validation
- Performance monitoring
- Security validation

**Usage:**
1. Import into Postman
2. Set `baseUrl` variable to `http://localhost:5000`
3. Run collection

## Test Categories

### 🏥 **Health Checks**
- Server responsiveness
- Basic connectivity
- Environment detection

### 🔄 **API Proxy Tests**
- GET request forwarding
- POST request with body
- Header handling
- Response forwarding

### 🔒 **Security Tests**
- API key protection
- Header sanitization
- Sensitive data exposure
- Request validation

### ⚡ **Performance Tests**
- Response time validation
- Concurrent request handling
- Large payload processing
- Memory usage

### 🛠️ **Error Handling**
- Invalid JSON handling
- Network error recovery
- Timeout management
- Error response formatting

## Quick Start

### 1. Start your API proxy server:
```bash
npm run dev:api
```

### 2. Run tests (choose one):

**Shell script (simplest):**
```bash
./test-api-proxy.sh
```

**Node.js (most comprehensive):**
```bash
node test-api-proxy.js
```

**Jest (for CI/CD):**
```bash
npm test test-api-proxy.test.js
```

## Test Configuration

### Environment Variables
```bash
# Test configuration
TEST_API_BASE=http://localhost:5000
PORT=5000
NODE_ENV=development

# Your actual API configuration
BACKEND_API_URL=http://localhost:8000
INSBUY_API_KEY_1=your_api_key_here
```

### Expected Test Results

**✅ Successful Test Run:**
```
🔬 API Proxy Test Suite
=======================

🧪 Testing: Server Health Check
   ✅ Server is responding

🧪 Testing: API Proxy - GET Request  
   ✅ GET request proxied (Status: 200)

🧪 Testing: API Proxy - POST Request
   ✅ POST request proxied (Status: 200)

📊 Test Results Summary
======================
✅ Passed: 6/6
❌ Failed: 0/6

🎉 All tests passed!
```

## Troubleshooting

### Common Issues

**Server not responding:**
```bash
# Make sure server is running
npm run dev:api

# Check if port is available
lsof -i :5000
```

**API key errors:**
```bash
# Check environment variables
echo $INSBUY_API_KEY_1
echo $BACKEND_API_URL

# Verify .env file
cat .env
```

**Backend connection issues:**
```bash
# Test backend directly
curl http://localhost:8000/health

# Check backend logs
# (check your Python backend server)
```

### Test Debugging

**Verbose output:**
```bash
# Shell script with verbose curl
CURL_OPTS="-v" ./test-api-proxy.sh

# Node.js with debug logs
DEBUG=1 node test-api-proxy.js
```

**Individual test functions:**
```javascript
// test-api-proxy.js
import { createManualTests } from './test-api-proxy.js';
const tests = createManualTests();
await tests.testInpaintEndpoint();
```

## Integration with CI/CD

Add to your `package.json`:
```json
{
  "scripts": {
    "test:api-proxy": "jest test-api-proxy.test.js",
    "test:api-proxy-shell": "./test-api-proxy.sh",
    "test:api-proxy-node": "node test-api-proxy.js"
  }
}
```

GitHub Actions example:
```yaml
- name: Test API Proxy
  run: |
    npm run dev:api &
    sleep 5
    npm run test:api-proxy
```

## Custom Test Development

### Adding New Tests

**Shell script:**
```bash
test_my_endpoint() {
    log_test "My Custom Test"
    # Your test logic here
    if curl -s "$API_BASE/api/my-endpoint"; then
        log_success "Test passed"
        return 0
    else
        log_error "Test failed"
        return 1
    fi
}
```

**Node.js:**
```javascript
{
  name: 'My Custom Test',
  method: 'POST',
  url: `${API_BASE}/api/my-endpoint`,
  body: { test: 'data' },
  expectedStatus: [200, 400],
  description: 'Should test my custom endpoint'
}
```

**Jest:**
```javascript
test('should handle my custom endpoint', async () => {
  const response = await fetch(`${API_BASE}/api/my-endpoint`);
  expect(response.status).toBe(200);
});
```
