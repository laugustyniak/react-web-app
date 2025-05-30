import { CONFIG } from '~/constants/config';

// Get the backend API URL from environment or config
const API_URL = CONFIG.API.URL;
const API_KEY = CONFIG.API.KEY;

export async function loader() {
  console.log('[health] GET health check called');
  try {
    // Check if we're using the proxy (API_KEY will be empty on client)
    const isUsingProxy = !API_KEY;
    console.log(`[health] isUsingProxy: ${isUsingProxy}, API_URL: ${API_URL}`);

    if (isUsingProxy) {
      // Using Express proxy - API key is handled server-side
      console.log('[health] Checking health via proxy:', `${API_URL}/health`);
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('[health] Proxy response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[health] Proxy API error:', errorText);
        return new Response(
          JSON.stringify({ 
            status: 'error', 
            message: `API returned ${response.status}: ${errorText}`,
            timestamp: new Date().toISOString()
          }), 
          { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const data = await response.json();
      console.log('[health] Proxy API success, response:', JSON.stringify(data));
      return new Response(JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        proxy: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Direct backend call (development mode)
      console.log('[health] Checking health directly with backend:', `${API_URL}/health`);
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });

      console.log('[health] Backend response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[health] Backend API error:', errorText);
        return new Response(
          JSON.stringify({ 
            status: 'error', 
            message: `Backend API returned ${response.status}: ${errorText}`,
            timestamp: new Date().toISOString()
          }), 
          { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const data = await response.json();
      console.log('[health] Backend API success, response:', JSON.stringify(data));
      return new Response(JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        proxy: false
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('[health] Error in health check API route:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function action({ request }: { request: Request }) {
  console.log('[health] action called');
  // Health check should typically be a GET request, but we'll handle POST as well
  if (request.method === 'POST') {
    // For POST requests, we can forward them to the health endpoint as well
    return loader();
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
