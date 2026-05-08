import { NextResponse } from 'next/server';

// ⛔ THIS CRON ENDPOINT IS DISABLED.
// All news automation has been migrated to GitHub Actions to prevent
// Vercel Fluid CPU limits from being exceeded.
// See: .github/workflows/news-scheduler.yml
//
// DO NOT re-add maxDuration or schedule this on Vercel.

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Respond immediately — no heavy work on Vercel
    return NextResponse.json({
        success: false,
        disabled: true,
        message: 'This Vercel cron endpoint is disabled. News automation now runs on GitHub Actions.',
        redirect: 'See .github/workflows/news-scheduler.yml',
        timestamp: new Date().toISOString(),
    }, { status: 410 }); // 410 Gone — intentionally retired
}
