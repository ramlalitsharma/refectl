import { News } from './models/News';

export type RevenueDecision = 'publish' | 'pending_approval' | 'skip';

export interface RevenueEvaluation {
  score: number;
  decision: RevenueDecision;
  reasons: string[];
}

const LOW_QUALITY_PATTERNS = [
  /lorem ipsum/i,
  /click here/i,
  /no direct news events found/i,
  /untitled/i,
];

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export const NewsRevenueMode = {
  optimizeHeadline(title: string, category?: string, country?: string): string {
    const clean = normalizeWhitespace(title || 'Global News Update');
    const prefix = [category, country].filter(Boolean).join(' • ');
    const candidate = clean.length >= 18 ? clean : `${prefix}: ${clean}`;
    if (candidate.length <= 86) return candidate;
    return `${candidate.slice(0, 83).trim()}...`;
  },

  formatForCommercialReadability(content: string, summary?: string): string {
    const cleanSummary = normalizeWhitespace(summary || '');
    const cleanBody = normalizeWhitespace(content || '');

    const lead = cleanSummary || cleanBody.slice(0, 220);
    const body = cleanBody || 'Verified details are being compiled by the newsroom.';

    return `
      <p><strong>Executive Brief:</strong> ${lead}</p>
      <h2>Why This Matters</h2>
      <p>${body}</p>
      <h2>What To Watch Next</h2>
      <p>Our editorial desk is monitoring verified updates and will refresh this report as new facts are confirmed.</p>
    `.trim();
  },

  evaluateCandidate(candidate: Partial<News>, minScore: number): RevenueEvaluation {
    let score = 50;
    const reasons: string[] = [];

    const title = normalizeWhitespace(candidate.title || '');
    const summary = normalizeWhitespace(candidate.summary || '');
    const content = normalizeWhitespace(candidate.content || '');

    if (title.length >= 32 && title.length <= 86) score += 12;
    else {
      score -= 10;
      reasons.push('Headline length not in optimal range (32-86 chars).');
    }

    if (summary.length >= 90) score += 10;
    else {
      score -= 8;
      reasons.push('Summary is too short for commercial-quality context.');
    }

    if (content.length >= 700) score += 16;
    else {
      score -= 14;
      reasons.push('Body is too short for high-value retention.');
    }

    if (candidate.source_url && /^https?:\/\//.test(candidate.source_url)) score += 8;
    else {
      score -= 10;
      reasons.push('Missing verifiable source URL.');
    }

    if ((candidate.tags || []).length >= 3) score += 6;
    else reasons.push('Insufficient topical tags for discovery/SEO.');

    if (typeof candidate.impact_score === 'number') {
      if (candidate.impact_score >= 60) score += 6;
      else score -= 4;
    }

    for (const p of LOW_QUALITY_PATTERNS) {
      if (p.test(`${title} ${summary} ${content}`)) {
        score -= 18;
        reasons.push(`Low-quality signal detected: ${p.source}`);
      }
    }

    score = clamp(score, 0, 100);

    if (score >= minScore) {
      return { score, decision: 'publish', reasons };
    }
    if (score >= minScore - 12) {
      reasons.push('Borderline quality: routed to pending approval.');
      return { score, decision: 'pending_approval', reasons };
    }
    reasons.push('Quality too low for auto-publish and review queue.');
    return { score, decision: 'skip', reasons };
  },
};
