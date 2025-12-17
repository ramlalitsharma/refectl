import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';
import { ObjectId } from 'mongodb';

/**
 * Manual Enrollment System
 * Allows Admin/Teacher/Superadmin to manually enroll students
 * Can enroll by email or user details
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: adminId } = await auth();
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requireAdmin();

    const body = await req.json();
    const {
      courseId,
      email,
      userId: targetUserId,
      firstName,
      lastName,
      enrollmentType = 'manual',
      notes,
    } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    if (!email && !targetUserId) {
      return NextResponse.json(
        { error: 'Email or User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const client = await clerkClient();

    // Find or create user
    let user: any = null;
    let clerkUserId: string | null = null;

    if (targetUserId) {
      // User ID provided
      clerkUserId = targetUserId;
      try {
        user = await client.users.getUser(targetUserId);
      } catch {
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
      }
    } else if (email) {
      // Email provided - find or create user
      try {
        // Try to find existing user
        const existingUsers = await client.users.getUserList({ emailAddress: [email] });
        if (existingUsers.data.length > 0) {
          user = existingUsers.data[0];
          clerkUserId = user.id;
        } else {
          // Create new user
          user = await client.users.createUser({
            emailAddress: [email],
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            skipPasswordChecks: true,
            skipPasswordRequirement: true,
          });
          clerkUserId = user.id;

          // Create user record in MongoDB
          await db.collection('users').insertOne({
            clerkId: clerkUserId,
            email: email.toLowerCase(),
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            role: 'student',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Failed to find or create user', message: error.message },
          { status: 500 }
        );
      }
    }

    if (!clerkUserId || !user) {
      return NextResponse.json({ error: 'Failed to identify user' }, { status: 500 });
    }

    // Find course
    let course: any = null;
    if (ObjectId.isValid(courseId)) {
      course = await db.collection('courses').findOne({ _id: new ObjectId(courseId) });
    }
    if (!course) {
      course = await db.collection('courses').findOne({ slug: courseId });
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseIdentifier = course._id ? String(course._id) : course.slug;

    // Check if already enrolled
    const existing = await db.collection('enrollments').findOne({
      userId: clerkUserId,
      courseId: courseIdentifier,
    });

    const now = new Date();
    const enrollment = {
      userId: clerkUserId,
      courseId: courseIdentifier,
      status: 'approved',
      enrollmentType: enrollmentType || 'manual',
      enrolledBy: adminId,
      notes: notes || `Manually enrolled by admin`,
      requestedAt: now,
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          status: 'approved',
          changedAt: now,
          adminId,
          note: notes || 'Manually enrolled by admin',
        },
      ],
    };

    if (existing) {
      // Update existing enrollment
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
              changedAt: now,
              adminId,
              note: notes || 'Re-approved by admin',
            },
          }) as unknown as import('mongodb').PushOperator<any>),
        }
      );

      return NextResponse.json({
        success: true,
        enrollment: { ...enrollment, id: String(existing._id) },
        message: 'Enrollment updated successfully',
      });
    } else {
      // Create new enrollment
      const result = await db.collection('enrollments').insertOne(enrollment);

      return NextResponse.json({
        success: true,
        enrollment: { ...enrollment, id: String(result.insertedId) },
        message: 'Student enrolled successfully',
      });
    }
  } catch (error: any) {
    console.error('Manual enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll student', message: error.message },
      { status: 500 }
    );
  }
}

