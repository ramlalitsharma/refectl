import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { UserManagement } from '@/components/admin/UserManagement';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="bg-[#f4f6f9] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <UserManagement />
      </div>
    </div>
  );
}
