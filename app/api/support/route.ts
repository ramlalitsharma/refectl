import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { SupportTicket } from '@/lib/models/SupportTicket';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDatabase();
    const tickets = await db
      .collection<SupportTicket>('supportTickets')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Support tickets fetch error:', error);
    return NextResponse.json({ error: 'Failed to load tickets', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const payload = await req.json();
    const { email, subject, message, priority = 'medium', tags } = payload;

    const resolvedEmail = email || (await currentUser())?.email;
    if (!resolvedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const ticket: SupportTicket = {
      userId: userId || undefined,
      email: resolvedEmail,
      subject,
      message,
      status: 'open',
      priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<SupportTicket>('supportTickets').insertOne(ticket);
    return NextResponse.json({ success: true, ticketId: result.insertedId.toString() });
  } catch (error: any) {
    console.error('Support ticket create error:', error);
    return NextResponse.json({ error: 'Failed to submit ticket', message: error.message }, { status: 500 });
  }
}
