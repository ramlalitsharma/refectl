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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content || '{"chapters":[]}';
  return JSON.parse(content);
}
