import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';

export const dynamic = 'force-dynamic';

// GET - List all live courses
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const db = await getDatabase();
        const courses = await db
            .collection('courses')
            .find({ type: 'live-course' })
            .sort({ createdAt: -1 })
            .toArray();

        // Calculate stats for each course
        const coursesWithStats = courses.map((course) => ({
            ...course,
            _id: course._id.toString(),
            totalSessions: course.units?.reduce((acc: number, u: any) =>
                acc + (u.chapters?.reduce((cAcc: number, c: any) =>
                    cAcc + (c.lessons?.length || 0), 0) || 0), 0) || 0,
        }));

        return NextResponse.json({ courses: coursesWithStats });
    } catch (error: any) {
        console.error('Live courses fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch live courses', message: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new live course
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await requireAdmin();

        const body = await req.json();
        const {
            title,
            description,
            thumbnail,
            categoryId,
            units,
            status = 'draft',
            defaultLiveRoomId,
            price,
            currency,
            isPaid,
            paymentType
        } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const db = await getDatabase();

        // Check if slug already exists
        const existing = await db.collection('courses').findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: 'A course with this title already exists' }, { status: 400 });
        }

        const courseData = {
            type: 'live-course',
            title,
            slug,
            description: description || '',
            thumbnail: thumbnail || '',
            categoryId: categoryId || null,
            authorId: userId,
            units: units || [],
            status,
            defaultLiveRoomId: defaultLiveRoomId || null,
            price: price || 0,
            currency: currency || 'USD',
            isPaid: isPaid || false,
            paymentType: paymentType || 'free',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection('courses').insertOne(courseData);

        return NextResponse.json({ success: true, course: courseData });
    } catch (error: any) {
        console.error('Live course creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create live course', message: error.message },
            { status: 500 }
        );
    }
}
