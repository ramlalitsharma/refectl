// Achievement Model - MongoDB Schema

import { ObjectId } from 'mongodb';

export type AchievementCategory = 'learning' | 'social' | 'mastery' | 'exploration' | 'special';
export type AchievementType = 'standard' | 'secret' | 'limited_time';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementTier {
    level: number;
    name: string; // Bronze, Silver, Gold, Platinum
    description: string;
    requirement: {
        type: string; // 'courses_completed', 'total_xp', 'quizzes_perfect', etc.
        value: number;
        metadata?: any;
    };
    xpReward: number;
    icon?: string;
}

export interface Achievement {
    _id?: ObjectId;
    id: string;
    name: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    type: AchievementType;
    isSecret: boolean;
    tiers: AchievementTier[];
    rarity: AchievementRarity;
    points: number; // Achievement points
    createdAt?: Date;
}

export interface UserAchievement {
    _id?: ObjectId;
    userId: string;
    achievementId: string;
    currentTier: number; // 0 = not started, 1+ = tier number
    totalTiers: number;
    progress: number; // Progress toward next tier (0-100)
    currentValue: number; // Current actual value (e.g., 25 courses completed)
    unlocked: boolean; // True if at least tier 1 unlocked
    unlockedTiers: number[]; // [1, 2, 3] for unlocked tiers
    completedAt?: Date; // When all tiers completed
    createdAt: Date;
    updatedAt: Date;
}

// Collection names
export const ACHIEVEMENTS_COLLECTION = 'achievements';
export const USER_ACHIEVEMENTS_COLLECTION = 'userAchievements';
