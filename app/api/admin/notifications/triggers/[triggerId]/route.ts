import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeTrigger } from '@/lib/models/NotificationTemplate';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ triggerId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { triggerId } = await params;
    const body = await req.json();
    const update: any = { updatedAt: new Date() };
    const fields = ['name', 'eventKey', 'description', 'templateId', 'channels', 'enabled', 'segment'];

    for (const field of fields) {
      if (body[field] !== undefined) {
        if (field === 'channels' && Array.isArray(body.channels)) {
          update.channels = body.channels;
        } else if (field === 'enabled') {
          update.enabled = Boolean(body.enabled);
        } else {
          update[field] = body[field];
        }
      }
    }

    const db = await getDatabase();
    const result = await db
      .collection('notificationTriggers')
      .findOneAndUpdate({ _id: new ObjectId(triggerId) }, { $set: update }, { returnDocument: 'after' });

    if (!result.value) {
      return NextResponse.json({ error: 'Trigger not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, trigger: serializeTrigger(result.value as any) });
  } catch (error: any) {
    console.error('Notification trigger update error:', error);
    return NextResponse.json({ error: 'Failed to update trigger', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ triggerId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { triggerId } = await params;
    const db = await getDatabase();
    const result = await db.collection('notificationTriggers').deleteOne({ _id: new ObjectId(triggerId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Trigger not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notification trigger delete error:', error);
    return NextResponse.json({ error: 'Failed to delete trigger', message: error.message }, { status: 500 });
  }
}
