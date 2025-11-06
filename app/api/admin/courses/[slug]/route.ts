import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

// GET - Get course by slug
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    const db = await getDatabase();
    const course = await db.collection('courses').findOne({ slug });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch course', message: e.message }, { status: 500 });
  }
}

// PUT - Update course
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // TODO: Check admin role
    // const user = await getUser(userId);
    // if (!user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { slug } = await params;
    const body = await req.json();
    const { title, summary, subject, level, modules, status } = body;

    const db = await getDatabase();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (subject) updateData.subject = subject;
    if (level) updateData.level = level;
    if (modules) updateData.modules = modules;
    if (status) updateData.status = status;

    const result = await db.collection('courses').updateOne(
      { slug },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Course updated successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update course', message: e.message }, { status: 500 });
  }
}

// DELETE - Delete course
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // TODO: Check admin role

    const { slug } = await params;
    const db = await getDatabase();

    const result = await db.collection('courses').deleteOne({ slug });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Course deleted successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete course', message: e.message }, { status: 500 });
  }
}

