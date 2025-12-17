import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/quiz(.*)',
  '/admin(.*)',
  '/analytics(.*)',
  '/settings(.*)',
]);

// Security headers middleware
function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://cdn.jsdelivr.net https://meet.jit.si",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob: https://*.clerk.com https://img.clerk.com",
    "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://api.openai.com https://*.openai.com wss://*.clerk.com https://meet.jit.si wss://meet.jit.si https://*.jitsi.net",
    "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://meet.jit.si",
    "media-src 'self' https://meet.jit.si https://*.jitsi.net",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  // Set security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', csp);
  // Allow camera and microphone for live classes (Jitsi)
  response.headers.set('Permissions-Policy', 'camera=(self "https://meet.jit.si"), microphone=(self "https://meet.jit.si"), geolocation=()');

  // Remove server information
  response.headers.delete('X-Powered-By');

  return response;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const provider = (process.env.AUTH_PROVIDER || 'clerk').toLowerCase();

  // Apply authentication protection
  if (provider === 'clerk') {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  } else {
    if (isProtectedRoute(req)) {
      const cookie = req.headers.get('cookie') || '';
      const hasSession = /adaptiq_session=/.test(cookie);
      if (!hasSession) {
        const url = new URL('/sign-in', req.url);
        return addSecurityHeaders(NextResponse.redirect(url));
      }
    }
  }

  // Create response and add security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

