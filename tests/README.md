# Unified Test System

A comprehensive test suite for the React Web App that tests all services and APIs in one unified command.

## 🚀 Quick Start

### Run All Tests
```bash
npm test
# or
npm run test:all
```

This single command will:
1. 🏥 **Service Health Checks** - Verify all services are running
2. 🔄 **API Proxy Tests** - Test API forwarding and responses  
3. 📚 **Documentation Tests** - Validate API documentation endpoints
4. 🔗 **Integration Tests** - End-to-end workflow testing
5. 📊 **Generate Report** - Comprehensive test results

## 📁 Test Structure

```
tests/
├── run-all-tests.js          # Main unified test runner
├── suites/                   # Individual test suites
│   ├── api-proxy.test.js     # API proxy functionality
│   ├── docs.test.js          # Documentation endpoints
│   └── integration.test.js   # End-to-end workflows
├── utils/                    # Test utilities
│   └── test-utils.js         # Common utilities and helpers
├── reports/                  # Generated test reports
│   └── test-report.json      # Detailed JSON report
└── archive/                  # Old test files (moved here)
```

## 🧪 Individual Test Suites

### API Proxy Tests
```bash
npm run test:api
```
Tests:
- ✅ Server health check
- ✅ API endpoint forwarding
- ✅ POST request handling with JSON body
- ✅ Error handling (invalid JSON, large payloads)
- ✅ Security (API key protection)

### Documentation Tests  
```bash
npm run test:docs
```
Tests:
- ✅ API documentation JSON endpoints
- ✅ Swagger UI pages
- ✅ OpenAPI specification validation
- ✅ Content structure validation

### Integration Tests
```bash
npm run test:integration
```
Tests:
- ✅ Complete API proxy workflows
- ✅ Security validation workflows  
- ✅ Error handling workflows
- ✅ Performance and concurrent request handling

## 📊 Test Reports

### Console Output
Real-time colored output showing:
- Service health status
- Individual test results with timing
- Overall summary with pass/fail counts
- Detailed error information

### JSON Report
Detailed report saved to `tests/reports/test-report.json`:
```json
{
  "timestamp": "2025-05-30T...",
  "services": [...],
  "tests": [...],
  "summary": {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "duration": 12500
  }
}
```

## 🏥 Service Health Checks

The test runner automatically checks:
- **API Server** (`http://localhost:5000/`)
- **Health Endpoint** (`http://localhost:5000/api/health`)  
- **API Documentation** (`http://localhost:5000/api-docs`)

## ⚙️ Configuration

### Environment Variables
```bash
# Test configuration
TEST_API_BASE=http://localhost:5000
PORT=5000
NODE_ENV=development

# Backend API configuration  
BACKEND_API_URL=http://localhost:8000
INSBUY_API_KEY_1=your_api_key_here
```

### Timeouts and Retries
Default settings in `tests/utils/test-utils.js`:
- Request timeout: 10 seconds
- Service startup timeout: 30 seconds  
- Max retries: 3
- Retry delay: 1 second

## 🔧 Usage Scenarios

### Development Workflow
```bash
# Start your API server
npm run dev:api

# In another terminal, run tests
npm test
```

### CI/CD Integration
```bash
# GitHub Actions / Jenkins
npm run dev:api &
sleep 5
npm test
```

### Debugging Failed Tests
```bash
# Run individual test suites for debugging
npm run test:api      # API proxy issues
npm run test:docs     # Documentation problems  
npm run test:integration  # Workflow failures
```

## 🧹 Migration from Old Tests

### Clean Up Old Test Files
```bash
npm run test:cleanup
```

This moves old test files to `tests/archive/`:
- `test-api-proxy.js` → `tests/archive/`
- `test-api-proxy.test.js` → `tests/archive/`
- `test-api-proxy.sh` → `tests/archive/`
- `test-docs-endpoints.sh` → `tests/archive/`

### What Changed
- ✅ **Before**: Multiple scattered test files in root directory
- ✅ **After**: Organized test directory structure
- ✅ **Before**: Manual server startup required
- ✅ **After**: Automatic service management
- ✅ **Before**: Separate commands for each test type
- ✅ **After**: Single unified command runs everything
- ✅ **Before**: Basic console output
- ✅ **After**: Detailed reporting with JSON export

## 🛠️ Extending the Test Suite

### Adding New Tests

1. **API Tests** - Add to `tests/suites/api-proxy.test.js`
2. **Documentation Tests** - Add to `tests/suites/docs.test.js`  
3. **Integration Tests** - Add to `tests/suites/integration.test.js`

### Creating New Test Suite
```javascript
// tests/suites/my-new-tests.js
class MyNewTester {
  async runAllTests() {
    // Your test logic
    return success;
  }
}

// Add to run-all-tests.js:
await this.runTestSuite('My New Tests', './tests/suites/my-new-tests.js');
```

## ✅ Expected Results

### Successful Run
```
🧪 UNIFIED TEST RUNNER STARTED
============================================================

🏥 Phase 1: Service Startup
[10:30:15] ℹ️  Starting API server...
[10:30:18] ✅ API server started

🧪 Phase 2: Service Health Checks  
[10:30:18] ✅ API Server Root is healthy (200)
[10:30:18] ✅ API Health Endpoint is healthy (200)
[10:30:19] ✅ API Documentation is healthy (200)

🧪 Phase 3: Test Suite Execution
[10:30:19] ℹ️  Running API Proxy Tests test suite...
[10:30:21] ✅ API Proxy Tests passed (2134ms)
[10:30:21] ℹ️  Running Documentation Tests test suite...
[10:30:22] ✅ Documentation Tests passed (987ms)
[10:30:22] ℹ️  Running Integration Tests test suite...
[10:30:25] ✅ Integration Tests passed (3421ms)

🧪 Test Results Summary
============================================================

🏥 Services Health:
   ✅ API Server Root: 200
   ✅ API Health Endpoint: 200  
   ✅ API Documentation: 200

🧪 Test Results:
   ✅ API Proxy Tests (2134ms)
   ✅ Documentation Tests (987ms)
   ✅ Integration Tests (3421ms)

📊 Overall Summary:
   Services: 3/3 healthy
   Tests: 3/3 passed
   Duration: 7s

🎉 ALL TESTS PASSED!
```

## 🚨 Troubleshooting

### Server Not Starting
```bash
# Check if port is in use
lsof -i :5000

# Kill existing processes
pkill -f "node server.js"
```

### API Key Issues
```bash
# Verify environment variables
echo $INSBUY_API_KEY_1
echo $BACKEND_API_URL

# Check .env file
cat .env
```

### Backend Connection Issues  
```bash
# Test backend directly
curl http://localhost:8000/health

# Check backend server logs
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run dev:api &
      - run: sleep 10
      - run: npm test
```
