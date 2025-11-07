import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { generateQuestionsAI } from '@/lib/question-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const params = await req.json();
    const payload = await generateQuestionsAI(params);
    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('AI question generation error:', error);
    return NextResponse.json({ error: 'Failed to generate questions', message: error.message }, { status: 500 });
  }
}
