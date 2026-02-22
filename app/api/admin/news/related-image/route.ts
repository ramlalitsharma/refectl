import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

type ImageEntry = {
  tags: string[];
  url: string;
  credit: string;
};

const IMAGE_LIBRARY: ImageEntry[] = [
  {
    tags: ['election', 'vote', 'politics', 'campaign', 'democracy'],
    url: 'https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    tags: ['business', 'market', 'economy', 'trade', 'finance'],
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    tags: ['technology', 'tech', 'ai', 'digital', 'cyber'],
    url: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    tags: ['health', 'medical', 'hospital', 'disease'],
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    tags: ['climate', 'environment', 'weather', 'flood', 'earthquake'],
    url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    tags: ['sport', 'sports', 'football', 'cricket', 'match'],
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    tags: ['war', 'conflict', 'military', 'security', 'defense'],
    url: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    tags: ['culture', 'festival', 'heritage', 'society'],
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    tags: ['nepal', 'kathmandu', 'himalaya', 'everest'],
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    tags: ['global', 'world', 'international'],
    url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  }
];

function scoreEntry(query: string, entry: ImageEntry): number {
  let score = 0;
  for (const tag of entry.tags) {
    if (query.includes(tag)) score += 1;
  }
  return score;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const title = String(body?.title || '');
    const summary = String(body?.summary || '');
    const category = String(body?.category || '');
    const country = String(body?.country || '');

    const query = `${title} ${summary} ${category} ${country}`.toLowerCase();
    if (!query.trim()) {
      return NextResponse.json({ error: 'Missing query context' }, { status: 400 });
    }

    const best = IMAGE_LIBRARY
      .map((entry) => ({ entry, score: scoreEntry(query, entry) }))
      .sort((a, b) => b.score - a.score)[0];

    const selected = best && best.score > 0 ? best.entry : IMAGE_LIBRARY[IMAGE_LIBRARY.length - 1];
    return NextResponse.json({ url: selected.url, source: selected.credit });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to resolve related image', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
