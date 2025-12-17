import { openai } from '@/lib/openai';

export interface GenerateBlogParams {
  topic: string;
  audience?: string;
  tone?: string;
  callToAction?: string;
  keywords?: string[];
}

export async function generateBlogMarkdownAI(params: GenerateBlogParams) {
  const { topic, audience, tone, callToAction, keywords } = params;
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  
  const systemPrompt = `You are an expert blog writer and content creator specializing in educational and informative articles. Your task is to write engaging, well-structured blog posts in Markdown format. DO NOT generate quiz questions, course outlines, or tutorials - write a complete blog article with introduction, body paragraphs, and conclusion.`;
  
  const prompt = `Write a comprehensive, well-structured BLOG POST in Markdown format (NOT quiz questions, NOT a course, NOT a tutorial - a complete blog article).

Topic: ${topic}
${audience ? `Target audience: ${audience}
` : ''}${tone ? `Writing tone: ${tone}
` : ''}${callToAction ? `Call to action: ${callToAction}
` : ''}${keywords && keywords.length ? `Keywords to include: ${keywords.join(', ')}
` : ''}

IMPORTANT: Generate a COMPLETE BLOG ARTICLE with:
- Engaging introduction
- Well-structured body paragraphs with clear headings (use ## for main headings, ### for subheadings)
- Short, readable paragraphs
- Bullet lists where appropriate
- Examples and explanations
- Strong conclusion with call-to-action
- DO NOT include quiz questions
- DO NOT create course modules
- Write as a blog article, not educational course content

Format: Markdown with proper headings, paragraphs, and formatting.
Length: 800-1200 words
Include YAML frontmatter at the top with summary if needed.`;

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
  });
  const content = resp.choices[0]?.message?.content || '# Draft\nComing soon.';
  return content;
}
