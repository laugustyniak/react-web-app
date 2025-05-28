# SSR Setup with Express

This project supports Server-Side Rendering (SSR) using React Router v7's built-in SSR capabilities along with an optional Express.js server for production deployment.

## ✅ **What's Working:**

- **React Router v7 SSR** - Built-in server-side rendering
- **Express Production Server** - Custom Express server for production
- **SEO Optimization** - Full HTML pre-rendering
- **Fast Initial Loads** - Server-rendered content

## Available Scripts

### Development
```bash
npm run dev                 # React Router dev server with SSR (recommended)
```

### Production
```bash
npm run build              # Build the app for production with SSR
npm run start              # Start React Router's built-in SSR server
npm run start:express      # Start custom Express SSR server
```

## How It Works

### Development Mode
- Use `npm run dev` which starts React Router v7's development server
- SSR is automatically enabled via `react-router.config.ts`
- Hot module replacement and fast refresh work out of the box

### Production Mode
You have two options:

#### Option 1: React Router Server (Recommended)
```bash
npm run build
npm run start
```

#### Option 2: Express Server (Custom Deployment)
```bash
npm run build
npm run start:express
```

## Express Server Benefits

The custom Express server (`server.js`) provides:
- **Custom middleware support**
- **API route integration**
- **Enhanced caching strategies**  
- **Custom request/response handling**
- **Deployment flexibility**

## Configuration Files

- `react-router.config.ts` - SSR enabled by default
- `server.js` - Custom Express server for production
- `vite.config.ts` - React Router and Vite configuration

**Note:** React Router v7 handles entry files automatically. No custom `entry.client.tsx` or `entry.server.tsx` files are needed for basic SSR functionality.

## SSR Features

✅ **SEO Optimization** - Search engines can crawl your content  
✅ **Faster Initial Load** - HTML rendered on server  
✅ **Better Performance** - Reduced time to first contentful paint  
✅ **Social Media** - Meta tags rendered server-side  
✅ **React 19 Support** - Latest React features with SSR  

## Troubleshooting

If you encounter issues:

1. **Development errors:** Use `npm run dev` (not Express in dev mode)
2. **Build errors:** Ensure all dependencies are installed with `npm install`
3. **Port conflicts:** Express server uses port 5000 by default

## Architecture

```
React Router v7 (SSR) → Express.js → Static Files + SSR HTML
```

Your app is now fully SSR-ready! 🚀
