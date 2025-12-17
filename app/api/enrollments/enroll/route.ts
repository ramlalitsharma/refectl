import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { validateSlug } from '@/lib/validation';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 10;
const rateMap = new Map<string, { ts: number; count: number }>();

/**
 * Smart Enrollment System
 * - Free courses: Direct enrollment
 * - Paid courses: Redirect to payment, then auto-enroll
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await req.json();
    const courseId = typeof rawBody.courseId === 'string' ? rawBody.courseId.trim() : undefined;
    const courseSlug = typeof rawBody.courseSlug === 'string' ? rawBody.courseSlug.trim() : undefined;
    if (!courseId && !courseSlug) {
      return NextResponse.json({ error: 'Course ID or slug is required' }, { status: 400 });
    }
    if (courseId && !ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 });
    }
    if (courseSlug && !validateSlug(courseSlug)) {
      return NextResponse.json({ error: 'Invalid courseSlug' }, { status: 400 });
    }

    const key = `enroll:${userId}:${courseId || courseSlug}`;
    const nowTs = Date.now();
    const entry = rateMap.get(key);
    if (entry && nowTs - entry.ts < RATE_LIMIT_WINDOW_MS) {
      if (entry.count >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateMap.set(key, { ts: entry.ts, count: entry.count + 1 });
    } else {
      rateMap.set(key, { ts: nowTs, count: 1 });
    }

    const db = await getDatabase();

    // Find course
    let course: any = null;
    if (ObjectId.isValid(courseId || courseSlug || '')) {
      course = await db.collection('courses').findOne({ _id: new ObjectId(courseId || courseSlug) });
    }
    
    if (!course) {
      course = await db.collection('courses').findOne({ slug: courseSlug || courseId });
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseIdentifier = course._id ? String(course._id) : (course.slug || courseId);

    // Check if already enrolled
    const existing = await db.collection('enrollments').findOne({
      userId,
      courseId: courseIdentifier,
    });

    if (existing && ['approved', 'completed'].includes(existing.status)) {
      return NextResponse.json({
        success: true,
        enrolled: true,
        message: 'Already enrolled',
        enrollment: existing,
      });
    }

    // Check if course is free or paid
    const coursePrice = course.price?.amount || 0;
    const isFree = coursePrice === 0 || !course.price;

    if (isFree) {
      // Free course: Direct enrollment
      const enrollment = {
        userId,
        courseId: courseIdentifier,
        status: 'approved',
        enrollmentType: 'free',
        requestedAt: new Date(),
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update existing or create new
      if (existing) {
        await db.collection('enrollments').updateOne(
          { _id: existing._id },
          {
            $set: {
              ...enrollment,
              status: 'approved',
            },
            $push: (({
              history: {
                status: 'approved',
                changedAt: new Date(),
                note: 'Auto-approved for free course',
              },
            }) as unknown as import('mongodb').PushOperator<any>),
          }
        );
      } else {
        await db.collection('enrollments').insertOne(enrollment);
      }

      return NextResponse.json({
        success: true,
        enrolled: true,
        message: 'Successfully enrolled in free course',
        enrollment: { ...enrollment, id: existing?._id || enrollment },
      });
    } else {
      // Paid course: Return payment URL
      return NextResponse.json({
        success: true,
        enrolled: false,
        requiresPayment: true,
        amount: coursePrice,
        currency: course.price?.currency || 'USD',
        courseId: courseIdentifier,
        courseSlug: course.slug,
        paymentUrl: `/checkout?courseId=${courseIdentifier}&amount=${coursePrice}`,
        message: 'Payment required for this course',
      });
    }
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to process enrollment', message: error.message },
      { status: 500 }
    );
  }
}
