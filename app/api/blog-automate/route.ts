import { NextResponse } from 'next/server';

// IMPORTANT: No maxDuration — this route is EMERGENCY manual use only.
// All automated blog generation runs on GitHub Actions (see .github/workflows/blog-scheduler.yml)
// to avoid consuming Vercel CPU/bandwidth limits.
export const dynamic = 'force-dynamic';

async function handleRequest(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret')
        || request.headers.get('x-cron-secret')
        || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized: Access Denied' }, { status: 401 });
    }

    try {
        const { BlogAutomationService } = await import('@/lib/blog-automation');
        const seedTopic = searchParams.get('topic') || undefined;

        // Fire-and-forget: respond immediately, run generation in background
        BlogAutomationService.generateAutonomousBlog(seedTopic)
            .catch(err => console.error('[BlogAutomate] Background generation failed:', err));

        return NextResponse.json({
            success: true,
            message: 'Blog generation started in background.',
            note: 'Automation now runs on GitHub Actions — this endpoint is for emergency use only.',
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) { return handleRequest(request); }
export async function GET(request: Request) { return handleRequest(request); }
