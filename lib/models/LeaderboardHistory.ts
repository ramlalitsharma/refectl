// Leaderboard History Models - MongoDB Schema

import { ObjectId } from 'mongodb';

export type SnapshotType = 'daily' | 'weekly' | 'monthly';
export type TierType = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface LeaderboardSnapshot {
    _id?: ObjectId;
    snapshotType: SnapshotType;
    snapshotDate: Date;
    rankings: Array<{
        userId: string;
        userName: string;
        rank: number;
        xp: number;
        level: number;
        tier: TierType;
    }>;
    totalUsers: number;
    createdAt: Date;
}

export interface UserRankHistory {
    _id?: ObjectId;
    userId: string;
    date: Date;
    rank: number;
    xp: number;
    level: number;
    tier: TierType;
    rankChange: number; // Positive = improved, negative = declined
    tierChange?: 'promoted' | 'demoted' | null;
    createdAt: Date;
}

export interface UserRankStats {
    currentRank: number;
    bestRank: number;
    worstRank: number;
    averageRank: number;
    rankChange7Days: number;
    rankChange30Days: number;
    tierChanges: number;
    currentTier: TierType;
}

// Collection names
export const LEADERBOARD_HISTORY_COLLECTION = 'leaderboardHistory';
export const USER_RANK_HISTORY_COLLECTION = 'userRankHistory';
