import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireEventManager } from '@/lib/admin-check';
import { NewsEventService } from '@/lib/news-event-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireEventManager();
    const { id } = await params;
    const item = await NewsEventService.getEventById(id);
    if (!item) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireEventManager();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const saved = await NewsEventService.upsertEvent({
      ...body,
      _id: id as any,
      createdBy: userId,
    });
    return NextResponse.json({ item: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update event' }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireEventManager();
    const { id } = await params;
    await NewsEventService.deleteEvent(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete event' }, { status: 400 });
  }
}

