import { openai } from '@/lib/openai';

export interface GenerateQuestionParams {
  subject?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionType?: 'multiple-choice' | 'true-false' | 'short-answer';
  examType?: string;
  count?: number;
}

export async function generateQuestionsAI(params: GenerateQuestionParams) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const {
    subject = 'General knowledge',
    topic,
    difficulty = 'medium',
    questionType = 'multiple-choice',
    examType,
    count = 1,
  } = params;

  const prompt = `Generate ${count} ${questionType} question(s) for ${subject}${topic ? ` on the topic ${topic}` : ''}.
Difficulty: ${difficulty}.
${examType ? `Exam context: ${examType}.` : ''}
Return JSON in the form {"questions":[{"question":"","options":[{"id":"A","text":"","correct":false}],"answerExplanation":""}]}. Options only when the type is multiple-choice.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.6,
  });

  const content = response.choices[0]?.message?.content || '{"questions":[]}';
  return JSON.parse(content);
}
