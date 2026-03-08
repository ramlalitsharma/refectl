type SourceVerdict = 'trusted' | 'unknown' | 'blocked';
type SafeBrowsingVerdict = 'safe' | 'unsafe' | 'unknown';

const TRUSTED_SOURCE_HOSTS = [
  'news.google.com',
  'google.com',
  'reuters.com',
  'apnews.com',
  'bbc.com',
  'bbc.co.uk',
  'ft.com',
  'wsj.com',
  'nytimes.com',
  'bloomberg.com',
  'theguardian.com',
  'aljazeera.com',
  'cnn.com',
  'npr.org',
  'washingtonpost.com',
  'economist.com',
  'nature.com',
  'sciencemag.org',
  'who.int',
  'un.org',
  'worldbank.org',
  'imf.org',
  'oecd.org',
];

const BLOCKED_KEYWORDS = [
  'casino',
  'bet',
  'betting',
  'gamble',
  'porn',
  'adult',
  'escort',
  'loan',
  'crypto-casino',
  'sweepstakes',
  'lottery',
];

const BLOCKED_HOSTS = [
  'doubleclick.net',
  'adultfriendfinder.com',
];

function normalizeHost(url?: string): string | null {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.replace(/^www\./, '');
  } catch {
    return null;
  }
}

let cachedLists: { trusted: string[]; blocked: string[]; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getDynamicLists() {
  if (cachedLists && Date.now() - cachedLists.ts < CACHE_TTL_MS) return cachedLists;
  try {
    const { getSourceHosts } = await import('./source-trust-store');
    const [trusted, blocked] = await Promise.all([
      getSourceHosts('trusted'),
      getSourceHosts('blocked'),
    ]);
    cachedLists = { trusted, blocked, ts: Date.now() };
    return cachedLists;
  } catch {
    return { trusted: [], blocked: [], ts: Date.now() };
  }
}

async function isHostTrusted(host: string): Promise<boolean> {
  const lists = await getDynamicLists();
  const trusted = [...TRUSTED_SOURCE_HOSTS, ...lists.trusted];
  return trusted.some((t) => host === t || host.endsWith(`.${t}`));
}

async function isHostBlocked(host: string): Promise<boolean> {
  const lists = await getDynamicLists();
  const blocked = [...BLOCKED_HOSTS, ...lists.blocked];
  if (blocked.includes(host)) return true;
  return BLOCKED_KEYWORDS.some((kw) => host.includes(kw));
}

function isUrlBlocked(url: string): boolean {
  const lowered = url.toLowerCase();
  return BLOCKED_KEYWORDS.some((kw) => lowered.includes(kw));
}

async function checkSafeBrowsing(url: string): Promise<SafeBrowsingVerdict> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) return 'unknown';

  try {
    const resp = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            clientId: 'terai-times',
            clientVersion: '1.0.0',
          },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!resp.ok) return 'unknown';
    const json = await resp.json();
    if (json && Array.isArray(json.matches) && json.matches.length > 0) {
      return 'unsafe';
    }
    return 'safe';
  } catch {
    return 'unknown';
  }
}

export async function verifySourceSafety(params: {
  sourceUrl?: string;
  sourceName?: string;
}): Promise<{
  sourceHost?: string | null;
  sourceVerdict: SourceVerdict;
  safeBrowsingVerdict: SafeBrowsingVerdict;
  reason?: string;
}> {
  const sourceUrl = params.sourceUrl?.trim();
  if (!sourceUrl) {
    return { sourceHost: null, sourceVerdict: 'unknown', safeBrowsingVerdict: 'unknown', reason: 'missing_url' };
  }

  if (!/^https?:\/\//i.test(sourceUrl)) {
    return { sourceHost: null, sourceVerdict: 'unknown', safeBrowsingVerdict: 'unknown', reason: 'invalid_url' };
  }

  const host = normalizeHost(sourceUrl);
  if (!host) {
    return { sourceHost: null, sourceVerdict: 'unknown', safeBrowsingVerdict: 'unknown', reason: 'invalid_host' };
  }

  if (await isHostBlocked(host) || isUrlBlocked(sourceUrl)) {
    return { sourceHost: host, sourceVerdict: 'blocked', safeBrowsingVerdict: 'unsafe', reason: 'blocked_pattern' };
  }

  const trusted = await isHostTrusted(host);
  const safeBrowsingVerdict = await checkSafeBrowsing(sourceUrl);

  if (safeBrowsingVerdict === 'unsafe') {
    return { sourceHost: host, sourceVerdict: 'blocked', safeBrowsingVerdict, reason: 'safe_browsing' };
  }

  return {
    sourceHost: host,
    sourceVerdict: trusted ? 'trusted' : 'unknown',
    safeBrowsingVerdict,
    reason: trusted ? 'trusted_host' : 'unknown_host',
  };
}
