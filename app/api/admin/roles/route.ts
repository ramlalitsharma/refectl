import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { PERMISSION_OPTIONS, PermissionKey } from '@/lib/permissions';
import { serializeRole } from '@/lib/models/Role';
import type { Role } from '@/lib/models/Role';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const db = await getDatabase();
    const roles = await db
      .collection<Role>('roles')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ roles: roles.map(serializeRole) });
  } catch (error: any) {
    console.error('Roles fetch error:', error);
    return NextResponse.json({ error: 'Failed to load roles', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const body = await req.json();
    const { name, description, permissions } = body as {
      name: string;
      description?: string;
      permissions: PermissionKey[];
    };

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const allowedPermissions = new Set(PERMISSION_OPTIONS.map((option) => option.key));
    const perms = Array.isArray(permissions)
      ? (permissions.filter((key) => allowedPermissions.has(key)) as PermissionKey[])
      : [];

    const now = new Date();
    const db = await getDatabase();

    const existing = await db.collection<Role>('roles').findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return NextResponse.json({ error: 'A role with this name already exists' }, { status: 409 });
    }

    const result = await db.collection<Role>('roles').insertOne({
      name,
      description: description || '',
      permissions: perms,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, role: serializeRole({ _id: result.insertedId, name, description, permissions: perms, createdAt: now, updatedAt: now }) });
  } catch (error: any) {
    console.error('Role create error:', error);
    return NextResponse.json({ error: 'Failed to create role', message: error.message }, { status: 500 });
  }
}
