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

// Global Authentic RSS Feeds — Worldwide Coverage Matrix
const SCRAPE_TARGETS: ScrapeTarget[] = [
    // ── GLOBAL / WORLD ─────────────────────────────────────────────
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'World', country: 'Global' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'World', country: 'Global' },
    { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR World', category: 'World', country: 'Global' },
    { url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', source: 'Google Top Stories', category: 'World', country: 'Global' },

    // ── USA ─────────────────────────────────────────────────────────
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times World', category: 'World', country: 'USA' },
    { url: 'https://feeds.washingtonpost.com/rss/world', source: 'Washington Post', category: 'Politics', country: 'USA' },
    { url: 'https://www.cbsnews.com/latest/rss/world', source: 'CBS News World', category: 'World', country: 'USA' },
    { url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', source: 'Wall Street Journal', category: 'Finance', country: 'USA' },
    { url: 'https://news.google.com/rss/search?q=USA+breaking+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Google USA News', category: 'Politics', country: 'USA' },

    // ── UK ─────────────────────────────────────────────────────────
    { url: 'http://feeds.bbci.co.uk/news/uk/rss.xml', source: 'BBC UK', category: 'World', country: 'UK' },
    { url: 'https://www.theguardian.com/uk/rss', source: 'The Guardian UK', category: 'World', country: 'UK' },
    { url: 'https://news.google.com/rss/search?q=UK+Britain+news+today&hl=en-GB&gl=GB&ceid=GB:en', source: 'Google UK News', category: 'World', country: 'UK' },

    // ── INDIA ───────────────────────────────────────────────────────
    { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', source: 'NDTV India', category: 'World', country: 'India' },
    { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', source: 'Hindustan Times', category: 'Politics', country: 'India' },
    { url: 'https://news.google.com/rss/search?q=India+news+today&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google India News', category: 'World', country: 'India' },
    { url: 'https://news.google.com/rss/search?q=Modi+India+economy+2025&hl=en-IN&gl=IN&ceid=IN:en', source: 'India Economy', category: 'Finance', country: 'India' },

    // ── CHINA ───────────────────────────────────────────────────────
    { url: 'https://news.google.com/rss/search?q=China+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Google China News', category: 'World', country: 'China' },

    // ── MIDDLE EAST ─────────────────────────────────────────────────
    { url: 'https://news.google.com/rss/search?q=Middle+East+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Middle East Wire', category: 'World', country: 'UAE' },

    // ── EUROPE ──────────────────────────────────────────────────────
    { url: 'https://news.google.com/rss/search?q=Europe+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Google Europe News', category: 'World', country: 'Germany' },
    { url: 'https://news.google.com/rss/search?q=France+news+Macron+2025&hl=fr-FR&gl=FR&ceid=FR:fr', source: 'France News', category: 'Politics', country: 'France' },
    { url: 'https://news.google.com/rss/search?q=Russia+Ukraine+war+news+2025&hl=en-US&gl=US&ceid=US:en', source: 'Russia Ukraine', category: 'World', country: 'Russia' },

    // ── SOUTH ASIA ──────────────────────────────────────────────────
    { url: 'https://news.google.com/rss/search?q=Nepal+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Google Nepal News', category: 'World', country: 'Nepal' },
    { url: 'https://news.google.com/rss/search?q=Bangladesh+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Bangladesh News', category: 'World', country: 'Bangladesh' },

    // ── AFRICA ──────────────────────────────────────────────────────
    { url: 'https://news.google.com/rss/search?q=Africa+Nigeria+South+Africa+news+2025&hl=en-US&gl=US&ceid=US:en', source: 'Africa Wire', category: 'World', country: 'Nigeria' },

    // ── TECHNOLOGY (GLOBAL) ─────────────────────────────────────────
    { url: 'https://feeds.feedburner.com/TechCrunch', source: 'TechCrunch', category: 'Technology', country: 'USA' },
    { url: 'https://www.wired.com/feed/rss', source: 'Wired', category: 'Technology', country: 'Global' },
    { url: 'https://news.google.com/rss/search?q=AI+technology+news+2025&hl=en-US&gl=US&ceid=US:en', source: 'AI Tech News', category: 'Technology', country: 'Global' },

    // ── FINANCE / MARKETS ───────────────────────────────────────────
    { url: 'http://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business', category: 'Finance', country: 'Global' },
    { url: 'https://news.google.com/rss/search?q=global+stock+market+finance+2025&hl=en-US&gl=US&ceid=US:en', source: 'Markets Wire', category: 'Finance', country: 'Global' },

    // ── SPORTS ──────────────────────────────────────────────────────
    { url: 'http://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', category: 'Sports', country: 'Global' },
    { url: 'https://news.google.com/rss/search?q=cricket+football+sports+news+2025&hl=en-US&gl=US&ceid=US:en', source: 'Sports Wire', category: 'Sports', country: 'Global' },

    // ── SCIENCE / HEALTH ────────────────────────────────────────────
    { url: 'https://news.google.com/rss/search?q=science+space+discovery+2025&hl=en-US&gl=US&ceid=US:en', source: 'Science Wire', category: 'Science', country: 'Global' },
    { url: 'https://news.google.com/rss/search?q=health+medical+research+2025&hl=en-US&gl=US&ceid=US:en', source: 'Health Wire', category: 'Health', country: 'Global' },
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

                        // Extract image from media:content or media:thumbnail
                        let imageUrl = '';
                        const mediaContent = (item as any)['media:content'];
                        const mediaThumbnail = (item as any)['media:thumbnail'];

                        if (mediaContent && mediaContent.$ && mediaContent.$.url) {
                            imageUrl = mediaContent.$.url;
                        } else if (mediaThumbnail && mediaThumbnail.$ && mediaThumbnail.$.url) {
                            imageUrl = mediaThumbnail.$.url;
                        }

                        return {
                            title,
                            link: item.link || '',
                            source: target.source,
                            pubDate: item.pubDate || new Date().toISOString(),
                            category,
                            country,
                            imageUrl,
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
        
        const KEYWORDS: Partial<Record<NewsCategory, string[]>> = {
            'Finance': ['market', 'stock', 'inflation', 'trade', 'bank', 'finance', 'economy', 'gdp', 'fed', 'rate', 'dollar', 'crypto', 'btc', 'budget', 'earnings', 'quarterly'],
            'Sports': ['cricket', 'match', 'ipl', 'football', 'fifa', 'league', 'score', 'trophy', 'stadium', 'athlete', 'olympics', 'nba', 'tennis', 'tournament', 'world cup', 'runs', 'wicket', 'wickets', 'overs', 'innings', 'bowled', 'batting', 'toss', 'pitch', 'goal'],
            'Technology': ['ai', 'tech', 'software', 'app', 'gadget', 'silicon', 'cyber', 'meta', 'google', 'apple', 'startup', 'openai', 'llm', 'chip', 'robotics'],
            'Politics': ['election', 'vote', 'politics', 'government', 'president', 'summit', 'policy', 'minister', 'opposition', 'diplomatic', 'nato', 'un', 'legislation', 'parliament', 'senate', 'congress'],
            'Environment': ['climate', 'nature', 'sustainable', 'warming', 'forest', 'energy', 'solar', 'pollution', 'carbon', 'earth', 'ocean', 'ecology'],
            'Health': ['health', 'medical', 'virus', 'doctor', 'hospital', 'science', 'research', 'dna', 'vaccine', 'outbreak', 'cancer', 'pandemic', 'wellness'],
            'Science': ['science', 'research', 'space', 'nasa', 'universe', 'planet', 'expert', 'discovery', 'gene', 'lab', 'physics', 'astronomy'],
            'World': ['conflict', 'international', 'diplomatic', 'border', 'global', 'summit', 'war', 'tensions', 'treaty', 'military', 'army', 'troops'],
            'Business': ['company', 'ceo', 'industry', 'brand', 'commercial', 'startup', 'venture', 'corporate', 'merger'],
            'Education': ['school', 'university', 'student', 'learning', 'research', 'academy', 'college', 'exam']
        };

        let bestCategory: NewsCategory = 'World';
        let maxScore = 0;

        for (const [cat, keywords] of Object.entries(KEYWORDS)) {
            let score = 0;
            for (const k of keywords) {
                // Accumulate confidence score for each category
                if (new RegExp(`\\b${k}\\b`, 'i').test(text)) {
                    score += 1;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestCategory = cat as NewsCategory;
            }
        }

        // Require at least one strong contextual signal; otherwise default to World
        return maxScore > 0 ? bestCategory : 'World';
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
            'UK': ['uk', 'britain', 'london', 'sunak', 'king charles', 'bbc', 'manchester', 'pound'],
            // New Additions from Global Intelligence Grid
            'Bangladesh': ['bangladesh', 'dhaka', 'hasina', 'chittagong', 'taka'],
            'Pakistan': ['pakistan', 'islamabad', 'lahore', 'karachi', 'shehbaz', 'imran khan'],
            'Sri Lanka': ['sri lanka', 'colombo', 'wickremesinghe', 'kandy'],
            'Norway': ['norway', 'oslo', 'krone', 'støre'],
            'Switzerland': ['switzerland', 'bern', 'zurich', 'geneva', 'franc'],
            'Canada': ['canada', 'ottawa', 'trudeau', 'toronto', 'vancouver'],
            'Argentina': ['argentina', 'buenos aires', 'milei', 'peso'],
            'Egypt': ['egypt', 'cairo', 'sisi', 'nile']
        };

        // Priority Check: Try to find specific mentioned countries first
        for (const [country, tokens] of Object.entries(GEO_TOKENS)) {
            if (tokens.some(t => new RegExp(`\\b${t}\\b`, 'i').test(text))) return country as any;
        }

        return 'Global';
    },

    cleanHtml(text: string): string {
        if (!text) return '';
        
        let cleaned = text
            // 1. STRIP MARKDOWN AND SYSTEM MARKERS FIRST (while newlines exist)
            .replace(/^#+ /gm, '') 
            .replace(/## Intelligence Briefing/gi, '')
            .replace(/## Executive Brief/gi, '')
            .replace(/Executive Brief:/gi, '')
            .replace(/Primary Lead:/gi, '')
            .replace(/\*\*Source:\*\*/gi, '')
            .replace(/--- #+/g, '')
            .replace(/\*\*/g, '') // Strip bold markdown
            .replace(/\[Intelligence Truncated\]/gi, '')
            .replace(/\*Journalistic Note:[\s\S]*?\*/gi, '');

        // 2. CLEAN HTML ENTITIES
        cleaned = cleaned
            .replace(/\\u0027/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;|&#39;|&apos;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            // Aggressive JSON/Object detection
            .replace(/\{"[\s\S]*?"uri"[\s\S]*?\}/gi, '')
            .replace(/\{"[\s\S]*?"url"[\s\S]*?\}/gi, '')
            .replace(/\{"[\s\S]*?[\{\[][\s\S]*?[\}\]][\s\S]*?\}/g, '')
            .replace(/\{"[\s\S]*?"\}/g, '')
            .replace(/\[\{[\s\S]*?\}\]/g, '');

        // 3. FINAL TAG REMOVAL AND WHITESPACE
        return cleaned
            .replace(/<[^>]*>?/gm, '')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n\s*\n+/g, '\n\n') 
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
            // Aggressive UI Debris Removal (Menus, Watchlists, Sign-ins)
            .replace(/LivestreamMenu|Make Itselect|USAINTLLivestream|Search quotes, news & videos|SIGN IN|Create free account|Watchlist|Investing ClubPRO/gi, '')
            .replace(/MarketsBusinessInvestingTechPoliticsVideo/gi, '')
            .replace(/Select your region|Newsletters|Podcasts|Log In/gi, '')
            // BBC/Generic massive concatenated nav menus
            .replace(/HomeNewsSportBusinessTechnologyHealthCultureArtsTravelEarthAudioVideoLive[A-Za-z]*/gi, '')
            // Social Media & Author boilerplate
            .replace(/agoShareSaveAdd as preferred on Google.*?([A-Z][a-z]+ [A-Z][a-z]+, )?/gi, '')
            .replace(/Image Briefing.*?Link Copied!/gi, '')
            .replace(/Source:\s*CNN/gi, '')
            .replace(/\s*[A-Z0-9-]+\.jpg\?[a-z0-9=&_]+/gi, '')
            // Deep text hygiene
            .replace(/[ \t]+/g, ' ')
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

    /**
     * TRACKER PURGE ENGINE
     * Strips ALL known external tracker patterns from raw HTML before
     * we process any content. Ensures our platform only tracks OUR pages.
     */
    sanitizeTrackers(html: string): string {
        return html
            // 1. Kill tracking pixels (1x1 images from known ad/tracking networks)
            .replace(/<img[^>]+src=["'][^"']*(doubleclick\.net|googlesyndication|googleadservices|facebook\.net\/tr|pixel\.twitter|bat\.bing|analytics\.twitter|trackjs|newrelic|hotjar|fullstory|mixpanel|segment\.io|amplitude|heap\.io|quantserve|scorecardresearch|comscore|omtrdc|demdex|krxd|outbrain|taboola|revcontent|sharethrough)[^"']*["'][^>]*>/gi, '')
            // 2. Kill all <script> tags from third-party trackers
            .replace(/<script[^>]*(googletagmanager|google-analytics|gtag|fbq|_gaq|analytics\.js|hotjar|fullstory|heap\.load|mixpanel|amplitude|segment|newrelic|munchkin|pardot|hubspot|marketo|intercom|drift|hs-analytics|hs-script-loader|bat\.js)[^>]*>[\s\S]*?<\/script>/gi, '')
            // 3. Kill ALL <noscript> tracking fallbacks  
            .replace(/<noscript>[\s\S]*?(pixel|track|analytics|facebook|google)[\s\S]*?<\/noscript>/gi, '')
            // 4. Kill tracking iframes (common for FB pixel noscript fallbacks)
            .replace(/<iframe[^>]*(facebook\.com\/tr|doubleclick|googlesyndication|fls\.doubleclick)[^>]*>[\s\S]*?<\/iframe>/gi, '')
            // 5. Strip UTM and tracking query params from href/src attributes
            .replace(/(href|src)=["']([^"']+)["']/gi, (match, attr, url) => {
                try {
                    const u = new URL(url);
                    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','msclkid','ref','source','_ga','mc_cid','mc_eid'].forEach(p => u.searchParams.delete(p));
                    return `${attr}="${u.toString()}"`;
                } catch { return match; }
            })
            // 6. Kill inline tracker event handlers
            .replace(/\s+on(click|mousedown|mouseup|mouseover|load|error)=["'][^"']*["']/gi, '');
    },

    extractArticleIntelligenceFromHtml(html: string, url: string): ArticleMediaIntelligence {
        // Phase 63: Structural DOM Sanitization
        // Eradicate entire semantic blocks that contain menus, footers, sidebars, and UI debris
        // BEFORE we attempt to extract paragraphs.
        const normalized = this.sanitizeTrackers(html)
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
            .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
            .replace(/<header[\s\S]*?<\/header>/gi, ' ')
            .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
            .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
            .replace(/<svg[\s\S]*?<\/svg>/gi, ' '); // Strip SVGs which sometimes contain massive text paths

        // Extract paragraphs and strictly filter out boilerplate
        const paragraphs = Array.from(normalized.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
            .map((m) => this.scrubMetadata(this.cleanHtml(m[1] || '')))
            .map((p) => p.replace(/\s+/g, ' ').trim())
            .filter((p) => p.length >= 90) // Ensure it's a substantive sentence, not a UI button
            .filter((p) => !/cookie|subscribe|sign up|advertis|newsletter|privacy policy|terms of service|all rights reserved/i.test(p))
            .slice(0, 10);

        const snapshot = paragraphs.join('\n\n').slice(0, 3500);
        const headline = this.extractMetaContent(normalized, [
            /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
            /<title[^>]*>([\s\S]*?)<\/title>/i,
            /<h1[^>]*>([\s\S]*?)<\/h1>/i,
        ]);

        const imageRaw = this.extractMetaContent(normalized, [
            /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
            /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
            /<img[^>]+src=["']([^"']+)["'][^>]*class=["'][^"']*main[^"']*["'][^>]*>/i,
            /<img[^>]+src=["']([^"']+)["'][^>]*class=["'][^"']*article[^"']*["'][^>]*>/i,
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
                        desc = this.cleanHtml(desc);
                    }
                    const source = this.cleanHtml((sourceMatch?.[1] || '').replace(/<!\[CDATA\[(.*?)\]\]>/, '$1'));
                    const articleSnapshot = await this.extractArticleSnapshot(linkMatch?.[1]?.trim() || '');

                    // Narrative synthesis format for AI
                    items.push(`[SOURCE: ${source || 'Unknown'}] ${title}\nContext: ${desc}${articleSnapshot ? `\nIntelligence Snapshot: ${articleSnapshot.slice(0, 1000)}` : ''}`);
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
