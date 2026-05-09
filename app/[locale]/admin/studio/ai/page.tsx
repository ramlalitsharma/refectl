import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/admin-check';
import AICoPilotDashboard from '@/components/admin/studio/AICoPilotDashboard';

export const dynamic = 'force-dynamic';

export default async function AICoPilotPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const role = await getUserRole();
  if (!role || !['superadmin', 'admin', 'teacher', 'student', 'user'].includes(role)) {
    redirect('/dashboard');
  }

  return <AICoPilotDashboard />;
}
