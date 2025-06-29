# SSR API Proxy Setup

This project now includes an Express-based SSR API proxy that securely routes requests to your backend server while keeping API keys hidden from client-side code.

## How It Works

The Express server includes middleware that:
1. **Intercepts API requests** - All requests to `/api/*` are caught by the proxy
2. **Adds authentication** - Server-side API key is automatically added to requests
3. **Forwards to backend** - Requests are forwarded to your Python backend
4. **Returns responses** - Backend responses are sent back to the client

## Setup

1. **Environment Variables**: Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual values:
   ```
   BACKEND_API_URL=http://localhost:8000
   PRODUCT_API_KEY_1=your_actual_api_key
   PORT=5000
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

## Usage

### Development
For API testing in development mode:
```bash
npm run dev:api
```
This starts the Express server with API proxy enabled at `http://localhost:5000/api/*`

For full React Router development:
```bash
npm run dev
```
This uses React Router's built-in dev server (API calls will go directly to backend)

### Production
```bash
npm run build
npm run start:express
```

## API Routes

All your existing API routes work automatically. The proxy will handle:

- `GET /api/endpoint` → `GET http://your-backend/endpoint`
- `POST /api/inpaint` → `POST http://your-backend/inpaint`
- Any HTTP method to `/api/*` → Forwarded to backend

## Security Benefits

1. **API Key Protection**: Your `PRODUCT_API_KEY_1` is never exposed to the client
2. **Server-Side Authentication**: All backend requests are authenticated server-side
3. **CORS Handling**: Proxy handles cross-origin requests cleanly
4. **Request Sanitization**: Sensitive headers are filtered out

## Client-Side Usage

Your existing client code works without changes. The `CONFIG.API.URL` automatically detects the environment:

- **Production/SSR**: Uses `/api` (proxy)
- **Development**: Uses direct backend URL

Example:
```typescript
// This automatically uses the right endpoint
const response = await fetch(`${CONFIG.API.URL}/inpaint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## Error Handling

The proxy includes comprehensive error handling:
- Backend errors are forwarded with appropriate status codes
- Network errors return 500 with descriptive messages
- Development mode includes detailed error messages

## Testing

Test the API proxy:
```bash
# Start the proxy server
npm run dev:api

# Test in another terminal
curl -X POST http://localhost:5000/api/inpaint \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

## File Structure

```
server.js              # Express server with API proxy
app/constants/config.ts # Configuration with environment detection
app/routes/api/        # React Router API routes (fallback)
.env.example          # Environment template
.env                  # Your actual environment (gitignored)
```

## Migration Notes

- Existing API routes in `app/routes/api/` now work as fallbacks
- Client-side code automatically uses proxy in production
- No changes needed to existing fetch calls
- Environment variables are loaded from `.env` file
