import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeRole } from '@/lib/models/Role';
import { RoleManager } from '@/components/admin/RoleManager';

export const dynamic = 'force-dynamic';

export default async function AdminRolesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();

  const rolesRaw = await db.collection('roles').find({}).sort({ createdAt: -1 }).toArray();
  const usersRaw = await db
    .collection('users')
    .find({}, { projection: { name: 1, email: 1, roleIds: 1, clerkId: 1 } })
    .sort({ createdAt: -1 })
    .limit(25)
    .toArray();

  const roles = rolesRaw.map((role: any) => serializeRole(role));
  const users = usersRaw.map((user: any) => ({
    id: user._id ? user._id.toString() : user.clerkId,
    name: user.name || '',
    email: user.email || '',
    roleIds: (user.roleIds || []).map((roleId: any) => roleId.toString()),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Role Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create reusable permission sets and assign them to administrators and editors.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <RoleManager initialRoles={roles} users={users} />
      </main>
    </div>
  );
}
