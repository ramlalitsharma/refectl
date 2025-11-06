import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

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

    const { slug } = await params;
    const body = await req.json();
    const { title, content, excerpt, coverImage, status, tags } = body;

    const db = await getDatabase();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage) updateData.coverImage = coverImage;
    if (status) updateData.status = status;
    if (tags) updateData.tags = tags;

    const result = await db.collection('blogs').updateOne(
      { slug },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
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

