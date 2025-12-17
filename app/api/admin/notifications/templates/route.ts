import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeTemplate } from '@/lib/models/NotificationTemplate';
import type { NotificationTemplate } from '@/lib/models/NotificationTemplate';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const db = await getDatabase();
    const templates = await db
      .collection<NotificationTemplate>('notificationTemplates')
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json({ templates: templates.map(serializeTemplate) });
  } catch (error: any) {
    console.error('Notification templates fetch error:', error);
    return NextResponse.json({ error: 'Failed to load templates', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { name, description, category, channel, subject, body, ctaLabel, ctaUrl, variables } = await req.json();

    if (!name || !body || !channel) {
      return NextResponse.json({ error: 'Template name, channel, and body are required' }, { status: 400 });
    }

    const record = {
      name,
      description: description || '',
      category: category || '',
      channel,
      subject: subject || '',
      body,
      ctaLabel: ctaLabel || '',
      ctaUrl: ctaUrl || '',
      variables: Array.isArray(variables) ? variables : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('notificationTemplates').insertOne(record);
    return NextResponse.json({ success: true, template: serializeTemplate({ ...record, _id: result.insertedId }) });
  } catch (error: any) {
    console.error('Notification template create error:', error);
    return NextResponse.json({ error: 'Failed to create template', message: error.message }, { status: 500 });
  }
}
