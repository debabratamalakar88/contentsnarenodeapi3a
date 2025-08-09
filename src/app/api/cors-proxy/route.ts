
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse(JSON.stringify({ error: 'URL parameter is missing' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Narlax-CORS-Proxy/1.0',
            },
        });

        if (!response.ok) {
            return new NextResponse(JSON.stringify({ error: `Failed to fetch image. Status: ${response.status}` }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error) {
        console.error('CORS Proxy Error:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error while fetching image' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

