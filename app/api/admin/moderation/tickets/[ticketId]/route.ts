import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { ticketId } = await params;
    const body = await req.json();
    const { status, note, priority, assignTo } = body as {
      status?: 'open' | 'in_review' | 'resolved' | 'rejected' | 'spam';
      note?: string;
      priority?: 'low' | 'medium' | 'high';
      assignTo?: string;
    };

    const update: Record<string, any> = { updatedAt: new Date() };
    if (status) {
      update.status = status;
      if (status === 'resolved') {
        update.resolvedAt = new Date();
      }
    }
    if (note !== undefined) {
      update.resolutionNote = note;
    }
    if (priority) {
      update.priority = priority;
    }
    if (assignTo !== undefined) {
      update.assignedTo = assignTo;
    }

    const db = await getDatabase();
    const result = await db.collection('supportTickets').findOneAndUpdate(
      { _id: new ObjectId(ticketId) },
      { $set: update },
      { returnDocument: 'after' },
    );

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Support ticket moderation update error:', error);
    return NextResponse.json({ error: 'Failed to update ticket', message: error.message }, { status: 500 });
  }
}
