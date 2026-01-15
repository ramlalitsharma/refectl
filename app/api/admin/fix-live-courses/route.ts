import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';

export const runtime = 'nodejs';

/**
 * Manual fix endpoint to update already-ended live courses
 * This will:
 * 1. Find all courses with type 'live-course' that should be video courses
 * 2. Update their type to 'video-course'
 * 3. Update associated liveRooms to 'ended' status
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await requireAdmin();

        const db = await getDatabase();

        // Find all live courses
        const liveCourses = await db.collection('courses')
            .find({ type: 'live-course' })
            .toArray();

        let convertedCount = 0;
        let roomsUpdatedCount = 0;

        // Convert each live course to video course
        for (const course of liveCourses) {
            // Update course type
            await db.collection('courses').updateOne(
                { _id: course._id },
                {
                    $set: {
                        type: 'video-course',
                        status: 'published',
                        updatedAt: new Date()
                    }
                }
            );
            convertedCount++;

            // Update associated live rooms
            const roomsResult = await db.collection('liveRooms').updateMany(
                { courseId: course._id.toString() },
                {
                    $set: {
                        status: 'ended',
                        endedAt: new Date()
                    }
                }
            );
            roomsUpdatedCount += roomsResult.modifiedCount;
        }

        return NextResponse.json({
            success: true,
            message: `Converted ${convertedCount} live courses to video courses and updated ${roomsUpdatedCount} live rooms to ended status`,
            convertedCourses: convertedCount,
            updatedRooms: roomsUpdatedCount
        });
    } catch (error: any) {
        console.error('Fix live courses error:', error);
        return NextResponse.json(
            { error: 'Failed to fix live courses', message: error.message },
            { status: 500 }
        );
    }
}
