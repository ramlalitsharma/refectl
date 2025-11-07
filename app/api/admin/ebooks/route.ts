import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const body = await req.json();
    const { title, audience, tone, chapters, focus, outline, releaseAt, tags } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const record = {
      authorId: userId,
      title,
      audience: audience || '',
      tone: tone || '',
      focus: focus || '',
      chapters: Array.isArray(outline?.chapters) ? outline.chapters : [],
      requestedChapters: chapters ? Number(chapters) : undefined,
      tags: Array.isArray(tags) ? tags : [],
      releaseAt: releaseAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('ebooks').insertOne(record);
    return NextResponse.json({ success: true, ebookId: String(result.insertedId) });
  } catch (error: any) {
    console.error('Ebook create error:', error);
    return NextResponse.json({ error: 'Failed to create ebook', message: error.message }, { status: 500 });
  }
}
