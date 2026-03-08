import { NewsCategory } from './models/News';
import { DiscoveredTrend } from './news-discovery';

export interface ScrapeTarget {
    url: string;
    source: string;
    category: NewsCategory;
    country?: import('./models/News').NewsCountry; // Assign scraped news to a specific country filter
    // Simple patterns to find titles/links in HTML if regex is used
    titlePattern: RegExp;
    linkPattern: RegExp;
}

export type ArticleMediaIntelligence = {
    snapshot: string;
    headline?: string;
    imageUrl?: string;
    imageCredit?: string;
    imageCaption?: string;
    imageLicense?: 'partner' | 'creative_commons' | 'public_domain' | 'unknown';
};

const SCRAPE_TARGETS: ScrapeTarget[] = [
    {
        url: 'https://www.bbc.com/news',
        source: 'BBC News Hub',
        category: 'World',
        country: 'UK',
        titlePattern: /"title":"([^"]+)"/g,
        linkPattern: /"href":"([^"]+)"/g
    },
    {
        url: 'https://www.aljazeera.com/news/',
        source: 'Al Jazeera',
        category: 'World',
        country: 'UAE',
        titlePattern: /<h3[^>]*><span>([^<]+)<\/span>/g,
        linkPattern: /<a[^>]*href="([^"]+)"[^{]*class="u-clickable-card__link"/g
    },
    {
        url: 'https://www.cnn.com/world',
        source: 'CNN Global',
        category: 'World',
        country: 'USA',
        titlePattern: /"headline":"([^"]+)"/g,
        linkPattern: /"url":"([^"]+)"/g
    },
    {
        url: 'https://www.businessinsider.com/international',
        source: 'Business Insider',
        category: 'Finance',
        country: 'Global',
        titlePattern: /"title":"([^"]+)"/g,
        linkPattern: /"url":"([^"]+)"/g
    },
    {
        url: 'https://www.newscientist.com/section/news/',
        source: 'New Scientist',
        category: 'Technology',
        country: 'Global',
        titlePattern: /<h3[^>]*><a[^>]*>([^<]+)<\/a><\/h3>/g,
        linkPattern: /<h3[^>]*><a[^>]*href="([^"]+)"/g
    },
    {
        url: 'https://www.nationalgeographic.com/pages/topic/latest-stories',
        source: 'National Geographic',
        category: 'Environment',
        country: 'Global',
        titlePattern: /"title":"([^"]+)"/g,
        linkPattern: /"url":"([^"]+)"/g
    },
    {
        url: 'https://www.theguardian.com/world',
        source: 'The Guardian',
        category: 'World',
        country: 'UK',
        titlePattern: /"headline":"([^"]+)"/g,
        linkPattern: /"url":"([^"]+)"/g
    },
    {
        url: 'https://www.un.org/news/',
        source: 'UN News Hub',
        category: 'World',
        country: 'Global',
        titlePattern: /<h1[^>]*><span>([^<]+)<\/span>/g,
        linkPattern: /<a[^>]*href="([^"]+)"[^{]*class="u-link"/g
    }
];

export const AdvancedScraperService = {
    /**
     * Scrapes multiple news hubs directly from HTML.
     */
    async scrapeTrends(): Promise<DiscoveredTrend[]> {
        const discovered: DiscoveredTrend[] = [];

        await Promise.allSettled(
            SCRAPE_TARGETS.map(async (target) => {
                try {
                    const response = await fetch(target.url, {
                        cache: 'no-store',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    if (!response.ok) throw new Error(`Fetch failed for ${target.source}`);

                    const html = await response.text();
                    const items = this.extractFromHtml(html, target);
                    discovered.push(...items);
                } catch (error) {
                    console.error(`[Scraper] Failed to scrape ${target.source}:`, error);
                }
            })
        );

        return discovered;
    },

    /**
     * Extracts headlines and links using regex patterns.
     */
    extractFromHtml(html: string, target: ScrapeTarget): DiscoveredTrend[] {
        const items: DiscoveredTrend[] = [];
        const titles: string[] = [];
        const links: string[] = [];

        let titleMatch;
        while ((titleMatch = target.titlePattern.exec(html)) !== null) {
            titles.push(this.cleanHtml(titleMatch[1]));
        }

        let linkMatch;
        while ((linkMatch = target.linkPattern.exec(html)) !== null) {
            let url = linkMatch[1];
            if (url.startsWith('/')) {
                const base = new URL(target.url).origin;
                url = base + url;
            }
            links.push(url);
        }

        // Pair them up (limited to top 15 per source)
        const count = Math.min(titles.length, links.length, 15);
        for (let i = 0; i < count; i++) {
            if (titles[i].length > 10 && links[i].includes('http')) {
                items.push({
                    title: titles[i],
                    link: links[i],
                    source: target.source,
                    pubDate: new Date().toISOString(),
                    category: target.category,
                    country: target.country
                } as DiscoveredTrend);
            }
        }

        return items;
    },

    cleanHtml(text: string): string {
        return text
            .replace(/\\u0027/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;|&#39;|&apos;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<[^>]*>?/gm, '')
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
            .map((m) => this.cleanHtml(m[1] || ''))
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
