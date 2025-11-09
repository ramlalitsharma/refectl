import { NextRequest, NextResponse } from 'next/server';
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
  if (!allowed) {
    throw new Error('Forbidden');
  }
  return userId;
}

export async function GET() {
  try {
    await ensureSchemaPermission();
    const db = await getDatabase();
    const schemas = await db.collection('contentSchemas').find({}).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json({ schemas: schemas.map(serializeSchema) });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to load schemas' }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchemaPermission();
    const body = await req.json();
    const { name, key, description, fields } = body;

    if (!name || !key) {
      return NextResponse.json({ error: 'Name and key are required' }, { status: 400 });
    }

    const db = await getDatabase();

    const existing = await db.collection('contentSchemas').findOne({ key });
    if (existing) {
      return NextResponse.json({ error: 'Schema key already exists' }, { status: 409 });
    }

    const now = new Date();
    const doc = {
      name,
      key,
      description: description || '',
      fields: Array.isArray(fields) ? fields : [],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('contentSchemas').insertOne(doc);
    return NextResponse.json({ schema: serializeSchema({ ...doc, _id: result.insertedId }) });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to create schema' }, { status });
  }
}
