import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth, currentUser } from '@/lib/auth';
import { renderCompletionEmail, sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, courseId, courseTitle } = body as {
      type: 'course_completion' | 'quiz_completed' | 'achievement';
      courseId?: string;
      courseTitle?: string;
    };

    const user = await currentUser();
    if (!user?.email) return NextResponse.json({ error: 'User email not found' }, { status: 400 });

    // In production, use a service like SendGrid, Resend, or AWS SES
    // For now, we'll log and store the notification
    const db = await getDatabase();
    const notifications = db.collection('notifications');

    const notification = {
      userId,
      email: user.email,
      type,
      courseId,
      courseTitle,
      sent: false, // Set to true when actually sent via email service
      createdAt: new Date(),
    };

    await notifications.insertOne(notification);

    try {
      if ((process.env.EMAIL_PROVIDER || 'none').toLowerCase() === 'resend') {
        const { BRAND_NAME } = await import('@/lib/brand');
        const subject = type === 'course_completion' ? `You completed ${courseTitle}` : `${BRAND_NAME} Notification`;
        const html = type === 'course_completion' ? renderCompletionEmail(courseTitle) : renderCompletionEmail();
        await sendEmail({ to: user.email, subject, html });
      }
    } catch (e) {
      console.warn('Email provider send failed:', e);
    }

    return NextResponse.json({ success: true, message: 'Notification queued' });
  } catch (e: any) {
    console.error('Email notification error:', e);
    return NextResponse.json({ error: 'Failed to send notification', message: e.message }, { status: 500 });
  }
}

