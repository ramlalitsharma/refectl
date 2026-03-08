import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const autoPublishEnabled = process.env.NEWS_AUTO_PUBLISH_ENABLED !== 'false';
  const targetPerHour = Math.max(1, Math.min(6, Number(process.env.NEWS_AUTO_PUBLISH_COUNT || '1')));
  const retentionDays = 7;
  const newsletterUtcHour = 6;

  if (!supabaseAdmin) {
    return NextResponse.json({
      success: true,
      status: {
        autoPublishEnabled,
        targetPerHour,
        retentionDays,
        newsletterUtcHour,
        last24hAutomatedPublished: null,
        pendingApprovalCount: null,
        maintenanceMode: 'degraded',
      },
    });
  }

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [automatedRes, pendingRes] = await Promise.all([
      supabaseAdmin
        .from('news')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', 'global-intelligence-bot')
        .gte('created_at', since)
        .in('status', ['published', 'Published', 'live', 'Active Relay', 'active relay']),
      supabaseAdmin
        .from('news')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending_approval'),
    ]);

    return NextResponse.json({
      success: true,
      status: {
        autoPublishEnabled,
        targetPerHour,
        retentionDays,
        newsletterUtcHour,
        last24hAutomatedPublished: automatedRes.count ?? 0,
        pendingApprovalCount: pendingRes.count ?? 0,
        maintenanceMode: 'healthy',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: {
          autoPublishEnabled,
          targetPerHour,
          retentionDays,
          newsletterUtcHour,
          last24hAutomatedPublished: null,
          pendingApprovalCount: null,
          maintenanceMode: 'degraded',
        },
        error: error?.message || 'Unknown error',
      },
      { status: 200 }
    );
  }
}

