import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/admin-check';
import AnalyticsDashboard from '@/components/admin/studio/AnalyticsDashboard';

export const dynamic = 'force-dynamic';

export default async function AnalyticsStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const role = await getUserRole();
  if (!role || !['superadmin', 'admin', 'teacher', 'student', 'user'].includes(role)) {
    redirect('/dashboard');
  }

  return <AnalyticsDashboard />;
}
