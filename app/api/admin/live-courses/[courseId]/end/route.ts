import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await requireAdmin();

        const { courseId } = await params;
        const db = await getDatabase();

        // Get the current live course to check for pricing
        const liveCourse = await db.collection('courses').findOne({
            _id: new ObjectId(courseId),
            type: 'live-course'
        });

        if (!liveCourse) {
            return NextResponse.json({ error: 'Live course not found' }, { status: 404 });
        }

        // Update the course type from live-course to video-course
        const courseResult = await db.collection('courses').updateOne(
            { _id: new ObjectId(courseId) },
            {
                $set: {
                    type: 'video-course',
                    status: 'published', // Ensure it's published
                    updatedAt: new Date(),
                    // Pricing is preserved since we only $set specific fields, 
                    // but we ensure consistency here
                    isPaid: liveCourse.price > 0,
                    paymentType: liveCourse.price > 0 ? 'paid' : 'free'
                }
            }
        );

        if (courseResult.matchedCount === 0) {
            return NextResponse.json({ error: 'Live course not found' }, { status: 404 });
        }

        // Also update any associated liveRooms to 'ended' status
        await db.collection('liveRooms').updateMany(
            { courseId: courseId },
            {
                $set: {
                    status: 'ended',
                    endedAt: new Date()
                }
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Live course ended and converted to video course successfully'
        });
    } catch (error: any) {
        console.error('End live course error:', error);
        return NextResponse.json(
            { error: 'Failed to end live course', message: error.message },
            { status: 500 }
        );
    }
}
