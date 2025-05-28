import express from 'express';
import { createRequestHandler } from '@react-router/express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Production mode
    app.use(express.static(path.resolve(__dirname, 'build/client')));

    try {
      // Load the production server build
      const build = await import('./build/server/index.js');
      const requestHandler = createRequestHandler({
        build,
        mode: 'production',
      });

      app.all('*', requestHandler);
    } catch (error) {
      console.error('Failed to load server build:', error);
      console.log('Make sure to run "npm run build" first');
      process.exit(1);
    }
  } else {
    // Development mode - fallback to regular React Router dev server
    console.log('❌ Express server is for production use only.');
    console.log('✅ For development, use: npm run dev');
    console.log('This will start React Router dev server with built-in SSR support.');
    process.exit(1);
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 Express server with SSR running at http://localhost:${port}`);
    console.log('📱 Your React app is server-side rendered!');
  });
}

createServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
