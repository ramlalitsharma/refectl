import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { FlashcardStudy } from '@/components/learning/FlashcardStudy';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { serializeFlashcard } from '@/lib/models/Flashcard';
import type { Flashcard } from '@/lib/models/Flashcard';

export const dynamic = 'force-dynamic';

export default async function FlashcardsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const db = await getDatabase();
  
  // Get flashcards due for review
  const flashcards = await db
    .collection<Flashcard>('flashcards')
    .find({
      userId,
      $or: [
        { nextReview: { $lte: new Date() } },
        { nextReview: { $exists: false } },
      ],
    })
    .sort({ nextReview: 1 })
    .limit(50)
    .toArray();

  const serialized = flashcards.map(serializeFlashcard);
  const uiFlashcards = serialized.map((f) => ({
    id: String(f.id || ''),
    front: f.front,
    back: f.back,
    difficulty: f.difficulty,
    reviewCount: f.reviewCount || 0,
    correctCount: f.correctCount || 0,
  }));

  return (
    <div className="bg-[#f4f6f9] min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Learning', href: '/my-learning' },
            { label: 'Flashcards' },
          ]}
        />

        <FlashcardStudy flashcards={uiFlashcards} />
      </div>
    </div>
  );
}

