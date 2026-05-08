import { NextResponse } from 'next/server';

// IMPORTANT: maxDuration removed — this route is now for EMERGENCY manual use only.
// All automated news generation runs on GitHub Actions (see .github/workflows/news-scheduler.yml)
// to avoid consuming Vercel CPU/bandwidth limits.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Strict secret check — no secret = immediate reject
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { NewsAutomationService } = await import('@/lib/news-automation');
        const { searchParams } = new URL(request.url);
        const count = Math.min(3, Math.max(1, Number(searchParams.get('count') || '1')));
        const country = searchParams.get('country') || undefined;

        // Fire-and-forget: don't await, respond immediately to avoid CPU drain
        NewsAutomationService.ingestRoamingGlobalNews(count, country)
            .catch(err => console.error('[ManualTrigger] Background ingestion failed:', err));

        return NextResponse.json({
            success: true,
            message: `Ingestion started for ${count} article(s) in background.`,
            note: 'Automation now runs on GitHub Actions — this endpoint is for emergency use only.',
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
