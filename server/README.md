# Server Authentication Setup

## Overview

The server now includes Firebase Admin SDK authentication middleware that:
- Validates Bearer tokens from Firebase Authentication
- Extracts user information from tokens
- Checks admin status in Firestore `users` collection
- Protects API endpoints with authentication and authorization

## Environment Variables

### Development
Add this to your `.env` file:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/service-account-key.json
```

The service account file should be a JSON service account key downloaded from Firebase Console.

### Production (Google Cloud)
No environment variables needed. The server automatically uses Google Cloud's default credentials when deployed to Google Cloud Run.

## Middleware

### `requireAuth`
- Validates Bearer token in `Authorization` header
- Adds `req.user` object with user information
- Returns 401 if token is missing, invalid, or expired

### `requireAdmin` 
- Must be used after `requireAuth`
- Checks `isAdmin: true` flag in Firestore `users/{uid}` document
- Returns 403 if user is not an admin

### `requireAuthAndAdmin`
- Combines both `requireAuth` and `requireAdmin`
- Use this for admin-only endpoints

## Protected Endpoints

All API endpoints now require authentication and admin access:

- `POST /api/get_product_description` - Protected
- `POST /api/find_image` - Protected  
- `POST /api/inpaint` - Protected

## Test Endpoints

For development and testing:

- `GET /api/auth/public-test` - No auth required
- `GET /api/auth/test` - Auth required (Bearer token)
- `GET /api/auth/admin-test` - Admin auth required

## Usage Example

```javascript
// Client-side request with Firebase auth token
const token = await user.getIdToken();

fetch('/api/find_image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* your data */ })
});
```

## User Document Structure

Users must have a document in Firestore `users` collection:

```javascript
// users/{uid}
{
  isAdmin: true,  // Required for admin access
  email: "user@example.com",
  // ... other user fields
}
```