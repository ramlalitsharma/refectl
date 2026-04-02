type LicensedImageEntry = {
  tags: string[];
  url: string;
  credit: string;
  license: 'partner' | 'public_domain';
};

const LICENSED_IMAGE_LIBRARY: LicensedImageEntry[] = [
  // Finance & Markets
  {
    tags: ['business', 'finance', 'economy', 'market', 'trade', 'stock', 'investing', 'gold'],
    url: 'https://images.unsplash.com/photo-1611974717482-98ea05afc195?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash Pro (Finance)', license: 'partner',
  },
  {
    tags: ['crypto', 'bitcoin', 'blockchain', 'currency', 'digital-finance'],
    url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Crypto)', license: 'partner',
  },
  // Technology & AI
  {
    tags: ['technology', 'tech', 'ai', 'digital', 'cyber', 'robot', 'chip'],
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (AI)', license: 'partner',
  },
  {
    tags: ['coding', 'programming', 'software', 'cloud', 'data'],
    url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Code)', license: 'partner',
  },
  // Geopolitics, War & Security
  {
    tags: ['war', 'conflict', 'military', 'security', 'defense', 'tank', 'explosion', 'iran', 'palestine', 'ukraine', 'conflict'],
    url: 'https://images.unsplash.com/photo-1590483734724-383b9f4badfe?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Conflict)', license: 'partner',
  },
  {
    tags: ['diplomacy', 'un', 'summit', 'flag', 'government', 'peacemaker', 'politics', 'china', 'us', 'europe'],
    url: 'https://images.unsplash.com/photo-1541872703-74c5e4001920?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Diplomacy)', license: 'partner',
  },
  // Health & Science
  {
    tags: ['health', 'medical', 'hospital', 'disease', 'science', 'lab', 'vaccine', 'virus'],
    url: 'https://images.unsplash.com/photo-1581093458791-9f3c3250bb8b?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Science)', license: 'partner',
  },
  // Environment & Space
  {
    tags: ['climate', 'environment', 'weather', 'flood', 'earthquake', 'storm', 'fire'],
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Nature)', license: 'partner',
  },
  {
    tags: ['space', 'nasa', 'moon', 'stars', 'satellite', 'spacex'],
    url: 'https://images.unsplash.com/photo-1454789548928-132d7877e8a9?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Space)', license: 'partner',
  },
  // Culture & Social
  {
    tags: ['culture', 'social', 'protest', 'crowd', 'festival', 'people'],
    url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Social)', license: 'partner',
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
  const title = (params.title || 'Terai Times Intelligence Report').trim().slice(0, 96);
  const category = (params.category || 'World').trim().slice(0, 18).toUpperCase();
  const country = (params.country || 'Global').trim().slice(0, 18).toUpperCase();
  
  // High-end coloring based on category
  const themeMap: Record<string, string> = {
    'Finance': '#06b6d4', // Cyan
    'Markets & Finance': '#06b6d4',
    'Geopolitics': '#e11d48', // Rose
    'Conflict & War': '#e11d48',
    'Technology': '#8b5cf6', // Violet
    'Technology & AI': '#8b5cf6',
    'Health': '#10b981', // Emerald
    'Environment': '#10b981',
    'Culture': '#f59e0b', // Amber
  };
  const accent = themeMap[params.category || ''] || '#f08821';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="60%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" stroke-width="0.5" opacity="0.04"/>
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="1600" height="900" fill="url(#bg)"/>
      <rect width="1600" height="900" fill="url(#grid)"/>
      
      {/* Dynamic Graphic Elements */}
      <circle cx="1400" cy="150" r="300" fill="${accent}" opacity="0.07" filter="url(#glow)"/>
      <circle cx="200" cy="750" r="250" fill="${accent}" opacity="0.05" filter="url(#glow)"/>
      
      {/* Decorative tech lines */}
      <line x1="100" y1="100" x2="300" y2="100" stroke="${accent}" stroke-width="4" opacity="0.4"/>
      <line x1="100" y1="100" x2="100" y2="200" stroke="${accent}" stroke-width="4" opacity="0.4"/>
      
      {/* Branding */}
      <text x="140" y="145" fill="${accent}" font-family="Arial, sans-serif" font-size="20" font-weight="900" letter-spacing="8">TERAI TIMES INTELLIGENCE</text>
      <text x="140" y="210" fill="white" font-family="Georgia, serif" font-size="32" font-weight="700" letter-spacing="2" opacity="0.9">${escapeXml(category)} / ${escapeXml(country)}</text>
      
      <rect x="140" y="240" width="80" height="4" fill="${accent}"/>
      
      <foreignObject x="140" y="320" width="1320" height="400">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Georgia, serif; font-size: 82px; line-height: 1.1; color: white; font-weight: 700; text-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          ${escapeXml(title)}
        </div>
      </foreignObject>
      
      <text x="140" y="800" fill="#64748b" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4">AUTONOMOUS SIGNAL • STRATEGIC DEPTH • VERIFIED DESK</text>
      
      {/* Scanning line effect */}
      <rect x="0" y="880" width="1600" height="20" fill="${accent}" opacity="0.1"/>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
