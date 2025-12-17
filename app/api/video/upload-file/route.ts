import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { sanitizeInput } from '@/lib/validation';
import { sanitizeFilename } from '@/lib/security';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 5;
const rateMap = new Map<string, { ts: number; count: number }>();

/**
 * Free self-hosted video file upload
 * Uploads video file to server storage
 * Note: In production, you'd want to use a proper file storage solution
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('video') as File;
    const videoId = String(formData.get('videoId') || '').trim();

    if (!file || !videoId) {
      return NextResponse.json(
        { error: 'Video file and videoId are required' },
        { status: 400 }
      );
    }

    // Validate file type and size
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 });
    }
    // Max 200MB per upload
    if (file.size > 200 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 200MB' }, { status: 400 });
    }

    // Basic rate limiting per user and videoId
    const key = `video-upload:${userId}:${videoId}`;
    const nowTs = Date.now();
    const existing = rateMap.get(key);
    if (existing && nowTs - existing.ts < RATE_LIMIT_WINDOW_MS) {
      if (existing.count >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateMap.set(key, { ts: existing.ts, count: existing.count + 1 });
    } else {
      rateMap.set(key, { ts: nowTs, count: 1 });
    }

    // For development: save to public/videos directory
    // For production: upload to your CDN/storage service
    const safeVideoId = sanitizeInput(videoId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    const uploadDir = join(process.cwd(), 'public', 'videos', safeVideoId);
    
    // Prevent path traversal
    const resolvedPath = join(process.cwd(), 'public', 'videos');
    if (!uploadDir.startsWith(resolvedPath)) {
      return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
    }
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file with sanitized filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const baseName = sanitizeFilename(file.name).slice(0, 200);
    const filePath = join(uploadDir, baseName);
    
    // Double-check path safety
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    
    await writeFile(filePath, buffer);

    // Update video record
    const db = await getDatabase();
    await db.collection('videos').updateOne(
      { videoId: safeVideoId },
      {
        $set: {
          fileName: baseName,
          filePath: `/videos/${safeVideoId}/${baseName}`,
          fileSize: file.size,
          status: 'uploaded', // Needs conversion to HLS
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      videoId: safeVideoId,
      message: 'Video uploaded successfully. Convert to HLS format using ffmpeg for playback.',
      conversionInstructions: `ffmpeg -i ${filePath} -c:v libx264 -c:a aac -hls_time 10 -hls_playlist_type vod ${join(uploadDir, 'playlist.m3u8')}`,
    });
  } catch (error: unknown) {
    console.error('Video file upload error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to upload video file', message: msg },
      { status: 500 }
    );
  }
}


