import { NextResponse } from 'next/server';
import { NewsWorkflowService } from '@/lib/news-workflow';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('[Cron] Starting weekly news maintenance...');

  try {
    await NewsWorkflowService.performMaintenance();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Weekly maintenance completed',
    });
  } catch (error: any) {
    console.error('[Cron] Weekly maintenance failed:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
