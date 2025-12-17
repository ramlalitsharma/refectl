import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth, currentUser } from '@/lib/auth';
import crypto from 'crypto';
import { validateTitle } from '@/lib/validation';

export const runtime = 'nodejs';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 5;
const rateMap = new Map<string, { ts: number; count: number }>();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const courseId = String(body?.courseId || '');
    const courseTitle = String(body?.courseTitle || '');
    if (!courseId) return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    const titleCheck = validateTitle(courseTitle);
    if (!titleCheck.valid) return NextResponse.json({ error: titleCheck.error || 'Invalid course title' }, { status: 400 });

    const key = `cert-generate:${userId}:${courseId}`;
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

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

    const db = await getDatabase();
    const certificates = db.collection('certificates');

    // Generate certificate ID
    const certId = crypto.randomBytes(16).toString('hex');
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year validity

    const certificate = {
      id: certId,
      userId,
      userName: user.firstName || user.email || 'Learner',
      courseId,
      courseTitle,
      issuedAt,
      expiresAt,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com'}/certificates/verify/${certId}`,
      createdAt: issuedAt,
    };

    await certificates.insertOne(certificate);

    // Trigger email notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'course_completion', courseId, courseTitle }),
      });
    } catch (e) {
      console.warn('Failed to send completion email:', e);
    }

    return NextResponse.json({ certificate });
  } catch (e: any) {
    console.error('Certificate generation error:', e);
    return NextResponse.json({ error: 'Failed to generate certificate', message: e.message }, { status: 500 });
  }
}

