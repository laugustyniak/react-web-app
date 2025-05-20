import { CONFIG } from '~/constants/config';

// Get the backend API URL from environment or config
const API_URL = CONFIG.API.URL;
const API_KEY = CONFIG.API.KEY;

export async function loader() {
  return new Response("Method not allowed", { status: 405 });
}

export async function action({ request }: { request: Request }) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get request body
    const body = await request.json();
    
    // Forward the request to the Python backend
    const response = await fetch(`${API_URL}/inpaint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return new Response(
        JSON.stringify({ error: `Backend API returned ${response.status}: ${errorText}` }), 
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return the response from the backend
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in inpaint API route:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 