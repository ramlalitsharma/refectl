import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requireAdmin();

    const { videoId } = await params;
    const db = await getDatabase();

    // Delete video record
    const result = await db.collection('videos').deleteOne({ videoId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Video deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete video', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await params;
    const db = await getDatabase();

    const video = await db.collection('videos').findOne({ videoId });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ video });
  } catch (error: any) {
    console.error('Video fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video', message: error.message },
      { status: 500 }
    );
  }
}

