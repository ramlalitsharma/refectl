import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';
import { recordContentVersion } from '@/lib/workflow';
import { isValidStatus } from '@/lib/workflow-status';

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
    await requireAdmin();

    const { slug } = await params;
    const body = await req.json();
    const {
      title,
      summary,
      subject,
      level,
      modules,
      language,
      tags,
      resources,
      seo,
      metadata,
      price,
      thumbnail,
      status,
      changeNote,
    } = body;

    const db = await getDatabase();
    const existing = await db.collection('courses').findOne({ slug });
    if (!existing) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (subject) updateData.subject = subject;
    if (level) updateData.level = level;
    if (modules) updateData.modules = modules;
    if (language !== undefined) updateData.language = language;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (resources !== undefined) updateData.resources = resources;
    if (seo !== undefined) updateData.seo = seo;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (price !== undefined) updateData.price = price;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (status) {
      if (!isValidStatus(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
      updateData.workflowUpdatedAt = new Date();
      updateData.workflowUpdatedBy = userId;
    }

    await db.collection('courses').updateOne({ slug }, { $set: updateData });

    const updated = await db.collection('courses').findOne({ slug });

    if (updated) {
      await recordContentVersion({
        contentType: 'course',
        contentId: slug,
        status: updated.status || 'draft',
        snapshot: updated,
        changeNote: changeNote || (status ? `Status changed to ${status}` : undefined),
        changedBy: userId,
      });
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
    await requireAdmin();

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

