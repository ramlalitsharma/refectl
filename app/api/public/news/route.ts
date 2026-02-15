import { NextResponse } from 'next/server';
import { NewsService } from '@/lib/news-service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'All';
    const country = url.searchParams.get('country') || 'All';

    const [published, trending] = await Promise.all([
      NewsService.getPublishedNews({ category, country }),
      NewsService.getTrendingNews(6),
    ]);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API_DEBUG] /api/public/news hit. Params: cat=${category}, country=${country}`);
      console.log(`[API_DEBUG] Published found: ${published?.length || 0}`);
      console.log(`[API_DEBUG] Trending found: ${trending?.length || 0}`);
    }

    return NextResponse.json({
      items: published || [],
      trending: trending || [],
    });
  } catch (error: any) {
    console.error('Public news fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public news', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
