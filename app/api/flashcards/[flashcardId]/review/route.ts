import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * SM-2 Algorithm for spaced repetition
 * Updates flashcard based on user's performance
 */
function calculateNextReview(
  quality: number, // 0-5: 0=blackout, 1=incorrect, 2=incorrect but remembered, 3=correct with difficulty, 4=correct, 5=perfect
  easeFactor: number,
  interval: number
): { newInterval: number; newEaseFactor: number } {
  // Update ease factor
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum ease factor

  // Update interval
  let newInterval: number;
  if (quality < 3) {
    // Incorrect - reset interval
    newInterval = 1;
  } else {
    // Correct - increase interval
    if (interval === 0) {
      newInterval = 1;
    } else if (interval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  return { newInterval, newEaseFactor };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ flashcardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flashcardId } = await params;
    const body = await req.json();
    const { quality } = body; // 0-5 rating

    if (quality === undefined || quality < 0 || quality > 5) {
      return NextResponse.json({ error: 'Quality rating (0-5) is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const flashcard = await db.collection('flashcards').findOne({
      $or: [{ _id: new ObjectId(flashcardId) }, { id: flashcardId }],
      userId,
    });

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    const { newInterval, newEaseFactor } = calculateNextReview(
      quality,
      flashcard.easeFactor || 2.5,
      flashcard.interval || 1
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    const update: any = {
      lastReviewed: new Date(),
      nextReview,
      reviewCount: (flashcard.reviewCount || 0) + 1,
      easeFactor: newEaseFactor,
      interval: newInterval,
      updatedAt: new Date(),
    };

    if (quality >= 3) {
      update.correctCount = (flashcard.correctCount || 0) + 1;
    } else {
      update.incorrectCount = (flashcard.incorrectCount || 0) + 1;
    }

    await db.collection('flashcards').updateOne(
      { _id: flashcard._id },
      { $set: update }
    );

    return NextResponse.json({
      success: true,
      nextReview: nextReview.toISOString(),
      interval: newInterval,
    });
  } catch (error: any) {
    console.error('Flashcard review error:', error);
    return NextResponse.json(
      { error: 'Failed to update flashcard review', message: error.message },
      { status: 500 }
    );
  }
}

