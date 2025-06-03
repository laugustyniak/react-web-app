import { CONFIG } from '~/constants/config';

// Get the backend API URL from environment or config
const API_URL = CONFIG.API.URL;
const API_KEY = CONFIG.API.KEY;

export async function loader() {
  console.log('[inpaint] loader called');
  return new Response("Method not allowed", { status: 405 });
}

export async function action({ request }: { request: Request }) {
  console.log('[inpaint] action called');
  try {
    console.log(`[inpaint] Request method: ${request.method}`);
    if (request.method !== 'POST') {
      console.warn('[inpaint] Method not allowed:', request.method);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get request body
    let body;
    try {
      body = await request.json();
      console.log('[inpaint] Request body:', JSON.stringify(body).slice(0, 500));
    } catch (err) {
      console.error('[inpaint] Failed to parse JSON body:', err);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Always pass API key
    const response = await fetch(`${API_URL}/inpaint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(body)
    });

    console.log('[inpaint] API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[inpaint] API error:', errorText);
      return new Response(
        JSON.stringify({ error: `API returned ${response.status}: ${errorText}` }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('[inpaint] API success, response:', JSON.stringify(data).slice(0, 500));
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[inpaint] Error in inpaint API route:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};