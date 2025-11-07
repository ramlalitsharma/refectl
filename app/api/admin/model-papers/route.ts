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
    const { title, examType, sections, tags, releaseAt } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const record = {
      authorId: userId,
      title,
      examType: examType || '',
      sections: Array.isArray(sections) ? sections : [],
      tags: Array.isArray(tags) ? tags : [],
      releaseAt: releaseAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('modelPapers').insertOne(record);
    return NextResponse.json({ success: true, modelPaperId: String(result.insertedId) });
  } catch (error: any) {
    console.error('Model paper create error:', error);
    return NextResponse.json({ error: 'Failed to create model paper', message: error.message }, { status: 500 });
  }
}
