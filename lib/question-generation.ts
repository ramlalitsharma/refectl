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

  const systemPrompt = `You are an expert quiz and assessment creator specializing in educational questions. Your task is to generate high-quality quiz questions with multiple choice options, correct answers, and explanations. Focus ONLY on creating quiz questions - do not generate course content, blog posts, or tutorials.`;

  const prompt = `Generate ${count} ${questionType} QUIZ QUESTION(S) (NOT course content, NOT blog posts, NOT tutorials - only quiz questions).

Subject: ${subject}
${topic ? `Topic: ${topic}
` : ''}Difficulty: ${difficulty}
${examType ? `Exam context: ${examType}
` : ''}

IMPORTANT: Generate QUIZ QUESTIONS with:
- Clear, well-written question text
- Multiple choice options (if questionType is multiple-choice)
- One correct answer
- Detailed explanation for the answer
- DO NOT generate course lessons, blog content, or tutorial steps
- Focus ONLY on assessment questions

Return JSON in this exact format:
{
  "questions": [
    {
      "question": "The question text",
      "options": [
        {"id": "A", "text": "Option A text", "correct": false},
        {"id": "B", "text": "Option B text", "correct": true},
        {"id": "C", "text": "Option C text", "correct": false},
        {"id": "D", "text": "Option D text", "correct": false}
      ],
      "answerExplanation": "Why the correct answer is correct"
    }
  ]
}

Note: Include options array only when questionType is multiple-choice.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
  });

  const content = response.choices[0]?.message?.content || '{"questions":[]}';
  return JSON.parse(content);
}
