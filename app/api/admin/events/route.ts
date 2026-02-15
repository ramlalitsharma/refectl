import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireEventManager } from '@/lib/admin-check';
import { NewsEventService } from '@/lib/news-event-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireEventManager();
    const items = await NewsEventService.getAllEvents();
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireEventManager();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const saved = await NewsEventService.upsertEvent({
      ...body,
      createdBy: userId,
    });
    return NextResponse.json({ item: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create event' }, { status: 400 });
  }
}

