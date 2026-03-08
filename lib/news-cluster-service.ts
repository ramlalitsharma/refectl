import { NewsService } from './news-service';

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

function slugToQuery(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/[^\w\s]/g, '').trim();
}

export const NewsClusterService = {
  async getClusterBySlug(slug: string) {
    const query = slugToQuery(slug);
    const items = await NewsService.getPublishedNews();
    const targetTokens = tokenize(query);

    const matched = items
      .map((item) => {
        const score = jaccard(
          targetTokens,
          tokenize(`${item.title} ${item.summary || ''}`)
        );
        return { item, score };
      })
      .filter((entry) => entry.score >= 0.22)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    if (!matched.length) return null;

    return {
      slug,
      title: `Live: ${matched[0].title}`,
      summary: matched[0].summary,
      updatedAt: matched[0].updated_at || matched[0].published_at || matched[0].created_at,
      items: matched.slice(0, 12),
    };
  },
};

