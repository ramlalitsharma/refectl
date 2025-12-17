import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { serializeFlashcard } from '@/lib/models/Flashcard';
import type { Flashcard } from '@/lib/models/Flashcard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const subject = searchParams.get('subject');
    const courseId = searchParams.get('courseId');
    const due = searchParams.get('due') === 'true'; // Get cards due for review

    const db = await getDatabase();
    const query: any = { userId };

    if (subject) query.subject = subject;
    if (courseId) query.courseId = courseId;
    if (due) {
      query.$or = [
        { nextReview: { $lte: new Date() } },
        { nextReview: { $exists: false } },
      ];
    }

    const flashcards = await db
      .collection<Flashcard>('flashcards')
      .find(query)
      .sort(due ? { nextReview: 1 } : { createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      flashcards: flashcards.map(serializeFlashcard),
    });
  } catch (error: any) {
    console.error('Flashcards fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards', message: error.message },
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
    const { front, back, subject, courseId, lessonId, tags, difficulty = 'medium' } = body;

    if (!front || !back) {
      return NextResponse.json({ error: 'Front and back are required' }, { status: 400 });
    }

    const db = await getDatabase();

    // Calculate initial next review date (1 day from now)
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 1);

    const flashcard = {
      userId,
      front: front.trim(),
      back: back.trim(),
      subject: subject || undefined,
      courseId: courseId || undefined,
      lessonId: lessonId || undefined,
      tags: Array.isArray(tags) ? tags : [],
      difficulty,
      lastReviewed: undefined,
      nextReview,
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      easeFactor: 2.5, // Initial ease factor for SM-2 algorithm
      interval: 1, // Initial interval in days
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('flashcards').insertOne(flashcard);
    const created = await db.collection('flashcards').findOne({ _id: result.insertedId });

    return NextResponse.json({ flashcard: serializeFlashcard(created as any) });
  } catch (error: any) {
    console.error('Flashcard creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard', message: error.message },
      { status: 500 }
    );
  }
}

