import { NextResponse } from 'next/server';
import { requireEventManager } from '@/lib/admin-check';
import { NewsEventService } from '@/lib/news-event-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    await requireEventManager();
    const body = await req.json();
    const ids = Array.isArray(body?.ids) ? body.ids.map(String) : [];
    if (!ids.length) {
      return NextResponse.json({ error: 'ids is required' }, { status: 400 });
    }
    await NewsEventService.setEventOrder(ids);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to reorder events' }, { status: 400 });
  }
}

