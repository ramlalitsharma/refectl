import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { openai } from '@/lib/openai';
import { sanitizeInput } from '@/lib/validation';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 10;
const rateMap = new Map<string, { ts: number; count: number }>();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const rawMessage = String(body?.message || '').trim();
    let context = String(body?.context || '');
    const conversationHistory = Array.isArray(body?.conversationHistory) ? body.conversationHistory : [];

    if (!rawMessage) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ error: 'OpenAI API not configured' }, { status: 500 });
    }

    const safeMessage = sanitizeInput(rawMessage).slice(0, 2000);
    context = sanitizeInput(context).slice(0, 4000);

    const key = `ai-tutor:${userId}`;
    const nowTs = Date.now();
    const existing = rateMap.get(key);
    if (existing && nowTs - existing.ts < RATE_LIMIT_WINDOW_MS) {
      if (existing.count >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateMap.set(key, { ts: existing.ts, count: existing.count + 1 });
    } else {
      rateMap.set(key, { ts: nowTs, count: 1 });
    }

    const systemPrompt = `You are an AI tutor helping students learn. You are patient, encouraging, and explain concepts clearly.
${context ? `Context: ${context}` : ''}

Guidelines:
- Provide clear, step-by-step explanations
- Use examples when helpful
- Encourage the student
- Ask clarifying questions if needed
- Keep responses concise but thorough`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: safeMessage },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return NextResponse.json({
      reply,
      conversationId: `conv_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('AI tutor error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI tutor response', message: error.message },
      { status: 500 }
    );
  }
}

