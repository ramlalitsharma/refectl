import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { serializeEnrollment } from '@/lib/models/Enrollment';
import { ObjectId } from 'mongodb';

function normalizeId(id: any): string | undefined {
  if (!id) return undefined;
  if (typeof id === 'string') {
    return id;
  }
  if (typeof id === 'object') {
    if (typeof id.toHexString === 'function') return id.toHexString();
    if (typeof id.toString === 'function') {
      const str = id.toString();
      const match = str.match(/[a-fA-F0-9]{24}/);
      return match ? match[0] : str;
    }
  }
  return undefined;
}

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
    const enrollments = await db
      .collection('enrollments')
      .find({})
      .sort({ requestedAt: -1 })
      .limit(200)
      .toArray();

    // gather related user and course info
    const userIds = Array.from(new Set(enrollments.map((e: any) => e.userId).filter(Boolean)));
    const courseIds = Array.from(new Set(enrollments.map((e: any) => e.courseId).filter(Boolean)));
    const courseSlugs = Array.from(new Set(enrollments.map((e: any) => e.courseSlug).filter(Boolean)));

    const userObjectIds = userIds
      .filter((id: string) => ObjectId.isValid(id))
      .map((id: string) => new ObjectId(id));

    const courseObjectIds = courseIds
      .filter((id: string) => ObjectId.isValid(id))
      .map((id: string) => new ObjectId(id));

    const [users, courses] = await Promise.all([
      db
        .collection('users')
        .find({
          $or: [
            { clerkId: { $in: userIds } },
            ...(userObjectIds.length > 0 ? [{ _id: { $in: userObjectIds } }] : []),
          ],
        })
        .toArray(),
      db
        .collection('courses')
        .find({
          $or: [
            ...(courseObjectIds.length > 0 ? [{ _id: { $in: courseObjectIds } }] : []),
            { slug: { $in: [...courseIds, ...courseSlugs] } },
          ],
        })
        .toArray(),
    ]);

    const userMap = new Map<string, any>();
    users.forEach((user: any) => {
      if (user.clerkId) userMap.set(user.clerkId, user);
      if (user._id) userMap.set(String(user._id), user);
    });

    const courseMap = new Map<string, any>();
    courses.forEach((course: any) => {
      if (course._id) courseMap.set(String(course._id), course);
      if (course.slug) courseMap.set(course.slug, course);
    });

    const response = enrollments.map((enrollment: any) => {
      const serialized = serializeEnrollment(enrollment);
      const user = userMap.get(enrollment.userId) || {};
      const course = courseMap.get(enrollment.courseId) || {};
      const enrollmentId = normalizeId(enrollment._id) || `${enrollment.userId}:${enrollment.courseId}`;

      return {
        ...serialized,
        id: enrollmentId, // Ensure stable ID
        userName: user.name || user.fullName || user.firstName || user.email || 'Unknown user',
        userEmail: user.email || '',
        userId: enrollment.userId,
        courseTitle: serialized.courseTitle || course.title || 'Course',
        courseSlug: serialized.courseSlug || course.slug || '',
        courseId: enrollment.courseId,
      };
    });

    return NextResponse.json({ enrollments: response });
  } catch (error: any) {
    console.error('Admin enrollments fetch error:', error);
    return NextResponse.json({ error: 'Failed to load enrollments', message: error.message }, { status: 500 });
  }
}
