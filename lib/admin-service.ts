// Admin Service - Utilities for admin tasks

import { getDatabase } from './mongodb';
import { AdminLog, ADMIN_LOGS_COLLECTION, AdminActionType, TargetType } from './models/AdminLog';
import { ObjectId } from 'mongodb';

/**
 * Check if a user has admin privileges
 */
export async function isAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ userId });

    return user?.role === 'admin' || user?.role === 'super_admin';
}

/**
 * Log an admin action
 */
export async function logAdminAction(input: {
    adminId: string;
    action: AdminActionType;
    targetId?: string;
    targetType: TargetType;
    details: string;
    metadata?: any;
    ipAddress?: string;
}) {
    const db = await getDatabase();

    // Get admin name for easier reading
    const admin = await db.collection('users').findOne({ userId: input.adminId });

    const log: AdminLog = {
        adminId: input.adminId,
        adminName: admin?.name || 'Unknown Admin',
        action: input.action,
        targetId: input.targetId,
        targetType: input.targetType,
        details: input.details,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        createdAt: new Date(),
    };

    await db.collection(ADMIN_LOGS_COLLECTION).insertOne(log);
}

/**
 * Get system-wide statistics
 */
export async function getSystemStats() {
    const db = await getDatabase();

    // User stats
    const totalUsers = await db.collection('users').countDocuments();
    const bannedUsers = await db.collection('users').countDocuments({ isBanned: true });

    // Active users (last 24h) - Estimating based on recent activity/login if available
    // For now using userStats updated recently
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const activeUsers = await db.collection('userStats').countDocuments({ lastLoginAt: { $gte: oneDayAgo } });

    // Gamification stats
    const xpStats = await db.collection('userStats').aggregate([
        { $group: { _id: null, totalXP: { $sum: '$currentXP' } } }
    ]).toArray();
    const totalXP = xpStats[0]?.totalXP || 0;

    const totalBadges = await db.collection('userBadges').countDocuments({ earned: true });

    // Content stats
    const totalQuizzes = await db.collection('studyActivities').countDocuments({ activityType: 'quiz' });

    return {
        users: {
            total: totalUsers,
            active24h: activeUsers,
            banned: bannedUsers,
        },
        gamification: {
            totalXP,
            totalBadges,
        },
        content: {
            totalQuizzes,
        },
        system: {
            version: '1.0.0',
            databaseStatus: 'Healthy',
        }
    };
}

/**
 * Update a user's role
 */
export async function updateUserRole(adminId: string, targetUserId: string, newRole: 'user' | 'admin') {
    const db = await getDatabase();

    await db.collection('users').updateOne(
        { userId: targetUserId },
        { $set: { role: newRole, updatedAt: new Date() } }
    );

    await logAdminAction({
        adminId,
        action: 'change_role',
        targetId: targetUserId,
        targetType: 'user',
        details: `Changed role to ${newRole}`,
        metadata: { newRole }
    });
}

/**
 * Ban or Unban a user
 */
export async function toggleUserBan(adminId: string, targetUserId: string, ban: boolean, reason?: string) {
    const db = await getDatabase();

    await db.collection('users').updateOne(
        { userId: targetUserId },
        {
            $set: {
                isBanned: ban,
                banReason: ban ? reason : null,
                bannedAt: ban ? new Date() : null,
                updatedAt: new Date()
            }
        }
    );

    await logAdminAction({
        adminId,
        action: ban ? 'ban_user' : 'unban_user',
        targetId: targetUserId,
        targetType: 'user',
        details: ban ? `Banned user: ${reason}` : 'Unbanned user',
        metadata: { reason }
    });
}
