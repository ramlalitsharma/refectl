// Activity Feed Model - MongoDB Schema

import { ObjectId } from 'mongodb';

export type ActivityType =
    | 'level_up'
    | 'badge_earned'
    | 'achievement'
    | 'streak_milestone'
    | 'quiz_perfect'
    | 'course_completed';

export type ActivityVisibility = 'public' | 'friends' | 'private';

export interface ActivityFeedItem {
    _id?: ObjectId;
    userId: string;
    userName: string; // Denormalized for performance
    userAvatar?: string; // Denormalized for performance
    activityType: ActivityType;
    title: string;
    description: string;
    icon: string;
    metadata?: {
        level?: number;
        badgeId?: string;
        badgeName?: string;
        achievementId?: string;
        achievementName?: string;
        tier?: number;
        streakDays?: number;
        courseName?: string;
        score?: number;
    };
    visibility: ActivityVisibility;
    createdAt: Date;
}

export interface CreateActivityInput {
    userId: string;
    activityType: ActivityType;
    title: string;
    description: string;
    icon?: string;
    metadata?: ActivityFeedItem['metadata'];
    visibility?: ActivityVisibility;
}

// Collection name
export const ACTIVITY_FEED_COLLECTION = 'activityFeed';
