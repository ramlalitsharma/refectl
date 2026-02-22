import { NewsAIService } from './ai/news-ai';
import { News, NewsCategory, NewsCountry } from './models/News';
import { supabaseAdmin } from './supabase';
import { NewsDiscoveryService } from './news-discovery';
import { AdvancedScraperService } from './news-scraper';
import { NewsRevenueMode } from './news-revenue-mode';

export const NewsAutomationService = {
    /**
     * Fetches top trending global news topics from live discovery feeds.
     */
    async fetchGlobalTrends(): Promise<{ title: string; category: NewsCategory; source_url?: string }[]> {
        console.log('[Automation] Fetching live global trends...');
        try {
            const rawTrends = await NewsDiscoveryService.getLiveTrends();
            const topViral = await NewsDiscoveryService.scoreAndFilterTrends(rawTrends);

            return topViral.map(t => ({
                title: t.title,
                category: t.category || 'World',
                country: t.country || 'Global',
                source_url: t.link,
                slug: this.generateSlug(t.title || 'untitled-discovery') // Ensure safety
            }));
        } catch (error) {
            console.error('[Automation] Failed to fetch live trends, using fallback:', error);
            return [
                { title: "AI Breakthrough in Quantum Computing", category: "Technology" },
                { title: "Global Economic Summit 2026: Key Takeaways", category: "Finance" },
                { title: "New Sustainable Energy Records in Europe", category: "Environment" }
            ];
        }
    },

    /**
     * Fully automates the generation of a news article from a title.
     */
    async autoGenerateArticle(params: {
        title: string;
        category?: NewsCategory;
        country?: NewsCountry;
        author_id: string;
        source_url?: string;
        status?: 'draft' | 'pending_approval' | 'published';
    }): Promise<Partial<News>> {
        console.log(`[Automation] Generating article for: ${params.title}`);

        try {
            // 1. Generate Draft & Strategy using Hybrid Switchboard
            const { draft, strategy, mode } = await NewsAIService.generateNewsDraftHybrid({
                topic: params.title,
                region: params.country || 'Global',
                tone: 'Analytical',
                depth: 'Standard',
                generateImage: true // Phase 34: Legal Media Generation
            });

            // 2. Assemble the News object
            const optimizedTitle = NewsRevenueMode.optimizeHeadline(
                draft.print_headline || params.title,
                params.category || 'World',
                params.country || 'Global'
            );
            const formattedContent = NewsRevenueMode.formatForCommercialReadability(
                draft.body || '',
                draft.executive_summary || draft.subheadline
            );
            const minScore = Number(process.env.NEWS_REVENUE_MIN_SCORE || '62');

            const newsItem: Partial<News> = {
                title: optimizedTitle,
                slug: this.generateSlug(optimizedTitle),
                content: formattedContent,
                summary: draft.executive_summary || draft.subheadline,
                cover_image: draft.cover_image, // Persisted AI art
                category: params.category || 'World',
                country: params.country || 'Global',
                tags: strategy.operational_tags,
                source_url: params.source_url || `${mode === 'AI' ? 'OpenAI GPT Synthesis' : 'Deterministic Sanitizer'}: ${params.title}`,
                status: params.status || 'pending_approval',
                author_id: params.author_id,
                is_trending: true,
                sentiment: strategy.sentiment,
                market_entities: strategy.market_entities,
                impact_score: strategy.impact_score,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            const evalResult = NewsRevenueMode.evaluateCandidate(newsItem, minScore);
            const requestedStatus = params.status || 'pending_approval';
            if (requestedStatus === 'published' && evalResult.decision !== 'publish') {
                newsItem.status = evalResult.decision === 'pending_approval' ? 'pending_approval' : 'draft';
            } else {
                newsItem.status = requestedStatus;
            }
            newsItem.tags = [...(newsItem.tags || []), `quality_score:${evalResult.score}`];

            return newsItem;
        } catch (error) {
            console.error('[Automation] Generation failed:', error);
            throw error;
        }
    },

    /**
     * Ingests a global trend and creates an internal article immediately.
     * This moves discovery items directly into the project's internal reading flow.
     */
    async ingestGlobalTrend(trend: { title: string; category: NewsCategory; country?: NewsCountry; source_url?: string }): Promise<Partial<News>> {
        console.log(`[Automation] Ingesting global trend: ${trend.title}`);

        // 1. Check if already exists to avoid duplicates
        if (supabaseAdmin) {
            const { data: existing } = await supabaseAdmin
                .from('news')
                .select('id, slug')
                .eq('title', trend.title)
                .single();
            if (existing) return existing;
        }

        // 2. Generate
        const newsItem = await this.autoGenerateArticle({
            title: trend.title,
            category: trend.category,
            country: trend.country || 'Global',
            author_id: 'global-intelligence-bot',
            source_url: trend.source_url,
            status: 'published'
        });

        // 3. Store
        if (supabaseAdmin) {
            const { data, error } = await supabaseAdmin
                .from('news')
                .insert([newsItem])
                .select()
                .single();
            if (error) {
                console.error('[Automation] Ingestion DB Insert Failed:', error);
                throw error;
            }
            return data;
        }

        return newsItem;
    },

    /**
     * Phase 26: Global Roaming Engine
     * Randomly cycles through world countries/categories, scrapes targeted news,
     * and autonomously publishes it. Replaces static RSS discovery.
     */
    async ingestRoamingGlobalNews(count: number = 3): Promise<Partial<News>[]> {
        console.log(`[Automation - Roaming Engine] Waking up. Target ingests: ${count}`);

        const COUNTRIES: NewsCountry[] = [
            'Global', 'USA', 'UK', 'China', 'India', 'Japan', 'Germany', 'France', 'Brazil',
            'Canada', 'Australia', 'Russia', 'South Korea', 'Mexico', 'Indonesia', 'Saudi Arabia',
            'Turkey', 'UAE', 'Singapore', 'Israel', 'Nigeria', 'South Africa', 'Egypt', 'Nepal'
        ];
        const CATEGORIES: NewsCategory[] = [
            'World', 'Politics', 'Business', 'Tech', 'Culture', 'Science', 'Environment', 'Finance', 'Health'
        ];

        const published: Partial<News>[] = [];
        const minScore = Number(process.env.NEWS_REVENUE_MIN_SCORE || '62');

        for (let i = 0; i < count; i++) {
            const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
            const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const query = `${randomCategory} news in ${randomCountry}`;

            console.log(`[Automation - Roaming Engine] Vector ${i + 1}: Scouting "${query}"`);

            try {
                // 1. Scrape Facts
                const sourceMaterial = await AdvancedScraperService.scrapeTargetedNews(query);
                if (sourceMaterial.includes('No direct news events found')) {
                    console.log(`[Automation - Roaming Engine] Vector ${i + 1} yielded no viable intelligence. Skipping.`);
                    continue; // Skip if no news found for this specific combo
                }

                // 2. Draft & Strategize using Hybrid Switchboard (AI first, Sanitizer failover)
                const { draft, strategy, mode } = await NewsAIService.generateNewsDraftHybrid({
                    topic: `Latest insights regarding ${query}`,
                    region: randomCountry,
                    tone: 'Analytical',
                    depth: 'Standard',
                    sourceMaterial,
                    generateImage: true // Phase 34: Legal Media Generation
                });

                console.log(`[Automation - Roaming Engine] Vector ${i + 1} generated via ${mode} mode.`);

                // 3. Prevent Duplicates (Check Title)
                if (supabaseAdmin) {
                    const { data: existing } = await supabaseAdmin
                        .from('news')
                        .select('id')
                        .eq('title', draft.print_headline)
                        .single();
                    if (existing) {
                        console.log(`[Automation - Roaming Engine] Vector ${i + 1} discovered duplicate headline. Skipping.`);
                        continue;
                    }
                }

                // 4. (Deprecated direct strategy call, now handled by Hybrid Switchboard)

                // 5. Assemble & Save
                const optimizedTitle = NewsRevenueMode.optimizeHeadline(
                    draft.print_headline,
                    randomCategory,
                    randomCountry
                );
                const formattedContent = NewsRevenueMode.formatForCommercialReadability(
                    draft.body || '',
                    strategy.editorial_summary
                );

                const newsItem: Partial<News> = {
                    title: optimizedTitle,
                    slug: this.generateSlug(optimizedTitle),
                    content: formattedContent,
                    summary: strategy.editorial_summary,
                    category: randomCategory,
                    country: randomCountry,
                    cover_image: draft.cover_image, // Persisted AI art
                    tags: strategy.operational_tags,
                    author_id: 'global-intelligence-bot',
                    status: 'published', // Instant Autonomous Publishing
                    sentiment: strategy.sentiment,
                    market_entities: strategy.market_entities,
                    impact_score: strategy.impact_score,
                    source_url: `${mode === 'AI' ? 'OpenAI GPT Synthesis' : 'Deterministic Sanitizer'}: ${query}`,
                    is_trending: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Exact 7-day auto-delete schedule
                };
                const evalResult = NewsRevenueMode.evaluateCandidate(newsItem, minScore);
                if (evalResult.decision === 'skip') {
                    console.log(`[Automation - Roaming Engine] Vector ${i + 1} skipped (quality score ${evalResult.score}).`);
                    continue;
                }
                if (evalResult.decision === 'pending_approval') {
                    newsItem.status = 'pending_approval';
                }
                newsItem.tags = [...(newsItem.tags || []), `quality_score:${evalResult.score}`];

                console.log(`[Automation - Roaming Engine] Finalizing publishing for: ${optimizedTitle} (quality: ${evalResult.score}).`);

                if (supabaseAdmin) {
                    const { data, error } = await supabaseAdmin
                        .from('news')
                        .insert([newsItem])
                        .select()
                        .single();

                    if (!error && data) {
                        published.push(data);
                    } else {
                        console.error(`[Automation - Roaming Engine] DB Insert Failed:`, error);
                    }
                } else {
                    // Fallback for tests if db is not connected
                    published.push(newsItem);
                }

            } catch (error) {
                console.error(`[Automation - Roaming Engine] Vector ${i + 1} Critical Failure:`, error);
            }
        }

        console.log(`[Automation - Roaming Engine] Cycle complete. Published ${published.length} global pieces.`);
        return published;
    },

    /**
     * Helper to generate a URL-friendly slug
     */
    generateSlug(title: string): string {
        const safeTitle = title || 'untitled-news';
        return safeTitle
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() + '-' + Math.random().toString(36).substring(2, 7);
    }
};
