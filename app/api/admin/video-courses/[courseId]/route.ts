import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

// GET - Get video course by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { courseId } = await params;
        const db = await getDatabase();

        const course = await db.collection('courses').findOne({
            _id: new ObjectId(courseId),
            type: 'video-course'
        });

        if (!course) {
            return NextResponse.json({ error: 'Video course not found' }, { status: 404 });
        }

        return NextResponse.json({ course });
    } catch (error: any) {
        console.error('Video course fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch video course', message: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update video course
export async function PUT(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await requireAdmin();

        const { courseId } = await params;
        const body = await req.json();
        const {
            title,
            description,
            thumbnail,
            categoryId,
            units,
            status,
            price,
            currency,
            isPaid,
            paymentType
        } = body;

        const db = await getDatabase();

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (units) updateData.units = units;
        if (status) updateData.status = status;
        if (price !== undefined) updateData.price = price;
        if (currency !== undefined) updateData.currency = currency;
        if (isPaid !== undefined) updateData.isPaid = isPaid;
        if (paymentType !== undefined) updateData.paymentType = paymentType;

        await db.collection('courses').updateOne(
            { _id: new ObjectId(courseId), type: 'video-course' },
            { $set: updateData }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Video course update error:', error);
        return NextResponse.json(
            { error: 'Failed to update video course', message: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete video course
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await requireAdmin();

        const { courseId } = await params;
        const db = await getDatabase();

        const result = await db.collection('courses').deleteOne({
            _id: new ObjectId(courseId),
            type: 'video-course'
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Video course not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Video course deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete video course', message: error.message },
            { status: 500 }
        );
    }
}
