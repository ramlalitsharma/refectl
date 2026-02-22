import type { Metadata } from 'next';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { NewsFeedClient } from '@/components/news/NewsFeedClient';
import { LiveNewsPulse } from '@/components/news/LiveNewsPulse';
import { BRAND_URL } from '@/lib/brand';
import { NewsService } from '@/lib/news-service';
import { NewsEventService } from '@/lib/news-event-service';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, any>>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const category = (resolvedParams?.category as string) || 'All';
  const country = (resolvedParams?.country as string) || 'All';

  const title =
    category !== 'All'
      ? `${category} News | Terai Times`
      : country !== 'All'
        ? `${country} News | Terai Times`
        : 'Terai Times News | Global Intelligence & Market Pulse';

  const description =
    category !== 'All'
      ? `Latest ${category} news, analysis, and insights from Terai Times by Refectl Intelligence Agency.`
      : country !== 'All'
        ? `Breaking news and updates from ${country} - comprehensive coverage by Terai Times.`
        : 'World-class news coverage, global market intelligence, and deep-dive analysis from Terai Times News by Refectl.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BRAND_URL}/news`,
    },
  };
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, any>>;
}) {
  const resolvedParams = await searchParams;
  const category = (resolvedParams?.category as string) || 'All';
  const country = (resolvedParams?.country as string) || 'All';
  let initialItems: any[] = [];
  let initialTrending: any[] = [];
  let initialEvents: any[] = [];

  try {
    const [published, trending, events] = await Promise.all([
      NewsService.getPublishedNews({ category, country }),
      NewsService.getTrendingNews(6),
      NewsEventService.getPublishedForNews(country, 4),
    ]);

    initialItems = Array.isArray(published) ? published : [];
    initialTrending = Array.isArray(trending) ? trending : [];
    initialEvents = Array.isArray(events) ? events : [];

    // Fallback: if current filter has no published records, keep page populated
    // with latest global stories instead of showing a visually empty page.
    if (!initialItems.length && (category !== 'All' || country !== 'All')) {
      const [fallbackItems, fallbackTrending] = await Promise.all([
        NewsService.getPublishedNews({ category: 'All', country: 'All' }),
        NewsService.getTrendingNews(6),
      ]);
      initialItems = Array.isArray(fallbackItems) ? fallbackItems : [];
      initialTrending = Array.isArray(fallbackTrending) ? fallbackTrending : initialTrending;
    }
  } catch (error) {
    console.error('NewsPage initial fetch error:', error);
  }

  return (
    <div className="news-page-shell min-h-screen text-slate-900 dark:text-slate-100">
      <NewsNavbar />
      <div className="news-live-pulse-row">
        <LiveNewsPulse />
      </div>
      <main className="news-viewport news-main-surface px-4 pb-10 pt-2 md:pt-3">
        <NewsFeedClient
          category={category}
          country={country}
          initialItems={initialItems}
          initialTrending={initialTrending}
          initialEvents={initialEvents}
        />
      </main>
    </div>
  );
}
