// Daily Quests Model - Tracks user's daily challenges

import { ObjectId } from 'mongodb';

export interface DailyQuest {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    progress: number;
    total: number;
    completed: boolean;
    icon: string;
    type: 'quiz' | 'study_time' | 'video' | 'course' | 'streak';
}

export interface DailyQuests {
    _id?: ObjectId;
    userId: string;
    date: string;                // YYYY-MM-DD
    quests: DailyQuest[];
    completedCount: number;
    bonusAwarded: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function createDailyQuests(
    userId: string,
    date: string,
    quests: DailyQuest[]
): DailyQuests {
    const now = new Date();
    return {
        userId,
        date,
        quests,
        completedCount: 0,
        bonusAwarded: false,
        createdAt: now,
        updatedAt: now,
    };
}
