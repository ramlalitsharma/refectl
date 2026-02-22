import { NextResponse } from 'next/server';
import { NewsWorkflowService } from '@/lib/news-workflow';
import { NewsAutomationService } from '@/lib/news-automation';
import { NewsNewsletterService } from '@/lib/news-newsletter';

/**
 * Hourly News Automation Job
 * 1. Discover trends and auto-generate draft if configured (future expansion)
 * 2. Process approval queue (send emails to admins)
 * 3. Perform maintenance (delete old news)
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    // Simple CRON_SECRET check for security
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('[Cron] Starting hourly news automation cycle...');

    try {
        const autoPublishEnabled = process.env.NEWS_AUTO_PUBLISH_ENABLED !== 'false';
        const autoPublishCount = Math.max(1, Math.min(6, Number(process.env.NEWS_AUTO_PUBLISH_COUNT || '1')));

        // 1. Autonomous Discovery & Generation (Global Roaming Engine - Phase 26)
        // Replaces old static source fetching with dynamic global scraping
        let ingestedCount = 0;
        if (autoPublishEnabled) {
            console.log(`[Cron] Executing Global Roaming Engine...`);
            const ingested = await NewsAutomationService.ingestRoamingGlobalNews(autoPublishCount);
            ingestedCount = ingested.length;
            console.log(`[Cron] Successfully roamed and published ${ingestedCount} intelligence piece(s).`);
        } else {
            console.log('[Cron] NEWS_AUTO_PUBLISH_ENABLED=false, skipping auto publishing.');
        }

        // 2. Process Approval Notifications (Existing)
        await NewsWorkflowService.processApprovalQueue();

        // 3. Dispatch the Daily Pulse Newsletter (Assuming the cron triggers it around the desired time)
        // For demonstration, we attempt to generate it on the cron run. In real prod, check if it's 6:00 AM UTC.
        const currentHour = new Date().getUTCHours();
        if (currentHour === 6 || process.env.NEWS_NEWSLETTER_ALWAYS === 'true') {
            await NewsNewsletterService.generateAndSendDailyPulse();
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            ingestedCount,
            message: 'Hourly automation cycle completed'
        });
    } catch (error: any) {
        console.error('[Cron] Automation cycle failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
