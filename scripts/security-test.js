#!/usr/bin/env node

/**
 * Security Test Script
 * Tests the security headers and configurations of the Express server
 */

// Use Node.js built-in fetch (available in Node 18+)

const SERVER_URL = 'http://localhost:8080';

async function testSecurityHeaders() {
  console.log('🔍 Testing security headers...\n');

  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const headers = response.headers;

    const securityTests = [
      {
        name: 'X-Frame-Options',
        header: 'x-frame-options',
        expected: 'DENY',
        description: 'Prevents clickjacking attacks'
      },
      {
        name: 'X-Content-Type-Options',
        header: 'x-content-type-options',
        expected: 'nosniff',
        description: 'Prevents MIME-type sniffing'
      },
      {
        name: 'X-XSS-Protection',
        header: 'x-xss-protection',
        expected: '1; mode=block',
        description: 'Enables XSS filtering'
      },
      {
        name: 'Referrer-Policy',
        header: 'referrer-policy',
        expected: 'strict-origin-when-cross-origin',
        description: 'Controls referrer information'
      },
      {
        name: 'Content-Security-Policy',
        header: 'content-security-policy',
        expected: null, // Just check if present
        description: 'Prevents XSS and code injection'
      },
      {
        name: 'Permissions-Policy',
        header: 'permissions-policy',
        expected: null, // Just check if present
        description: 'Controls browser features'
      }
    ];

    let passedTests = 0;
    const totalTests = securityTests.length;

    for (const test of securityTests) {
      const headerValue = headers.get(test.header);
      const passed = headerValue && (test.expected ? headerValue === test.expected : true);
      
      console.log(`${passed ? '✅' : '❌'} ${test.name}`);
      console.log(`   Expected: ${test.expected || 'Present'}`);
      console.log(`   Actual: ${headerValue || 'Missing'}`);
      console.log(`   Purpose: ${test.description}\n`);
      
      if (passed) passedTests++;
    }

    // Test for X-Powered-By header removal
    const poweredBy = headers.get('x-powered-by');
    const poweredByRemoved = !poweredBy;
    console.log(`${poweredByRemoved ? '✅' : '❌'} X-Powered-By Header Removal`);
    console.log(`   Expected: Header should be removed`);
    console.log(`   Actual: ${poweredBy || 'Removed'}`);
    console.log(`   Purpose: Prevents server fingerprinting\n`);
    
    if (poweredByRemoved) passedTests++;

    console.log(`\n📊 Security Headers Test Results: ${passedTests}/${totalTests + 1} passed`);
    
    return passedTests === totalTests + 1;

  } catch (error) {
    console.error('❌ Failed to test security headers:', error.message);
    return false;
  }
}

async function testRateLimit() {
  console.log('\n🚦 Testing rate limiting...\n');

  try {
    // Make multiple requests quickly to test rate limiting
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(fetch(`${SERVER_URL}/api/healthcheck`));
    }

    const responses = await Promise.all(requests);
    
    let rateLimitHeadersFound = false;
    
    for (const response of responses) {
      const rateLimitHeader = response.headers.get('x-ratelimit-limit');
      if (rateLimitHeader) {
        rateLimitHeadersFound = true;
        console.log('✅ Rate limiting headers present');
        console.log(`   X-RateLimit-Limit: ${rateLimitHeader}`);
        console.log(`   X-RateLimit-Remaining: ${response.headers.get('x-ratelimit-remaining')}`);
        break;
      }
    }

    if (!rateLimitHeadersFound) {
      console.log('❌ Rate limiting headers not found');
    }

    return rateLimitHeadersFound;

  } catch (error) {
    console.error('❌ Failed to test rate limiting:', error.message);
    return false;
  }
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing health endpoint...\n');

  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();

    const hasRequiredFields = data.status && data.timestamp && data.uptime !== undefined;
    
    console.log(`${hasRequiredFields ? '✅' : '❌'} Health endpoint structure`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Timestamp: ${data.timestamp}`);
    console.log(`   Uptime: ${data.uptime}s`);

    return hasRequiredFields && response.status === 200;

  } catch (error) {
    console.error('❌ Failed to test health endpoint:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔐 Security Test Suite for Buy It React App\n');
  console.log('=' .repeat(50));

  const results = [];
  
  results.push(await testSecurityHeaders());
  results.push(await testRateLimit());
  results.push(await testHealthEndpoint());

  const passedTests = results.filter(Boolean).length;
  const totalTests = results.length;

  console.log('\n' + '='.repeat(50));
  console.log(`\n📋 Overall Results: ${passedTests}/${totalTests} test suites passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All security tests passed! Your server is well-secured.');
  } else {
    console.log('⚠️  Some security tests failed. Please review the issues above.');
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Only run if this script is executed directly
if (process.argv[1].includes('security-test.js')) {
  main().catch(console.error);
}