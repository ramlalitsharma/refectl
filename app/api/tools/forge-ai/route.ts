import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

type Provider = 'openai' | 'gemini';
type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeMessages(messages: unknown): Message[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .map((message) => {
      if (!message || typeof message !== 'object') return null;
      const role = typeof (message as { role?: string }).role === 'string'
        ? (message as { role: string }).role
        : 'user';
      const content = typeof (message as { content?: string }).content === 'string'
        ? (message as { content: string }).content.trim()
        : '';

      if (!content) return null;
      if (role !== 'system' && role !== 'user' && role !== 'assistant') return null;

      return {
        role,
        content: content.slice(0, 30000),
      } as Message;
    })
    .filter((message): message is Message => Boolean(message))
    .slice(-16);
}

async function runOpenAI(apiKey: string, model: string, messages: Message[]) {
  const client = new OpenAI({ apiKey });
  const result = await client.chat.completions.create({
    model,
    temperature: 0.3,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  });

  const content = result.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  return content;
}

async function runGemini(apiKey: string, model: string, messages: Message[]) {
  const systemInstruction = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n');

  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(systemInstruction
          ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
          : {}),
        contents,
        generationConfig: {
          temperature: 0.3,
        },
      }),
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini request failed.');
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || '')
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const provider = body?.provider as Provider;
    const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    const model = typeof body?.model === 'string' ? body.model.trim() : '';
    const messages = normalizeMessages(body?.messages);

    if (provider !== 'openai' && provider !== 'gemini') {
      return badRequest('Unsupported AI provider.');
    }

    if (!apiKey) {
      return badRequest('API key is required.');
    }

    if (!model) {
      return badRequest('Model is required.');
    }

    if (!messages.length) {
      return badRequest('At least one message is required.');
    }

    const message = provider === 'openai'
      ? await runOpenAI(apiKey, model, messages)
      : await runGemini(apiKey, model, messages);

    return NextResponse.json({ message });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Forge AI request failed.' },
      { status: 500 },
    );
  }
}
