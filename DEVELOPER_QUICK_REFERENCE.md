# 🚀 Developer Quick Reference - AdaptiQ LMS

Quick reference guide for developers working on the AdaptiQ LMS codebase.

---

## 🔒 Security Utilities

### Input Sanitization
```typescript
import { sanitizeString, escapeRegex } from '@/lib/security';

// Sanitize user input
const safeInput = sanitizeString(userInput, maxLength);

// Escape regex to prevent ReDoS
const safePattern = escapeRegex(userInput);
```

### MongoDB Query Sanitization
```typescript
import { sanitizeMongoQuery } from '@/lib/security';

// Sanitize query parameters
const safeQuery = sanitizeMongoQuery(rawQuery);
```

### File Upload Security
```typescript
import { sanitizeFilename, isValidFileType, isValidFileSize } from '@/lib/security';

// Validate file
if (!isValidFileType(file.type, ['image/jpeg', 'image/png'])) {
  return error('Invalid file type');
}

if (!isValidFileSize(file.size, 5 * 1024 * 1024)) {
  return error('File too large');
}

// Sanitize filename
const safeFilename = sanitizeFilename(file.name);
```

---

## ⚡ Rate Limiting

### Basic Rate Limiting
```typescript
import { rateLimit, generateRateLimitKey } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/security';

const clientIP = getClientIP(request);
const key = generateRateLimitKey('endpoint-name', userId || clientIP);

const result = await rateLimit({
  windowMs: 60000, // 1 minute
  max: 30, // 30 requests
  key,
  identifier: `User:${userId}`,
});

if (!result.allowed) {
  return NextResponse.json(
    { error: 'Too many requests', retryAfter: result.retryAfter },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
  );
}
```

### Rate Limit Headers in Response
```typescript
return NextResponse.json(data, {
  headers: {
    'X-RateLimit-Limit': '30',
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetTime.toISOString(),
  },
});
```

---

## 🛡️ Error Handling

### Standardized Error Responses
```typescript
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';

// Error response
try {
  // ... code
} catch (error) {
  return createErrorResponse(error, 'User-friendly message', 500);
}

// Success response
return createSuccessResponse(data, 'Optional message', 200);
```

### Request Validation
```typescript
import { validateRequestBody } from '@/lib/error-handler';

const result = await validateRequestBody(request, (body): body is MyType => {
  return typeof body.field === 'string';
});

if (!result.valid) {
  return result.error;
}

const { data } = result;
```

---

## 📊 Database Queries

### Using Indexes
```typescript
// Use projection to limit fields
const users = await db.collection('users')
  .find(query)
  .project({ _id: 1, name: 1, email: 1 })
  .sort({ createdAt: -1 })
  .limit(limit)
  .toArray();
```

### Safe Query Building
```typescript
import { sanitizeString, escapeRegex } from '@/lib/security';

const query: any = { status: 'published' };

if (search) {
  const escaped = escapeRegex(sanitizeString(search));
  query.$or = [
    { title: { $regex: escaped, $options: 'i' } },
    { description: { $regex: escaped, $options: 'i' } }
  ];
}
```

---

## 🔐 Authentication & Authorization

### Check Authentication
```typescript
import { auth } from '@/lib/auth';

const { userId } = await auth();
if (!userId) {
  return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
}
```

### Check Admin Access
```typescript
import { requireAdmin, isAdmin } from '@/lib/admin-check';

// Throw error if not admin
await requireAdmin();

// Or check without throwing
const isUserAdmin = await isAdmin();
```

### Check Permissions
```typescript
import { userHasPermission } from '@/lib/admin-check';

const canCreate = await userHasPermission('content:create');
```

---

## 📁 File Uploads

### Image Upload Example
```typescript
import { sanitizeFilename, isValidFileType, isValidFileSize } from '@/lib/security';

// Validate file
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!isValidFileType(file.type, allowedTypes)) {
  return createErrorResponse(new Error('Invalid type'), 'Invalid file type', 400);
}

if (!isValidFileSize(file.size, 5 * 1024 * 1024)) {
  return createErrorResponse(new Error('Too large'), 'File too large', 400);
}

// Sanitize and save
const safeFilename = sanitizeFilename(file.name);
const filePath = join(uploadsDir, safeFilename);

// Prevent path traversal
if (!filePath.startsWith(uploadsDir)) {
  return createErrorResponse(new Error('Invalid path'), 'Invalid path', 400);
}
```

---

## 🎯 API Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeString, escapeRegex, getClientIP } from '@/lib/security';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { rateLimit, generateRateLimitKey } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    // 2. Rate Limiting
    const clientIP = getClientIP(request);
    const rateLimitKey = generateRateLimitKey('endpoint-name', userId);
    const rateLimitResult = await rateLimit({
      windowMs: 60000,
      max: 30,
      key: rateLimitKey,
      identifier: `User:${userId}`,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      );
    }

    // 3. Input Validation
    const { searchParams } = new URL(request.url);
    const search = sanitizeString(searchParams.get('search') || '', 100);
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));

    // 4. Database Query
    const db = await getDatabase();
    const query: any = {};
    if (search) {
      query.title = { $regex: escapeRegex(search), $options: 'i' };
    }

    const results = await db.collection('collection')
      .find(query)
      .project({ _id: 1, title: 1 })
      .limit(limit)
      .toArray();

    // 5. Success Response
    return createSuccessResponse({ results }, undefined, 200);

  } catch (error) {
    return createErrorResponse(error, 'Failed to process request', 500);
  }
}
```

---

## 📝 Common Patterns

### Pagination
```typescript
const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

const results = await collection
  .find(query)
  .skip(offset)
  .limit(limit)
  .toArray();

const total = await collection.countDocuments(query);
```

### Search with Regex
```typescript
import { escapeRegex, sanitizeString } from '@/lib/security';

const search = sanitizeString(searchParams.get('q') || '', 200);
if (search) {
  query.$or = [
    { title: { $regex: escapeRegex(search), $options: 'i' } },
    { description: { $regex: escapeRegex(search), $options: 'i' } }
  ];
}
```

### ObjectId Validation
```typescript
import { isValidObjectId } from '@/lib/security';
import { ObjectId } from 'mongodb';

const id = searchParams.get('id');
if (!id || !isValidObjectId(id)) {
  return createErrorResponse(new Error('Invalid ID'), 'Invalid ID', 400);
}

const objectId = new ObjectId(id);
```

---

## 🔍 Debugging Tips

### Development Mode
- Error details are shown in development
- Stack traces available
- Detailed error messages

### Production Mode
- Generic error messages
- No stack traces
- No sensitive information

### Logging
```typescript
// Log errors (server-side only)
console.error('Error:', error);

// Log warnings
console.warn('Warning:', message);

// Log info (be careful in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

---

## 📚 Key Files Reference

- `lib/security.ts` - Security utilities
- `lib/error-handler.ts` - Error handling
- `lib/rate-limit.ts` - Rate limiting
- `lib/validation.ts` - Input validation
- `lib/admin-check.ts` - Authorization
- `lib/db-indexes.ts` - Database indexes
- `middleware.ts` - Security headers

---

## ✅ Security Checklist

When creating new API routes:

- [ ] Authentication check
- [ ] Authorization check (if needed)
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Input validation
- [ ] Query sanitization (MongoDB)
- [ ] Error handling
- [ ] Proper HTTP status codes
- [ ] Security headers (handled by middleware)
- [ ] No information leakage in errors

---

**Last Updated:** $(date)  
**Version:** 1.0

