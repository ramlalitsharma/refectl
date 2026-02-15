import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const ebooks = await prisma.ebook.findMany({
      select: {
        id: true,
        title: true,
        updatedAt: true,
        requestedChapters: true,
        tags: true,
        status: true,
        seo: true
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(ebooks);
  } catch (error: any) {
    console.error('Ebooks fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch ebooks', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const body = await req.json();
    const { title, audience, tone, chaptersCount, focus, outline, releaseAt, tags, status, seo } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const ebook = await prisma.ebook.create({
      data: {
        authorId: userId,
        title: title.trim(),
        audience: audience?.trim() || null,
        tone: tone?.trim() || null,
        focus: focus?.trim() || null,
        chapters: outline || { chapters: [] },
        requestedChapters: chaptersCount ? Number(chaptersCount) : null,
        tags: Array.isArray(tags) ? tags : [],
        status: status || "draft",
        releaseAt: releaseAt ? new Date(releaseAt) : null,
        seo: seo || null,
      },
    });

    return NextResponse.json({ success: true, ebookId: ebook.id });
  } catch (error: any) {
    console.error('Ebook create error:', error);
    return NextResponse.json({ error: 'Failed to create ebook', message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const body = await req.json();
    const { id, title, audience, tone, chaptersCount, focus, outline, releaseAt, tags, status, seo } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const ebook = await prisma.ebook.update({
      where: { id },
      data: {
        title: title?.trim(),
        audience: audience?.trim() || undefined,
        tone: tone?.trim() || undefined,
        focus: focus?.trim() || undefined,
        chapters: outline || undefined,
        requestedChapters: chaptersCount ? Number(chaptersCount) : undefined,
        tags: Array.isArray(tags) ? tags : undefined,
        status: status || undefined,
        releaseAt: releaseAt ? new Date(releaseAt) : undefined,
        seo: seo || undefined,
      },
    });

    return NextResponse.json({ success: true, ebookId: ebook.id });
  } catch (error: any) {
    console.error('Ebook update error:', error);
    return NextResponse.json({ error: 'Failed to update ebook', message: error.message }, { status: 500 });
  }
}
