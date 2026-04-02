import { FeatureModule } from '@/modules/core/shared';
import { NewsService } from '@/lib/news-service';
import { NewsEventService } from '@/lib/news-event-service';
import { supabaseAdmin } from '@/lib/supabase';
import { NewsAutomationService } from '@/lib/news-automation';

export type TeraiTimesLandingPayload = {
  category: string;
  country: string;
  initialItems: any[];
  initialTrending: any[];
  initialEvents: any[];
  automationStatus: {
    autoPublishEnabled: boolean;
    targetPerHour: number;
    retentionDays: number;
    newsletterUtcHour: number;
    last24hAutomatedPublished: number | null;
    pendingApprovalCount: number | null;
    maintenanceMode: 'healthy' | 'degraded';
  };
  networkAnalytics?: {
    totalReads: number;
    activeTerminals: number;
    scannedNodes: number;
    networkPulse: string;
    ingressRate: string;
  };
};

export class TeraiTimesPublicService extends FeatureModule {
  constructor() {
    super('terai-times');
  }

  async getLandingPayload(params: {
    category?: string;
    country?: string;
  }): Promise<TeraiTimesLandingPayload> {
    const category = params.category || 'All';
    const country = params.country || 'All';

    // Phase 42: Category Mapping for Live Relays
    // If the category is IPL-Live, we fetch Sports news from the database
    const dbCategory = category === 'IPL-Live' ? 'Sports' : category;

    const [published, trending, events, automationStatus, networkAnalytics] = await Promise.all([
      NewsService.getPublishedNews({ category: dbCategory, country }),
      NewsService.getTrendingNews(6),
      NewsEventService.getPublishedForNews(country, 4),
      this.getAutomationStatus(),
      NewsService.getAnalyticsSummary(),
    ]);

    let initialItems = Array.isArray(published) ? published : [];
    let initialTrending = Array.isArray(trending) ? trending : [];
    const initialEvents = Array.isArray(events) ? events : [];

    if (!initialItems.length && (category !== 'All' || country !== 'All')) {
      const [fallbackItems, fallbackTrending] = await Promise.all([
        NewsService.getPublishedNews({ category: 'All', country: 'All' }),
        NewsService.getTrendingNews(6),
      ]);
      initialItems = Array.isArray(fallbackItems) ? fallbackItems : [];
      initialTrending = Array.isArray(fallbackTrending) ? fallbackTrending : initialTrending;
    }

    if (automationStatus.autoPublishEnabled && this.shouldBackfill(initialItems, automationStatus)) {
      // Fire-and-forget background ingestion to keep the landing page fast and resilient
      NewsAutomationService.ingestRoamingGlobalNews(Math.max(1, automationStatus.targetPerHour))
        .catch(err => console.error('[PublicService] Background ingestion failed:', err));
    }

    return {
      category,
      country,
      initialItems,
      initialTrending,
      initialEvents,
      automationStatus,
      networkAnalytics,
    };
  }

  public async getAutomationStatus(): Promise<TeraiTimesLandingPayload['automationStatus']> {
    const autoPublishEnabled = process.env.NEWS_AUTO_PUBLISH_ENABLED !== 'false';
    const targetPerHour = Math.max(1, Math.min(6, Number(process.env.NEWS_AUTO_PUBLISH_COUNT || '1')));
    const retentionDays = 7;
    const newsletterUtcHour = 6;

    if (!supabaseAdmin) {
      return {
        autoPublishEnabled,
        targetPerHour,
        retentionDays,
        newsletterUtcHour,
        last24hAutomatedPublished: null,
        pendingApprovalCount: null,
        maintenanceMode: 'degraded',
      };
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

      return {
        autoPublishEnabled,
        targetPerHour,
        retentionDays,
        newsletterUtcHour,
        last24hAutomatedPublished: automatedRes.count ?? 0,
        pendingApprovalCount: pendingRes.count ?? 0,
        maintenanceMode: 'healthy',
      };
    } catch {
      return {
        autoPublishEnabled,
        targetPerHour,
        retentionDays,
        newsletterUtcHour,
        last24hAutomatedPublished: null,
        pendingApprovalCount: null,
        maintenanceMode: 'degraded',
      };
    }
  }

  private shouldBackfill(
    initialItems: any[],
    automationStatus: TeraiTimesLandingPayload['automationStatus']
  ): boolean {
    if (!automationStatus.autoPublishEnabled) return false;
    if (!Array.isArray(initialItems) || initialItems.length === 0) return true;

    const latestPublishedAt = initialItems
      .map((item) => new Date(item.published_at || item.created_at || 0).getTime())
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => b - a)[0];

    if (!latestPublishedAt) return true;
    const hoursSinceLatest = (Date.now() - latestPublishedAt) / (1000 * 60 * 60);

    return hoursSinceLatest >= 6 && (automationStatus.last24hAutomatedPublished ?? 0) < 1;
  }
}
