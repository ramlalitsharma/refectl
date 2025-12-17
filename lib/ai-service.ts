import { OpenAI } from 'openai';

// Define the structure we want back from the AI
export interface GeneratedQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index 0-3
    explanation: string;
}

export interface QuizGenerationResult {
    topic: string;
    questions: GeneratedQuestion[];
    source: 'ai' | 'mock';
}

const mockQuestions: GeneratedQuestion[] = [
    {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
        correctAnswer: 1,
        explanation: "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP)."
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        explanation: "Mars is often referred to as the 'Red Planet' because the iron oxide prevalent on its surface gives it a reddish appearance."
    },
    {
        question: "What is the chemical symbol for Gold?",
        options: ["Au", "Ag", "Fe", "Cu"],
        correctAnswer: 0,
        explanation: "The symbol 'Au' comes from the Latin word for gold, 'aurum'."
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: 1,
        explanation: "William Shakespeare wrote the tragic play 'Romeo and Juliet' early in his career."
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3,
        explanation: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions."
    }
];

export const AIService = {
    /**
     * Generates a quiz based on a topic using OpenAI or Mock data
     */
    generateQuiz: async (topic: string, difficulty: string = 'medium'): Promise<QuizGenerationResult> => {
        const apiKey = process.env.OPENAI_API_KEY;

        // FALLBACK: If no key, return mock data (simulated delay for realism)
        if (!apiKey) {
            console.log('⚠️ No OPENAI_API_KEY found. using Mock AI Service.');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
                topic,
                questions: mockQuestions,
                source: 'mock'
            };
        }

        try {
            const openai = new OpenAI({ apiKey });

            const prompt = `
        Create a ${difficulty} difficulty quiz about "${topic}".
        Output ONLY a valid JSON object with a "questions" array.
        Each question object must have:
        - "question" (string)
        - "options" (array of 4 strings)
        - "correctAnswer" (number logic 0-3)
        - "explanation" (string)
        Generate exactly 5 questions.
      `;

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful educational AI that outputs strict JSON." },
                    { role: "user", content: prompt }
                ],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("Empty response from AI");

            const parsed = JSON.parse(content);

            return {
                topic,
                questions: parsed.questions || [],
                source: 'ai'
            };

        } catch (error) {
            console.error('AI Generation Error:', error);
            // Fallback on error too, or rethrow? Let's rethrow to inform admin.
            throw new Error("Failed to generate quiz via AI. Please try again.");
        }
    },

    /**
     * General Chat completion for AI Tutor
     */
    chat: async (message: string, history: Array<{ role: 'user' | 'assistant' | 'system', content: string }>): Promise<string> => {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return "I am currently in Offline/Mock mode. Please configure my API key to enable real chat capabilities!";
        }

        try {
            const openai = new OpenAI({ apiKey });

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are 'Prof. AI', a helpful, encouraging, and knowledgeable virtual tutor. Keep answers concise and educational." },
                    ...history,
                    { role: "user", content: message }
                ],
                model: "gpt-4o-mini", // Better for chat than 3.5
            });

            return completion.choices[0].message.content || "I'm not sure what to say.";
        } catch (error) {
            console.error('AI Chat Error:', error);
            throw new Error("Failed to get response from AI.");
        }
    }
};
