// Notification Model - MongoDB Schema

import { ObjectId } from 'mongodb';

export type NotificationType = 'badge' | 'level_up' | 'quest' | 'streak' | 'rank' | 'achievement';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
    _id?: ObjectId;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    icon?: string; // Emoji or icon identifier
    priority: NotificationPriority;

    // Type-specific metadata
    metadata?: {
        badgeId?: string;
        badgeName?: string;
        oldLevel?: number;
        newLevel?: number;
        questId?: string;
        xpAwarded?: number;
        streakDays?: number;
        oldRank?: number;
        newRank?: number;
        achievementId?: string;
    };

    // Status tracking
    read: boolean;
    readAt?: Date;
    dismissed: boolean;

    // Timestamps
    createdAt: Date;
    expiresAt?: Date; // Auto-delete after 30 days
}

// Helper type for creating notifications
export interface CreateNotificationInput {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    icon?: string;
    priority?: NotificationPriority;
    metadata?: Notification['metadata'];
}

// Collection name
export const NOTIFICATIONS_COLLECTION = 'notifications';

// Default expiration (30 days)
export const NOTIFICATION_EXPIRATION_DAYS = 30;
