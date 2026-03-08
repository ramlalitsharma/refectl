import { NextRequest, NextResponse } from 'next/server';
import { ForumDiscussionsService } from '@/modules/forum/backend/services/ForumDiscussionsService';

export async function handleDiscussionsGet(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    const subjectId = searchParams.get('subjectId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    const service = new ForumDiscussionsService();
    const result = await service.list({ courseId, lessonId, subjectId, limit, skip });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Discussions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions', message: error.message },
      { status: 500 }
    );
  }
}

export async function handleDiscussionsPost(req: NextRequest) {
  try {
    const body = await req.json();
    const service = new ForumDiscussionsService();
    const result = await service.create(body);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ post: result.post });
  } catch (error: any) {
    console.error('Discussion creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion', message: error.message },
      { status: 500 }
    );
  }
}

export async function handleDiscussionByIdGet(
  _req: NextRequest,
  params: Promise<{ postId: string }>
) {
  try {
    const { postId } = await params;
    const service = new ForumDiscussionsService();
    const result = await service.getById(postId);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ post: result.post });
  } catch (error: any) {
    console.error('Discussion fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussion', message: error.message },
      { status: 500 }
    );
  }
}

export async function handleDiscussionReplyPost(
  req: NextRequest,
  params: Promise<{ postId: string }>
) {
  try {
    const { postId } = await params;
    const body = await req.json();
    const service = new ForumDiscussionsService();
    const result = await service.addReply(postId, body);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ reply: result.reply });
  } catch (error: any) {
    console.error('Reply creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create reply', message: error.message },
      { status: 500 }
    );
  }
}

