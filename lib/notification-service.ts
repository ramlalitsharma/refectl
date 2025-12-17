// Notification Service - Utility functions for managing notifications

import { getDatabase } from './mongodb';
import {
    Notification,
    CreateNotificationInput,
    NOTIFICATIONS_COLLECTION,
    NOTIFICATION_EXPIRATION_DAYS
} from './models/Notification';

/**
 * Send a notification to a user
 */
export async function sendNotification(input: CreateNotificationInput): Promise<Notification> {
    const db = await getDatabase();
    const collection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + NOTIFICATION_EXPIRATION_DAYS);

    const notification: Notification = {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        icon: input.icon,
        priority: input.priority || 'medium',
        metadata: input.metadata,
        read: false,
        dismissed: false,
        createdAt: new Date(),
        expiresAt,
    };

    const result = await collection.insertOne(notification);

    return {
        ...notification,
        _id: result.insertedId,
    };
}

/**
 * Get user's notifications with pagination
 */
export async function getUserNotifications(
    userId: string,
    options?: {
        limit?: number;
        offset?: number;
        read?: boolean;
        type?: string;
    }
): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const db = await getDatabase();
    const collection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    // Build query
    const query: any = { userId };
    if (options?.read !== undefined) {
        query.read = options.read;
    }
    if (options?.type) {
        query.type = options.type;
    }

    // Get notifications
    const notifications = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

    // Get total count
    const total = await collection.countDocuments(query);

    // Get unread count
    const unreadCount = await collection.countDocuments({
        userId,
        read: false,
    });

    return {
        notifications,
        total,
        unreadCount,
    };
}

/**
 * Mark notification(s) as read
 */
export async function markNotificationsAsRead(
    userId: string,
    notificationIds?: string[]
): Promise<number> {
    const db = await getDatabase();
    const collection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

    const query: any = { userId, read: false };

    if (notificationIds && notificationIds.length > 0) {
        const { ObjectId } = await import('mongodb');
        query._id = { $in: notificationIds.map(id => new ObjectId(id)) };
    }

    const result = await collection.updateMany(
        query,
        {
            $set: {
                read: true,
                readAt: new Date(),
            },
        }
    );

    return result.modifiedCount;
}

/**
 * Delete old expired notifications (for cron job)
 */
export async function cleanupExpiredNotifications(): Promise<number> {
    const db = await getDatabase();
    const collection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

    const result = await collection.deleteMany({
        expiresAt: { $lt: new Date() },
    });

    return result.deletedCount;
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
    const db = await getDatabase();
    const collection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

    return await collection.countDocuments({
        userId,
        read: false,
    });
}

/**
 * Helper: Send badge unlock notification
 */
export async function sendBadgeNotification(
    userId: string,
    badgeId: string,
    badgeName: string,
    xpAwarded: number = 75
): Promise<Notification> {
    return sendNotification({
        userId,
        type: 'badge',
        title: '🎖️ Badge Unlocked!',
        message: `You earned "${badgeName}"!`,
        icon: '🎖️',
        priority: 'high',
        metadata: { badgeId, badgeName, xpAwarded },
    });
}

/**
 * Helper: Send level up notification
 */
export async function sendLevelUpNotification(
    userId: string,
    oldLevel: number,
    newLevel: number,
    xpAwarded: number
): Promise<Notification> {
    return sendNotification({
        userId,
        type: 'level_up',
        title: '🎊 Level Up!',
        message: `You reached Level ${newLevel}!`,
        icon: '🎊',
        priority: 'high',
        metadata: { oldLevel, newLevel, xpAwarded },
    });
}

/**
 * Helper: Send quest completion notification
 */
export async function sendQuestNotification(
    userId: string,
    questTitle: string,
    xpAwarded: number
): Promise<Notification> {
    return sendNotification({
        userId,
        type: 'quest',
        title: '✨ Quest Complete!',
        message: questTitle,
        icon: '✨',
        priority: 'medium',
        metadata: { xpAwarded },
    });
}

/**
 * Helper: Send streak milestone notification
 */
export async function sendStreakNotification(
    userId: string,
    streakDays: number
): Promise<Notification> {
    return sendNotification({
        userId,
        type: 'streak',
        title: `🔥 ${streakDays}-Day Streak!`,
        message: 'Incredible dedication!',
        icon: '🔥',
        priority: 'high',
        metadata: { streakDays },
    });
}
