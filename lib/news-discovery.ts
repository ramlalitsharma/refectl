import { NewsCategory } from './models/News';
import { openai } from './openai';
import { AdvancedScraperService } from './news-scraper';

export interface DiscoveredTrend {
    title: string;
    link: string;
    source: string;
    pubDate: string;
    category?: NewsCategory;
    country?: import('./models/News').NewsCountry;
    score?: number; // 0-100 viral potential
}

const RSS_FEEDS: { url: string; source: string; defaultCategory: NewsCategory }[] = [
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', source: 'Google News', defaultCategory: 'World' as NewsCategory },
    { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', defaultCategory: 'Technology' as NewsCategory },
    { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', defaultCategory: 'Technology' as NewsCategory },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', defaultCategory: 'World' as NewsCategory },
    { url: 'https://www.wired.com/feed/rss', source: 'WIRED', defaultCategory: 'Technology' as NewsCategory }
];

export const NewsDiscoveryService = {
    /**
     * Fetches and parses RSS feeds to discover live trending topics.
     */
    async getLiveTrends(): Promise<DiscoveredTrend[]> {
        const discovered: DiscoveredTrend[] = [];

        const outputs = await Promise.allSettled(
            RSS_FEEDS.map(async (feed) => {
                try {
                    const response = await fetch(feed.url, {
                        cache: 'no-store',
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
                    });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const text = await response.text();

                    // Lightweight XML parsing for titles and links
                    const items = this.parseRssItems(text, feed.source, feed.defaultCategory);
                    return items;
                } catch (error) {
                    console.error(`[Discovery] Failed to fetch feed ${feed.source}:`, error);
                    return [];
                }
            })
        );

        outputs.forEach((result) => {
            if (result.status === 'fulfilled') {
                discovered.push(...result.value);
            }
        });

        // 2. Fetch from Advanced Scrapers (Phase 18)
        try {
            const scrapedTrends = await AdvancedScraperService.scrapeTrends();
            discovered.push(...scrapedTrends);
        } catch (error) {
            console.error('[Discovery] Scraping step failed:', error);
        }

        // Remove duplicates and sort by date (newest first)
        return discovered
            .filter((v, i, a) => a.findIndex(t => t.title === v.title) === i)
            .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
            .slice(0, 50); // Increased pool size for intelligence hub
    },

    /**
     * Elite Scoring via Free-Tier Switchboard (OpenRouter Logic)
     * Preserves OpenAI quota by using free models for high-frequency discovery tasks.
     */
    async scoreAndFilterTrends(trends: DiscoveredTrend[]): Promise<DiscoveredTrend[]> {
        if (trends.length === 0) return [];

        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const prompt = `
            Score the following news headlines from 0 to 100 based on:
            1. Global viral potential (will people share this?)
            2. Impact (does it change the world/industry?)
            3. Recency/Urgency

            Return a JSON object with a "scores" array containing objects with "title" and "score".
            
            Headlines:
            ${trends.map(t => `- ${t.title}`).join('\n')}
        `;

        try {
            let jsonResponse: any = null;

            // 1. Try OpenRouter Free Models First
            if (openRouterKey) {
                console.log('[Discovery] Scoring via OpenRouter (Zero-Cost Optimization)...');
                const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openRouterKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://teraitimes.refectl.com',
                        'X-Title': 'Terai Times Discovery Engine'
                    },
                    body: JSON.stringify({
                        model: 'google/gemma-2-9b-it:free', // Default free king
                        messages: [
                            { role: 'system', content: 'You are an elite news editor. Output valid JSON only.' },
                            { role: 'user', content: prompt }
                        ],
                        response_format: { type: 'json_object' }
                    })
                });

                if (orResponse.ok) {
                    const data = await orResponse.json();
                    jsonResponse = JSON.parse(data.choices[0]?.message?.content || '{"scores": []}');
                }
            }

            // 2. Fallback to OpenAI if OpenRouter failed or no key
            if (!jsonResponse && openai) {
                console.log('[Discovery] Falling back to OpenAI (Premium Segment)...');
                const resp = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are an elite news editor.' },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: 'json_object' }
                });
                jsonResponse = JSON.parse(resp.choices[0]?.message?.content || '{"scores": []}');
            }

            if (!jsonResponse) throw new Error('All scoring providers failed');

            const scores = jsonResponse.scores || [];
            const scoredTrends = trends.map(t => {
                const scoreItem = scores.find((s: any) => s.title === t.title);
                return { ...t, score: scoreItem ? scoreItem.score : 50 };
            });

            return scoredTrends
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .slice(0, 12); // Return top 12 viral stars
        } catch (error) {
            console.error('[Discovery] Scoring failed, returning generic pool:', error);
            return trends.slice(0, 10).map(t => ({ ...t, score: 50 })); // Ensure always returns scored objects
        }
    },

    parseRssItems(xml: string, source: string, defaultCategory: NewsCategory): DiscoveredTrend[] {
        const items: DiscoveredTrend[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const titleRegex = /<title>([\s\S]*?)<\/title>/;
        const linkRegex = /<link>([\s\S]*?)<\/link>/;
        const dateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;

        let match;
        while ((match = itemRegex.exec(xml)) !== null) {
            const content = match[1];
            const titleMatch = titleRegex.exec(content);
            const linkMatch = linkRegex.exec(content);
            const dateMatch = dateRegex.exec(content);

            if (titleMatch && linkMatch) {
                items.push({
                    title: this.cleanText(titleMatch[1]),
                    link: linkMatch[1].trim(),
                    source,
                    pubDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
                    category: defaultCategory
                });
            }
        }
        return items;
    },

    cleanText(text: string): string {
        return text
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remove CDATA
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/<[^>]*>?/gm, '') // Remove any HTML tags
            .trim();
    }
};
