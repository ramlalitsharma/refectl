import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/quiz(.*)',
    '/admin(.*)',
    '/analytics(.*)',
    '/settings(.*)',
]);

function addSecurityHeaders(response: NextResponse) {
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://cdn.jsdelivr.net https://*.meet.jit.si https://pagead2.googlesyndication.com https://adservice.google.com https://va.vercel-scripts.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob: https://*.clerk.com https://img.clerk.com https://pagead2.googlesyndication.com",
        "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk-telemetry.com https://api.openai.com https://*.openai.com wss://*.clerk.com https://*.meet.jit.si wss://*.meet.jit.si https://*.jitsi.net https://va.vercel-scripts.com https://vitals.vercel-analytics.com",
        "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.meet.jit.si https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
        "media-src 'self' https://*.meet.jit.si https://*.jitsi.net",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "upgrade-insecure-requests",
    ].join('; ');

    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('Permissions-Policy', 'camera=(self "https://meet.jit.si" "https://*.meet.jit.si"), microphone=(self "https://meet.jit.si" "https://*.meet.jit.si"), geolocation=()');
    response.headers.delete('X-Powered-By');
    return response;
}

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
    return addSecurityHeaders(NextResponse.next());
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
