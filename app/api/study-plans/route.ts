import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { validateTitle, sanitizeInput } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 10;
const rateMap = new Map<string, { ts: number; count: number }>();

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const isPublic = searchParams.get('public') === 'true';
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)));

    const db = await getDatabase();
    const query: any = {};

    if (isPublic) {
      query.isPublic = true;
    } else {
      query.userId = userId;
    }

    const plans = await db
      .collection('studyPlans')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      plans: plans.map((plan: any) => ({
        ...plan,
        id: String(plan._id),
      })),
    });
  } catch (error: any) {
    console.error('Study plans fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study plans', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      courses,
      startDate,
      endDate,
      dailyHours,
      isPublic = false,
    } = body;

    const t = validateTitle(String(title || ''));
    if (!t.valid || !courses || !Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json(
        { error: t.error || 'Title and at least one course are required' },
        { status: 400 }
      );
    }

    const key = `study-plan:create:${userId}`;
    const nowTs = Date.now();
    const existing = rateMap.get(key);
    if (existing && nowTs - existing.ts < RATE_LIMIT_WINDOW_MS) {
      if (existing.count >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateMap.set(key, { ts: existing.ts, count: existing.count + 1 });
    } else {
      rateMap.set(key, { ts: nowTs, count: 1 });
    }

    const db = await getDatabase();

    // Calculate total duration and create schedule
    const schedule = courses.map((course: any, index: number) => ({
      courseId: String(course.courseId || ''),
      courseTitle: sanitizeInput(String(course.courseTitle || 'Course')).slice(0, 200),
      order: course.order || index,
      estimatedHours: course.estimatedHours || 10,
      startDate: course.startDate || undefined,
      endDate: course.endDate || undefined,
      status: 'pending', // pending, in-progress, completed
    }));

    const totalHours = schedule.reduce((sum: number, item: any) => sum + item.estimatedHours, 0);
    const estimatedDays = dailyHours > 0 ? Math.ceil(totalHours / dailyHours) : totalHours;

    const studyPlan = {
      title: String(title).trim(),
      description: description ? sanitizeInput(String(description)).slice(0, 1000) : undefined,
      userId,
      courses: schedule,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      dailyHours: dailyHours || 2,
      totalHours,
      estimatedDays,
      progress: 0,
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('studyPlans').insertOne(studyPlan);
    const created = await db.collection('studyPlans').findOne({ _id: result.insertedId });

    return NextResponse.json({
      plan: { ...created, id: String(created?._id) },
      success: true,
    });
  } catch (error: any) {
    console.error('Study plan creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create study plan', message: error.message },
      { status: 500 }
    );
  }
}

