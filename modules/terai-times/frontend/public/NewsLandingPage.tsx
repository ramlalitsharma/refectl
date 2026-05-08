import type { Metadata } from 'next';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import NewsFeedClient from '@/components/news/NewsFeedClient';
import { NewsAutoAdGuard } from '@/components/news/NewsAutoAdGuard';
import { TeraiTimesPublicService, TeraiTimesSeoService, type TeraiTimesLandingPayload } from '@/modules/terai-times/backend/services';

export async function generateNewsLandingMetadata({
  searchParams,
  locale,
}: {
  searchParams: Promise<Record<string, any>>;
  locale?: string;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const seo = new TeraiTimesSeoService();
  return seo.buildPageMetadata({ ...resolvedParams, locale });
}

export async function NewsLandingPage({
  searchParams,
  locale,
}: {
  searchParams: Promise<Record<string, any>>;
  locale?: string;
}) {
  const resolvedParams = await searchParams;
  const category = (resolvedParams?.category as string) || undefined;
  const country = (resolvedParams?.country as string) || undefined;
  const page = Number(resolvedParams?.page) || 1;
  const pageSize = 30;
  let payload: TeraiTimesLandingPayload = {
    category: 'All',
    country: 'All',
    initialItems: [] as any[],
    initialTrending: [] as any[],
    initialEvents: [] as any[],
    automationStatus: {
      autoPublishEnabled: true,
      targetPerHour: 1,
      retentionDays: 7,
      newsletterUtcHour: 6,
      last24hAutomatedPublished: null as number | null,
      pendingApprovalCount: null as number | null,
      maintenanceMode: 'degraded' as 'healthy' | 'degraded',
    },
    networkAnalytics: undefined as any,
    availableCountries: [],
    availableCategories: [],
    totalCount: 0,
    page: 1,
    pageSize: 30,
  };

  try {
    const service = new TeraiTimesPublicService();
    payload = await service.getLandingPayload({ 
      category, 
      country, 
      page, 
      pageSize,
      locale
    });
  } catch (error) {
    console.error('NewsLandingPage initial fetch error:', error);
  }
  return (
    <div className="news-page-shell news-paper-theme min-h-screen">
      <NewsNavbar />
      <main className="w-full max-w-none news-main-surface no-auto-ads-on-news pb-0 pt-0" data-news-surface="true">
        <NewsAutoAdGuard />
        <NewsFeedClient
          category={payload.category}
          country={payload.country}
          initialItems={payload.initialItems}
          initialTrending={payload.initialTrending}
          initialEvents={payload.initialEvents}
          automationStatus={payload.automationStatus}
          networkAnalytics={payload.networkAnalytics}
          availableCountries={payload.availableCountries}
          availableCategories={payload.availableCategories}
          totalCount={payload.totalCount}
          page={payload.page}
          pageSize={payload.pageSize}
        />
      </main>
    </div>
  );
}
