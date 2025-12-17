import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeString, escapeRegex } from '@/lib/security';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { rateLimit, generateRateLimitKey } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/security';

type SearchResult = {
  _id: string;
  type: 'course' | 'blog' | 'subject';
  title: string;
  url: string;
  summary?: string;
  excerpt?: string;
  category?: string;
};

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitKey = generateRateLimitKey('search', clientIP);
    const rateLimitResult = await rateLimit({
      windowMs: 60000, // 1 minute
      max: 30, // 30 requests per minute
      key: rateLimitKey,
      identifier: `IP:${clientIP}`,
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
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          },
        }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const q = sanitizeString((searchParams.get('q') || '').trim(), 200);
    const category = sanitizeString((searchParams.get('category') || '').trim(), 50);
    const subjectParam = sanitizeString((searchParams.get('subject') || '').trim(), 50);
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));

    const db = await getDatabase();

    type SubjectDoc = { _id: unknown; name: string; slug?: string; category?: string };
    const subjectsRaw = (await db.collection('subjects').find({}).project({ name: 1, slug: 1, category: 1 }).toArray()) as SubjectDoc[];
    const subjects = subjectsRaw.map((s: SubjectDoc) => ({ id: String(s._id), name: s.name, slug: (s.slug ?? String(s._id)) as string, category: (s.category ?? 'General') as string }));

    const subjectBySlug = new Map(subjects.map((s) => [s.slug.toLowerCase(), s]));
    const subjectByName = new Map(subjects.map((s) => [s.name.toLowerCase(), s]));

    // Escape regex to prevent ReDoS attacks
    const qRegex = q ? new RegExp(escapeRegex(q), 'i') : null;

    const courseQuery: any = { status: 'published' };
    const blogQuery: Record<string, never> = {};

    type CourseDoc = { _id: unknown; title?: string; slug?: string; summary?: string; subject?: string; tags?: string[] };
    type BlogDoc = { _id: unknown; title?: string; slug?: string; description?: string };
    const [coursesRaw, blogsRaw] = await Promise.all([
      db.collection('courses').find(courseQuery).sort({ updatedAt: -1 }).limit(400).toArray(),
      db.collection('blogs').find(blogQuery).sort({ updatedAt: -1 }).limit(200).toArray(),
    ]);

    const courseResults: SearchResult[] = [];
    for (const c of coursesRaw as CourseDoc[]) {
      const subjKey = (c.subject || '').toLowerCase();
      const subj = subjectBySlug.get(subjKey) || subjectByName.get(subjKey);
      if (category && (!subj || subj.category !== category)) continue;
      if (subjectParam) {
        const wanted = subjectBySlug.get(subjectParam.toLowerCase()) || subjectByName.get(subjectParam.toLowerCase());
        if (wanted) {
          const matchSubject = subj && (subj.slug.toLowerCase() === wanted.slug.toLowerCase() || subj.name.toLowerCase() === wanted.name.toLowerCase());
          if (!matchSubject) continue;
        }
      }
      const text = `${c.title || ''}\n${c.summary || ''}\n${Array.isArray(c.tags) ? c.tags.join(' ') : ''}`;
      if (qRegex && !qRegex.test(text)) continue;
      courseResults.push({
        _id: String(c._id),
        type: 'course',
        title: c.title || 'Untitled Course',
        url: `/courses/${c.slug || String(c._id)}`,
        summary: c.summary || '',
        category: subj?.category,
      });
      if (courseResults.length >= limit) break;
    }

    const blogResults: SearchResult[] = [];
    for (const b of blogsRaw as BlogDoc[]) {
      const text = `${b.title || ''}\n${b.description || ''}`;
      if (qRegex && !qRegex.test(text)) continue;
      blogResults.push({
        _id: String(b._id),
        type: 'blog',
        title: b.title || 'Untitled Blog',
        url: `/blogs/${b.slug || String(b._id)}`,
        excerpt: b.description || '',
        category: 'blog',
      });
      if (blogResults.length >= limit) break;
    }

    const subjectResults: SearchResult[] = [];
    if (qRegex) {
      for (const s of subjects) {
        if (!qRegex.test(`${s.name}`)) continue;
        subjectResults.push({
          _id: s.id,
          type: 'subject',
          title: s.name,
          url: `/subjects/${s.slug}`,
          category: s.category,
        });
        if (subjectResults.length >= limit) break;
      }
    }

    const results = [...subjectResults, ...courseResults, ...blogResults].slice(0, limit);
    
    return NextResponse.json(
      { results },
      {
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
        },
      }
    );
  } catch (e: unknown) {
    return createErrorResponse(e, 'Failed to perform search', 500);
  }
}

