import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { validateSlug } from '@/lib/validation';

export const runtime = 'nodejs';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 5;
const rateMap = new Map<string, { ts: number; count: number }>();

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    if (!validateSlug(slug)) {
      return NextResponse.json({ error: 'Invalid course slug' }, { status: 400 });
    }

    const rateKey = `course-complete:${userId}:${slug}`;
    const nowTs = Date.now();
    const existing = rateMap.get(rateKey);
    if (existing && nowTs - existing.ts < RATE_LIMIT_WINDOW_MS) {
      if (existing.count >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateMap.set(rateKey, { ts: existing.ts, count: existing.count + 1 });
    } else {
      rateMap.set(rateKey, { ts: nowTs, count: 1 });
    }
    const db = await getDatabase();
    
    const course = await db.collection('courses').findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const existingCompletion = await db.collection('courseCompletions').findOne({
      userId,
      courseId: String(course._id),
    });

    if (existingCompletion) {
      return NextResponse.json({ success: true, certificateId: existingCompletion.certificateId });
    }

    const certRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/certificates/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        courseId: String(course._id),
        courseTitle: course.title,
      }),
    });

    if (!certRes.ok) {
      const err = await certRes.json().catch(() => ({}));
      return NextResponse.json({ error: 'Certificate generation failed', details: err }, { status: 500 });
    }
    const certData = await certRes.json();
    const certificateId = certData?.certificate?.id;

    await db.collection('courseCompletions').insertOne({
      userId,
      courseId: String(course._id),
      courseSlug: slug,
      courseName: course.title,
      certificateId,
      completedAt: new Date(),
    });

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'success',
        title: 'Course Completed! 🎉',
        message: `You've completed "${course.title}". Download your certificate!`,
        link: `/certificates/${certificateId}`,
        userId,
      }),
    });

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'course_completion',
        userId,
        courseName: course.title,
        certificateId,
      }),
    });

    return NextResponse.json({ success: true, certificateId });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to complete course', message: e.message }, { status: 500 });
  }
}

