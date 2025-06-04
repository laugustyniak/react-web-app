import { CONFIG } from '~/constants/config';
import type { FindImageRequest } from '~/types/api_models';

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

        // Validate required fields for FindImageRequest
        if (!body.query) {
            return new Response(JSON.stringify({
                detail: [
                    { loc: ['body', 'query'], msg: 'query is required', type: 'value_error.missing' }
                ]
            }), {
                status: 422,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Build request according to FindImageRequest model
        const findImageRequest: FindImageRequest = {
            query: body.query,
            location: body.location || 'Japan',
            gl: body.gl || 'jp',
            hl: body.hl || 'ja',
        };

        const response = await fetch(`${API_URL}/find_image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(findImageRequest)
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

        // The response is a string (image URL or similar)
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
