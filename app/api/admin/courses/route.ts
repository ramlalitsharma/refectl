import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { Course } from '@/lib/models/Course';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { mode, title, subject, level, outline } = body as {
      mode: 'ai' | 'manual';
      title?: string;
      subject?: string;
      level?: 'basic' | 'intermediate' | 'advanced';
      outline?: any;
    };

    const db = await getDatabase();
    const col = db.collection<Course>('courses');

    let course: Course | null = null;

    if (mode === 'manual') {
      if (!title || !outline) return NextResponse.json({ error: 'title and outline required' }, { status: 400 });
      course = buildCourseFromOutline(userId, title, subject, level, outline);
    } else {
      if (!title) return NextResponse.json({ error: 'title required for AI mode' }, { status: 400 });
      const generated = await generateCourseOutlineAI(title, subject, level);
      course = buildCourseFromOutline(userId, title, subject, level, generated);
    }

    await col.insertOne(course);
    return NextResponse.json({ course });
  } catch (e: any) {
    console.error('Create course failed:', e);
    return NextResponse.json({ error: 'Failed to create course', message: e.message }, { status: 500 });
  }
}

function buildCourseFromOutline(
  authorId: string,
  title: string,
  subject: string | undefined,
  level: 'basic' | 'intermediate' | 'advanced' | undefined,
  outline: any
): Course {
  const now = new Date().toISOString();
  const modules = (outline.modules || outline || []).map((m: any, mi: number) => ({
    id: `m${mi+1}`,
    title: m.title || `Module ${mi+1}`,
    slug: (m.title || `module-${mi+1}`).toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    lessons: (m.lessons || []).map((l: any, li: number) => ({
      id: `m${mi+1}-l${li+1}`,
      title: l.title || `Lesson ${li+1}`,
      slug: (l.title || `lesson-${li+1}`).toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      content: l.content,
    })),
  }));
  return {
    authorId,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    subject,
    level,
    modules,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

async function generateCourseOutlineAI(
  title: string,
  subject?: string,
  level?: 'basic' | 'intermediate' | 'advanced'
) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const prompt = `Create a concise JSON course outline for the course "${title}"${subject ? ` in subject ${subject}` : ''}${level ? ` at ${level} level` : ''}.
Return: {"modules":[{"title":"...","lessons":[{"title":"..."}]}]}.`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  });
  const content = resp.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}


