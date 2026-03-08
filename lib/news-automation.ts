import { NewsAIService } from './ai/news-ai';
import { News, NewsCategory, NewsCountry } from './models/News';
import { supabaseAdmin } from './supabase';
import { NewsDiscoveryService } from './news-discovery';
import { AdvancedScraperService } from './news-scraper';
import { NewsRevenueMode } from './news-revenue-mode';
import { verifySourceSafety } from './source-safety';
import { verifyArticle } from './news-verification-engine';
import { attachTrustTags, extractTrustMetadata } from './news-trust-metadata';
import { attachNewsImageMeta } from './news-image-metadata';
import { buildTextGraphicDataUrl, selectLicensedLibraryImage } from './news-visuals';

async function insertNewsSafely(newsItem: Partial<News>) {
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

function normalizeText(value?: string | null): string {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildFallbackSummary(params: {
    title: string;
    country?: string;
    draftSummary?: string | null;
    strategySummary?: string | null;
    sourceMaterial?: string | null;
}): string {
    const draftSummary = normalizeText(params.draftSummary);
    if (draftSummary.length >= 90) return draftSummary;

    const strategySummary = normalizeText(params.strategySummary);
    if (strategySummary.length >= 90) return strategySummary;

    const sourceMaterial = normalizeText(params.sourceMaterial);
    if (sourceMaterial.length >= 140) return sourceMaterial.slice(0, 260);

    return `${params.title} is being tracked by the Terai Times autonomous desk with live source review and continuing updates across ${params.country || 'global'} coverage lanes.`;
}

function buildRichCommercialBody(params: {
    formattedContent: string;
    sourceMaterial?: string | null;
    summary: string;
    title: string;
}): string {
    const formattedContent = normalizeText(params.formattedContent);
    const sourceMaterial = normalizeText(params.sourceMaterial);

    const assembled = [
        formattedContent,
        '<h2>Verified Source Material</h2>',
        `<p>${sourceMaterial || `${params.title} remains under active newsroom monitoring with additional reporting layers being assembled automatically.`}</p>`,
        '<h2>Editorial Outlook</h2>',
        `<p>${params.summary}</p>`,
        '<p>Terai Times keeps this story in rotation for follow-up updates, contextual explainers, and additional source verification as the situation evolves.</p>',
      ].join('\n');

    if (assembled.length >= 900) return assembled;

    return `
      ${assembled}
      <h2>What To Watch Next</h2>
      <p>Readers can expect continued updates, fresh market or political implications, and follow-up reporting as more verified details become available.</p>
    `.trim();
}

function qualityScoreFromTags(tags?: string[]): number | null {
    const hit = (tags || []).find((tag) => tag.startsWith('quality_score:'));
    if (!hit) return null;
    const parsed = Number(hit.split(':')[1]);
    return Number.isFinite(parsed) ? parsed : null;
}

function resolveImageStrategy(params: {
    aiCoverImage?: string;
    articleImageUrl?: string;
    sourceName?: string;
    sourceUrl?: string;
    imageCaption?: string;
    imageLicense?: 'partner' | 'creative_commons' | 'public_domain' | 'unknown';
    trustedSource: boolean;
    title: string;
    summary?: string;
    category?: string;
    country?: string;
}) {
    const mayUseSourceImage =
        Boolean(params.articleImageUrl) &&
        params.trustedSource &&
        ['partner', 'creative_commons', 'public_domain'].includes(params.imageLicense || 'unknown');

    if (mayUseSourceImage) {
        return {
            coverImage: params.articleImageUrl,
            tags: attachNewsImageMeta([], {
                origin: 'source',
                credit: params.sourceName || 'Source image',
                caption: params.imageCaption,
                sourceUrl: params.sourceUrl || params.articleImageUrl,
                license: params.imageLicense || 'unknown',
            }),
        };
    }

    if (params.aiCoverImage) {
        return {
            coverImage: params.aiCoverImage,
            tags: attachNewsImageMeta([], {
                origin: 'ai',
                credit: 'Terai Times AI Desk',
                caption: params.imageCaption,
                sourceUrl: params.sourceUrl,
                license: 'owned',
            }),
        };
    }

    const licensedLibrary = selectLicensedLibraryImage({
        title: params.title,
        summary: params.summary,
        category: params.category,
        country: params.country,
    });
    if (licensedLibrary) {
        return {
            coverImage: licensedLibrary.url,
            tags: attachNewsImageMeta([], {
                origin: 'library',
                credit: licensedLibrary.credit,
                caption: params.imageCaption,
                sourceUrl: licensedLibrary.url,
                license: licensedLibrary.license,
            }),
        };
    }

    return {
        coverImage: buildTextGraphicDataUrl({
            title: params.title,
            category: params.category,
            country: params.country,
        }),
        tags: attachNewsImageMeta([], {
            origin: 'ai',
            credit: 'Terai Times Design Desk',
            caption: params.imageCaption,
            sourceUrl: params.sourceUrl,
            license: 'owned',
        }),
    };
}

function normalizeStrategy(strategy: {
    editorial_summary?: string;
    operational_tags?: unknown;
    sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
    market_entities?: unknown;
    impact_score?: number;
}) {
    return {
        editorial_summary: normalizeText(strategy.editorial_summary) || 'Terai Times analysis is continuing as additional reporting and verification layers come in.',
        operational_tags: Array.isArray(strategy.operational_tags) ? strategy.operational_tags.filter(Boolean) : [],
        sentiment: strategy.sentiment || 'Neutral',
        market_entities: Array.isArray(strategy.market_entities) ? strategy.market_entities.filter(Boolean) : [],
        impact_score: Number.isFinite(Number(strategy.impact_score)) ? Number(strategy.impact_score) : 55,
    };
}

function isGenericHeadline(value?: string | null): boolean {
    const text = normalizeText(value);
    return (
        !text ||
        /^global news update$/i.test(text) ||
        /^latest insights regarding /i.test(text) ||
        text.length < 12
    );
}

export const NewsAutomationService = {
    /**
     * Fetches top trending global news topics from live discovery feeds.
     */
    async fetchGlobalTrends(): Promise<{ title: string; category: NewsCategory; country?: NewsCountry; source_url?: string; source_name?: string }[]> {
        console.log('[Automation] Fetching live global trends...');
        try {
            const rawTrends = await NewsDiscoveryService.getLiveTrends();
            const topViral = await NewsDiscoveryService.scoreAndFilterTrends(rawTrends);

            return topViral.map(t => ({
                title: t.title,
                category: t.category || 'World',
                country: t.country || 'Global',
                source_url: t.link,
                source_name: t.source,
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
        source_name?: string;
        status?: 'draft' | 'pending_approval' | 'published';
        forcePublish?: boolean;
    }): Promise<Partial<News>> {
        console.log(`[Automation] Generating article for: ${params.title}`);

        try {
            const sourceCheck = params.source_url
                ? await verifySourceSafety({
                    sourceUrl: params.source_url,
                    sourceName: params.source_name,
                })
                : null;
            const articleIntel = params.source_url
                ? await AdvancedScraperService.extractArticleIntelligence(params.source_url)
                : { snapshot: '' };
            const draftTopic = articleIntel.headline || params.title;

            // 1. Generate Draft & Strategy using Hybrid Switchboard
            const { draft, strategy, mode } = await NewsAIService.generateNewsDraftHybrid({
                topic: draftTopic,
                region: params.country || 'Global',
                tone: 'Analytical',
                depth: 'Longform',
                sourceMaterial: articleIntel.snapshot || params.source_url,
                generateImage: true // Phase 34: Legal Media Generation
            });
            const normalizedStrategy = normalizeStrategy(strategy);

            // 2. Assemble the News object
            const editorialHeadline = isGenericHeadline(draft.print_headline)
                ? (articleIntel.headline || params.title)
                : (draft.print_headline || articleIntel.headline || params.title);
            const optimizedTitle = NewsRevenueMode.optimizeHeadline(
                editorialHeadline,
                params.category || 'World',
                params.country || 'Global',
                articleIntel.headline || params.title
            );
            const summary = buildFallbackSummary({
                title: optimizedTitle,
                country: params.country,
                draftSummary: draft.executive_summary || draft.subheadline,
                strategySummary: normalizedStrategy.editorial_summary,
                sourceMaterial: articleIntel.snapshot || params.source_url,
            });
            const formattedContent = buildRichCommercialBody({
                formattedContent: NewsRevenueMode.formatForCommercialReadability(
                    draft.body || '',
                    summary
                ),
                sourceMaterial: articleIntel.snapshot || params.source_url,
                summary,
                title: optimizedTitle,
            });
            const minScore = Number(process.env.NEWS_REVENUE_MIN_SCORE || '62');

            const imageStrategy = resolveImageStrategy({
                aiCoverImage: draft.cover_image,
                articleImageUrl: articleIntel.imageUrl,
                sourceName: params.source_name,
                sourceUrl: params.source_url,
                imageCaption: articleIntel.imageCaption,
                imageLicense: articleIntel.imageLicense,
                trustedSource: sourceCheck?.sourceVerdict === 'trusted',
                title: optimizedTitle,
                summary,
                category: params.category || 'World',
                country: params.country || 'Global',
            });
            const newsItem: Partial<News> = {
                title: optimizedTitle,
                slug: this.generateSlug(optimizedTitle),
                content: formattedContent,
                summary,
                cover_image: imageStrategy.coverImage,
                category: params.category || 'World',
                country: params.country || 'Global',
                tags: [...normalizedStrategy.operational_tags, ...imageStrategy.tags],
                source_url: params.source_url || `${mode === 'AI' ? 'OpenAI GPT Synthesis' : 'Deterministic Sanitizer'}: ${params.title}`,
                source_name: params.source_name || (params.source_url ? 'Source Link' : 'Terai Times AI Desk'),
                status: params.status || 'pending_approval',
                author_id: params.author_id,
                is_trending: true,
                sentiment: normalizedStrategy.sentiment,
                market_entities: normalizedStrategy.market_entities,
                impact_score: normalizedStrategy.impact_score,
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

            if (newsItem.source_url) {
                const verifiedSource = sourceCheck || await verifySourceSafety({
                    sourceUrl: newsItem.source_url,
                    sourceName: newsItem.source_name,
                });
                if (verifiedSource.sourceHost) {
                    newsItem.tags = [...(newsItem.tags || []), `source_host:${verifiedSource.sourceHost}`];
                }
                if (verifiedSource.sourceVerdict === 'blocked' || verifiedSource.safeBrowsingVerdict === 'unsafe') {
                    newsItem.status = 'draft';
                    newsItem.tags = [...(newsItem.tags || []), 'source_blocked'];
                } else if (verifiedSource.sourceVerdict === 'trusted') {
                    newsItem.tags = [...(newsItem.tags || []), 'source_trusted'];
                    if ((newsItem.status || '').toLowerCase() === 'pending_approval') {
                        newsItem.status = 'published';
                    }
                } else {
                    if ((newsItem.status || '').toLowerCase() === 'published') {
                        newsItem.status = 'pending_approval';
                    }
                    newsItem.tags = [...(newsItem.tags || []), 'source_unverified'];
                }
            } else {
                newsItem.tags = [...(newsItem.tags || []), 'source_missing'];
            }

            // Manual deploy should remain published unless source is explicitly blocked/unsafe.
            if (params.forcePublish && (newsItem.status || '').toLowerCase() !== 'draft') {
                newsItem.status = 'published';
                newsItem.tags = [...(newsItem.tags || []), 'manual_publish_override'];
            }

            const trustSnapshot = extractTrustMetadata(newsItem.tags || []);
            const verification = await verifyArticle({
                title: newsItem.title || params.title,
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

            return newsItem;
        } catch (error: any) {
            console.error('[Automation] Generation failed:', error);
            if (error?.status === 429) {
                console.error('[Automation] CRITICAL: AI Quota Exceeded. Automatic generation suspended.');
            }
            throw error;
        }
    },

    /**
     * Ingests a global trend and creates an internal article immediately.
     * This moves discovery items directly into the project's internal reading flow.
     */
    async ingestGlobalTrend(trend: { title: string; category: NewsCategory; country?: NewsCountry; source_url?: string; source_name?: string; forcePublish?: boolean }): Promise<Partial<News>> {
        console.log(`[Automation] Ingesting global trend: ${trend.title}`);

        // 1. Check if already exists to avoid duplicates
        if (supabaseAdmin) {
            const { data: existing } = await supabaseAdmin
                .from('news')
                .select('id, slug, status')
                .eq('title', trend.title)
                .single();
            if (existing) {
                const existingStatus = String(existing.status || '').toLowerCase();
                if (trend.forcePublish && existingStatus !== 'published') {
                    const { data: updated } = await supabaseAdmin
                        .from('news')
                        .update({ status: 'published', updated_at: new Date().toISOString() })
                        .eq('id', existing.id)
                        .select()
                        .single();
                    if (updated) return updated;
                }
                return existing;
            }
        }

        // 2. Generate
        const newsItem = await this.autoGenerateArticle({
            title: trend.title,
            category: trend.category,
            country: trend.country || 'Global',
            author_id: 'global-intelligence-bot',
            source_url: trend.source_url,
            source_name: trend.source_name || 'Global Trend Desk',
            status: 'published',
            forcePublish: trend.forcePublish === true
        });

        // 3. Store
        if (supabaseAdmin) {
            try {
                return await insertNewsSafely(newsItem);
            } catch (error) {
                console.error('[Automation] Ingestion DB Insert Failed:', error);
                throw error;
            }
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

        const published: Partial<News>[] = [];
        const minScore = Number(process.env.NEWS_REVENUE_MIN_SCORE || '62');
        const trendPool = await this.fetchGlobalTrends();
        const candidates = trendPool
            .filter((trend) => Boolean(trend.title) && Boolean(trend.source_url))
            .slice(0, Math.max(count * 4, 8));

        for (let i = 0; i < candidates.length && published.length < count; i++) {
            const trend = candidates[i];
            const query = trend.title;

            console.log(`[Automation - Roaming Engine] Vector ${i + 1}: Ingesting "${query}" from ${trend.source_name || 'live source'}`);

            try {
                // 1. Duplicate protection by source URL
                if (supabaseAdmin && trend.source_url) {
                    const { data: existingBySource } = await supabaseAdmin
                        .from('news')
                        .select('id')
                        .eq('source_url', trend.source_url)
                        .limit(1)
                        .maybeSingle();
                    if (existingBySource?.id) {
                        console.log(`[Automation - Roaming Engine] Vector ${i + 1} source already ingested. Skipping.`);
                        continue;
                    }
                }

                // 2. Scrape Facts from the real linked article first
                const articleIntel = trend.source_url
                    ? await AdvancedScraperService.extractArticleIntelligence(trend.source_url)
                    : { snapshot: '' };
                let sourceMaterial = articleIntel.snapshot;
                if (!sourceMaterial) {
                    sourceMaterial = await AdvancedScraperService.scrapeTargetedNews(query);
                }
                if (sourceMaterial.includes('No direct news events found')) {
                    console.log(`[Automation - Roaming Engine] Vector ${i + 1} yielded no viable intelligence. Skipping.`);
                    continue; // Skip if no news found for this specific combo
                }

                // 3. Draft & Strategize using Hybrid Switchboard
                const sourceCheck = trend.source_url
                    ? await verifySourceSafety({
                        sourceUrl: trend.source_url,
                        sourceName: trend.source_name,
                    })
                    : null;
                const { draft, strategy, mode } = await NewsAIService.generateNewsDraftHybrid({
                    topic: articleIntel.headline || query,
                    region: trend.country || 'Global',
                    tone: 'Analytical',
                    depth: 'Longform',
                    sourceMaterial,
                    generateImage: true // Phase 34: Legal Media Generation
                });
                const normalizedStrategy = normalizeStrategy(strategy);

                console.log(`[Automation - Roaming Engine] Vector ${i + 1} generated via ${mode} mode.`);

                // 4. Prevent Duplicates (Check Title)
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
                const editorialHeadline = isGenericHeadline(draft.print_headline)
                    ? (articleIntel.headline || query)
                    : (draft.print_headline || articleIntel.headline || query);
                const optimizedTitle = NewsRevenueMode.optimizeHeadline(
                    editorialHeadline,
                    trend.category,
                    trend.country || 'Global',
                    query
                );
                const summary = buildFallbackSummary({
                    title: optimizedTitle,
                    country: trend.country,
                    draftSummary: draft.executive_summary || draft.subheadline,
                    strategySummary: normalizedStrategy.editorial_summary,
                    sourceMaterial,
                });
                const formattedContent = buildRichCommercialBody({
                    formattedContent: NewsRevenueMode.formatForCommercialReadability(
                        draft.body || sourceMaterial,
                        summary
                    ),
                    sourceMaterial,
                    summary,
                    title: optimizedTitle,
                });
                const imageStrategy = resolveImageStrategy({
                    aiCoverImage: draft.cover_image,
                    articleImageUrl: articleIntel.imageUrl,
                    sourceName: trend.source_name,
                    sourceUrl: trend.source_url,
                    imageCaption: articleIntel.imageCaption,
                    imageLicense: articleIntel.imageLicense,
                    trustedSource: sourceCheck?.sourceVerdict === 'trusted',
                    title: optimizedTitle,
                    summary,
                    category: trend.category,
                    country: trend.country || 'Global',
                });

                const newsItem: Partial<News> = {
                    title: optimizedTitle,
                    slug: this.generateSlug(optimizedTitle),
                    content: formattedContent,
                    summary,
                    category: trend.category,
                    country: trend.country || 'Global',
                    cover_image: imageStrategy.coverImage,
                    tags: [...normalizedStrategy.operational_tags, ...imageStrategy.tags],
                    author_id: 'global-intelligence-bot',
                    status: 'published', // Instant Autonomous Publishing
                    sentiment: normalizedStrategy.sentiment,
                    market_entities: normalizedStrategy.market_entities,
                    impact_score: normalizedStrategy.impact_score,
                    source_url: trend.source_url,
                    source_name: trend.source_name || (mode === 'AI' ? 'Terai Times AI Desk' : 'Terai Times Sanitizer'),
                    is_trending: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Exact 7-day auto-delete schedule
                };
                const evalResult = NewsRevenueMode.evaluateCandidate(newsItem, minScore);
                if (evalResult.decision === 'skip') {
                    const qualitySourceCheck = sourceCheck || await verifySourceSafety({
                        sourceUrl: newsItem.source_url,
                        sourceName: newsItem.source_name,
                    });
                    if (!(qualitySourceCheck.sourceVerdict === 'trusted' && (newsItem.content || '').length >= 700)) {
                        console.log(`[Automation - Roaming Engine] Vector ${i + 1} skipped (quality score ${evalResult.score}).`);
                        continue;
                    }
                    newsItem.tags = [...(newsItem.tags || []), 'quality_override:trusted_source'];
                }
                if (evalResult.decision === 'pending_approval') {
                    newsItem.status = 'pending_approval';
                }
                newsItem.tags = [...(newsItem.tags || []), `quality_score:${evalResult.score}`];

                if (newsItem.source_url) {
                    const verifiedSource = sourceCheck || await verifySourceSafety({
                        sourceUrl: newsItem.source_url,
                        sourceName: newsItem.source_name,
                    });
                    if (verifiedSource.sourceHost) {
                        newsItem.tags = [...(newsItem.tags || []), `source_host:${verifiedSource.sourceHost}`];
                    }
                    if (verifiedSource.sourceVerdict === 'blocked' || verifiedSource.safeBrowsingVerdict === 'unsafe') {
                        newsItem.status = 'draft';
                        newsItem.tags = [...(newsItem.tags || []), 'source_blocked'];
                    } else if (verifiedSource.sourceVerdict === 'trusted') {
                        newsItem.tags = [...(newsItem.tags || []), 'source_trusted'];
                        if ((newsItem.status || '').toLowerCase() === 'pending_approval') {
                            newsItem.status = 'published';
                        }
                    } else {
                        if ((newsItem.status || '').toLowerCase() === 'published') {
                            newsItem.status = 'pending_approval';
                        }
                        newsItem.tags = [...(newsItem.tags || []), 'source_unverified'];
                    }
                } else {
                    newsItem.tags = [...(newsItem.tags || []), 'source_missing'];
                }

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
                const qualityScore = qualityScoreFromTags(newsItem.tags);
                const trustedAutoPublish =
                    (trustSnapshot.sourceVerdict === 'trusted' || verification.verificationCount >= 2) &&
                    verification.trustScore >= 78 &&
                    (qualityScore === null || qualityScore >= Math.max(46, minScore - 16));
                if (trustedAutoPublish && (newsItem.status || '').toLowerCase() !== 'draft') {
                    newsItem.status = 'published';
                    newsItem.published_at = new Date().toISOString();
                }

                console.log(`[Automation - Roaming Engine] Finalizing publishing for: ${optimizedTitle} (quality: ${evalResult.score}).`);

                if (supabaseAdmin) {
                    try {
                        const saved = await insertNewsSafely(newsItem);
                        if (saved) published.push(saved);
                    } catch (error) {
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
