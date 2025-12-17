import type { UserRole } from './role-hierarchy';

export type RoleClaims = {
  role: UserRole;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
};

const ROLE_KEYS = ['role', 'Role', 'userRole', 'appRole'];

function extractRoleValue(source: Record<string, any> = {}): string | null {
  for (const key of ROLE_KEYS) {
    const value = source?.[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim().toLowerCase();
    }
  }
  return null;
}

export function resolveRoleClaims(
  ...sources: Array<Record<string, any> | null | undefined>
): RoleClaims | null {
  const merged = Object.assign({}, ...sources.filter(Boolean));

  const explicitRole = extractRoleValue(merged);
  const hasFlag =
    typeof merged?.isSuperAdmin !== 'undefined' ||
    typeof merged?.isAdmin !== 'undefined' ||
    typeof merged?.isTeacher !== 'undefined';

  if (!explicitRole && !hasFlag) {
    return null;
  }

  let role: UserRole =
    explicitRole && ['superadmin', 'admin', 'teacher', 'student'].includes(explicitRole)
      ? (explicitRole as UserRole)
      : 'student';

  const isSuperAdmin = merged?.isSuperAdmin === true || role === 'superadmin';
  const isAdmin = merged?.isAdmin === true || isSuperAdmin || role === 'admin';
  const isTeacher = merged?.isTeacher === true || isAdmin || role === 'teacher';

  if (isSuperAdmin) {
    role = 'superadmin';
  } else if (isAdmin) {
    role = role === 'student' ? 'admin' : role;
  } else if (isTeacher && role === 'student') {
    role = 'teacher';
  }

  return { role, isSuperAdmin, isAdmin, isTeacher };
}


