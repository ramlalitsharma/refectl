import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { serializePlan } from '@/lib/models/SubscriptionPlan';
import { SubscriptionPlanManager } from '@/components/admin/SubscriptionPlanManager';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const plans = await db.collection('subscriptionPlans').find({}).sort({ price: 1 }).toArray();
  const serialized = plans.map((plan: any) => serializePlan(plan));

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">← Admin Panel</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Subscription Plans</h1>
          <p className="text-sm text-slate-500">
            Configure pricing, benefits, and Lime/Lemon Squeezy integration for each tier. Toggle visibility instantly without redeploying.
          </p>
        </div>

        <SubscriptionPlanManager initialPlans={serialized} />
      </main>
    </div>
  );
}
