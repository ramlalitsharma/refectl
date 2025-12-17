// Quest Template Model - MongoDB Schema

import { ObjectId } from 'mongodb';

export type QuestFrequency = 'daily' | 'weekly';
export type QuestRarity = 'common' | 'rare' | 'epic';

export interface QuestTemplate {
    _id?: ObjectId;
    id: string;               // Unique ID
    title: string;            // e.g., "Daily Reader"
    description: string;
    type: string;             // Logic type: "read_articles", "complete_quiz"
    requirementValue: number; // Amount needed: 3
    xpReward: number;         // XP
    rarity: QuestRarity;
    frequency: QuestFrequency;
    active: boolean;          // Active status
    createdAt: Date;
    updatedAt: Date;
}

// Collection name
export const QUEST_TEMPLATES_COLLECTION = 'questTemplates';
