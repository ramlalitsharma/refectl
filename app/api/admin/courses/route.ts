import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { Course } from '@/lib/models/Course';
import { generateCourseOutlineAI, GenerateCourseParams } from '@/lib/course-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
      const { requireAdmin } = await import('@/lib/admin-check');
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      mode,
      title,
      subject,
      level,
      outline,
      summary,
      audience,
      goals,
      tone,
      modulesCount,
      lessonsPerModule,
      language,
      tags,
      resources,
      price,
      seo,
      thumbnail,
    } = body as {
      mode: 'ai' | 'manual';
      title?: string;
      subject?: string;
      level?: 'basic' | 'intermediate' | 'advanced';
      outline?: any;
      summary?: string;
      audience?: string;
      goals?: string;
      tone?: string;
      modulesCount?: number;
      lessonsPerModule?: number;
      language?: string;
      tags?: string[];
      resources?: Course['resources'];
      price?: Course['price'];
      seo?: Course['seo'];
      thumbnail?: string;
    };

    const db = await getDatabase();
    const col = db.collection<Course>('courses');

    let course: Course | null = null;

    const metadata: Course['metadata'] = {
      audience,
      goals,
      tone,
      modulesCount: modulesCount ? Number(modulesCount) : undefined,
      lessonsPerModule: lessonsPerModule ? Number(lessonsPerModule) : undefined,
    };

    if (mode === 'manual') {
      if (!title || !outline) return NextResponse.json({ error: 'title and outline required' }, { status: 400 });
      course = buildCourseFromOutline({
        authorId: userId,
        title,
        subject,
        level,
        outline,
        summary,
        metadata,
        language,
        tags,
        resources,
        price,
        seo,
        thumbnail,
      });
    } else {
      if (!title) return NextResponse.json({ error: 'title required for AI mode' }, { status: 400 });
      const generated = await generateCourseOutlineAI({
        title,
        subject,
        level,
        audience,
        goals,
        tone,
        modulesCount,
        lessonsPerModule,
      });
      course = buildCourseFromOutline({
        authorId: userId,
        title,
        subject,
        level,
        outline: generated,
        summary,
        metadata,
        language,
        tags,
        resources,
        price,
        seo,
        thumbnail,
      });
    }

    await col.insertOne(course);
    return NextResponse.json({ course });
  } catch (e: any) {
    console.error('Create course failed:', e);
    return NextResponse.json({ error: 'Failed to create course', message: e.message }, { status: 500 });
  }
}

function buildCourseFromOutline({
  authorId,
  title,
  subject,
  level,
  outline,
  summary,
  metadata,
  language,
  tags,
  resources,
  price,
  seo,
  thumbnail,
}: {
  authorId: string;
  title: string;
  subject?: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  outline: any;
  summary?: string;
  metadata?: Course['metadata'];
  language?: string;
  tags?: string[];
  resources?: Course['resources'];
  price?: Course['price'];
  seo?: Course['seo'];
  thumbnail?: string;
}): Course {
  const now = new Date().toISOString();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const modules = (outline.modules || outline || []).map((m: any, mi: number) => ({
    id: `m${mi + 1}`,
    title: m.title || `Module ${mi + 1}`,
    slug: (m.title || `module-${mi + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    lessons: (m.lessons || []).map((l: any, li: number) => ({
      id: `m${mi + 1}-l${li + 1}`,
      title: l.title || `Lesson ${li + 1}`,
      slug: (l.title || `lesson-${li + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: l.content,
    })),
  }));
  return {
    authorId,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    summary,
    subject,
    level,
    language,
    tags,
    modules,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    metadata,
    resources,
    price,
    seo,
  };
}


