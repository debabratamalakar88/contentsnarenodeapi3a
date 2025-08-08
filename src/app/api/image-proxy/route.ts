
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Image URL is required', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64Image}`;

    return NextResponse.json({ dataUri });

  } catch (error: any) {
    console.error(`[IMAGE PROXY] Error fetching image: ${imageUrl}`, error);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch image', error: error.message }), { status: 500 });
  }
}
