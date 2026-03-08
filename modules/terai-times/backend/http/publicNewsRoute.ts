import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/news-service';
import { TeraiTimesCommentsService } from '@/modules/terai-times/backend/services/TeraiTimesCommentsService';

export async function handlePublicNewsGet(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'All';
    const country = url.searchParams.get('country') || 'All';
    const query = (url.searchParams.get('q') || '').trim();
    const facetsOnly = url.searchParams.get('facets') === '1';

    if (facetsOnly) {
      const filters = await NewsService.getAvailableFilters();
      return NextResponse.json(filters);
    }

    const [published, trending, filters] = await Promise.all([
      NewsService.getPublishedNews({ category, country, query, limit: query ? 20 : undefined }),
      NewsService.getTrendingNews(6),
      NewsService.getAvailableFilters(),
    ]);

    return NextResponse.json({
      items: published || [],
      trending: trending || [],
      availableCountries: filters.countries || [],
      availableCategories: filters.categories || [],
    });
  } catch (error: any) {
    console.error('Public news fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public news', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function handlePublicNewsCommentsGet(
  _req: NextRequest,
  params: Promise<{ slug: string }>
) {
  try {
    const { slug } = await params;
    const service = new TeraiTimesCommentsService();
    const comments = await service.getTreeBySlug(slug);
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function handlePublicNewsCommentsPost(
  req: NextRequest,
  params: Promise<{ slug: string }>
) {
  try {
    const { slug } = await params;
    const { content, parentId } = await req.json();
    const service = new TeraiTimesCommentsService();
    const result = await service.createBySlug({ slug, content, parentId });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, comment: result.comment });
  } catch {
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}

export async function handlePublicNewsCommentsDelete(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId') || '';
    const service = new TeraiTimesCommentsService();
    const result = await service.deleteById(commentId);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
