import { ObjectId } from 'mongodb';
import { auth } from './auth';
import { getDatabase } from './mongodb';
import { PermissionKey } from './permissions';

async function fetchUserWithRoles(userId: string) {
  const db = await getDatabase();

  let query: Record<string, any> = { clerkId: userId };
  if (ObjectId.isValid(userId)) {
    query = { $or: [{ clerkId: userId }, { _id: new ObjectId(userId) }] };
  }

  const user = await db.collection('users').findOne(query);
  if (!user) return { user: null, roles: [] as any[] };

  const roleIds = Array.isArray(user.roleIds)
    ? user.roleIds
        .map((id: any) => {
          if (id instanceof ObjectId) return id;
          if (typeof id === 'string' && ObjectId.isValid(id)) return new ObjectId(id);
          return null;
        })
        .filter(Boolean)
    : [];

  const roles = roleIds.length
    ? await db.collection('roles').find({ _id: { $in: roleIds } }).toArray()
    : [];

  return { user, roles };
}

function roleHasPermission(roles: any[], permission: PermissionKey) {
  return roles.some((role) => Array.isArray(role.permissions) && role.permissions.includes(permission));
}

export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const { user, roles } = await fetchUserWithRoles(userId);
    if (!user) return false;

    if (user.isAdmin === true) return true;
    if (roleHasPermission(roles, 'admin:access')) return true;
    if (Array.isArray(user.permissions) && user.permissions.includes('admin:access')) return true;
    if (roleHasPermission(roles, 'schemas:manage')) return true;
    if (Array.isArray(user.permissions) && user.permissions.includes('schemas:manage')) return true;

    return false;
  } catch (error) {
    console.error('Admin check failed:', error);
    return false;
  }
}

export async function userHasPermission(permission: PermissionKey): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const { user, roles } = await fetchUserWithRoles(userId);
    if (!user) return false;

    if (user.isAdmin === true) return true;
    if (Array.isArray(user.permissions) && user.permissions.includes(permission)) return true;
    return roleHasPermission(roles, permission);
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Admin access required');
  }
  return true;
}

