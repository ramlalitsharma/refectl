import { SourceVerdict } from './news-trust-metadata';

type RelatedItem = {
  title: string;
  link?: string;
  source?: string;
};

type VerificationResult = {
  verificationCount: number;
  related: RelatedItem[];
  neutralityScore: number;
  trustScore: number;
  claims: string[];
};

const SUBJECTIVE_TERMS = [
  'shocking', 'explosive', 'disaster', 'outrage', 'stunning', 'terrifying', 'incredible',
  'massive', 'historic', 'unbelievable', 'crisis', 'devastating', 'unprecedented'
];

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function extractClaims(text: string): string[] {
  const sentences = (text || '')
    .replace(/\s+/g, ' ')
    .split(/[.!?]/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const claims: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length > 30) claims.push(sentence);
    if (claims.length >= 4) break;
  }
  return claims.length ? claims : sentences.slice(0, 2);
}

function scoreNeutrality(text: string): number {
  const tokens = tokenize(text);
  if (!tokens.length) return 70;
  const hits = tokens.filter((t) => SUBJECTIVE_TERMS.includes(t)).length;
  const ratio = hits / tokens.length;
  return Math.max(40, Math.min(100, Math.round(100 - ratio * 400)));
}

async function fetchGoogleNewsRelated(query: string): Promise<RelatedItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return [];
  const xml = await response.text();
  const items: RelatedItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>(.*?)<\/title>/;
  const linkRegex = /<link>(.*?)<\/link>/;
  const sourceRegex = /<source.*?>(.*?)<\/source>/;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
    const block = match[1];
    const titleMatch = titleRegex.exec(block);
    if (!titleMatch) continue;
    const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1');
    const linkMatch = linkRegex.exec(block);
    const sourceMatch = sourceRegex.exec(block);
    items.push({
      title,
      link: linkMatch?.[1],
      source: sourceMatch?.[1],
    });
  }
  return items;
}

export async function verifyArticle(params: {
  title: string;
  summary?: string;
  sourceVerdict: SourceVerdict;
}): Promise<VerificationResult> {
  const query = params.title || params.summary || '';
  const related = await fetchGoogleNewsRelated(query);
  const targetTokens = tokenize(`${params.title} ${params.summary || ''}`);
  const matches = related.filter((item) => {
    const score = jaccard(targetTokens, tokenize(item.title));
    return score >= 0.2;
  });

  const verificationCount = matches.length;
  const neutralityScore = scoreNeutrality(`${params.title} ${params.summary || ''}`);

  let baseTrust = 55;
  if (params.sourceVerdict === 'trusted') baseTrust = 80;
  if (params.sourceVerdict === 'blocked') baseTrust = 0;
  if (params.sourceVerdict === 'missing') baseTrust = 35;

  const trustScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(baseTrust + verificationCount * 5 + (neutralityScore - 70) * 0.3)
    )
  );

  return {
    verificationCount,
    related: matches,
    neutralityScore,
    trustScore,
    claims: extractClaims(params.summary || params.title),
  };
}

