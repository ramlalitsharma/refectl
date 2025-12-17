import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export const dynamic = 'force-dynamic';

export default async function StudyPlansPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const db = await getDatabase();
  const plans = await db
    .collection('studyPlans')
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Learning', href: '/my-learning' },
            { label: 'Study Plans' },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Study Plans</h1>
            <p className="text-slate-600 mt-2">Create and manage your personalized study schedules</p>
          </div>
          <Button asChild>
            <Link href="/study-plans/create">+ Create Study Plan</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-slate-500 mb-4">No study plans yet</p>
                <Button asChild>
                  <Link href="/study-plans/create">Create Your First Study Plan</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            plans.map((plan: any) => (
              <Card key={String(plan._id)} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  {plan.description && (
                    <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Courses:</span>
                    <span className="font-medium">{plan.courses?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Hours:</span>
                    <span className="font-medium">{plan.totalHours || 0}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progress:</span>
                    <span className="font-medium">{plan.progress || 0}%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${plan.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href={`/study-plans/${plan._id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

