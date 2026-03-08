import { NextResponse } from 'next/server';
import { NewsService } from '@/lib/news-service';
import { extractTrustMetadata } from '@/lib/news-trust-metadata';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const news = await NewsService.getNewsById(params.id);
    if (!news) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const trust = extractTrustMetadata(news.tags || []);

    return NextResponse.json({
      id: news.id,
      title: news.title,
      slug: news.slug,
      source: {
        name: news.source_name || null,
        url: news.source_url || null,
        verdict: trust.sourceVerdict,
      },
      trustScore: trust.trustScore ?? null,
      verificationCount: trust.verificationCount ?? 0,
      neutralityScore: trust.neutralityScore ?? null,
      updatedAt: news.updated_at || news.published_at || news.created_at,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

