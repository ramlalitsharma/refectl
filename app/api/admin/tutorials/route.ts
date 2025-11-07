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
    const {
      title,
      format,
      audience,
      durationMinutes,
      level,
      objectives,
      sections,
      resources,
      releaseAt,
      tags,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const record = {
      authorId: userId,
      title,
      format: format || 'video',
      audience: audience || '',
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      level: level || '',
      objectives: objectives || '',
      sections: Array.isArray(sections) ? sections : [],
      resources: Array.isArray(resources) ? resources : [],
      tags: Array.isArray(tags) ? tags : [],
      releaseAt: releaseAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('tutorials').insertOne(record);
    return NextResponse.json({ success: true, tutorialId: String(result.insertedId) });
  } catch (error: any) {
    console.error('Tutorial create error:', error);
    return NextResponse.json({ error: 'Failed to create tutorial', message: error.message }, { status: 500 });
  }
}
