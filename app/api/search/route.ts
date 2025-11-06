import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, courses, blogs, subjects
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const db = await getDatabase();
    const results: any[] = [];
    const searchRegex = new RegExp(query, 'i');

    // Search courses
    if (type === 'all' || type === 'courses') {
      const courses = await db.collection('courses').find({
        $or: [
          { title: searchRegex },
          { summary: searchRegex },
          { subject: searchRegex }
        ],
        status: { $ne: 'draft' }
      }).limit(limit).toArray();
      results.push(...courses.map(c => ({ ...c, type: 'course', url: `/courses/${c.slug}` })));
    }

    // Search blogs
    if (type === 'all' || type === 'blogs') {
      const blogs = await db.collection('blogs').find({
        $or: [
          { title: searchRegex },
          { excerpt: searchRegex },
          { content: searchRegex }
        ],
        status: { $ne: 'draft' }
      }).limit(limit).toArray();
      results.push(...blogs.map(b => ({ ...b, type: 'blog', url: `/blog/${b.slug}` })));
    }

    // Search subjects
    if (type === 'all' || type === 'subjects') {
      const subjects = await db.collection('subjects').find({
        $or: [
          { name: searchRegex },
          { category: searchRegex }
        ]
      }).limit(limit).toArray();
      results.push(...subjects.map(s => ({ ...s, type: 'subject', url: `/subjects/${s.slug || s._id}` })));
    }

    return NextResponse.json({
      results,
      total: results.length,
      query,
      type
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Search failed', message: e.message }, { status: 500 });
  }
}

