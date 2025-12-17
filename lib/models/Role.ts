import { ObjectId } from 'mongodb';
import { PermissionKey } from '@/lib/permissions';

export interface Role {
  _id?: ObjectId;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeRole(role: Role & { _id?: any }) {
  return {
    id: role._id ? String(role._id) : String(role.name),
    name: role.name,
    description: role.description || '',
    permissions: role.permissions || [],
    isSystem: role.isSystem === true,
    createdAt: role.createdAt instanceof Date ? role.createdAt.toISOString() : role.createdAt,
    updatedAt: role.updatedAt instanceof Date ? role.updatedAt.toISOString() : role.updatedAt,
  };
}
