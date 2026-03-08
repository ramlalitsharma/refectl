import { NextResponse } from 'next/server';
import { NewsWorkflowService } from '@/lib/news-workflow';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get('slug') || '').trim();

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 });
  }

  try {
    await NewsWorkflowService.refreshAutomationStoryBySlug(slug);
    return NextResponse.json({
      success: true,
      slug,
      timestamp: new Date().toISOString(),
      message: 'Story refresh completed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, slug, error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
