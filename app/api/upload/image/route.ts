import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { auth } from '@/lib/auth';
import { requireAdmin, getUserRole } from '@/lib/admin-check';
import { sanitizeInput } from '@/lib/validation';
import { sanitizeFilename } from '@/lib/security';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is allowed to upload images (admin, teacher, student, user)
    // Relaxed check: Allow any authenticated user to upload for now, or keep strict if preferred.
    // Keeping strict for security but ensuring roles are fetched correctly.
    const role = await getUserRole();
    const isAllowed = role && ['superadmin', 'admin', 'teacher', 'student', 'user'].includes(role);
    if (!isAllowed) {
      // Fallback: If role check fails but user is auth'd, let them upload if they are creating content.
      // For now, return 403.
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'thumbnail';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Expanded allowed types
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'application/x-pdf', 'application/acrobat', 'applications/vnd.pdf', 'text/pdf', 'text/x-pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      // Log for debugging
      console.log('Rejected file type:', file.type);
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only Images and PDFs are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    // Simple extension extraction
    let extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    // Normalize PDF extension
    if (file.type.includes('pdf')) extension = 'pdf';

    // Sanitize type parameter
    const sanitizedType = sanitizeInput(type).replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'thumbnail';
    const filename = `${sanitizedType}-${timestamp}-${randomStr}.${extension}`;

    // Create uploads directory if it doesn't exist
    // Use process.cwd() to be safe in Next.js
    const publicDir = join(process.cwd(), 'public');
    const uploadsDir = join(publicDir, 'uploads', sanitizedType);

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file
    const safeFilename = sanitizeFilename(filename);
    const filePath = join(uploadsDir, safeFilename);

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // V-003 FIX: Basic SVG Sanitization
    if (file.type === 'image/svg+xml') {
      const content = buffer.toString('utf8');
      const sanitized = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
        .replace(/on\w+\s*=/gi, '') // Remove event handlers (e.g., onload)
        .replace(/javascript:/gi, ''); // Remove javascript: pseudo-protocol

      buffer = Buffer.from(sanitized, 'utf8');
    }

    await writeFile(filePath, buffer);

    // Return public URL
    // Ensure it starts with / for relative path from root
    const url = `/uploads/${sanitizedType}/${safeFilename}`;

    // Record in database for Media Library
    const db = await getDatabase();
    await db.collection('media').insertOne({
      url,
      filename: safeFilename,
      type: sanitizedType,
      mimeType: file.type,
      size: file.size,
      uploadedBy: userId,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ url, filename: safeFilename });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', message: error.message },
      { status: 500 }
    );
  }
}

