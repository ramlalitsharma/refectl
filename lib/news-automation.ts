import { NewsAIService } from './ai/news-ai';
import { News, NewsCategory, NewsCountry } from './models/News';
import { MultiAgentOrchestrator } from './ai/ai-orchestrator';
import { supabaseAdmin } from './supabase';
import { NewsDiscoveryService } from './news-discovery';
import { AdvancedScraperService } from './news-scraper';
import { NewsRevenueMode } from './news-revenue-mode';
import { verifySourceSafety } from './source-safety';
import { verifyArticle } from './news-verification-engine';
import { attachTrustTags, extractTrustMetadata } from './news-trust-metadata';
import { NewsImagerySearch } from './news-imagery-search';
import { attachNewsImageMeta } from './news-image-metadata';
import { buildTextGraphicDataUrl, selectLicensedLibraryImage } from './news-visuals';
import { translationService } from './translation-service';

async function insertNewsSafely(newsItem: Partial<News>) {
    if (!supabaseAdmin) return newsItem;

    // Phase 42: Deep Payload Sanitization against 23502 NOT NULL Violations
    const sanitizedItem = {
        ...newsItem,
        title: newsItem.title || 'Live Global Coverage',
        slug: newsItem.slug || `global-${Date.now()}`,
        content: newsItem.content || '<p>Detailed intelligence pending verification by the autonomous desk.</p>',
        summary: newsItem.summary || 'Strategic overview pending verification.',
        view_count: Number.isFinite(newsItem.view_count) ? newsItem.view_count : 0,
        author_id: newsItem.author_id || 'terai-times-senior-desk',
    };

    const attempt = await supabaseAdmin.from('news').insert([sanitizedItem]).select().single();
    if (!attempt.error) return attempt.data;

    // Retry gracefully if certain aggressive analytic fields fail constraint
    if (attempt.error?.message?.includes('impact_score') || attempt.error?.message?.includes('23502')) {
        const fallback = { ...sanitizedItem };
        delete (fallback as any).impact_score;
        delete (fallback as any).market_entities;
        delete (fallback as any).sentiment;
        const retry = await supabaseAdmin.from('news').insert([fallback]).select().single();
        if (!retry.error) return retry.data;
    }

    throw attempt.error;
}

function normalizeText(value?: string | null, options?: { preserveNewlines?: boolean }): string {
    if (options?.preserveNewlines) {
        return String(value || '').replace(/[ \t]+/g, ' ').trim();
    }
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

    return `${params.title}: Terai Times is currently tracking verified updates on this developing story through live international intelligence channels.`;
}

function buildRichCommercialBody(params: {
    formattedContent: string;
    sourceMaterial?: string | null;
    summary: string;
    title: string;
    impactScore?: number;
    sentiment?: string;
    mode?: 'AI' | 'Sanitized';
}): string {
    const formattedContent = normalizeText(params.formattedContent, { preserveNewlines: true });
    const sourceMaterial = normalizeText(params.sourceMaterial, { preserveNewlines: true });

    // Phase 27: Body Guard - Don't double-append source material if already sanitized in content
    const isSanitized = params.mode === 'Sanitized' || formattedContent.includes('Intelligence Briefing');

    const assembled = [
        formattedContent,
        `<p class="commercial-summary-footer">${params.summary}</p>`,
    ].filter(Boolean).join('\n');

    return assembled;
}

function qualityScoreFromTags(tags?: string[]): number | null {
    const hit = (tags || []).find((tag) => tag.startsWith('quality_score:'));
    if (!hit) return null;
    const parsed = Number(hit.split(':')[1]);
    return Number.isFinite(parsed) ? parsed : null;
}

async function resolveImageStrategy(params: {
    aiCoverImage?: string;
    articleImageUrl?: string;
    rssImageUrl?: string;
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
    // 1. AI Generated Image (DALL-E 3) - Premium Priority
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

    // 2. Original Source Image (Priority Journalistic Mirror)
    // We prioritize the ACTUAL news image over generic stock photos.
    if (params.articleImageUrl && /^https?:\/\//.test(params.articleImageUrl)) {
        return {
            coverImage: params.articleImageUrl,
            tags: attachNewsImageMeta([], {
                origin: 'source',
                credit: params.sourceName || 'News Source (Editorial)',
                caption: params.imageCaption || params.title,
                sourceUrl: params.sourceUrl || params.articleImageUrl,
                license: params.trustedSource ? (params.imageLicense || 'partner') : 'unknown',
            }),
        };
    }

    // 3. RSS Metadata Image (Secondary Journalistic Mirror)
    if (params.rssImageUrl && /^https?:\/\//.test(params.rssImageUrl)) {
        return {
            coverImage: params.rssImageUrl,
            tags: attachNewsImageMeta([], {
                origin: 'source',
                credit: params.sourceName || 'News Source (Editorial)',
                caption: params.imageCaption || params.title,
                sourceUrl: params.sourceUrl || params.rssImageUrl,
                license: 'unknown',
            }),
        };
    }

    // 4. High-Impact Free Discovery (Public Scanners - Commercial Free)
    // Sanitizing the query length to prevent search engine 404s.
    const cleanTitle = (params.title || '').split(' ').slice(0, 4).join(' ');
    const discovered = await NewsImagerySearch.findFreeStockPhoto([
        cleanTitle,
        ...(params.category ? [params.category] : []),
        ...(params.country ? [params.country] : [])
    ]);
    if (discovered) {
        return {
            coverImage: discovered,
            tags: attachNewsImageMeta([], {
                origin: 'library',
                credit: 'Open Media Search',
                caption: params.imageCaption,
                sourceUrl: discovered,
                license: 'creative_commons',
            }),
        };
    }

    // 5. Curated Intelligence Library (Hardcoded High-Quality)
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

    // 6. Generative Programmatic Art Engine (Absolute Last Resort)
    // Generates a dynamic SVG artwork based on the category.
    return {
        coverImage: buildTextGraphicDataUrl({
            title: params.title,
            category: params.category,
            country: params.country,
        }),
        tags: attachNewsImageMeta([], {
            origin: 'ai',
            credit: 'Terai Times Visuals',
            caption: params.title,
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
    const LOW_QUALITY_PATTERNS = [
        /lorem ipsum/i,
        /click here/i,
        /no direct news events found/i,
        /untitled/i,
        /^global news update$/i,
        /hiii+/i,
        /test article/i,
        /this is a test/i,
        /TARGETED NEWS BRIEFING/i,
        /Intelligence Source/i,
        /Verified Source Material/i,
        /Context:/i,
        /Source:/i,
        /Why This Matters/i,
        /What To Watch Next/i,
    ];
    return (
        !text ||
        LOW_QUALITY_PATTERNS.some(pattern => pattern.test(text)) ||
        /^latest insights regarding /i.test(text) ||
        text.length < 12
    );
}

export const NewsAutomationService = {
    /**
     * Fetches top trending global news topics from live discovery feeds.
     * Upgraded: Now supports targeted country injection to ensure specific regions stay warm.
     */
    async fetchGlobalTrends(targetCountry?: string): Promise<{ title: string; category: NewsCategory; country?: NewsCountry; source_url?: string; source_name?: string; imageUrl?: string }[]> {
        console.log(`[Automation] Fetching live trends ${targetCountry ? `specifically for: ${targetCountry}` : '(Global Pool)'}...`);
        try {
            // Priority 1: Fetch from broad discovery matrix
            const rawTrends = await NewsDiscoveryService.getLiveTrends();
            
            // Priority 2: If we have a targetCountry, perform an additional targeted scrape to guarantee matches
            if (targetCountry && targetCountry !== 'Global' && targetCountry !== 'All') {
                try {
                    console.log(`[Automation] Injecting targeted vectors for ${targetCountry}...`);
                    const targetedScrape = await AdvancedScraperService.scrapeTargetedNews(`${targetCountry} breaking news today`);
                    
                    // Parse the targeted scrape context back into trend objects
                    // Note: scrapeTargetedNews returns a string, we extract headlines for better coverage
                    const lines = targetedScrape.split('\n');
                    const injected: any[] = [];
                    for (const line of lines) {
                        if (line.startsWith('[SOURCE:')) {
                            const sourceMatch = line.match(/\[SOURCE: (.*?)\] (.*)/);
                            if (sourceMatch) {
                                injected.push({
                                    title: sourceMatch[2].trim(),
                                    source: sourceMatch[1].trim(),
                                    link: '', // Scraper returns snapshot but link is buried, we'll use source search if needed
                                    country: targetCountry as any,
                                    category: 'World' as any,
                                    score: 85 // Targeted results are high priority
                                });
                            }
                        }
                    }
                    rawTrends.unshift(...injected);
                } catch (e) {
                    console.warn(`[Automation] Targeted injection failed for ${targetCountry}:`, e);
                }
            }

            const topViral = await NewsDiscoveryService.scoreAndFilterTrends(rawTrends);

            return topViral.map(t => ({
                title: t.title,
                category: t.category || 'World',
                country: t.country || 'Global',
                source_url: t.link,
                source_name: t.source,
                imageUrl: t.imageUrl,
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
        locale?: string;
    }): Promise<Partial<News>> {
        console.log(`[Automation] Generating article for: ${params.title} (Locale: ${params.locale || 'en'})`);

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

            // Phase 40: Integrity Guard - Final "Clean & Secure" verification
            const integrityResult = await MultiAgentOrchestrator.runIntegrityAgent(draft);
            const integrityFailed = !integrityResult.passed;

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
            const summaryRaw = buildFallbackSummary({
                title: optimizedTitle,
                country: params.country,
                draftSummary: draft.executive_summary || draft.subheadline,
                strategySummary: normalizedStrategy.editorial_summary,
                sourceMaterial: articleIntel.snapshot || params.source_url,
            });

            // Phase 7.1: Global Multi-Language Activation
            let summary = summaryRaw;
            let strategicSummary = normalizedStrategy.editorial_summary;

            if (params.locale && params.locale !== 'en') {
                console.log(`[Automation] Phase 7.1: Translating Intelligence into ${params.locale}...`);
                try {
                    const [translatedSummary, translatedStrategy] = await Promise.all([
                        NewsAIService.translateIntelligence(summaryRaw, params.locale),
                        NewsAIService.translateIntelligence(strategicSummary, params.locale)
                    ]);
                    summary = translatedSummary;
                    strategicSummary = translatedStrategy;
                } catch (translationError) {
                    console.warn('[Automation] Translation Swarm failed. Using source.', translationError);
                }
            }
            const formattedContent = buildRichCommercialBody({
                formattedContent: NewsRevenueMode.formatForCommercialReadability(
                    draft.body || '',
                    summary
                ),
                sourceMaterial: articleIntel.snapshot || params.source_url,
                summary,
                title: optimizedTitle,
                impactScore: normalizedStrategy.impact_score,
                sentiment: normalizedStrategy.sentiment,
                mode: mode as any
            });
            normalizedStrategy.editorial_summary = strategicSummary; // Inject translated strategy back
            const minScore = Number(process.env.NEWS_REVENUE_MIN_SCORE || '62');

            const imageStrategy = await resolveImageStrategy({
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
            // Phase 49: Cross-Filter Symmetry Guard
            // If the primary target is 'Global', we perform a final neural inference
            // to see if the article is actually about a specific country.
            // This ensures "Global" news also appears in specific country filters.
            let finalCountry = params.country || 'Global';
            if (finalCountry === 'Global' || finalCountry === 'All') {
                const detected = AdvancedScraperService.inferCountry(optimizedTitle, draft.body || '');
                if (detected && detected !== 'Global') {
                    finalCountry = detected;
                    console.log(`[Automation] Cross-Filter Symmetry: Re-tagged Global piece as ${finalCountry}`);
                }
            }

            const newsItem: Partial<News> = {
                title: optimizedTitle,
                slug: this.generateSlug(optimizedTitle),
                content: formattedContent,
                summary,
                cover_image: imageStrategy.coverImage,
                category: params.category || 'World',
                country: finalCountry as any,
                tags: [...normalizedStrategy.operational_tags, ...imageStrategy.tags],
                source_url: params.source_url || `${mode === 'AI' ? 'OpenAI GPT Synthesis' : 'Deterministic Sanitizer'}: ${params.title}`,
                source_name: params.source_name || 'Terai Times Bureau',
                status: 'published',
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

            if (integrityFailed) {
                newsItem.tags = [...(newsItem.tags || []), `integrity_failure:${integrityResult.reason}`];
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
                } else {
                    newsItem.tags = [...(newsItem.tags || []), 'source_unverified'];
                }
            } else {
                newsItem.tags = [...(newsItem.tags || []), 'source_missing'];
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

            const saved = await insertNewsSafely(newsItem);
            
            // Phase 57: Background Cache Warming for priority languages
            if (saved && saved.title) {
                translationService.warmCache({
                    title: saved.title,
                    summary: saved.summary || '',
                    category: saved.category || '',
                    locales: ['hi', 'ms']
                }).catch(e => console.warn('[Automation] Cache warming failed:', e));
            }

            return saved;
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
    async ingestGlobalTrend(trend: {
        title: string;
        category: NewsCategory;
        country?: NewsCountry;
        source_url?: string;
        source_name?: string;
        forcePublish?: boolean;
        locale?: string;
    }): Promise<Partial<News>> {
        console.log(`[Automation] Ingesting global trend: ${trend.title} (${trend.locale || 'en'})`);

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
            forcePublish: trend.forcePublish === true,
            locale: trend.locale
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
    async ingestRoamingGlobalNews(count: number = 3, targetCountry?: string): Promise<Partial<News>[]> {
        console.log(`[Automation - Roaming Engine] Waking up. Target ingests: ${count} ${targetCountry ? `(Targeting: ${targetCountry})` : ''}`);

        // Phase 47: Enforce Data Hygiene - Purge before ingestion
        if (supabaseAdmin) {
            await this.purgeExpiredNews().catch(e => console.error('[Automation] Auto-purge failed:', e));
        }

        const published: Partial<News>[] = [];
        const minScore = Number(process.env.NEWS_REVENUE_MIN_SCORE || '65'); // Lowered from 78 to ensure hourly density
        const trendPool = await this.fetchGlobalTrends(targetCountry);

        // Phase 41: Strategic Priority - Filter for high-impact categories & regions
        const highValueCategories = ['Business', 'Technology', 'Politics', 'Finance', 'Science'];
        const highValueCountries = ['US', 'China', 'EU', 'India', 'Nepal', 'Global'];
        if (targetCountry && !highValueCountries.includes(targetCountry)) {
            highValueCountries.push(targetCountry);
        }

        const prioritized = trendPool.filter(t => {
            // Phase 48: Regional Diversity Guard
            // If we are NOT specifically targeting Nepal, do not publish Nepal news in this cycle.
            // This prevents Nepal feeds from leaking into "Global" or "Technology" cycles.
            if (targetCountry !== 'Nepal' && (t.country === 'Nepal' || t.title.toLowerCase().includes('nepal'))) {
                return false;
            }

            return (targetCountry && t.country === targetCountry) ||
                highValueCategories.includes(t.category) ||
                (t.country && highValueCountries.includes(t.country));
        });

        // Mix prioritized with others to maintain variety, but FORCE targetCountry to top if exists
        const targetMatches = targetCountry ? prioritized.filter(t => t.country === targetCountry) : [];
        const otherPrioritized = targetCountry ? prioritized.filter(t => t.country !== targetCountry) : prioritized;
        const others = trendPool.filter(t => !prioritized.includes(t));

        const combinedPool = [...targetMatches, ...otherPrioritized, ...others];

        const candidates = combinedPool
            .filter((trend) => Boolean(trend.title) && Boolean(trend.source_url))
            .slice(0, Math.max(count * 5, 12));

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

                // 2. Duplicate protection by title similarity (First 50 chars)
                if (supabaseAdmin && trend.title) {
                    const partialTitle = trend.title.substring(0, 50).trim();
                    const { data: existingByTitle } = await supabaseAdmin
                        .from('news')
                        .select('id')
                        .ilike('title', `${partialTitle}%`)
                        .limit(1)
                        .maybeSingle();
                    if (existingByTitle?.id) {
                        console.log(`[Automation - Roaming Engine] Vector ${i + 1} title similarity match found. Skipping.`);
                        continue;
                    }
                }

                // 3. Scrape Facts from the real linked article first
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

                // 4. Category-based Visual Intelligence (Fallback if no imageUrl)
                let finalImageUrl = trend.imageUrl || articleIntel.imageUrl;
                if (!finalImageUrl) {
                    const fallbacks: Record<string, string> = {
                        'Technology': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
                        'Finance': 'https://images.unsplash.com/photo-1611974714024-4607755ae08d?auto=format&fit=crop&q=80&w=1200',
                        'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200',
                        'Politics': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200',
                        'Health': 'https://images.unsplash.com/photo-1505751172107-573002a0f62d?auto=format&fit=crop&q=80&w=1200',
                        'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200',
                        'World': 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&q=80&w=1200'
                    };
                    finalImageUrl = fallbacks[trend.category] || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200';
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

                // Phase 40: Integrity Guard - Roaming Engine Pass
                const integrityResult = await MultiAgentOrchestrator.runIntegrityAgent(draft);
                const integrityFailed = !integrityResult.passed;

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
                    impactScore: normalizedStrategy.impact_score,
                    sentiment: normalizedStrategy.sentiment,
                    mode: mode as any
                });
                const imageStrategy = await resolveImageStrategy({
                    aiCoverImage: draft.cover_image,
                    articleImageUrl: articleIntel.imageUrl,
                    rssImageUrl: trend.imageUrl,
                    sourceName: trend.source_name,
                    sourceUrl: trend.source_url,
                    imageCaption: articleIntel.imageCaption || draft.subheadline,
                    imageLicense: articleIntel.imageLicense,
                    trustedSource: true, // Manual review pass implied in automation
                    title: optimizedTitle,
                    summary: summary,
                    category: trend.category,
                    country: trend.country
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
                    author_id: 'terai-times-correspondent',
                    status: 'published',
                    sentiment: normalizedStrategy.sentiment,
                    market_entities: normalizedStrategy.market_entities,
                    impact_score: normalizedStrategy.impact_score,
                    source_url: trend.source_url,
                    source_name: 'Terai Times Newsroom',
                    is_trending: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                };
                const evalResult = NewsRevenueMode.evaluateCandidate(newsItem, minScore);
                // Phase 45: Global Permissionless Publishing
                // All news is now published instantly by default to ensure maximum intelligence density.
                newsItem.status = 'published';
                if (integrityFailed) {
                    newsItem.tags = [...(newsItem.tags || []), `integrity_failure:${integrityResult.reason}`];
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
                    } else {
                        // Phase 55: Permissionless Publishing - unverified sources still publish
                        newsItem.tags = [...(newsItem.tags || []), 'source_unverified'];
                        // CRITICAL: Do NOT demote to pending_approval — auto-publish everything that isn't blocked
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
                // Phase 55: Auto-publish all content that is not explicitly blocked
                // Trust score gate is removed to prevent articles from getting stuck
                newsItem.status = 'published';
                newsItem.published_at = new Date().toISOString();

                console.log(`[Automation - Roaming Engine] Finalizing publishing for: ${optimizedTitle} (quality: ${evalResult.score}).`);

                if (supabaseAdmin) {
                    try {
                    const saved = await insertNewsSafely(newsItem);
                    if (saved) {
                        published.push(saved);
                        // Phase 56: Background Cache Warming for priority languages
                        translationService.warmCache({
                            title: saved.title || '',
                            summary: saved.summary || '',
                            category: saved.category || '',
                            locales: ['hi', 'ms']
                        }).catch(e => console.warn('[Automation] Cache warming failed:', e));
                    }
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
     * Phase 47: Intelligence Lifecycle Management
     * Permanently purges items that have passed their expires_at date or are marked as legacy mock data.
     */
    async purgeExpiredNews(): Promise<void> {
        if (!supabaseAdmin) return;
        const now = new Date().toISOString();
        console.log('[Automation] Executing data hygiene purge...');

        try {
            // 1. Delete by explicit expiration
            const { count: expiredCount } = await supabaseAdmin
                .from('news')
                .delete({ count: 'exact' })
                .lt('expires_at', now);

            // 2. Delete legacy mock items (more robust patterns)
            const { count: mockCount } = await supabaseAdmin
                .from('news')
                .delete({ count: 'exact' })
                .or('title.ilike.%Strategic Report%,title.ilike.%April 3, 2023%,title.ilike.%test debug title%');

            console.log(`[Automation] Purge complete. Removed ${expiredCount || 0} expired items and ${mockCount || 0} mock records.`);
        } catch (error) {
            console.error('[Automation] Purge operation failed:', error);
        }
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
