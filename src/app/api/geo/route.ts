import { geolocation } from '@vercel/functions';

export function GET(request: Request) {
    const location = geolocation(request);
    
    if (!location) {
        return new Response(JSON.stringify({ message: 'Location not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Return only the location data
    return new Response(JSON.stringify({ location }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
