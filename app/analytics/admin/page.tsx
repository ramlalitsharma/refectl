import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

interface RevenuePoint {
  period: string;
  mrr: number;
  arr: number;
  churn: number;
}

interface FinancialStats {
  totals: {
    mrr: number;
    arr: number;
    customers: number;
    churnRate: number;
  };
  trends: RevenuePoint[];
  planBreakdown: {
    planName: string;
    subscribers: number;
    revenue: number;
  }[];
  churnReasons: {
    reason: string;
    count: number;
  }[];
}

async function getFinancialStats(): Promise<FinancialStats> {
  const db = await getDatabase();

  const [subscriptions, invoices, churnEvents] = await Promise.all([
    db.collection('users').find({ subscriptionTier: { $in: ['premium', 'pro'] } }).toArray(),
    db.collection('invoices').find({ status: 'paid' }).toArray(),
    db.collection('subscriptionChurn').find({}).toArray(),
  ]);

  const totals = {
    mrr: 0,
    arr: 0,
    customers: subscriptions.length,
    churnRate: 0,
  };

  const revenueByPeriod: Record<string, RevenuePoint> = {};
  invoices.forEach((invoice: any) => {
    const date = new Date(invoice.paidAt || invoice.createdAt || Date.now());
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!revenueByPeriod[key]) {
      revenueByPeriod[key] = { period: key, mrr: 0, arr: 0, churn: 0 };
    }
    const amount = invoice.amount || 0;
    revenueByPeriod[key].mrr += amount;
    revenueByPeriod[key].arr += amount * 12;
    totals.mrr += amount;
    totals.arr += amount * 12;
  });

  const churnByPeriod: Record<string, number> = {};
  churnEvents.forEach((event: any) => {
    const date = new Date(event.occurredAt || Date.now());
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    churnByPeriod[key] = (churnByPeriod[key] || 0) + 1;
  });

  Object.entries(churnByPeriod).forEach(([period, churnCount]) => {
    if (!revenueByPeriod[period]) {
      revenueByPeriod[period] = { period, mrr: 0, arr: 0, churn: 0 };
    }
    revenueByPeriod[period].churn = churnCount;
  });

  totals.churnRate = subscriptions.length
    ? Math.round((churnEvents.length / subscriptions.length) * 100)
    : 0;

  const planBreakdown = subscriptions.reduce((acc: any, user: any) => {
    const plan = user.subscriptionPlan || user.subscriptionTier || 'premium';
    if (!acc[plan]) acc[plan] = { planName: plan, subscribers: 0, revenue: 0 };
    acc[plan].subscribers += 1;
    acc[plan].revenue += user.planAmount || 19;
    return acc;
  }, {});

  const churnReasons = churnEvents.reduce((acc: any, event: any) => {
    const reason = event.reason || 'Other';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});

  return {
    totals,
    trends: Object.values(revenueByPeriod).sort((a, b) => (a.period > b.period ? 1 : -1)).slice(-6),
    planBreakdown: Object.values(planBreakdown),
    churnReasons: Object.entries(churnReasons).map(([reason, count]) => ({ reason, count: Number(count) })),
  };
}

export default async function AdminAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const stats = await getFinancialStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-semibold">Financial Analytics</h1>
          <p className="mt-2 text-sm text-white/80">
            Monitor subscription revenue, churn, and plan performance in real time.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10 space-y-10">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Monthly Recurring Revenue"
            value={`$${(stats.totals.mrr || 0).toLocaleString()}`}
            subtitle="Current month"
            icon={<span>💰</span>}
            color="green"
          />
          <StatCard
            title="Annual Run Rate"
            value={`$${(stats.totals.arr || 0).toLocaleString()}`}
            subtitle="Projected"
            icon={<span>📈</span>}
            color="blue"
          />
          <StatCard
            title="Active Subscribers"
            value={stats.totals.customers.toLocaleString()}
            subtitle="Premium tiers"
            icon={<span>👥</span>}
            color="purple"
          />
          <StatCard
            title="Churn Rate"
            value={`${stats.totals.churnRate}%`}
            subtitle="This quarter"
            icon={<span>⚠️</span>}
            color="red"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white text-slate-900">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.trends.length === 0 ? (
                <p className="text-sm text-slate-500">No revenue data yet.</p>
              ) : (
                <div className="space-y-4">
                  {stats.trends.map((point) => (
                    <div key={point.period} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>{point.period}</span>
                        <span>${point.mrr.toLocaleString()} MRR</span>
                      </div>
                      <Progress value={Math.min(point.mrr / 1000, 100)} color="blue" />
                      <div className="mt-2 flex justify-between text-xs text-slate-500">
                        <span>ARR: ${point.arr.toLocaleString()}</span>
                        <span>Churned: {point.churn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white text-slate-900">
            <CardHeader>
              <CardTitle>Plan Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.planBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500">No subscribers yet.</p>
              ) : (
                <div className="space-y-4">
                  {stats.planBreakdown.map((plan) => (
                    <div key={plan.planName} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>{plan.planName}</span>
                        <span>{plan.subscribers} subscribers</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">Monthly revenue: ${plan.revenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white text-slate-900">
            <CardHeader>
              <CardTitle>Churn Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.churnReasons.length === 0 ? (
                <p className="text-sm text-slate-500">No churn events recorded.</p>
              ) : (
                <div className="space-y-3">
                  {stats.churnReasons.map((item) => (
                    <div key={item.reason} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">{item.reason}</span>
                      <Badge variant="warning">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white text-slate-900">
            <CardHeader>
              <CardTitle>Actionable Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <span className="font-semibold text-slate-900">Retention:</span> Target cohorts with churned users by offering refresher
                  content and highlighting new premium features.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Upsell:</span> {stats.planBreakdown.length > 1 ? 'Bundle popular plans together for cohort-based promotions.' : 'Introduce a higher tier with live mentorship add-ons.'}
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Product:</span> Review top churn reasons and prioritize roadmap items to improve perceived value.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
