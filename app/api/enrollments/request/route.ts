import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { EnrollmentRecord } from '@/lib/models/Enrollment';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const db = await getDatabase();

    // verify course exists
    let course: any = null;
    try {
      course = await db.collection('courses').findOne({ _id: new ObjectId(courseId) });
    } catch {
      course = await db.collection('courses').findOne({ slug: courseId });
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseIdentifier = course._id ? String(course._id) : courseId;

    const existing = await db.collection<EnrollmentRecord>('enrollments').findOne({
      userId,
      courseId: courseIdentifier,
    });

    if (existing && ['pending', 'approved', 'waitlisted'].includes(existing.status)) {
      return NextResponse.json({
        success: true,
        message: 'Enrollment already exists',
        status: existing.status,
      });
    }

    const now = new Date();

    if (existing && existing.status === 'rejected') {
      await db.collection('enrollments').updateOne(
        { _id: existing._id },
        {
          $set: {
            status: 'pending',
            requestedAt: now,
            decidedAt: null,
            adminId: null,
            notes: null,
            waitlistPosition: null,
          },
          $push: (({
            history: {
              status: 'pending',
              changedAt: now,
              adminId: null,
              note: 'Learner re-submitted enrollment request',
            },
          }) as unknown as import('mongodb').PushOperator<any>),
        },
      );

      return NextResponse.json({ success: true, status: 'pending' });
    }

    const record: EnrollmentRecord = {
      userId,
      courseId: courseIdentifier,
      courseSlug: course.slug || courseId,
      courseTitle: course.title || 'Course',
      status: 'pending',
      requestedAt: now,
      history: [
        {
          status: 'pending',
          changedAt: now,
          adminId: null,
          note: 'Enrollment requested by learner',
        },
      ],
    };

    await db.collection('enrollments').insertOne(record);

    return NextResponse.json({ success: true, status: 'pending' });
  } catch (error: any) {
    console.error('Enrollment request error:', error);
    return NextResponse.json({ error: 'Failed to request enrollment', message: error.message }, { status: 500 });
  }
}
