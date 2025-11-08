import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeTemplate } from '@/lib/models/NotificationTemplate';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ templateId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { templateId } = await params;
    const body = await req.json();
    const update: any = { updatedAt: new Date() };
    const fields = ['name', 'description', 'category', 'channel', 'subject', 'body', 'ctaLabel', 'ctaUrl', 'variables'];

    for (const field of fields) {
      if (body[field] !== undefined) {
        update[field] = field === 'variables' && Array.isArray(body.variables) ? body.variables : body[field];
      }
    }

    const db = await getDatabase();
    const result = await db
      .collection('notificationTemplates')
      .findOneAndUpdate({ _id: new ObjectId(templateId) }, { $set: update }, { returnDocument: 'after' });

    if (!result.value) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, template: serializeTemplate(result.value as any) });
  } catch (error: any) {
    console.error('Notification template update error:', error);
    return NextResponse.json({ error: 'Failed to update template', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ templateId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { templateId } = await params;
    const db = await getDatabase();
    const result = await db.collection('notificationTemplates').deleteOne({ _id: new ObjectId(templateId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notification template delete error:', error);
    return NextResponse.json({ error: 'Failed to delete template', message: error.message }, { status: 500 });
  }
}
