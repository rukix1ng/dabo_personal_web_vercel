import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('google-site-verification: google7371babaecbbee73.html', {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
