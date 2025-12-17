import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { PERMISSION_OPTIONS, PermissionKey } from '@/lib/permissions';
import { serializeRole } from '@/lib/models/Role';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ roleId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { roleId } = await params;
    const body = await req.json();
    const { name, description, permissions } = body as {
      name?: string;
      description?: string;
      permissions?: PermissionKey[];
    };

    const allowedPermissions = new Set(PERMISSION_OPTIONS.map((option) => option.key));
    const update: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (permissions !== undefined) {
      update.permissions = permissions.filter((key) => allowedPermissions.has(key)) as PermissionKey[];
    }

    const db = await getDatabase();
    const result = await db
      .collection('roles')
      .findOneAndUpdate({ _id: new ObjectId(roleId) }, { $set: update }, { returnDocument: 'after' });

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, role: serializeRole(result.value as any) });
  } catch (error: any) {
    console.error('Role update error:', error);
    return NextResponse.json({ error: 'Failed to update role', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ roleId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { roleId } = await params;

    const db = await getDatabase();
    const role = await db.collection('roles').findOne({ _id: new ObjectId(roleId) });
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    if (role.isSystem) {
      return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 400 });
    }

    await db.collection('roles').deleteOne({ _id: new ObjectId(roleId) });
    await db.collection('users').updateMany(
      { roleIds: new ObjectId(roleId) },
      { $pull: ((({ roleIds: new ObjectId(roleId) }) as unknown) as import('mongodb').PullOperator<any>) }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Role delete error:', error);
    return NextResponse.json({ error: 'Failed to delete role', message: error.message }, { status: 500 });
  }
}
