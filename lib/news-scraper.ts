import { NewsCategory } from './models/News';
import { DiscoveredTrend } from './news-discovery';
import Parser from 'rss-parser';

export interface ScrapeTarget {
    url: string;
    source: string;
    category: NewsCategory;
    country?: import('./models/News').NewsCountry;
}

export type ArticleMediaIntelligence = {
    snapshot: string;
    headline?: string;
    imageUrl?: string;
    imageCredit?: string;
    imageCaption?: string;
    imageLicense?: 'partner' | 'creative_commons' | 'public_domain' | 'unknown';
};

// Global Authentic RSS Feeds for enterprise resilience
const SCRAPE_TARGETS: ScrapeTarget[] = [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News Global', category: 'World', country: 'Global' },
    { url: 'http://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business', category: 'Finance', country: 'Global' },
    { url: 'https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en', source: 'Google Tech Intelligence', category: 'Technology', country: 'USA' },
    { url: 'https://news.google.com/rss/search?q=finance+economy&hl=en-US&gl=US&ceid=US:en', source: 'Google Trade Data', category: 'Finance', country: 'Global' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera Global', category: 'World', country: 'UAE' },
    { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR World', category: 'World', country: 'USA' },
    { url: 'https://news.google.com/rss/search?q=science+nature&hl=en-US&gl=US&ceid=US:en', source: 'Science Journal', category: 'Science', country: 'Global' }
];

export const AdvancedScraperService = {
    /**
     * Scrapes multiple news hubs securely using Enterprise RSS endpoints.
     */
    async scrapeTrends(): Promise<DiscoveredTrend[]> {
        const discovered: DiscoveredTrend[] = [];
        const parser = new Parser({
            customFields: {
                item: ['media:content', 'media:thumbnail', 'description', 'pubDate'],
            }
        });

        await Promise.allSettled(
            SCRAPE_TARGETS.map(async (target) => {
                try {
                    const feed = await parser.parseURL(target.url);
                    
                    const items = (feed.items || []).slice(0, 15).map(item => {
                        const title = this.cleanHtml(item.title || '');
                        const description = this.cleanHtml(item.description || '');
                        
                        // Intelligent Enrichment: Auto-detect if generic
                        let category = target.category;
                        let country = target.country;

                        if (!category || category === 'World' || category === 'Business') {
                            category = this.inferCategory(title, description);
                        }
                        if (!country || country === 'Global') {
                            country = this.inferCountry(title, description);
                        }

                        return {
                            title,
                            link: item.link || '',
                            source: target.source,
                            pubDate: item.pubDate || new Date().toISOString(),
                            category,
                            country,
                            score: this.calculateVectorScore(title)
                        } as DiscoveredTrend & { score: number };
                    });

                    // Filter low value and push top 8
                    const topItems = items
                        .filter(i => i.title.length > 20 && i.link.startsWith('http'))
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 8);

                    discovered.push(...topItems);
                } catch (error) {
                    console.error(`[Scraper] RSS Fetch failed for ${target.source}:`, error);
                }
            })
        );

        // Deduplicate globally across sources by title and url
        const unique = new Map<string, DiscoveredTrend>();
        discovered.forEach(item => {
            const key = item.title.toLowerCase().trim();
            if (!unique.has(key)) {
                unique.set(key, item);
            }
        });

        return Array.from(unique.values()).sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    },

    calculateVectorScore(title: string): number {
        let score = 50;
        const lower = title.toLowerCase();

        // High priority vectors
        const HIGH_IMPACT = ['crisis', 'market', 'announce', 'launch', 'unveil', 'president', 'global', 'economy', 'breakthrough', 'AI', 'summit', 'war', 'deal', 'historic'];
        HIGH_IMPACT.forEach(k => { if (lower.includes(k)) score += 12; });

        // Decrease score for soft news / low priority
        const SOFT_NEWS = ['review', 'deals', 'opinion', 'column', 'celebrity', 'gossip', 'horoscope', 'recipe'];
        SOFT_NEWS.forEach(k => { if (lower.includes(k)) score -= 20; });

        // Penalize extremely short or long titles
        if (title.length < 30) score -= 15;
        if (title.length > 120) score -= 10;

        return score;
    },

    /**
     * Linguistic Intelligence: Infers a more specific category if the source is generic.
     */
    inferCategory(title: string, content: string): NewsCategory {
        const text = `${title} ${content}`.toLowerCase();
        
        const KEYWORDS: Record<NewsCategory, string[]> = {
            'Finance': ['market', 'stock', 'inflation', 'trade', 'bank', 'finance', 'economy', 'gdp', 'fed', 'rate', 'dollar', 'crypto', 'btc', 'budget', 'earnings', 'quarterly'],
            'Sports': ['cricket', 'match', 'ipl', 'football', 'fifa', 'league', 'score', 'match', 'trophy', 'stadium', 'athlete', 'olympics', 'nba', 'tennis', 'tournament', 'world cup'],
            'Technology': ['ai', 'tech', 'software', 'app', 'gadget', 'silicon', 'cyber', 'meta', 'google', 'apple', 'startup', 'openai', 'llm', 'chip', 'robotics'],
            'Politics': ['election', 'vote', 'politics', 'government', 'president', 'summit', 'policy', 'minister', 'opposition', 'diplomatic', 'nato', 'un', 'legislation'],
            'Environment': ['climate', 'nature', 'sustainable', 'warming', 'forest', 'energy', 'solar', 'pollution', 'carbon', 'earth', 'ocean', 'ecology'],
            'Health': ['health', 'medical', 'virus', 'doctor', 'hospital', 'science', 'research', 'dna', 'vaccine', 'outbreak', 'cancer', 'pandemic', 'wellness'],
            'Science': ['science', 'research', 'space', 'nasa', 'universe', 'planet', 'expert', 'discovery', 'gene', 'lab', 'physics', 'astronomy'],
            'World': ['conflict', 'international', 'diplomatic', 'border', 'global', 'summit', 'war', 'tensions'],
            'Business': ['company', 'ceo', 'industry', 'brand', 'commercial', 'startup', 'venture'],
            'Education': ['school', 'university', 'student', 'learning', 'research', 'academy']
        };

        for (const [cat, keywords] of Object.entries(KEYWORDS)) {
            if (keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(text))) return cat as NewsCategory;
        }

        return 'World';
    },

    /**
     * Geographic Intelligence: Detects the specific country from title/content tokens.
     */
    inferCountry(title: string, content: string): import('./models/News').NewsCountry {
        const text = `${title} ${content}`.toLowerCase();

        const GEO_TOKENS: Record<string, string[]> = {
            'Nepal': ['nepal', 'kathmandu', 'pokhara', 'everest', 'oli', 'prachanda', 'biratnagar', 'lalitpur'],
            'Serbia': ['serbia', 'belgrade', 'vucic', 'balkan', 'niš', 'nis', 'novi sad', 'dinar'],
            'India': ['india', 'modi', 'delhi', 'mumbai', 'bengaluru', 'chennai', 'bollywood', 'cricket', 'gandhi', 'rupee'],
            'China': ['china', 'beijing', 'shanghai', 'xi jinping', 'yuan', 'alibaba', 'tencent', 'hong kong'],
            'Japan': ['japan', 'tokyo', 'yen', 'kishida', 'osaka', 'kyoto'],
            'Russia': ['russia', 'moscow', 'putin', 'kremlin', 'ukraine', 'ruble'],
            'Ukraine': ['ukraine', 'kyiv', 'zelensky', 'kharkiv'],
            'Germany': ['germany', 'berlin', 'scholz', 'munich', 'hamburg', 'euro'],
            'France': ['france', 'paris', 'macron', 'marseille', 'lyon'],
            'UAE': ['uae', 'dubai', 'abu dhabi', 'emirates'],
            'Saudi Arabia': ['saudi', 'riyadh', 'jeddah', 'bin salman'],
            'South Africa': ['south africa', 'ramaphosa', 'cape town', 'johannesburg'],
            'Nigeria': ['nigeria', 'abuja', 'lagos', 'tinubu'],
            'Brazil': ['brazil', 'lula', 'rio', 'sao paulo'],
            'Mexico': ['mexico', 'obrador', 'mexico city'],
            'Australia': ['australia', 'canberra', 'sydney', 'melbourne', 'albanese'],
            'USA': ['usa', 'america', 'washington', 'biden', 'trump', 'congress', 'new york', 'california', 'dollar'],
            'UK': ['uk', 'britain', 'london', 'sunak', 'king charles', 'bbc', 'manchester', 'pound']
        };

        // Priority Check: Try to find specific mentioned countries first
        for (const [country, tokens] of Object.entries(GEO_TOKENS)) {
            if (tokens.some(t => new RegExp(`\\b${t}\\b`, 'i').test(text))) return country as any;
        }

        return 'Global';
    },

    cleanHtml(text: string): string {
        if (!text) return '';
        return text
            .replace(/\\u0027/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;|&#39;|&apos;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            // Aggressive JSON/Object detection (balanced-like approach for nested structures)
            .replace(/\{"[\s\S]*?"uri"[\s\S]*?\}/gi, '')
            .replace(/\{"[\s\S]*?"url"[\s\S]*?\}/gi, '')
            .replace(/\{"[\s\S]*?"title"[\s\S]*?\}/gi, '')
            .replace(/\{"[\s\S]*?[\{\[][\s\S]*?[\}\]][\s\S]*?\}/g, '') // Nested objects
            .replace(/\{"[\s\S]*?"\}/g, '')
            .replace(/\[\{[\s\S]*?\}\]/g, '')
            // System Markers & Robotic Artifacts
            .replace(/\[Intelligence Truncated\]/gi, '')
            .replace(/\*Journalistic Note:[\s\S]*?\*/gi, '')
            .replace(/## Intelligence Briefing/gi, '')
            .replace(/## Executive Brief/gi, '')
            .replace(/Executive Brief:/gi, '')
            .replace(/Autonomous intelligence gathering[\s\S]*?global sources\./gi, '')
            .replace(/This synthesized report provides raw factual anchors[\s\S]*?sources\./gi, '')
            .replace(/This report was synthesized using the Terai Times Deterministic Sanitizer protocol/gi, '')
            // Media Credits & Attribution Bloat
            .replace(/[A-Z][a-z]+\s[A-Z][a-z]+\/(Getty Images|AFP|Reuters|AP|CNN|BBC)/gi, '')
            .replace(/(Getty Images|AFP|Reuters|AP|CNN|BBC)\sLive Updates/gi, '')
            .replace(/By\s([A-Z][a-z]+\s?,?\s?){1,5},?\s?(and\s[A-Z][a-z]+\s[A-Z][a-z]+)?/gi, '')
            .replace(/Live Updates[\s\S]*?En español/gi, '')
            // Broken HTML attribute leaks & Nested JSON
            .replace(/\{"[\s\S]*?"(uri|url|small|big|medium)"[\s\S]*?\}/gi, '')
            .replace(/data-[a-z0-9-]+=".*?"/gi, '')
            .replace(/data-[a-z0-9-]+='.*?'/gi, '')
            .replace(/data-[a-z0-9-]+=[^\s>]*/gi, '')
            .replace(/video-id=[^\s>]*/gi, '')
            // Final pass: Remove remaining HTML tags
            .replace(/<[^>]*>?/gm, '')
            // Collapse multiple spaces/newlines
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Deep neural scrubber for article bodies.
     */
    scrubMetadata(text: string): string {
        if (!text) return '';
        return text
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            // Target specific JSON leakage patterns observed in CNN/BBC RSS
            .replace(/\{"big":\s*\{.*\}\}/gi, '')
            .replace(/\{"small":\s*\{.*\}\}/gi, '')
            .replace(/Image Briefing.*?Link Copied!/gi, '')
            .replace(/Source:\s*CNN/gi, '')
            .replace(/Updated\s*\d+:\d+\s*[AP]M\s*EDT.*?Link\s*Copied!/gi, '')
            .replace(/\s*[A-Z0-9-]+\.jpg\?[a-z0-9=&_]+/gi, '')
            .replace(/\s*([a-z0-9-]+)\s*:\s*{\s*"url"\s*:\s*".*?"\s*}/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    },

    extractMetaContent(html: string, patterns: RegExp[]): string {
        for (const pattern of patterns) {
            const match = pattern.exec(html);
            if (match?.[1]) {
                return this.cleanHtml(match[1]);
            }
        }
        return '';
    },

    resolveAbsoluteUrl(baseUrl: string, value?: string): string {
        if (!value) return '';
        try {
            return new URL(value, baseUrl).toString();
        } catch {
            return '';
        }
    },

    inferImageLicense(imageUrl?: string, articleUrl?: string): 'partner' | 'creative_commons' | 'public_domain' | 'unknown' {
        const subject = `${imageUrl || ''} ${articleUrl || ''}`.toLowerCase();
        if (!subject) return 'unknown';
        if (/creativecommons|cc-by|cc by|publicdomain|public-domain/.test(subject)) return 'creative_commons';
        if (/unsplash\.com|pexels\.com|pixabay\.com/.test(subject)) return 'partner';
        if (/wikimedia\.org|wikipedia\.org|nasa\.gov|unspash/.test(subject)) return 'public_domain';
        return 'unknown';
    },

    extractArticleIntelligenceFromHtml(html: string, url: string): ArticleMediaIntelligence {
        const normalized = html
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

        const paragraphs = Array.from(normalized.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
            .map((m) => this.scrubMetadata(this.cleanHtml(m[1] || '')))
            .map((p) => p.replace(/\s+/g, ' ').trim())
            .filter((p) => p.length >= 90)
            .filter((p) => !/cookie|subscribe|sign up|advertis|newsletter/i.test(p))
            .slice(0, 10);

        const snapshot = paragraphs.join('\n\n').slice(0, 3500);
        const headline = this.extractMetaContent(normalized, [
            /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
            /<title[^>]*>([\s\S]*?)<\/title>/i,
            /<h1[^>]*>([\s\S]*?)<\/h1>/i,
        ]);

        const imageRaw = this.extractMetaContent(normalized, [
            /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
            /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
        ]);
        const imageCredit = this.extractMetaContent(normalized, [
            /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i,
        ]);
        const imageCaption = this.extractMetaContent(normalized, [
            /<meta[^>]+property=["']og:image:alt["'][^>]+content=["']([^"']+)["']/i,
            /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i,
        ]);

        const imageUrl = this.resolveAbsoluteUrl(url, imageRaw);
        const imageLicense = this.inferImageLicense(imageUrl, url);

        return {
            snapshot,
            headline: headline || undefined,
            imageUrl: imageUrl || undefined,
            imageCredit: imageCredit || undefined,
            imageCaption: imageCaption || undefined,
            imageLicense,
        };
    },

    async extractArticleSnapshot(url: string): Promise<string> {
        if (!url || !/^https?:\/\//i.test(url)) return '';
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 9000);
            const response = await fetch(url, {
                cache: 'no-store',
                redirect: 'follow',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
                }
            });
            clearTimeout(timeout);

            if (!response.ok) return '';
            const html = await response.text();

            return this.extractArticleIntelligenceFromHtml(html, url).snapshot;
        } catch {
            return '';
        }
    },

    async extractArticleIntelligence(url: string): Promise<ArticleMediaIntelligence> {
        if (!url || !/^https?:\/\//i.test(url)) return { snapshot: '' };
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 9000);
            const response = await fetch(url, {
                cache: 'no-store',
                redirect: 'follow',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
                }
            });
            clearTimeout(timeout);
            if (!response.ok) return { snapshot: '' };
            const html = await response.text();
            return this.extractArticleIntelligenceFromHtml(html, url);
        } catch {
            return { snapshot: '' };
        }
    },

    /**
     * TARGETED SCRAPING (Phase 25)
     * Fetches the latest highly-targeted news snippets from Google News RSS based on a specific query.
     * Returns a fused "Briefing Context" string to be fed directly to the AI writer.
     */
    async scrapeTargetedNews(query: string): Promise<string> {
        console.log(`[Targeted Scraper] Initializing targeted scan for: "${query}"`);

        try {
            const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' when:24h')}&hl=en-US&gl=US&ceid=US:en`;
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`Google News RSS fetch failed: ${response.statusText}`);
            }

            const xml = await response.text();

            // Very simple regex parsing for RSS tags to avoid heavy xml parsing libraries for now
            const items = [];
            const itemRegex = /<item>([\s\S]*?)<\/item>/g;
            const titleRegex = /<title>(.*?)<\/title>/;
            const descRegex = /<description>([\s\S]*?)<\/description>/;
            const linkRegex = /<link>([\s\S]*?)<\/link>/;
            const sourceRegex = /<source[^>]*>([\s\S]*?)<\/source>/;
            const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;

            let match;
            let limit = 0;
            while ((match = itemRegex.exec(xml)) !== null && limit < 8) {
                const itemBlock = match[1];
                const titleMatch = titleRegex.exec(itemBlock);
                const descMatch = descRegex.exec(itemBlock);
                const linkMatch = linkRegex.exec(itemBlock);
                const sourceMatch = sourceRegex.exec(itemBlock);
                const pubDateMatch = pubDateRegex.exec(itemBlock);

                if (titleMatch) {
                    const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1');
                    let desc = '';
                    if (descMatch) {
                        desc = descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1');
                        // Clean HTML from description
                        desc = this.cleanHtml(desc);
                    }
                    const link = linkMatch?.[1]?.trim() || '';
                    const source = this.cleanHtml((sourceMatch?.[1] || '').replace(/<!\[CDATA\[(.*?)\]\]>/, '$1'));
                    const publishedAt = this.cleanHtml(pubDateMatch?.[1] || '');
                    const articleSnapshot = await this.extractArticleSnapshot(link);

                    items.push([
                        `Title: ${title}`,
                        source ? `Source: ${source}` : '',
                        publishedAt ? `Published: ${publishedAt}` : '',
                        link ? `URL: ${link}` : '',
                        `Context: ${desc}`,
                        articleSnapshot ? `Article Snapshot:\n${articleSnapshot}` : ''
                    ].filter(Boolean).join('\n'));
                    limit++;
                }
            }

            if (items.length === 0) {
                return 'No direct news events found for this specific query in the last 24 hours.';
            }

            const fusedContext = `TARGETED NEWS BRIEFING FOR "${query}" (Last 24 Hours):\n\n` + items.join('\n\n---\n\n');
            console.log(`[Targeted Scraper] Successfully extracted ${items.length} factual anchors.`);
            return fusedContext;

        } catch (error) {
            console.error('[Targeted Scraper] Failed:', error);
            throw new Error('Failed to retrieve targeted factual anchors from the web.');
        }
    }
};
