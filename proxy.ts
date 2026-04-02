import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of mobile device identifiers
const mobilePatterns = [
    /Android/i, /webOS/i, /iPhone/i, /iPod/i, /BlackBerry/i,
    /Windows Phone/i, /Mobile/i, /Opera Mini/i, /IEMobile/i
];

export function proxy(request: NextRequest) {
  // Access the headers using the Next.js Web API format
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check if the User-Agent matches any mobile pattern
  const isMobile = mobilePatterns.some(pattern => pattern.test(userAgent));
  
  if (isMobile) {
    // Prevent infinite loops if they are already on the blocked page
    if (request.nextUrl.pathname === '/device-blocked') {
      return NextResponse.next();
    }
    
    // Option 1: Redirect to a "Not Allowed" page
    // This physically moves them away from /home to /device-blocked
    const url = request.nextUrl.clone();
    url.pathname = '/device-blocked';
    return NextResponse.redirect(url);
  }
  
  // Allow the request to proceed for desktop/laptop
  return NextResponse.next();
}

// Configure the middleware to run on the correct paths
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
};