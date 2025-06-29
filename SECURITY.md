# Security Documentation

## Overview

This document outlines the security measures implemented in the React web application and provides guidelines for maintaining security best practices.

## Security Features Implemented

### 1. Security Headers 🛡️

The Express server now includes comprehensive security headers:

- **X-Frame-Options: DENY** - Prevents clickjacking attacks
- **X-Content-Type-Options: nosniff** - Prevents MIME-type sniffing
- **X-XSS-Protection: 1; mode=block** - Enables XSS filtering
- **Referrer-Policy: strict-origin-when-cross-origin** - Controls referrer information
- **X-Powered-By: [removed]** - Prevents server fingerprinting
- **Permissions-Policy** - Restricts access to browser features (geolocation, microphone, camera, etc.)

### 2. Content Security Policy (CSP) 🔒

Implemented CSP headers to prevent XSS and code injection attacks:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob: https: http:;
connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://product-api.example.com wss: ws:;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self'
```

### 3. Enhanced CORS Configuration 🌐

- **Dynamic origin validation** based on environment
- **Environment-based allowed origins** configuration
- **Proper error handling** for blocked requests
- **Credential support** for authenticated requests

**Development Origins:**

- <http://localhost:3000>
- <http://localhost:8080>
- <https://localhost:3000>
- <https://localhost:8080>

**Production Origins:**

- Configurable via `ALLOWED_ORIGINS` environment variable
- Defaults to known production domains

### 4. Rate Limiting 🚦

Implemented API rate limiting with:

- **100 requests per 15-minute window** per IP
- **Rate limit headers** in responses
- **Graceful degradation** with retry information
- **In-memory storage** (consider Redis for production scaling)

### 5. Environment Variable Validation ✅

- **Startup validation** of required environment variables
- **Fail-fast approach** in production for missing critical variables
- **Warning system** in development mode
- **Graceful degradation** where appropriate

### 6. Error Handling 🔍

- **Production-safe error messages** (no sensitive information exposure)
- **Detailed logging** for debugging in development
- **Structured error responses** with timestamps
- **Proper HTTP status codes**

### 7. HTTPS Enforcement 🔐

- **Automatic HTTPS redirect** in production
- **SSL certificate support** for development
- **Graceful fallback** to HTTP when certificates unavailable
- **Proper error handling** for port conflicts

## Authentication & Authorization 👤

### Firebase Integration

- **Email verification required** before login
- **Google OAuth support** as alternative login method
- **Role-based access control** with admin privileges
- **Secure session management** through Firebase Auth
- **Reauthentication required** for sensitive operations

### Protected Routes

- **Route-level protection** with authentication checks
- **Loading states** during authentication verification
- **Automatic redirects** to sign-in page for unauthorized access

## API Security 🔌

### Proxy Pattern

- **Backend API keys hidden** from client-side code
- **Centralized API management** through Express proxy
- **Request/response logging** for debugging
- **Proper error handling** with fallbacks

### Data Validation

- **Input validation** in Firestore service functions
- **Duplicate prevention** mechanisms
- **Type safety** with TypeScript
- **Sanitization** of user inputs

## Security Testing 🧪

### Automated Security Tests

Run security tests with:

```bash
npm run test:security
```

Or combined audit and security test:

```bash
npm run audit:security
```

### Test Coverage

The security test suite covers:

- ✅ Security headers validation
- ✅ Rate limiting functionality
- ✅ Health endpoint integrity
- ✅ CORS configuration
- ✅ Error handling

## Environment Configuration 🔧

### Required Environment Variables

**Production:**

```env
NODE_ENV=production
BACKEND_API_URL=https://your-api-domain.com
PRODUCT_API_KEY_1=your-secure-api-key
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Development:**

```env
NODE_ENV=development
BACKEND_API_URL=http://localhost:3001
PRODUCT_API_KEY_1=dev-api-key
```

### Firebase Configuration

Set up Firebase environment variables in `.env`:

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Security Checklist ✅

### Pre-Production Checklist

- [ ] All environment variables configured
- [ ] HTTPS certificates installed and tested
- [ ] Firebase Security Rules reviewed and updated
- [ ] CORS origins restricted to production domains
- [ ] API keys secured and rotated
- [ ] Security headers tested
- [ ] Rate limiting configured appropriately
- [ ] Error messages sanitized for production
- [ ] Security test suite passing
- [ ] Dependency vulnerabilities addressed

### Regular Maintenance

- [ ] **Weekly:** Run `npm audit` and address vulnerabilities
- [ ] **Monthly:** Review and rotate API keys
- [ ] **Quarterly:** Update dependencies and security configurations
- [ ] **Annually:** Security audit and penetration testing

## Known Vulnerabilities 🚨

### React Router Vulnerabilities (Status: Monitoring)

Currently monitoring React Router vulnerabilities:

- **URL manipulation** via Host/X-Forwarded-Host headers
- **Pre-render data spoofing** in framework mode
- **DoS via cache poisoning**

**Mitigation:** Using latest available versions, monitoring for updates.

### Dependency Management

- **ESBuild:** Updated to address development server vulnerabilities
- **Undici:** Updated to address DoS vulnerabilities
- **Vite:** Updated to latest version with security patches

## Incident Response 🚨

### Security Incident Procedure

1. **Immediate Response**
   - Isolate affected systems
   - Document the incident
   - Notify stakeholders

2. **Investigation**
   - Analyze logs and security events
   - Identify root cause
   - Assess impact and scope

3. **Remediation**
   - Apply security patches
   - Update configurations
   - Rotate compromised credentials

4. **Recovery**
   - Restore services safely
   - Monitor for additional issues
   - Validate security measures

5. **Post-Incident**
   - Document lessons learned
   - Update security procedures
   - Implement preventive measures

## Contact Information 📞

For security-related issues:

- **Development Team:** Internal escalation
- **Security Officer:** TBD
- **Emergency Contact:** TBD

## Additional Resources 📚

- [OWASP Top 10](https://owasp.org/Top10/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)

---

**Last Updated:** $(date)  
**Version:** 1.0  
**Next Review:** $(date -d "+3 months")
