import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { sanitizeInput } from '@/lib/validation';
import { sanitizeFilename } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin/teacher (can upload images)
    try {
      await requireAdmin();
    } catch {
      // Allow teachers to upload as well
      const { isTeacher } = await import('@/lib/admin-check');
      if (!(await isTeacher())) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'thumbnail';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - strict MIME type checking
    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    
    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate minimum file size (prevent empty files)
    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    // Generate unique filename with sanitization
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const originalExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = allowedExtensions.includes(originalExtension) ? originalExtension : 'jpg';
    
    // Sanitize type parameter
    const sanitizedType = sanitizeInput(type).replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'thumbnail';
    const filename = `${sanitizedType}-${timestamp}-${randomStr}.${extension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', type);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file with additional security
    const safeFilename = sanitizeFilename(filename);
    const filePath = join(uploadsDir, safeFilename);
    
    // Prevent path traversal
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return public URL with sanitized filename
    const url = `/uploads/${sanitizedType}/${safeFilename}`;

    return NextResponse.json({ url, filename: safeFilename });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', message: error.message },
      { status: 500 }
    );
  }
}

