import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/navigation';

const intlMiddleware = createMiddleware(routing);


const isProtectedRoute = createRouteMatcher([
    '/:locale/dashboard(.*)',
    '/:locale/quiz(.*)',
    '/:locale/admin(.*)',
    '/:locale/analytics(.*)',
    '/:locale/settings(.*)',
]);

function addSecurityHeaders(response: NextResponse) {
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.refectl.com https://refectl.com https://www.refectl.com https://cdn.jsdelivr.net https://*.meet.jit.si https://pagead2.googlesyndication.com https://adservice.google.com https://va.vercel-scripts.com https://www.googletagmanager.com https://app.posthog.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob: https://*.clerk.com https://img.clerk.com https://pagead2.googlesyndication.com https://www.google-analytics.com",
        "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.refectl.com https://clerk-telemetry.com https://api.openai.com https://*.openai.com wss://*.clerk.com https://*.meet.jit.si wss://*.meet.jit.si https://*.jitsi.net https://va.vercel-scripts.com https://vitals.vercel-analytics.com https://www.google-analytics.com https://app.posthog.com https://refectl.com https://www.refectl.com",
        "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.refectl.com https://*.meet.jit.si https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
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
    const start = Date.now();
    const { pathname } = req.nextUrl;

    // Skip middleware for sitemap and robots.txt to avoid redirect errors
    if (pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    const response = intlMiddleware(req);
    const finalResponse = addSecurityHeaders(response);

    const duration = Date.now() - start;
    finalResponse.headers.set('X-Response-Time', `${duration}ms`);
    return finalResponse;
});

export const config = {
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',
        // Set locales in path
        '/(en|es|hi|zh|ja|ko|fr|de|it|pt|ru|ar|ur|ms|id|tr|vi|bn|he)/:path*',
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
