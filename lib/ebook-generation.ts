import { openai } from '@/lib/openai';

export interface GenerateEbookParams {
  title: string;
  audience?: string;
  tone?: string;
  chapters?: number;
  focus?: string;
}

export async function generateEbookOutlineAI(params: GenerateEbookParams) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const { title, audience, tone, chapters = 6, focus } = params;
  const prompt = `Create a chapter outline for an educational ebook.
Title: ${title}
${audience ? `Audience: ${audience}
` : ''}${tone ? `Tone: ${tone}
` : ''}${focus ? `Key focus: ${focus}
` : ''}
Chapters: ${chapters}
Return JSON: {"chapters":[{"title":"","summary":"","keyTakeaways":[""],"resources":["" ]}]}.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });
    const content = response.choices[0]?.message?.content || '{"chapters":[]}';
    return JSON.parse(content);
  } catch (err: any) {
    const count = Math.max(1, Math.min(20, Number(chapters) || 6));
    const base = title || 'Ebook';
    const gen = Array.from({ length: count }).map((_, i) => {
      const n = i + 1;
      return {
        title: `Chapter ${n}: ${base} Essentials`,
        summary: `Core concepts and practical guidance for ${base.toLowerCase()}.`,
        keyTakeaways: [
          `${base} overview`,
          `Important principles`,
          `Actionable steps`,
        ],
        resources: [],
      };
    });
    return { chapters: gen };
  }
}

export async function generateEbookDraftAI(params: GenerateEbookParams) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const { title, audience, tone, chapters = 6, focus } = params;
  const prompt = `Write a professional-grade, market-competitive educational ebook draft with rigorous chapter content.
Title: ${title}
${audience ? `Audience: ${audience}
` : ''}${tone ? `Tone: ${tone}
` : ''}${focus ? `Key focus: ${focus}
` : ''}
Chapters: ${chapters}
Each chapter MUST include:
- Executive Summary (wrapped in <p> tags)
- Deep Background with <h2> subheadings
- Case Studies or Examples with <blockquote> and <ul> lists
- Named Frameworks or Checklists with <ol> or <ul>
- Advanced Techniques with <strong> emphasis
- References or resources list as a <ul>
Return JSON: {"chapters":[{"title":"","summary":"","keyTakeaways":[""],"resources":[""],"content":""}]}. Content MUST be valid, semantic HTML prose. Ensure high-quality, precise and actionable text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });
    const content = response.choices[0]?.message?.content || '{"chapters":[]}';
    return JSON.parse(content);
  } catch (err: any) {
    const count = Math.max(1, Math.min(20, Number(chapters) || 6));
    const base = title || 'Ebook';
    const gen = Array.from({ length: count }).map((_, i) => {
      const n = i + 1;
      return {
        title: `Chapter ${n}: ${base} Mastery`,
        summary: `Executive summary introducing objectives, scope, and outcomes for ${base.toLowerCase()}.`,
        keyTakeaways: [
          `Strategic perspective`,
          `Practical applications`,
          `Common pitfalls`,
        ],
        resources: [],
        content:
          `<h2>Executive Summary</h2>` +
          `<p>This chapter establishes a rigorous foundation for ${base.toLowerCase()}${focus ? ` in the context of ${focus.toLowerCase()}` : ''}, defining objectives, scope, and outcomes for ${audience || 'modern learners'}.</p>` +
          `<h2>Deep Background</h2>` +
          `<p>We outline historical and technical context, key terminology, and constraints that shape decision-making. Nuanced trade-offs are discussed with realistic scenarios.</p>` +
          `<h2>Case Studies</h2>` +
          `<ul><li><strong>Example A:</strong> A practical scenario demonstrating ${base.toLowerCase()} adoption, metrics observed, and lessons learned.</li>` +
          `<li><strong>Example B:</strong> A contrasting environment highlighting pitfalls, mitigations, and governance.</li></ul>` +
          `<h2>Frameworks & Checklists</h2>` +
          `<p><strong>Framework 1:</strong> A named model with steps and criteria to evaluate options.</p>` +
          `<p><strong>Deployment Checklist:</strong> Focusing on quality, efficiency, and resilience.</p>` +
          `<h2>Advanced Techniques</h2>` +
          `<p>Actionable methods, templates, and decision trees to operationalize ${base.toLowerCase()} while staying future-proof.</p>` +
          `<h2>References</h2>` +
          `<ul><li>Curated resources for ongoing practice and deeper exploration.</li></ul>`,
      };
    });
    return { chapters: gen };
  }
}

export async function generateEbookChapterDraftAI(params: GenerateEbookParams & { chapterIndex: number }) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const { title, audience, tone, focus, chapterIndex } = params;
  const prompt = `Write a single professional-grade chapter for "${title}".
${audience ? `Audience: ${audience}
` : ''}${tone ? `Tone: ${tone}
` : ''}${focus ? `Key focus: ${focus}
` : ''}
Chapter number: ${Number(chapterIndex) + 1}
Each chapter MUST include:
- Executive Summary (wrapped in <p> tags)
- Deep Background with <h2> subheadings
- Case Studies or Examples with <blockquote> and <ul> lists
- Named Frameworks or Checklists with <ol> or <ul>
- Advanced Techniques with <strong> emphasis
- References or resources list as a <ul>
Return JSON: {"chapters":[{"title":"","summary":"","keyTakeaways":[""],"resources":[""],"content":""}]}. Content MUST be valid, semantic HTML prose. Use 800–1200 words of high-quality, precise text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });
    const content = response.choices[0]?.message?.content || '{"chapters":[]}';
    return JSON.parse(content);
  } catch (err: any) {
    return {
      chapters: [
        {
          title: `Chapter ${Number(chapterIndex) + 1}: ${title} Mastery`,
          summary: `Executive summary introducing objectives, scope, and outcomes for ${title.toLowerCase()}.`,
          keyTakeaways: [
            `Strategic perspective`,
            `Practical applications`,
            `Common pitfalls`,
          ],
          resources: [],
          content:
            `Executive Summary\n\n` +
            `This chapter establishes a rigorous foundation for ${title.toLowerCase()}${focus ? ` in the context of ${focus.toLowerCase()}` : ''}.\n\n` +
            `Deep Background\n\n` +
            `Historical and technical context, terminology, and constraints.\n\n` +
            `Case Studies\n\n` +
            `Example scenarios with metrics and lessons.\n\n` +
            `Frameworks & Checklists\n\n` +
            `Named models and practical checklists.\n\n` +
            `Advanced Techniques\n\n` +
            `Future-proof guidance.\n\n` +
            `References\n\n` +
            `Curated resources.`,
        },
      ],
    };
  }
}

export interface EbookSEO {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  canonicalPath: string;
  schemaOrg: any;
}

export async function generateEbookSEOAI(params: GenerateEbookParams & { tags?: string[] }) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const { title, audience, tone, focus, tags = [] } = params;
  const prompt = `Generate full SEO metadata for a professional-grade educational ebook page.
Title: ${title}
${audience ? `Audience: ${audience}
` : ''}${tone ? `Tone: ${tone}
` : ''}${focus ? `Key focus: ${focus}
` : ''}Tags: ${(tags || []).join(', ')}
Return JSON:
{
  "seoTitle": "",
  "metaDescription": "",
  "keywords": [],
  "slug": "",
  "ogTitle": "",
  "ogDescription": "",
  "twitterTitle": "",
  "twitterDescription": "",
  "canonicalPath": "",
  "schemaOrg": { "@context": "https://schema.org", "@type": "Book", "name": "", "about": "", "keywords": "" }
}`;

  const makeSlug = (s: string) =>
    (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });
    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const slug = parsed.slug || makeSlug(title);
    return {
      seoTitle: parsed.seoTitle || title,
      metaDescription: parsed.metaDescription || `Explore ${title} — a comprehensive, modern guide for ${audience || 'learners'}.`,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : (tags.length ? tags : [focus || title]),
      slug,
      ogTitle: parsed.ogTitle || title,
      ogDescription: parsed.ogDescription || parsed.metaDescription || '',
      twitterTitle: parsed.twitterTitle || title,
      twitterDescription: parsed.twitterDescription || parsed.metaDescription || '',
      canonicalPath: parsed.canonicalPath || `/ebooks/${slug}`,
      schemaOrg:
        parsed.schemaOrg || {
          '@context': 'https://schema.org',
          '@type': 'Book',
          name: title,
          about: focus || title,
          keywords: (tags || []).join(', '),
        },
    } as EbookSEO;
  } catch (err: any) {
    const slug = makeSlug(title);
    return {
      seoTitle: title,
      metaDescription: `A future-proof, high-quality, professional ebook on ${title.toLowerCase()}.`,
      keywords: tags.length ? tags : [title, focus || 'study guide'],
      slug,
      ogTitle: title,
      ogDescription: `Deep insights and actionable frameworks in ${title}.`,
      twitterTitle: title,
      twitterDescription: `Comprehensive ebook for ${audience || 'modern learners'}.`,
      canonicalPath: `/ebooks/${slug}`,
      schemaOrg: {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: title,
        about: focus || title,
        keywords: (tags || []).join(', '),
      },
    } as EbookSEO;
  }
}
