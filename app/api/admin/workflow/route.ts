import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { recordContentVersion } from '@/lib/workflow';
import { isValidStatus } from '@/lib/workflow-status';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await requireAdmin();

    const { contentType, contentId, status, changeNote } = await req.json();

    if (!contentType || !contentId || !status) {
      return NextResponse.json({ error: 'contentType, contentId, and status are required' }, { status: 400 });
    }

    if (!['course', 'blog'].includes(contentType)) {
      return NextResponse.json({ error: 'Unsupported contentType' }, { status: 400 });
    }

    if (!isValidStatus(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = contentType === 'course' ? 'courses' : 'blogs';

    const existing = await db.collection(collection).findOne({ slug: contentId });
    if (!existing) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    await db.collection(collection).updateOne(
      { slug: contentId },
      {
        $set: {
          status,
          workflowUpdatedAt: new Date(),
          workflowUpdatedBy: userId,
        },
      },
    );

    const updated = await db.collection(collection).findOne({ slug: contentId });

    if (updated) {
      await recordContentVersion({
        contentType,
        contentId,
        status,
        snapshot: updated,
        changeNote,
        changedBy: userId,
      });
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error('Workflow transition error:', error);
    return NextResponse.json({ error: 'Failed to update workflow', message: error.message }, { status: 500 });
  }
}
