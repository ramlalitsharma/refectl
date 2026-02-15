import { NextResponse } from 'next/server';
import { requireEventManager } from '@/lib/admin-check';
import { NewsEventService } from '@/lib/news-event-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type BulkAction = 'publish' | 'pause' | 'delete' | 'set-country' | 'set-global';

export async function POST(req: Request) {
  try {
    await requireEventManager();
    const body = await req.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids.map(String) : [];
    const action: BulkAction = body?.action;

    if (!ids.length) {
      return NextResponse.json({ error: 'ids is required' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    if (action === 'delete') {
      const count = await NewsEventService.bulkDelete(ids);
      return NextResponse.json({ ok: true, count });
    }

    if (action === 'publish') {
      const count = await NewsEventService.bulkUpdate(ids, { status: 'published' });
      return NextResponse.json({ ok: true, count });
    }

    if (action === 'pause') {
      const count = await NewsEventService.bulkUpdate(ids, { status: 'draft' });
      return NextResponse.json({ ok: true, count });
    }

    if (action === 'set-country') {
      const country = String(body?.country || '').trim();
      if (!country) {
        return NextResponse.json({ error: 'country is required for set-country' }, { status: 400 });
      }
      const count = await NewsEventService.bulkUpdate(ids, { scope: 'country', country });
      return NextResponse.json({ ok: true, count });
    }

    if (action === 'set-global') {
      const count = await NewsEventService.bulkUpdate(ids, { scope: 'global', country: undefined as any });
      return NextResponse.json({ ok: true, count });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Bulk action failed' }, { status: 400 });
  }
}

