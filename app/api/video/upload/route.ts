import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createMuxUpload } from '@/lib/video/mux';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Mux upload URL
    const uploadData = await createMuxUpload();

    return NextResponse.json({
      uploadId: uploadData.uploadId,
      uploadUrl: uploadData.uploadUrl,
    });
  } catch (error: any) {
    console.error('Video upload creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create video upload', message: error.message },
      { status: 500 }
    );
  }
}

