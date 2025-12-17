import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 10;
const rateMap = new Map<string, { ts: number; count: number }>();

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp = req.nextUrl.searchParams;
    const startDate = sp.get('startDate');
    const endDate = sp.get('endDate');

    const key = `funnel:${userId}`;
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
    const progress = db.collection('userProgress');
    const courses = db.collection('courses');
    const certificates = db.collection('certificates');

    // Funnel: View → Start → Complete → Certificate
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [viewedCourses, startedQuizzes, completedQuizzes, earnedCerts] = await Promise.all([
      // Viewed courses (approximate: users who accessed course pages)
      courses.countDocuments({ status: { $ne: 'draft' }, ...dateFilter }),
      // Started quizzes (progress entries)
      progress.countDocuments({ userId, ...dateFilter }),
      // Completed quizzes (score exists)
      progress.countDocuments({ userId, score: { $exists: true, $ne: null }, ...dateFilter }),
      // Certificates earned
      certificates.countDocuments({ userId, ...dateFilter }),
    ]);

    const funnel = {
      viewedCourses,
      startedQuizzes,
      completedQuizzes,
      earnedCerts,
      completionRate: startedQuizzes > 0 ? Math.round((completedQuizzes / startedQuizzes) * 100) : 0,
      certificateRate: completedQuizzes > 0 ? Math.round((earnedCerts / completedQuizzes) * 100) : 0,
    };

    return NextResponse.json(funnel);
  } catch (e: any) {
    console.error('Funnel analytics error:', e);
    return NextResponse.json({ error: 'Failed to fetch funnel', message: e.message }, { status: 500 });
  }
}

