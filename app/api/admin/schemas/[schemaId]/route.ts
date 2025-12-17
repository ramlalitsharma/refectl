import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { requireAdmin, userHasPermission } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeSchema } from '@/lib/models/ContentSchema';
import { PermissionKey } from '@/lib/permissions';

export const runtime = 'nodejs';

async function ensureSchemaPermission() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  await requireAdmin();
  const allowed = await userHasPermission('schemas:manage' as PermissionKey);
  if (!allowed) throw new Error('Forbidden');
  return userId;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ schemaId: string }> }) {
  try {
    await ensureSchemaPermission();
    const { schemaId } = await params;
    const body = await req.json();

    const update: Record<string, any> = { updatedAt: new Date() };
    if (body.name !== undefined) update.name = body.name;
    if (body.description !== undefined) update.description = body.description;
    if (Array.isArray(body.fields)) update.fields = body.fields;
    if (body.bumpVersion) update.version = (body.version ?? 1) + 1;

    const db = await getDatabase();
    const result = await db
      .collection('contentSchemas')
      .findOneAndUpdate({ _id: new ObjectId(schemaId) }, { $set: update }, { returnDocument: 'after' });

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
    }

    return NextResponse.json({ schema: serializeSchema(result.value as any) });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to update schema' }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ schemaId: string }> }) {
  try {
    await ensureSchemaPermission();
    const { schemaId } = await params;

    const db = await getDatabase();
    const result = await db.collection('contentSchemas').deleteOne({ _id: new ObjectId(schemaId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to delete schema' }, { status });
  }
}
