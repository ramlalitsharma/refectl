import { ObjectId } from "mongodb";
import { auth } from "./auth";
import { getDatabase } from "./mongodb";
import { PermissionKey } from "./permissions";
import { resolveRoleClaims, RoleClaims } from "./role-utils";
import { ROLE_PERMISSIONS } from "./role-hierarchy";

async function fetchUserWithRoles(userId: string) {
  const db = await getDatabase();

  let query: Record<string, any> = { clerkId: userId };
  if (ObjectId.isValid(userId)) {
    query = { $or: [{ clerkId: userId }, { _id: new ObjectId(userId) }] };
  }

  const user = await db.collection("users").findOne(query);
  if (!user && userId.includes("@")) {
    const emailUser = await db
      .collection("users")
      .findOne({ email: userId.toLowerCase() });
    if (emailUser) {
      return { user: emailUser, roles: [] as any[] };
    }
  }
  if (!user) return { user: null, roles: [] as any[] };

  const roleIds = Array.isArray(user.roleIds)
    ? user.roleIds
        .map((id: any) => {
          if (id instanceof ObjectId) return id;
          if (typeof id === "string" && ObjectId.isValid(id))
            return new ObjectId(id);
          return null;
        })
        // Narrow the type here so TypeScript treats the result as ObjectId[]
        .filter((id): id is ObjectId => id !== null)
    : [];

  const roles = roleIds.length
    ? await db
        .collection("roles")
        .find({ _id: { $in: roleIds } })
        .toArray()
    : [];

  return { user, roles };
}

function roleHasPermission(roles: any[], permission: PermissionKey) {
  return roles.some(
    (role) =>
      Array.isArray(role.permissions) && role.permissions.includes(permission),
  );
}

function deriveRoleFromRoleDocs(
  roles: any[],
): "superadmin" | "admin" | "teacher" | null {
  if (!roles?.length) return null;
  if (roleHasPermission(roles, "superadmin:access")) return "superadmin";
  if (roleHasPermission(roles, "admin:access")) return "admin";
  if (roleHasPermission(roles, "teacher:access")) return "teacher";
  return null;
}

function getAuthProvider(): "clerk" | "lucia" {
  return (process.env.AUTH_PROVIDER || "clerk").toLowerCase() === "lucia"
    ? "lucia"
    : "clerk";
}

async function fetchRoleClaimsFromAuthProvider(
  userId: string,
): Promise<RoleClaims | null> {
  if (getAuthProvider() !== "clerk") return null;
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    if (!clerkUser) return null;
    // Some Clerk types may not include organizationMemberships in the declared type.
    // Use a safe any-cast to access it without TypeScript errors and keep runtime safety.
    const orgRole = (clerkUser as any)?.organizationMemberships?.[0]?.role;
    return resolveRoleClaims(
      clerkUser.publicMetadata as Record<string, any>,
      clerkUser.privateMetadata as Record<string, any>,
      { role: orgRole },
    );
  } catch (error) {
    console.warn("Failed to load role from Clerk:", error);
    return null;
  }
}

async function persistRoleClaims(userId: string, claims: RoleClaims) {
  try {
    const db = await getDatabase();
    await db.collection("users").updateOne(
      { clerkId: userId },
      {
        $set: {
          role: claims.role,
          isSuperAdmin: claims.isSuperAdmin,
          isAdmin: claims.isAdmin,
          isTeacher: claims.isTeacher,
          permissions: ROLE_PERMISSIONS[claims.role] || [],
          updatedAt: new Date(),
        },
      },
      { upsert: false },
    );
  } catch (error) {
    console.warn("Failed to persist role claims:", error);
  }
}

export async function getUserRole(): Promise<
  "superadmin" | "admin" | "teacher" | "student" | null
> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const { user, roles } = await fetchUserWithRoles(userId);
    let derivedRole: "superadmin" | "admin" | "teacher" | null = null;

    if (user) {
      if (
        user.role === "superadmin" ||
        user.role === "admin" ||
        user.role === "teacher"
      ) {
        derivedRole = user.role;
      } else if (user.isSuperAdmin === true) {
        derivedRole = "superadmin";
      } else if (user.isAdmin === true) {
        derivedRole = "admin";
      } else if (user.isTeacher === true) {
        derivedRole = "teacher";
      }
    }

    if (!derivedRole) {
      const roleFromDocs = deriveRoleFromRoleDocs(roles);
      if (roleFromDocs) {
        derivedRole = roleFromDocs;
      }
    }

    if (derivedRole) {
      return derivedRole;
    }

    const providerClaims = await fetchRoleClaimsFromAuthProvider(userId);
    if (providerClaims) {
      if (user) {
        await persistRoleClaims(userId, providerClaims);
      }
      return providerClaims.role;
    }

    if (user) {
      return "student";
    }

    return null;
  } catch (error) {
    console.error("Role check failed:", error);
    return null;
  }
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "superadmin";
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "superadmin" || role === "admin";
}

export async function isTeacher(): Promise<boolean> {
  const role = await getUserRole();
  return role === "superadmin" || role === "admin" || role === "teacher";
}

export async function userHasPermission(
  permission: PermissionKey,
): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const { user, roles } = await fetchUserWithRoles(userId);
    if (!user) return false;

    if (user.isAdmin === true) return true;
    if (
      Array.isArray(user.permissions) &&
      user.permissions.includes(permission)
    )
      return true;
    return roleHasPermission(roles, permission);
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}

export async function requireSuperAdmin() {
  const superAdmin = await isSuperAdmin();
  if (!superAdmin) {
    throw new Error("Super admin access required");
  }
  return true;
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Admin access required");
  }
  return true;
}

export async function requireTeacher() {
  const teacher = await isTeacher();
  if (!teacher) {
    throw new Error("Teacher access required");
  }
  return true;
}
