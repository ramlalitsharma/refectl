import { openai } from '@/lib/openai';

export interface GenerateCourseParams {
  title: string;
  subject?: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  audience?: string;
  goals?: string;
  tone?: string;
  modulesCount?: number;
  lessonsPerModule?: number;
}

export async function generateCourseOutlineAI(params: GenerateCourseParams) {
  const { title, subject, level, audience, goals, tone, modulesCount, lessonsPerModule } = params;
  if (!openai) throw new Error('OPENAI_API_KEY not configured');

  const systemPrompt = `You are an Elite Curriculum Architect and Subject Matter Expert. Your goal is to design world-class, comprehensive online courses that rival top platforms like Coursera, Udemy, and Pluralsight.
  
  CRITICAL INSTRUCTIONS:
  1. DO NOT generate shallow outlines. Generate DETAILED, IN-DEPTH Content.
  2. Each lesson must be a full "Tutorial" or "Chapter" with actual educational value.
  3. Include practical "Exercises" or "Practice Problems" at the end of every lesson.
  4. Use clear Markdown formatting (Headings, Bold, Lists, Code Blocks).
  5. The content must be ready for a student to learn from IMMEDIATELY.`;

  const prompt = `Create a MASTER CLASS COURSE STRUCTURE for: "${title}".

Context:
${subject ? `- Subject: ${subject}\n` : ''}${level ? `- Difficulty: ${level}\n` : ''}${audience ? `- Target Student: ${audience}\n` : ''}${goals ? `- Goal: ${goals}\n` : ''}${modulesCount ? `- Scale: ${modulesCount} comprehensive modules\n` : ''}${lessonsPerModule ? `- Depth: ${lessonsPerModule} in-depth lessons per module\n` : ''}

REQUIREMENTS:
1. **Structure**: Create a logical flow from basics to advanced topics.
2. **Content Depth**: For every lesson, write a FULL EXPLANATION (3-5 paragraphs), not just a summary.
3. **Practicality**: Include a "Practical Exercise" or "Real-world Application" section in every lesson.
4. **Format**: Return strict JSON.

JSON FORMAT:
{
  "modules": [
    {
      "title": "Module Title (engaging and descriptive)",
      "lessons": [
        {
          "title": "Lesson Title (action-oriented)",
          "content": "## Introduction\n\n[Detailed explanation of the concept...]\n\n## Key Concepts\n\n- [Concept 1]: [Explanation...]\n- [Concept 2]: [Explanation...]\n\n## Real-World Example\n\n[Scenario or Case Study...]\n\n## Practical Exercise\n\n1. [Step-by-step exercise task...]\n2. [Challenge question...]"
        }
      ]
    }
  ]
}`;

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5, // Balanced for creativity and structural integrity
    max_tokens: 4000, // Allow larger response for detailed content
  });
  const content = resp.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}
