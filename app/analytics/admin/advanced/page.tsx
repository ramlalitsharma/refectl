import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export const dynamic = 'force-dynamic';

export default async function AdvancedAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    const { requireAdmin } = await import('@/lib/admin-check');
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();

  // Fetch comprehensive analytics data
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalRevenue,
    recentPayments,
    coursePerformance,
    userEngagement,
    monthlyRevenue,
  ] = await Promise.all([
    db.collection('users').countDocuments(),
    db.collection('courses').countDocuments({ status: 'published' }),
    db.collection('enrollments').countDocuments({ status: 'approved' }),
    db.collection('payments').aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).toArray(),
    db.collection('payments')
      .find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
    db.collection('courses')
      .aggregate([
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $project: {
            title: 1,
            enrollmentCount: { $size: '$enrollments' },
            slug: 1,
          },
        },
        { $sort: { enrollmentCount: -1 } },
        { $limit: 10 },
      ])
      .toArray(),
    db.collection('userProgress')
      .aggregate([
        {
          $group: {
            _id: '$userId',
            totalQuizzes: { $sum: 1 },
            avgScore: { $avg: '$score' },
          },
        },
        {
          $group: {
            _id: null,
            avgQuizzesPerUser: { $avg: '$totalQuizzes' },
            avgScore: { $avg: '$avgScore' },
          },
        },
      ])
      .toArray(),
    db.collection('payments')
      .aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ])
      .toArray(),
  ]);

  const analyticsData = {
    overview: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
    recentPayments: recentPayments.map((p: any) => ({
      id: String(p._id),
      amount: p.amount,
      currency: p.currency,
      courseId: p.courseId,
      userId: p.userId,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    })),
    coursePerformance: coursePerformance.map((c: any) => ({
      title: c.title,
      slug: c.slug,
      enrollmentCount: c.enrollmentCount,
    })),
    userEngagement: {
      avgQuizzesPerUser: userEngagement[0]?.avgQuizzesPerUser || 0,
      avgScore: userEngagement[0]?.avgScore || 0,
    },
    monthlyRevenue: monthlyRevenue.map((m: any) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      revenue: m.revenue,
      count: m.count,
    })),
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Analytics', href: '/analytics/admin' },
            { label: 'Advanced' },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold text-slate-900">Advanced Analytics</h1>
          <p className="text-slate-600 mt-2">Comprehensive insights into your platform performance</p>
        </div>

        <AdvancedAnalytics data={analyticsData} />
      </div>
    </div>
  );
}

