// GET /api/admin/users - Search and list users

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeString, escapeRegex } from '@/lib/security';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { rateLimit, generateRateLimitKey } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    // Security Check
    if (!userId || !(await isAdmin(userId))) {
      return createErrorResponse(
        new Error('Unauthorized'),
        'Unauthorized: Admin access required',
        403
      );
    }

    // Rate limiting for admin endpoints
    const clientIP = getClientIP(request);
    const rateLimitKey = generateRateLimitKey('admin-users', userId);
    const rateLimitResult = await rateLimit({
      windowMs: 60000, // 1 minute
      max: 60, // 60 requests per minute for admins
      key: rateLimitKey,
      identifier: `Admin:${userId}`,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = sanitizeString(searchParams.get('search') || '', 100);
    const role = sanitizeString(searchParams.get('role') || '', 20);
    const status = sanitizeString(searchParams.get('status') || '', 10);
    
    // Validate and sanitize pagination
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    const db = await getDatabase();

    // Build Query with proper sanitization
    const query: any = {};
    
    if (search) {
      // Escape regex to prevent ReDoS
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } }
      ];
    }
    
    // Validate role against allowed values
    const allowedRoles = ['student', 'teacher', 'admin', 'superadmin'];
    if (role && allowedRoles.includes(role)) {
      query.role = role;
    }
    
    // Validate status
    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'active') {
      query.isBanned = { $ne: true };
    }

    // Use indexes for better performance
    const users = await db.collection('users')
      .find(query)
      .project({ 
        _id: 1, 
        userId: 1, 
        name: 1, 
        email: 1, 
        role: 1, 
        isBanned: 1, 
        createdAt: 1 
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const total = await db.collection('users').countDocuments(query);

    return createSuccessResponse(
      {
        users,
        total,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
        limit,
        offset,
      },
      undefined,
      200
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to list users', 500);
  }
}
