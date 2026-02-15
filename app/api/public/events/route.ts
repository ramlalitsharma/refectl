import { NextResponse } from 'next/server';
import { NewsEventService } from '@/lib/news-event-service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const country = url.searchParams.get('country') || 'All';
    const surface = (url.searchParams.get('surface') || 'news').toLowerCase();
    const limit = Number(url.searchParams.get('limit') || 4);

    const items =
      surface === 'home'
        ? await NewsEventService.getPublishedForHome(limit)
        : await NewsEventService.getPublishedForNews(country, limit);

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch events', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

