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
    const { title, description, bankIds, questionCount, tags, releaseAt, visibility } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const record = {
      authorId: userId,
      title,
      description: description || '',
      bankIds: Array.isArray(bankIds) ? bankIds : [],
      questionCount: questionCount ? Number(questionCount) : undefined,
      tags: Array.isArray(tags) ? tags : [],
      releaseAt: releaseAt || null,
      visibility: visibility || 'private',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('practiceSets').insertOne(record);
    return NextResponse.json({ success: true, practiceSetId: String(result.insertedId) });
  } catch (error: any) {
    console.error('Practice set create error:', error);
    return NextResponse.json({ error: 'Failed to create practice set', message: error.message }, { status: 500 });
  }
}
