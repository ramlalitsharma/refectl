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
  const systemPrompt = `You are an expert tutorial designer specializing in creating step-by-step learning tutorials. Your task is to design tutorial structures with sections that include narrative explanations and demonstration activities. DO NOT generate quiz questions or course modules - focus on creating a tutorial flow with instructional content and hands-on activities.`;
  
  const prompt = `Design a ${format} TUTORIAL OUTLINE (NOT quiz questions, NOT a full course, NOT a blog - a step-by-step tutorial structure).

Title: ${title}
Format: ${format}
${audience ? `Target audience: ${audience}
` : ''}${durationMinutes ? `Duration: ${durationMinutes} minutes
` : ''}${level ? `Difficulty level: ${level}
` : ''}${objectives ? `Learning objectives: ${objectives}
` : ''}

IMPORTANT: Generate a TUTORIAL STRUCTURE with:
- Sequential sections/steps
- Narrative explanations for each section (what to teach/explain)
- Demonstration activities (what to show/do)
- Step-by-step progression
- DO NOT include quiz questions
- Focus on tutorial flow and instructional content

Return JSON in this exact format:
{
  "sections": [
    {
      "title": "Section/Step title",
      "duration": 10,
      "narrative": "What to explain/teach in this section (bullet points or short paragraphs)",
      "demo": "What demonstration or activity to perform (hands-on activity description)"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content || '{"sections":[]}';
  return JSON.parse(content);
}
