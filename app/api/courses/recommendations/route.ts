import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { getCache, setCache } from '@/lib/cache/redis';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cacheKey = `recommendations:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ recommendations: cached });
    }

    const db = await getDatabase();

    // Get user's progress to recommend based on subjects they're studying
    const userProgress = await db.collection('userProgress').find({ userId }).toArray();
    const userSubjects = new Set(userProgress.map((p: any) => p.subject).filter(Boolean));

    // Get courses in similar subjects
    const recommendations = await db.collection('courses')
      .find({
        status: 'published',
        subject: { $in: Array.from(userSubjects) }
      })
      .limit(6)
      .toArray();

    // If not enough, add popular courses
    if (recommendations.length < 6) {
      const popular = await db.collection('courses')
        .find({
          status: 'published',
          subject: { $nin: Array.from(userSubjects) }
        })
        .sort({ createdAt: -1 })
        .limit(6 - recommendations.length)
        .toArray();
      recommendations.push(...popular);
    }

    const result = recommendations.slice(0, 6);
    // Cache for 1 hour
    await setCache(cacheKey, result, 3600);

    return NextResponse.json({ recommendations: result });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to get recommendations', message: e.message }, { status: 500 });
  }
}

