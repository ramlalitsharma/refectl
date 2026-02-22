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
            .replace(/<[^>]*>?/gm, '')
            .trim();
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

            let match;
            let limit = 0;
            while ((match = itemRegex.exec(xml)) !== null && limit < 5) {
                const itemBlock = match[1];
                const titleMatch = titleRegex.exec(itemBlock);
                const descMatch = descRegex.exec(itemBlock);

                if (titleMatch) {
                    const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1');
                    let desc = '';
                    if (descMatch) {
                        desc = descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1');
                        // Clean HTML from description
                        desc = this.cleanHtml(desc);
                    }
                    items.push(`Title: ${title}\nContext: ${desc}`);
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
