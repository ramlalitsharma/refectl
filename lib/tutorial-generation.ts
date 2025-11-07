import { openai } from '@/lib/openai';

export interface GenerateTutorialParams {
  title: string;
  format?: 'video' | 'live' | 'text';
  audience?: string;
  durationMinutes?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  objectives?: string;
}

export async function generateTutorialOutlineAI(params: GenerateTutorialParams) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const { title, format = 'video', audience, durationMinutes, level, objectives } = params;
  const prompt = `Design a ${format} tutorial outline.
Title: ${title}
${audience ? `Audience: ${audience}
` : ''}${durationMinutes ? `Duration: ${durationMinutes} minutes
` : ''}${level ? `Difficulty: ${level}
` : ''}${objectives ? `Learning objectives: ${objectives}
` : ''}
Return JSON as {"sections":[{"title":"","duration":10,"narrative":"","demo":""}]}. Narrative should include bullet points; demo field should describe activity.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content || '{"sections":[]}';
  return JSON.parse(content);
}
