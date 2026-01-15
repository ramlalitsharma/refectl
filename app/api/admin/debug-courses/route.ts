import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';

export const runtime = 'nodejs';

/**
 * Debug endpoint to check what courses exist in the database
 */
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await requireAdmin();

        const db = await getDatabase();

        // Get all courses
        const allCourses = await db.collection('courses')
            .find({})
            .project({ _id: 1, title: 1, type: 1, status: 1, slug: 1 })
            .toArray();

        // Get video courses specifically
        const videoCourses = await db.collection('courses')
            .find({ type: 'video-course' })
            .project({ _id: 1, title: 1, type: 1, status: 1, slug: 1 })
            .toArray();

        // Get published video courses
        const publishedVideoCourses = await db.collection('courses')
            .find({ type: 'video-course', status: 'published' })
            .project({ _id: 1, title: 1, type: 1, status: 1, slug: 1 })
            .toArray();

        // Get live courses
        const liveCourses = await db.collection('courses')
            .find({ type: 'live-course' })
            .project({ _id: 1, title: 1, type: 1, status: 1, slug: 1 })
            .toArray();

        // Get all live rooms
        const liveRooms = await db.collection('liveRooms')
            .find({})
            .project({ _id: 1, roomName: 1, status: 1, courseId: 1 })
            .toArray();

        // Group courses by type
        const coursesByType = allCourses.reduce((acc: any, course: any) => {
            const type = course.type || 'unknown';
            if (!acc[type]) acc[type] = [];
            acc[type].push(course);
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            summary: {
                totalCourses: allCourses.length,
                videoCourses: videoCourses.length,
                publishedVideoCourses: publishedVideoCourses.length,
                liveCourses: liveCourses.length,
                liveRooms: liveRooms.length
            },
            coursesByType,
            videoCourses,
            publishedVideoCourses,
            liveCourses,
            liveRooms,
            allCourses
        });
    } catch (error: any) {
        console.error('Debug courses error:', error);
        return NextResponse.json(
            { error: 'Failed to debug courses', message: error.message },
            { status: 500 }
        );
    }
}
