// Badge Definition Model - MongoDB Schema

import { ObjectId } from 'mongodb';

export type BadgeCategory = 'learning' | 'social' | 'mastery' | 'consistency';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
    _id?: ObjectId;
    id: string;              // Unique identifier (e.g., "week_warrior")
    name: string;            // Display name
    description: string;
    icon: string;            // Emoji or icon path
    rarity: BadgeRarity;
    category: BadgeCategory;
    requirementType: string; // The metric to check (e.g., "streak_days", "quizzes_completed")
    requirementValue: number; // The target value (e.g., 7)
    xpReward: number;        // XP awarded on unlock
    order: number;           // Sort order for UI
    active: boolean;         // Soft delete status
    createdAt: Date;
    updatedAt: Date;
}

// Collection name
export const BADGES_COLLECTION = 'badges';
