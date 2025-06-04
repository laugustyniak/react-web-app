import { CONFIG } from '~/constants/config';

const API_URL = CONFIG.API.URL;
const API_KEY = CONFIG.API.KEY;

export async function loader() {
    return new Response('Method not allowed', { status: 405 });
}

export async function action({ request }: { request: Request }) {
    try {
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        } 

        let body;
        try {
            body = await request.json();
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!body.base_prompt) {
            return new Response(JSON.stringify({
                detail: [
                    { loc: ['body', 'base_prompt'], msg: 'base_prompt is required', type: 'value_error.missing' }
                ]
            }), {
                status: 422,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response = await fetch(`${API_URL}/generate_image_prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(
                JSON.stringify({ error: `API returned ${response.status}: ${errorText}` }),
                {
                    status: response.status,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // The response is a string prompt
        const data = await response.text();
        return new Response(data, {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
