import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    const db = await getDatabase();
    
    // Get course
    const course = await db.collection('courses').findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already completed
    const existing = await db.collection('courseCompletions').findOne({
      userId,
      courseId: String(course._id),
    });

    if (existing) {
      return NextResponse.json({ success: true, certificateId: existing.certificateId });
    }

    // Generate certificate
    const certRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/certificates/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        courseId: String(course._id),
        courseName: course.title,
      }),
    });

    const certData = await certRes.json();
    const certificateId = certData.certificateId;

    // Record completion
    await db.collection('courseCompletions').insertOne({
      userId,
      courseId: String(course._id),
      courseSlug: slug,
      courseName: course.title,
      certificateId,
      completedAt: new Date(),
    });

    // Send notification
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

    // Send email
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

