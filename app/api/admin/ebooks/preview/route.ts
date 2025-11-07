import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { generateEbookOutlineAI } from '@/lib/ebook-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const params = await req.json();
    const outline = await generateEbookOutlineAI(params);
    return NextResponse.json({ outline });
  } catch (error: any) {
    console.error('Ebook preview error:', error);
    return NextResponse.json({ error: 'Failed to generate ebook outline', message: error.message }, { status: 500 });
  }
}
