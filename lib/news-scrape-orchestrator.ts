import { NewsAIService } from './ai/news-ai';
import { News, NewsCategory, NewsCountry } from './models/News';
import { AdvancedScraperService } from './news-scraper';
import { NewsRevenueMode } from './news-revenue-mode';
import { NewsAutomationService } from './news-automation';
import { verifySourceSafety } from './source-safety';
import { supabaseAdmin } from './supabase';
import { verifyArticle } from './news-verification-engine';
import { attachTrustTags, extractTrustMetadata } from './news-trust-metadata';

type TargetedParams = {
  topic?: string;
  category: string;
  country: string;
  region?: string;
  state?: string;
  author_id: string;
  status?: 'draft' | 'pending_approval' | 'published';
};

type TrendParams = {
  title: string;
  category: NewsCategory;
  country?: NewsCountry;
  source_url?: string;
  source_name?: string;
  author_id: string;
  status?: 'draft' | 'pending_approval' | 'published';
  forcePublish?: boolean;
};

async function insertNewsWithFallback(newsItem: Partial<News>) {
  if (!supabaseAdmin) return newsItem;
  const attempt = await supabaseAdmin.from('news').insert([newsItem]).select().single();
  if (!attempt.error) return attempt.data;

  if (attempt.error?.message?.includes('impact_score')) {
    const fallback = { ...(newsItem as any) };
    delete fallback.impact_score;
    delete fallback.market_entities;
    delete fallback.sentiment;
    const retry = await supabaseAdmin.from('news').insert([fallback]).select().single();
    if (!retry.error) return retry.data;
  }

  throw attempt.error;
}

function buildTargetedQuery(params: TargetedParams): string {
  const parts = [params.topic?.trim() || '', params.category, 'news'];
  if (params.country && params.country !== 'Global' && params.country !== 'All') {
    parts.push(params.country);
  }
  if (params.state) parts.push(params.state);
  if (params.region) parts.push(params.region);
  return parts.filter(Boolean).join(' ');
}

function buildGoogleNewsRssUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' when:24h')}&hl=en-US&gl=US&ceid=US:en`;
}

async function applySourceSafety(newsItem: Partial<News>) {
  if (!newsItem.tags) newsItem.tags = [];
  if (!newsItem.source_url) {
    newsItem.tags = [...newsItem.tags, 'source_missing'];
    return;
  }

  const sourceCheck = await verifySourceSafety({
    sourceUrl: newsItem.source_url,
    sourceName: newsItem.source_name,
  });

  if (sourceCheck.sourceHost) {
    newsItem.tags = [...newsItem.tags, `source_host:${sourceCheck.sourceHost}`];
  }
  if (sourceCheck.sourceVerdict === 'blocked' || sourceCheck.safeBrowsingVerdict === 'unsafe') {
    newsItem.status = 'draft';
    newsItem.tags = [...newsItem.tags, 'source_blocked'];
    return;
  }
  if (sourceCheck.sourceVerdict === 'trusted') {
    newsItem.tags = [...newsItem.tags, 'source_trusted'];
    if ((newsItem.status || '').toLowerCase() === 'pending_approval') {
      newsItem.status = 'published';
    }
    return;
  }

  if ((newsItem.status || '').toLowerCase() === 'published') {
    newsItem.status = 'pending_approval';
  }
  newsItem.tags = [...newsItem.tags, 'source_unverified'];
}

function isGenericHeadline(value?: string | null): boolean {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return !text || /^global news update$/i.test(text) || /^latest insights regarding /i.test(text) || text.length < 12;
}

function normalizeStrategy(strategy: {
  editorial_summary?: string;
  operational_tags?: unknown;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  market_entities?: unknown;
  impact_score?: number;
}) {
  return {
    editorial_summary: String(strategy.editorial_summary || '').trim() || 'Terai Times analysis is continuing as additional reporting develops.',
    operational_tags: Array.isArray(strategy.operational_tags) ? strategy.operational_tags.filter(Boolean) : [],
    sentiment: strategy.sentiment || 'Neutral',
    market_entities: Array.isArray(strategy.market_entities) ? strategy.market_entities.filter(Boolean) : [],
    impact_score: Number.isFinite(Number(strategy.impact_score)) ? Number(strategy.impact_score) : 55,
  };
}

export class NewsScrapeOrchestrator {
  static async ingestTrend(params: TrendParams): Promise<Partial<News>> {
    const generated = await NewsAutomationService.autoGenerateArticle({
      title: params.title,
      category: params.category,
      country: params.country || 'Global',
      author_id: params.author_id,
      source_url: params.source_url,
      source_name: params.source_name,
      status: params.status || 'pending_approval',
      forcePublish: params.forcePublish === true,
    });

    await applySourceSafety(generated);
    const trustSnapshot = extractTrustMetadata(generated.tags || []);
    const verification = await verifyArticle({
      title: generated.title || params.title,
      summary: generated.summary,
      sourceVerdict: trustSnapshot.sourceVerdict || 'unverified',
    });
    generated.tags = attachTrustTags(generated.tags || [], {
      trustScore: verification.trustScore,
      verificationCount: verification.verificationCount,
      neutralityScore: verification.neutralityScore,
    });
    if (verification.verificationCount >= 2) {
      generated.tags = [...(generated.tags || []), 'multi_source_verified'];
    }
    return insertNewsWithFallback(generated);
  }

  static async ingestTargeted(params: TargetedParams): Promise<Partial<News>> {
    const query = buildTargetedQuery(params);
    const sourceMaterial = await AdvancedScraperService.scrapeTargetedNews(query);

    const { draft, strategy } = await NewsAIService.generateNewsDraftHybrid({
      topic: `Latest insights regarding ${query}`,
      region: params.country || 'Global',
      tone: 'Analytical',
      depth: 'Longform',
      sourceMaterial,
      generateImage: true,
    });
    const normalizedStrategy = normalizeStrategy(strategy);

    const optimizedTitle = NewsRevenueMode.optimizeHeadline(
      isGenericHeadline(draft.print_headline) ? query : (draft.print_headline || query),
      params.category as NewsCategory,
      params.country as NewsCountry,
      query
    );

    const formattedContent = NewsRevenueMode.formatForCommercialReadability(
      draft.body || '',
      normalizedStrategy.editorial_summary
    );

    const minScore = Number(process.env.NEWS_REVENUE_MIN_SCORE || '62');
    const newsItem: Partial<News> = {
      title: optimizedTitle,
      slug: NewsAutomationService.generateSlug(optimizedTitle),
      content: formattedContent,
      summary: normalizedStrategy.editorial_summary,
      category: params.category as NewsCategory,
      country: params.country as NewsCountry,
      cover_image: draft.cover_image,
      tags: normalizedStrategy.operational_tags,
      author_id: params.author_id,
      status: params.status || 'pending_approval',
      sentiment: normalizedStrategy.sentiment,
      market_entities: normalizedStrategy.market_entities,
      impact_score: normalizedStrategy.impact_score,
      source_url: buildGoogleNewsRssUrl(query),
      source_name: 'Google News RSS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const evalResult = NewsRevenueMode.evaluateCandidate(newsItem, minScore);
    if (evalResult.decision === 'skip') {
      newsItem.status = 'draft';
    } else if (evalResult.decision === 'pending_approval') {
      newsItem.status = 'pending_approval';
    }
    newsItem.tags = [...(newsItem.tags || []), `quality_score:${evalResult.score}`];

    await applySourceSafety(newsItem);
    const trustSnapshot = extractTrustMetadata(newsItem.tags || []);
    const verification = await verifyArticle({
      title: newsItem.title || query,
      summary: newsItem.summary,
      sourceVerdict: trustSnapshot.sourceVerdict || 'unverified',
    });
    newsItem.tags = attachTrustTags(newsItem.tags || [], {
      trustScore: verification.trustScore,
      verificationCount: verification.verificationCount,
      neutralityScore: verification.neutralityScore,
    });
    if (verification.verificationCount >= 2) {
      newsItem.tags = [...(newsItem.tags || []), 'multi_source_verified'];
    }
    return insertNewsWithFallback(newsItem);
  }
}
