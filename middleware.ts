import { NextResponse, userAgent } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extract device information from the incoming request
  const { device } = userAgent(request);

  // Check if the device is identified as mobile or tablet
  if (device.type === 'mobile' || device.type === 'tablet') {
    
    // Check if they are already on the blocked page to prevent infinite loops
    if (request.nextUrl.pathname === '/device-blocked') {
      return NextResponse.next();
    }

    // Rewrite the request to show the blocked page without changing the URL
    const url = request.nextUrl.clone();
    url.pathname = '/device-blocked';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Configure the middleware to ignore static files, APIs, and images
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, file.svg, globe.svg, etc. (static public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
};