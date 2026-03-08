import { NextRequest, NextResponse } from 'next/server';
import { BlogsCommentsService, BlogsPublicService } from '@/modules/blogs/backend/services';

export async function handlePublicBlogsGet() {
  try {
    const service = new BlogsPublicService();
    const posts = await service.getPublishedPosts();
    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Public blog fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs', message: error.message },
      { status: 500 }
    );
  }
}

export async function handlePublicBlogBySlugGet(
  _req: NextRequest,
  params: Promise<{ slug: string }>
) {
  try {
    const { slug } = await params;
    const service = new BlogsPublicService();
    const post = await service.getPublishedPostBySlug(slug);

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Public blog post fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post', message: error.message },
      { status: 500 }
    );
  }
}

export async function handlePublicBlogCommentsGet(
  _req: NextRequest,
  params: Promise<{ slug: string }>
) {
  try {
    const { slug } = await params;
    const service = new BlogsCommentsService();
    const comments = await service.getTreeBySlug(slug);
    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function handlePublicBlogCommentsPost(
  req: NextRequest,
  params: Promise<{ slug: string }>
) {
  try {
    const { slug } = await params;
    const { content, parentId } = await req.json();
    const service = new BlogsCommentsService();
    const result = await service.createBySlug({ slug, content, parentId });

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ success: true, comment: result.comment });
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}

export async function handlePublicBlogCommentsDelete(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId') || '';
    const service = new BlogsCommentsService();
    const result = await service.deleteById(commentId);

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

