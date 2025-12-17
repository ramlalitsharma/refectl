// User Stats Model - Tracks XP, levels, streaks, and study metrics

import { ObjectId } from 'mongodb';

export interface UserStats {
    _id?: ObjectId;
    userId: string;             // Clerk user ID
    currentXP: number;           // Total lifetime XP
    currentLevel: number;        // Calculated from XP
    currentStreak: number;       // Consecutive days studied
    longestStreak: number;       // Personal best streak
    lastStudyDate: string;       // ISO date string (YYYY-MM-DD)
    totalStudyMinutes: number;   // All-time study time
    totalQuizzes: number;        // Total quizzes completed
    perfectScores: number;       // Number of 100% quiz scores
    completedCourses: number;    // Total courses finished
    createdAt: Date;
    updatedAt: Date;
}

export const userStatsDefaults: Omit<UserStats, '_id' | 'userId' | 'createdAt' | 'updatedAt'> = {
    currentXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    totalStudyMinutes: 0,
    totalQuizzes: 0,
    perfectScores: 0,
    completedCourses: 0,
};

export function createUserStats(userId: string): UserStats {
    const now = new Date();
    return {
        userId,
        ...userStatsDefaults,
        createdAt: now,
        updatedAt: now,
    };
}
