import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserRole } from '@/lib/admin-check';
import { generateBlogMarkdownAI, suggestBlogFields, improveBlogMarkdown, describeMediaForBlog } from '@/lib/blog-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = await getUserRole();
    const isAllowed = role && ['superadmin', 'admin', 'teacher', 'student', 'user'].includes(role);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const action = body?.action;

    if (action === 'suggest_fields') {
      const suggestions = await suggestBlogFields({ topic: body.topic, title: body.title });
      return NextResponse.json({ suggestions });
    }

    if (action === 'improve_markdown') {
      const markdown = await improveBlogMarkdown({
        markdown: body.markdown || '',
        topic: body.topic,
        audience: body.audience,
        tone: body.tone,
        keywords: body.keywords,
      });
      return NextResponse.json({ markdown });
    }

    if (action === 'analyze_media') {
      const content = await describeMediaForBlog({
        topic: body.topic,
        media: Array.isArray(body.media) ? body.media : [],
      });
      return NextResponse.json({ markdown: content });
    }

    const markdown = await generateBlogMarkdownAI(body);
    return NextResponse.json({ markdown });
  } catch (error: any) {
    console.error('Blog preview generate error:', error);
    
    // Check for OpenAI insufficient quota
    const errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('insufficient_quota') || (error.status === 429)) {
      return NextResponse.json({ 
        error: 'OpenAI Quota Exceeded', 
        message: 'The OpenAI API key has run out of funds or hit its limit. Please check your OpenAI billing dashboard or update the API key in .env.local.' 
      }, { status: 429 });
    }

    return NextResponse.json({ error: 'Failed to generate blog preview', message: errorMessage }, { status: 500 });
  }
}
