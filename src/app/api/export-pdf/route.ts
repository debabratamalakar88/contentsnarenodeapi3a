
import { NextRequest, NextResponse } from 'next/server';

// This route is no longer used for PDF generation and can be removed.
// It is kept here as a reference for a potential server-side rendering implementation.

export async function POST(req: NextRequest) {
  return new NextResponse(JSON.stringify({ error: 'This endpoint is deprecated. PDF generation is now handled client-side.' }), { status: 410 });
}
