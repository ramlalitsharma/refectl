import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeTrigger } from '@/lib/models/NotificationTemplate';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const db = await getDatabase();
    const triggers = await db.collection('notificationTriggers').find({}).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json({ triggers: triggers.map(serializeTrigger) });
  } catch (error: any) {
    console.error('Notification triggers fetch error:', error);
    return NextResponse.json({ error: 'Failed to load triggers', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { name, eventKey, description, templateId, channels, enabled, segment } = await req.json();

    if (!name || !eventKey || !templateId) {
      return NextResponse.json({ error: 'Trigger name, event key, and template are required' }, { status: 400 });
    }

    const record = {
      name,
      eventKey,
      description: description || '',
      templateId,
      channels: Array.isArray(channels) && channels.length ? channels : ['in-app'],
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      segment: segment || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('notificationTriggers').insertOne(record);
    return NextResponse.json({ success: true, trigger: serializeTrigger({ ...record, _id: result.insertedId }) });
  } catch (error: any) {
    console.error('Notification trigger create error:', error);
    return NextResponse.json({ error: 'Failed to create trigger', message: error.message }, { status: 500 });
  }
}
