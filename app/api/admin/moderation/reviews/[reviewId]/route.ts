import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { reviewId } = await params;
    const body = await req.json();
    const { status, note } = body as { status: 'approved' | 'rejected' | 'flagged'; note?: string };

    if (!['approved', 'rejected', 'flagged'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection('reviews').findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      {
        $set: {
          status,
          moderatedAt: new Date(),
          moderatedBy: userId,
          moderationNote: note || '',
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Moderation review update error:', error);
    return NextResponse.json({ error: 'Failed to update review', message: error.message }, { status: 500 });
  }
}
