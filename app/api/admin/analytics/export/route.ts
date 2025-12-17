import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv'; // 'csv' or 'json'
    const type = searchParams.get('type') || 'revenue'; // 'revenue', 'users', 'courses', 'all'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDatabase();
    const dateFilter: any = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let data: any = {};

    if (type === 'revenue' || type === 'all') {
      // Revenue analytics
      const payments = await db
        .collection('payments')
        .find({ ...dateFilter, status: 'completed' })
        .toArray();

      const subscriptions = await db
        .collection('users')
        .find({
          ...dateFilter,
          $or: [
            { subscriptionStatus: 'active' },
            { 'publicMetadata.subscriptionStatus': 'active' },
          ],
        })
        .toArray();

      const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const monthlyRecurring = subscriptions.length * 19; // $19/month

      data.revenue = {
        totalRevenue,
        monthlyRecurring,
        totalPayments: payments.length,
        activeSubscriptions: subscriptions.length,
        payments: payments.map((p: any) => ({
          id: String(p._id),
          amount: p.amount,
          currency: p.currency || 'USD',
          status: p.status,
          createdAt: p.createdAt,
          userId: p.userId,
        })),
      };
    }

    if (type === 'users' || type === 'all') {
      // User analytics
      const users = await db
        .collection('users')
        .find(dateFilter)
        .toArray();

      const enrollments = await db
        .collection('enrollments')
        .find(dateFilter)
        .toArray();

      data.users = {
        totalUsers: users.length,
        totalEnrollments: enrollments.length,
        users: users.map((u: any) => ({
          id: String(u._id),
          email: u.email,
          name: u.name,
          role: u.role,
          createdAt: u.createdAt,
          subscriptionTier: u.subscriptionTier,
        })),
      };
    }

    if (type === 'courses' || type === 'all') {
      // Course analytics
      const courses = await db
        .collection('courses')
        .find(dateFilter)
        .toArray();

      const enrollments = await db
        .collection('enrollments')
        .find(dateFilter)
        .toArray();

      data.courses = {
        totalCourses: courses.length,
        publishedCourses: courses.filter((c: any) => c.status === 'published').length,
        totalEnrollments: enrollments.length,
        courses: courses.map((c: any) => ({
          id: String(c._id),
          title: c.title,
          slug: c.slug,
          status: c.status,
          price: c.price,
          enrollments: enrollments.filter((e: any) => e.courseId === String(c._id)).length,
          createdAt: c.createdAt,
        })),
      };
    }

    if (format === 'csv') {
      // Convert to CSV
      let csv = '';
      
      if (data.revenue) {
        csv += 'Revenue Report\n';
        csv += 'Total Revenue,Monthly Recurring,Total Payments,Active Subscriptions\n';
        csv += `${data.revenue.totalRevenue},${data.revenue.monthlyRecurring},${data.revenue.totalPayments},${data.revenue.activeSubscriptions}\n\n`;
        csv += 'Payment Details\n';
        csv += 'ID,Amount,Currency,Status,Date\n';
        data.revenue.payments.forEach((p: any) => {
          csv += `${p.id},${p.amount},${p.currency},${p.status},${p.createdAt}\n`;
        });
        csv += '\n';
      }

      if (data.users) {
        csv += 'User Report\n';
        csv += 'Total Users,Total Enrollments\n';
        csv += `${data.users.totalUsers},${data.users.totalEnrollments}\n\n`;
      }

      if (data.courses) {
        csv += 'Course Report\n';
        csv += 'Total Courses,Published Courses,Total Enrollments\n';
        csv += `${data.courses.totalCourses},${data.courses.publishedCourses},${data.courses.totalEnrollments}\n`;
      }

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics', message: error.message },
      { status: 500 }
    );
  }
}

