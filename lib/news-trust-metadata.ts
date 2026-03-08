export type SourceVerdict = 'trusted' | 'unverified' | 'blocked' | 'missing';

export type TrustMetadata = {
  trustScore?: number;
  verificationCount?: number;
  neutralityScore?: number;
  sourceVerdict?: SourceVerdict;
};

function parseScoreTag(tags: string[] | undefined, key: string): number | undefined {
  if (!tags?.length) return undefined;
  const found = tags.find((t) => t.startsWith(`${key}:`));
  if (!found) return undefined;
  const value = Number(found.split(':')[1]);
  return Number.isFinite(value) ? value : undefined;
}

export function extractTrustMetadata(tags?: string[]): TrustMetadata {
  const sourceVerdict: SourceVerdict =
    tags?.includes('source_trusted')
      ? 'trusted'
      : tags?.includes('source_blocked')
        ? 'blocked'
        : tags?.includes('source_missing')
          ? 'missing'
          : 'unverified';

  return {
    trustScore: parseScoreTag(tags, 'trust_score'),
    verificationCount: parseScoreTag(tags, 'verification_count'),
    neutralityScore: parseScoreTag(tags, 'neutrality_score'),
    sourceVerdict,
  };
}

export function attachTrustTags(
  tags: string[] | undefined,
  meta: {
    trustScore?: number;
    verificationCount?: number;
    neutralityScore?: number;
  }
): string[] {
  const next = new Set(tags || []);
  if (Number.isFinite(meta.trustScore)) next.add(`trust_score:${Math.round(meta.trustScore as number)}`);
  if (Number.isFinite(meta.verificationCount)) next.add(`verification_count:${Math.round(meta.verificationCount as number)}`);
  if (Number.isFinite(meta.neutralityScore)) next.add(`neutrality_score:${Math.round(meta.neutralityScore as number)}`);
  return Array.from(next);
}

