import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-check';
import { EnrollmentStatus } from '@/lib/models/Enrollment';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId: adminId } = await auth();
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, cohort, notes, waitlistPosition } = await req.json();
    const { enrollmentId } = await params;

    const allowedStatuses: EnrollmentStatus[] = ['pending', 'approved', 'waitlisted', 'rejected'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = await getDatabase();
    const now = new Date();
    const update: any = {
      updatedAt: now,
    };

    if (status) {
      update.status = status;
      update.decidedAt = ['approved', 'rejected'].includes(status) ? now : null;
      update.adminId = adminId;
    }
    if (cohort !== undefined) {
      update.cohort = cohort || null;
    }
    if (notes !== undefined) {
      update.notes = notes || null;
    }
    if (waitlistPosition !== undefined) {
      update.waitlistPosition = waitlistPosition !== null ? Number(waitlistPosition) : null;
    }

    // Try multiple query strategies to find enrollment
    let query: any = {};
    
    // First try as ObjectId
    if (ObjectId.isValid(enrollmentId)) {
      query = {
        $or: [
          { _id: new ObjectId(enrollmentId) },
          { id: enrollmentId },
        ],
      };
    } else {
      // Try as composite key format: "userId:courseId"
      if (enrollmentId.includes(':')) {
        const [userId, courseId] = enrollmentId.split(':');
        query = {
          userId,
          courseId,
        };
      } else {
        // Try as string ID field or direct _id match
        query = {
          $or: [
            { id: enrollmentId },
            { _id: enrollmentId },
          ],
        };
      }
    }

    const result = await db.collection('enrollments').findOneAndUpdate(
      query,
      {
        $set: update,
        ...(status
          ? {
              $push: (({
                history: {
                  status,
                  changedAt: now,
                  adminId,
                  note: notes || null,
                },
              }) as unknown as import('mongodb').PushOperator<any>),
            }
          : {}),
      },
      { returnDocument: 'after' },
    );

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, enrollment: result.value });
  } catch (error: any) {
    console.error('Admin enrollment update error:', error);
    return NextResponse.json({ error: 'Failed to update enrollment', message: error.message }, { status: 500 });
  }
}
