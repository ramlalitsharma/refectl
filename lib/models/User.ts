import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  clerkId: string;
  email: string;
  name: string;
  role?: 'superadmin' | 'admin' | 'teacher' | 'student';
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
  isTeacher?: boolean;
  permissions?: string[];
  roleIds?: ObjectId[];
  subscriptionTier: 'free' | 'premium';
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  subscriptionCurrentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  learningProgress: {
    totalQuizzesTaken: number;
    averageScore: number;
    masteryLevel: number; // 0-100
    knowledgeGaps: string[]; // Array of topic IDs
  };
  preferences: {
    difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
    language: string;
  };
}

export interface UserProgress {
  userId: string;
  quizId: string;
  score: number;
  answers: Array<{
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number; // milliseconds
  }>;
  knowledgeGapsIdentified: string[];
  completedAt: Date;
}
