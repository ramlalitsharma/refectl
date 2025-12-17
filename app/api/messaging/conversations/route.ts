import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();

    // Get user's conversations
    const conversations = await db
      .collection('conversations')
      .find({
        participants: userId,
      })
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientId, initialMessage } = body;

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    if (recipientId === userId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if conversation already exists
    let conversation = await db.collection('conversations').findOne({
      participants: { $all: [userId, recipientId] },
      type: 'direct',
    });

    if (!conversation) {
      // Create new conversation
      const result = await db.collection('conversations').insertOne({
        type: 'direct',
        participants: [userId, recipientId],
        lastMessage: initialMessage || '',
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      conversation = await db.collection('conversations').findOne({ _id: result.insertedId });
    }

    // Add initial message if provided
    if (initialMessage && conversation) {
      await db.collection('messages').insertOne({
        conversationId: String(conversation._id),
        senderId: userId,
        content: initialMessage.trim(),
        read: false,
        createdAt: new Date(),
      });

      // Update conversation
      await db.collection('conversations').updateOne(
        { _id: conversation._id },
        {
          $set: {
            lastMessage: initialMessage.trim(),
            lastMessageAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error('Conversation creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation', message: error.message },
      { status: 500 }
    );
  }
}

