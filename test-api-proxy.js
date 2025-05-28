#!/usr/bin/env node

/**
 * API Proxy Test Suite
 * Tests the Express SSR API proxy functionality
 */

import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const TEST_PORT = 5001; // Use different port to avoid conflicts
const API_BASE = `http://localhost:${TEST_PORT}`;

// Test configuration
const TESTS = [
  {
    name: 'Health Check - Root endpoint',
    method: 'GET',
    url: `${API_BASE}/`,
    expectedStatus: 200,
    description: 'Should return development mode message'
  },
  {
    name: 'API Proxy - GET request',
    method: 'GET',
    url: `${API_BASE}/api/health`,
    expectedStatus: [200, 404], // 200 if backend has health endpoint, 404 if not
    description: 'Should proxy GET request to backend'
  },
  {
    name: 'API Proxy - POST inpaint endpoint',
    method: 'POST',
    url: `${API_BASE}/api/inpaint`,
    body: {
      prompt: "test prompt",
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    },
    headers: { 'Content-Type': 'application/json' },
    expectedStatus: [200, 400, 422, 500], // Various valid responses
    description: 'Should proxy POST request with body to backend'
  },
  {
    name: 'API Proxy - Invalid JSON',
    method: 'POST',
    url: `${API_BASE}/api/test`,
    body: 'invalid json',
    headers: { 'Content-Type': 'application/json' },
    expectedStatus: [400, 500],
    description: 'Should handle invalid JSON gracefully'
  },
  {
    name: 'API Proxy - Large payload',
    method: 'POST',
    url: `${API_BASE}/api/test`,
    body: { data: 'x'.repeat(1024 * 1024) }, // 1MB payload
    headers: { 'Content-Type': 'application/json' },
    expectedStatus: [200, 400, 413, 500],
    description: 'Should handle large payloads (within 10MB limit)'
  },
  {
    name: 'Non-API Route',
    method: 'GET',
    url: `${API_BASE}/some-other-route`,
    expectedStatus: 200,
    description: 'Should return development message for non-API routes'
  }
];

class APITester {
  constructor() {
    this.server = null;
    this.results = [];
  }

  async startServer() {
    console.log('🚀 Starting test server...');
    
    return new Promise((resolve, reject) => {
      this.server = spawn('node', ['server.js'], {
        env: { 
          ...process.env, 
          NODE_ENV: 'development', 
          PORT: TEST_PORT 
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      this.server.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Express server with SSR running')) {
          resolve();
        }
      });

      this.server.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      this.server.on('error', reject);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 10000);
    });
  }

  async stopServer() {
    if (this.server) {
      console.log('🛑 Stopping test server...');
      this.server.kill('SIGTERM');
      await setTimeout(1000); // Give it time to shut down
    }
  }

  async runTest(test) {
    console.log(`\n🧪 Running: ${test.name}`);
    console.log(`   ${test.description}`);
    
    try {
      const options = {
        method: test.method,
        headers: test.headers || {}
      };

      if (test.body) {
        options.body = typeof test.body === 'string' 
          ? test.body 
          : JSON.stringify(test.body);
      }

      const startTime = Date.now();
      const response = await fetch(test.url, options);
      const duration = Date.now() - startTime;

      const result = {
        name: test.name,
        status: response.status,
        duration,
        passed: Array.isArray(test.expectedStatus) 
          ? test.expectedStatus.includes(response.status)
          : response.status === test.expectedStatus,
        url: test.url,
        method: test.method
      };

      // Try to get response body for debugging
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result.body = await response.json();
        } else {
          const text = await response.text();
          result.body = text.substring(0, 200); // Truncate long responses
        }
      } catch (e) {
        result.body = 'Could not parse response body';
      }

      console.log(`   ✅ Status: ${result.status} (${duration}ms)`);
      if (!result.passed) {
        console.log(`   ❌ Expected: ${test.expectedStatus}, Got: ${result.status}`);
      }

      this.results.push(result);
      return result;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      const result = {
        name: test.name,
        error: error.message,
        passed: false,
        url: test.url,
        method: test.method
      };
      this.results.push(result);
      return result;
    }
  }

  async runAllTests() {
    console.log('🔬 Starting API Proxy Test Suite\n');
    
    try {
      await this.startServer();
      await setTimeout(2000); // Wait for server to be fully ready

      for (const test of TESTS) {
        await this.runTest(test);
      }

    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      return false;
    } finally {
      await this.stopServer();
    }

    return this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log(`\n✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed < total) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`   • ${r.name}: ${r.error || `Status ${r.status}`}`);
        });
    }

    console.log('\n📋 Detailed Results:');
    this.results.forEach(r => {
      const status = r.passed ? '✅' : '❌';
      const duration = r.duration ? `(${r.duration}ms)` : '';
      console.log(`   ${status} ${r.name} ${duration}`);
      if (r.body && typeof r.body === 'object') {
        console.log(`       Response: ${JSON.stringify(r.body).substring(0, 100)}...`);
      }
    });

    return passed === total;
  }
}

// Manual test functions for interactive testing
export function createManualTests() {
  return {
    async testInpaintEndpoint() {
      console.log('🎨 Testing Inpaint Endpoint');
      const response = await fetch(`${API_BASE}/api/inpaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "a beautiful landscape",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          mask: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        })
      });
      
      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      try {
        const data = await response.json();
        console.log('Response:', data);
      } catch (e) {
        const text = await response.text();
        console.log('Response (text):', text);
      }
    },

    async testBackendHealth() {
      console.log('🏥 Testing Backend Health');
      const response = await fetch(`${API_BASE}/api/health`);
      console.log('Status:', response.status);
      
      try {
        const data = await response.json();
        console.log('Response:', data);
      } catch (e) {
        const text = await response.text();
        console.log('Response (text):', text);
      }
    }
  };
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new APITester();
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

export default APITester;
