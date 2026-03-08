type LicensedImageEntry = {
  tags: string[];
  url: string;
  credit: string;
  license: 'partner' | 'public_domain';
};

const LICENSED_IMAGE_LIBRARY: LicensedImageEntry[] = [
  {
    tags: ['business', 'finance', 'economy', 'market', 'trade'],
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash',
    license: 'partner',
  },
  {
    tags: ['technology', 'tech', 'ai', 'digital', 'cyber'],
    url: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash',
    license: 'partner',
  },
  {
    tags: ['health', 'medical', 'hospital', 'disease'],
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash',
    license: 'partner',
  },
  {
    tags: ['climate', 'environment', 'weather', 'flood', 'earthquake'],
    url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash',
    license: 'partner',
  },
  {
    tags: ['war', 'conflict', 'military', 'security', 'defense'],
    url: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash',
    license: 'partner',
  },
  {
    tags: ['world', 'global', 'international', 'diplomacy'],
    url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash',
    license: 'partner',
  },
];

function scoreEntry(query: string, entry: LicensedImageEntry): number {
  let score = 0;
  for (const tag of entry.tags) {
    if (query.includes(tag)) score += 1;
  }
  return score;
}

export function selectLicensedLibraryImage(params: {
  title?: string;
  summary?: string;
  category?: string;
  country?: string;
}) {
  const query = `${params.title || ''} ${params.summary || ''} ${params.category || ''} ${params.country || ''}`.toLowerCase();
  const best = LICENSED_IMAGE_LIBRARY
    .map((entry) => ({ entry, score: scoreEntry(query, entry) }))
    .sort((a, b) => b.score - a.score)[0];

  if (!best || best.score <= 0) return null;
  return best.entry;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildTextGraphicDataUrl(params: {
  title: string;
  category?: string;
  country?: string;
}) {
  const title = (params.title || 'Terai Times').trim().slice(0, 72);
  const category = (params.category || 'World').trim().slice(0, 18).toUpperCase();
  const country = (params.country || 'Global').trim().slice(0, 18).toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0b1424"/>
          <stop offset="52%" stop-color="#12243c"/>
          <stop offset="100%" stop-color="#1a0f1d"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)"/>
      <circle cx="1280" cy="180" r="210" fill="rgba(192,20,46,0.22)"/>
      <circle cx="300" cy="760" r="240" fill="rgba(240,136,33,0.18)"/>
      <rect x="82" y="82" rx="28" ry="28" width="1436" height="736" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
      <text x="120" y="170" fill="#f08821" font-family="Georgia, serif" font-size="56" font-weight="700">TERAI TIMES</text>
      <text x="120" y="244" fill="#d7deea" font-family="Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="4">${escapeXml(category)} • ${escapeXml(country)}</text>
      <foreignObject x="120" y="300" width="1220" height="360">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Georgia, serif; font-size: 74px; line-height: 1.04; color: white; font-weight: 700;">
          ${escapeXml(title)}
        </div>
      </foreignObject>
      <text x="120" y="772" fill="#a8b3c5" font-family="Arial, sans-serif" font-size="24" letter-spacing="3">WORLD EDITION • VERIFIED DESK • PREMIUM BRIEFING</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
