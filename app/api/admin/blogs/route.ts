import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { mode, title, topic, markdown } = body as { mode: 'ai' | 'manual'; title?: string; topic?: string; markdown?: string };

    const db = await getDatabase();
    const col = db.collection('blogs');

    let doc: any = null;

    if (mode === 'manual') {
      if (!title || !markdown) return NextResponse.json({ error: 'title and markdown required' }, { status: 400 });
      doc = buildBlog(userId, title, markdown);
    } else {
      const t = topic || title;
      if (!t) return NextResponse.json({ error: 'title or topic required for AI mode' }, { status: 400 });
      const generated = await generateBlogAI(t);
      doc = buildBlog(userId, generated.title, generated.markdown);
    }

    await col.insertOne(doc);
    return NextResponse.json({ blog: doc });
  } catch (e: any) {
    console.error('Create blog failed:', e);
    return NextResponse.json({ error: 'Failed to create blog', message: e.message }, { status: 500 });
  }
}

function buildBlog(authorId: string, title: string, markdown: string) {
  const now = new Date();
  return {
    authorId,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    markdown,
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(now.getTime() + 7*24*60*60*1000),
  };
}

async function generateBlogAI(topic: string) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const prompt = `Write a concise, well-structured technical blog post in Markdown about "${topic}" with headings and short paragraphs.`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });
  const content = resp.choices[0]?.message?.content || '# Draft\nComing soon.';
  return { title: topic, markdown: content };
}


