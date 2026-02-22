'use server';

import { NewsAIService, NewsDraftResult, ContextBriefResult, EditorialStrategyResult } from '@/lib/ai/news-ai';
import { requireContentWriter } from '@/lib/admin-check';
import { AdvancedScraperService } from '@/lib/news-scraper';
import { NewsAutomationService } from '@/lib/news-automation';
import { NewsCategory, NewsCountry, News } from '@/lib/models/News';

/**
 * Action to synthesize a news draft.
 */
export async function getNewsDraftAction(params: {
    topic: string;
    region: string;
    tone: 'Neutral' | 'Investigative' | 'Analytical';
    depth: 'Brief' | 'Standard' | 'Longform';
}): Promise<{ data?: NewsDraftResult; error?: string }> {
    try {
        await requireContentWriter();
        const data = await NewsAIService.generateNewsDraft(params);
        return { data };
    } catch (error: any) {
        console.error('AI Draft Error:', error);
        return { error: error.message || 'Intelligence Synthesis Failed' };
    }
}

/**
 * Action to generate a context brief memo.
 */
export async function getContextBriefAction(topic: string): Promise<{ data?: ContextBriefResult; error?: string }> {
    try {
        await requireContentWriter();
        const data = await NewsAIService.generateContextBrief(topic);
        return { data };
    } catch (error: any) {
        console.error('AI Context Error:', error);
        return { error: error.message || 'Briefing Generation Failed' };
    }
}

/**
 * Action to generate editorial strategy and SEO logic.
 */
export async function getEditorialStrategyAction(content: string, title?: string): Promise<{ data?: EditorialStrategyResult; error?: string }> {
    try {
        await requireContentWriter();
        const data = await NewsAIService.generateEditorialStrategy(content, title);
        return { data };
    } catch (error: any) {
        console.error('AI Strategy Error:', error);
        return { error: error.message || 'Strategy Analysis Failed' };
    }
}

/**
 * Action to fetch global trending topics.
 */
export async function getGlobalTrendsAction(): Promise<{ data?: { title: string; category: NewsCategory; country?: NewsCountry; source_url?: string; slug?: string }[]; error?: string }> {
    try {
        await requireContentWriter();
        const data = await NewsAutomationService.fetchGlobalTrends();
        return { data };
    } catch (error: any) {
        return { error: error.message || 'Trend Pulse Offline' };
    }
}

/**
 * Action to auto-generate a full news article.
 */
export async function autoGenerateNewsAction(params: {
    title: string;
    category?: NewsCategory;
    country?: NewsCountry;
    author_id: string;
    source_url?: string;
}): Promise<{ data?: Partial<News>; error?: string }> {
    try {
        await requireContentWriter();
        const data = await NewsAutomationService.autoGenerateArticle(params);
        return { data };
    } catch (error: any) {
        return { error: error.message || 'Auto-Generation Failed' };
    }
}

/**
 * Action to scrape specific params and generate an impromptu article for the studio.
 * (Phase 25)
 */
export async function scrapeAndGenerateTargetedNewsAction(params: {
    topic?: string;
    category: string;
    country: string;
    region?: string;
    state?: string;
    author_id: string;
}): Promise<{ data?: Partial<News>; error?: string }> {
    try {
        await requireContentWriter();

        // 1. Build Query
        const queryParts = [params.topic?.trim() || '', params.category, 'news'];
        if (params.country && params.country !== 'Global' && params.country !== 'All') {
            queryParts.push(params.country);
        }
        if (params.state) queryParts.push(params.state);
        if (params.region) queryParts.push(params.region);

        const query = queryParts.join(' ');

        // 2. Scrape source material
        const sourceMaterial = await AdvancedScraperService.scrapeTargetedNews(query);

        // 3. Draft & Strategize using Hybrid Switchboard
        const { draft, strategy, mode } = await NewsAIService.generateNewsDraftHybrid({
            topic: `Latest insights regarding ${query}`,
            region: params.country || 'Global',
            tone: 'Analytical',
            depth: 'Standard',
            sourceMaterial
        });

        // 5. Assemble Preview payload (Does not save to DB)
        const newsItem: Partial<News> = {
            title: draft.print_headline,
            content: draft.body,
            summary: strategy.editorial_summary,
            category: params.category as NewsCategory || 'World',
            country: params.country as NewsCountry || 'Global',
            tags: strategy.operational_tags,
            author_id: params.author_id,
            sentiment: strategy.sentiment,
            market_entities: strategy.market_entities,
            impact_score: strategy.impact_score,
            source_url: `${mode === 'AI' ? 'Google News RSS Aggregation' : 'Deterministic Sanitizer Failover'}: ${query}`
        };

        return { data: newsItem };

    } catch (error: any) {
        console.error('Targeted Scrape & Gen Error:', error);
        return { error: error.message || 'Targeted Generation Failed' };
    }
}

/**
 * Public action to ingest a global trend on-demand when a user clicks it essentially.
 */
export async function ingestPublicTrendAction(trend: { title: string; category: NewsCategory; country?: NewsCountry; source_url?: string }): Promise<{ data?: Partial<News>; error?: string }> {
    try {
        const data = await NewsAutomationService.ingestGlobalTrend(trend);
        return { data };
    } catch (error: any) {
        console.error('Public Ingest Error:', error);
        return { error: error.message || 'Ingestion Failed' };
    }
}
