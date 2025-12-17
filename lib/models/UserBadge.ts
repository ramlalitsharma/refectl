// User Badges Model - Tracks earned and locked badges per user

import { ObjectId } from 'mongodb';

export interface UserBadge {
    _id?: ObjectId;
    userId: string;
    badgeId: string;
    earned: boolean;
    earnedDate: Date | null;
    progress: number;            // 0-100 percentage
    notified: boolean;           // Whether user was notified of earning
    createdAt: Date;
    updatedAt: Date;
}

export function createUserBadge(
    userId: string,
    badgeId: string,
    progress: number = 0
): UserBadge {
    const now = new Date();
    return {
        userId,
        badgeId,
        earned: false,
        earnedDate: null,
        progress,
        notified: false,
        createdAt: now,
        updatedAt: now,
    };
}

export function earnBadge(badge: UserBadge): UserBadge {
    return {
        ...badge,
        earned: true,
        earnedDate: new Date(),
        progress: 100,
        updatedAt: new Date(),
    };
}
