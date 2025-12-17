import { ObjectId } from 'mongodb';

export interface Flashcard {
  _id?: ObjectId;
  id?: string;
  userId: string;
  front: string;
  back: string;
  subject?: string;
  courseId?: string;
  lessonId?: string;
  tags?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  easeFactor: number; // For spaced repetition algorithm
  interval: number; // Days until next review
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardDeck {
  _id?: ObjectId;
  id?: string;
  userId: string;
  title: string;
  description?: string;
  subject?: string;
  courseId?: string;
  flashcards: string[]; // Flashcard IDs
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeFlashcard(flashcard: Flashcard & { _id?: any }): Flashcard {
  return {
    id: flashcard._id ? String(flashcard._id) : flashcard.id,
    userId: flashcard.userId,
    front: flashcard.front,
    back: flashcard.back,
    subject: flashcard.subject,
    courseId: flashcard.courseId,
    lessonId: flashcard.lessonId,
    tags: flashcard.tags || [],
    difficulty: flashcard.difficulty,
    lastReviewed: flashcard.lastReviewed instanceof Date ? flashcard.lastReviewed : flashcard.lastReviewed ? new Date(flashcard.lastReviewed) : undefined,
    nextReview: flashcard.nextReview instanceof Date ? flashcard.nextReview : flashcard.nextReview ? new Date(flashcard.nextReview) : undefined,
    reviewCount: flashcard.reviewCount || 0,
    correctCount: flashcard.correctCount || 0,
    incorrectCount: flashcard.incorrectCount || 0,
    easeFactor: flashcard.easeFactor || 2.5,
    interval: flashcard.interval || 1,
    createdAt: flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt),
    updatedAt: flashcard.updatedAt instanceof Date ? flashcard.updatedAt : new Date(flashcard.updatedAt),
  };
}

