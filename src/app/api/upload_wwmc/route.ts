import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Retrieve cookies from the request
    const cookies = request.headers.get('cookie');
    const debugCookie = cookies?.split('; ').find(row => row.startsWith('debug='));

    // Extract the value of the 'debug' cookie
    const debugValue = debugCookie ? debugCookie.split('=')[1] : null;

    // Pass the debug value into your API logic here
    // For example, you might want to include it in the request body or headers
    const apiResponse = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Debug-Cookie': debugValue || '', // Pass the debug cookie value
        },
        body: JSON.stringify({ /* your payload */ }),
    });

    const data = await apiResponse.json();
    return NextResponse.json(data);
}
