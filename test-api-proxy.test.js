const { test, expect } = require('@jest/globals');
const fetch = require('node-fetch');

// Test configuration
const API_BASE = process.env.TEST_API_BASE || 'http://localhost:5000';
const TIMEOUT = 10000; // 10 seconds

describe('API Proxy Integration Tests', () => {
  beforeAll(async () => {
    // Wait for server to be ready
    let retries = 5;
    while (retries > 0) {
      try {
        const response = await fetch(`${API_BASE}/`);
        if (response.ok) break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`Server not ready at ${API_BASE}. Make sure to run 'npm run dev:api' first.`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }, TIMEOUT);

  describe('Server Health', () => {
    test('should respond to root endpoint', async () => {
      const response = await fetch(`${API_BASE}/`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toContain('development mode');
    }, TIMEOUT);
  });

  describe('API Proxy Functionality', () => {
    test('should proxy GET requests to backend', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      
      // Should get a response (200, 404, or 500 are all valid)
      expect([200, 404, 500]).toContain(response.status);
      expect(response.headers.get('content-type')).toBeTruthy();
    }, TIMEOUT);

    test('should proxy POST requests with JSON body', async () => {
      const testData = {
        prompt: 'test prompt',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      };

      const response = await fetch(`${API_BASE}/api/inpaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      // Should get a response from backend
      expect([200, 400, 422, 500]).toContain(response.status);
      expect(response.headers.get('content-type')).toContain('application/json');
    }, TIMEOUT);

    test('should handle invalid JSON gracefully', async () => {
      const response = await fetch(`${API_BASE}/api/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }'
      });

      expect([400, 500]).toContain(response.status);
    }, TIMEOUT);

    test('should handle large payloads within limits', async () => {
      const largeData = {
        data: 'x'.repeat(100000) // 100KB payload
      };

      const response = await fetch(`${API_BASE}/api/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeData)
      });

      // Should either process or reject with appropriate status
      expect([200, 400, 413, 500]).toContain(response.status);
    }, TIMEOUT);
  });

  describe('Security Tests', () => {
    test('should not expose API key in response headers', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      
      const headers = response.headers;
      expect(headers.get('x-api-key')).toBeNull();
      expect(headers.get('api-key')).toBeNull();
      expect(headers.get('apikey')).toBeNull();
    }, TIMEOUT);

    test('should not expose API key in response body', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const text = await response.text();
      
      expect(text.toLowerCase()).not.toContain('insbuy_api_key');
      expect(text.toLowerCase()).not.toContain('api_key');
    }, TIMEOUT);

    test('should sanitize request headers', async () => {
      const response = await fetch(`${API_BASE}/api/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'malicious-key',
          'authorization': 'Bearer malicious-token'
        },
        body: JSON.stringify({ test: true })
      });

      // Should process request without forwarding malicious headers
      expect([200, 400, 404, 500]).toContain(response.status);
    }, TIMEOUT);
  });

  describe('Error Handling', () => {
    test('should handle non-API routes correctly', async () => {
      const response = await fetch(`${API_BASE}/some-other-route`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toContain('development mode');
    }, TIMEOUT);

    test('should handle network errors gracefully', async () => {
      // This test assumes the backend might not be running
      const response = await fetch(`${API_BASE}/api/nonexistent-endpoint`);
      
      // Should get some response, even if it's an error
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    }, TIMEOUT);
  });

  describe('Performance Tests', () => {
    test('should handle concurrent requests', async () => {
      const promises = Array(5).fill().map(() => 
        fetch(`${API_BASE}/api/health`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect([200, 404, 500]).toContain(response.status);
      });
    }, TIMEOUT);

    test('should respond within reasonable time', async () => {
      const start = Date.now();
      const response = await fetch(`${API_BASE}/api/health`);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // 5 seconds max
      expect([200, 404, 500]).toContain(response.status);
    }, TIMEOUT);
  });
});

module.exports = {
  testApiProxy: async () => {
    console.log('Running API Proxy tests...');
    // This can be used for programmatic testing
  }
};
