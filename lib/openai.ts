import OpenAI from 'openai';

// Initialize OpenAI client (will check for API key when used)
export const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

/**
 * Generate adaptive quiz questions based on user performance
 */
export async function generateAdaptiveQuestion(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  previousPerformance?: {
    correctAnswers: number;
    incorrectAnswers: number;
    weakTopics: string[];
  },
  context?: { subjectName?: string; levelName?: string; chapterName?: string }
): Promise<{
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}> {
  const subjectContext = context?.subjectName ? `Subject: ${context.subjectName}.` : '';
  const levelContext = context?.levelName ? `Level: ${context.levelName}.` : '';
  const chapterContext = context?.chapterName ? `Chapter: ${context.chapterName}.` : '';
  const prompt = `Generate a ${difficulty} level QUIZ QUESTION (NOT course content, NOT blog, NOT tutorial - only a quiz question) about ${topic}.
${previousPerformance ? `Previous performance: ${previousPerformance.correctAnswers} correct, ${previousPerformance.incorrectAnswers} incorrect. Weak areas: ${previousPerformance.weakTopics.join(', ')}` : ''}
${subjectContext} ${levelContext} ${chapterContext}

IMPORTANT: Generate ONLY a quiz question with:
- A clear question text
- Four multiple choice options
- One correct answer
- An explanation
- DO NOT generate course lessons, blog posts, or tutorial content

Return a JSON object with:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Brief explanation of the answer",
  "difficulty": "${difficulty}"
}

Make the question relevant, educational, and appropriate for the difficulty level.`;

  if (!openai) {
    throw new Error('OPENAI_API_KEY is not set in environment variables. Please add it to your .env.local file.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
      messages: [
        {
          role: 'system',
          content: 'You are an expert quiz question creator specializing in educational assessments. Your ONLY task is to generate quiz questions with multiple choice options, correct answers, and explanations. DO NOT generate course content, blog posts, tutorials, or any other content type - ONLY quiz questions. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating question:', error);
    throw error;
  }
}

/**
 * Analyze user performance and predict knowledge gaps
 */
export async function analyzePerformanceAndPredictGaps(
  quizHistory: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    topic: string;
  }>
): Promise<{
  knowledgeGaps: string[];
  recommendedTopics: string[];
  masteryScore: number;
  predictions: {
    topic: string;
    confidence: number;
    recommendation: string;
  }[];
}> {
  const historySummary = quizHistory.map(q => ({
    topic: q.topic,
    correct: q.isCorrect,
    question: q.question,
  }));

  const prompt = `Analyze this quiz performance history and identify knowledge gaps:

${JSON.stringify(historySummary, null, 2)}

Return a JSON object with:
{
  "knowledgeGaps": ["topic1", "topic2"],
  "recommendedTopics": ["topic1", "topic2"],
  "masteryScore": 75,
  "predictions": [
    {
      "topic": "Algebra",
      "confidence": 0.85,
      "recommendation": "User struggles with quadratic equations. Recommend focused practice."
    }
  ]
}

Be specific and actionable.`;

  if (!openai) {
    throw new Error('OPENAI_API_KEY is not set in environment variables. Please add it to your .env.local file.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an AI learning analytics expert. Analyze quiz performance and provide actionable insights. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing performance:', error);
    throw error;
  }
}
