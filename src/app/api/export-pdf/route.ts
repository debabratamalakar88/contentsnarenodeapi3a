
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, token } = body;

    if (!url) {
      return new NextResponse(JSON.stringify({ error: 'URL is required' }), { status: 400 });
    }
    if (!token) {
        return new NextResponse(JSON.stringify({ error: 'Authentication is required' }), { status: 401 });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessary for many hosting environments
    });
    const page = await browser.newPage();

    // Set a cookie with the auth token so the page can authenticate server-side
    // The cookie name 'authToken' must match what your middleware/page expects
    await page.setCookie({
        name: 'authToken',
        value: token,
        url: new URL(url).origin,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });

    // Navigate to the target page
    await page.goto(url, {
      waitUntil: 'networkidle0', // Wait until the network is quiet
    });

    // Generate PDF from the page content
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="submission.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF', details: error.message }), { status: 500 });
  }
}
