import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';
import { recordContentVersion } from '@/lib/workflow';
import { isValidStatus } from '@/lib/workflow-status';

export const runtime = 'nodejs';

// GET - Get blog by slug
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    const db = await getDatabase();
    const blog = await db.collection('blogs').findOne({ slug });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch blog', message: e.message }, { status: 500 });
  }
}

// PUT - Update blog
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { slug } = await params;
    const body = await req.json();
    const { title, content, excerpt, coverImage, status, tags, changeNote } = body;

    const db = await getDatabase();
    const existing = await db.collection('blogs').findOne({ slug });
    if (!existing) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage) updateData.coverImage = coverImage;
    if (status) {
      if (!isValidStatus(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
      updateData.workflowUpdatedAt = new Date();
      updateData.workflowUpdatedBy = userId;
    }
    if (tags) updateData.tags = tags;

    await db.collection('blogs').updateOne({ slug }, { $set: updateData });

    const updated = await db.collection('blogs').findOne({ slug });

    if (updated) {
      await recordContentVersion({
        contentType: 'blog',
        contentId: slug,
        status: updated.status || 'draft',
        snapshot: updated,
        changeNote: changeNote || (status ? `Status changed to ${status}` : undefined),
        changedBy: userId,
      });
    }

    return NextResponse.json({ success: true, message: 'Blog updated successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update blog', message: e.message }, { status: 500 });
  }
}

// DELETE - Delete blog
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { slug } = await params;
    const db = await getDatabase();

    const result = await db.collection('blogs').deleteOne({ slug });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete blog', message: e.message }, { status: 500 });
  }
}

