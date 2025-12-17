// Export Service - Data Aggregation and CSV Generation

import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

/**
 * Generate full data dump for a specific user (GDPR/Backup)
 * Returns a JSON object with all user data
 */
export async function generateUserData(userId: string) {
    const db = await getDatabase();

    const [
        user,
        stats,
        badges,
        achievements,
        studyActivities,
        quests,
        friends,
        notifications
    ] = await Promise.all([
        db.collection('users').findOne({ userId }),
        db.collection('userStats').findOne({ userId }),
        db.collection('userBadges').find({ userId }).toArray(),
        db.collection('userAchievements').find({ userId }).toArray(),
        db.collection('studyActivities').find({ userId }).sort({ createdAt: -1 }).toArray(),
        db.collection('dailyQuests').find({ userId }).sort({ date: -1 }).limit(30).toArray(),
        db.collection('friendships').find({ $or: [{ userId }, { friendId: userId }] }).toArray(),
        db.collection('notifications').find({ userId }).sort({ createdAt: -1 }).limit(100).toArray()
    ]);

    // Clean sensitive/internal data if necessary (e.g., password hashes if they existed)
    // Since we use Clerk, our local DB mostly has safe profile data.

    return {
        profile: user,
        stats,
        gamification: {
            badges,
            achievements,
            quests
        },
        activity: studyActivities,
        social: friends,
        notifications,
        exportDate: new Date()
    };
}

/**
 * Generate CSV string from array of objects
 */
function jsonToCsv(items: any[], fields: string[]) {
    if (!items || items.length === 0) return '';

    const header = fields.join(',');
    const rows = items.map(item => {
        return fields.map(field => {
            const value = item[field] === undefined || item[field] === null ? '' : item[field];
            // Basic CSV escaping
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });

    return [header, ...rows].join('\n');
}

/**
 * Generate Admin Report Data (CSV)
 */
export async function generateAdminReport(type: 'users' | 'activity' | 'gamification') {
    const db = await getDatabase();

    if (type === 'users') {
        // 1. User Report: Basic profile + Role + Status
        // Join with UserStats for high-level numbers
        const users = await db.collection('users').aggregate([
            {
                $lookup: {
                    from: 'userStats',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'stats'
                }
            },
            {
                $project: {
                    userId: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    isBanned: 1,
                    createdAt: 1,
                    currentLevel: { $arrayElemAt: ['$stats.currentLevel', 0] },
                    currentXP: { $arrayElemAt: ['$stats.currentXP', 0] }
                }
            }
        ]).toArray();

        return jsonToCsv(users, ['userId', 'name', 'email', 'role', 'currentLevel', 'currentXP', 'isBanned', 'createdAt']);
    }

    if (type === 'activity') {
        // 2. Activity Report: Recent 1000 study sessions
        const activities = await db.collection('studyActivities').aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 1000 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            {
                $project: {
                    activityId: '$_id',
                    userName: { $arrayElemAt: ['$user.name', 0] },
                    activityType: 1,
                    score: 1,
                    durationSeconds: 1,
                    createdAt: 1
                }
            }
        ]).toArray();

        return jsonToCsv(activities, ['activityId', 'userName', 'activityType', 'score', 'durationSeconds', 'createdAt']);
    }

    if (type === 'gamification') {
        // 3. Gamification Report: Badges & Quests summary
        const stats = await db.collection('userStats').find({}).toArray();

        // Enrich with badge counts
        const enriched = await Promise.all(stats.map(async (stat) => {
            const badgeCount = await db.collection('userBadges').countDocuments({ userId: stat.userId, earned: true });
            const user = await db.collection('users').findOne({ userId: stat.userId });

            return {
                userId: stat.userId,
                name: user?.name || 'Unknown',
                level: stat.currentLevel,
                xp: stat.currentXP,
                streak: stat.currentStreak,
                badgesEarned: badgeCount,
                quizzesCompleted: stat.quizzesCompleted
            };
        }));

        return jsonToCsv(enriched, ['userId', 'name', 'level', 'xp', 'streak', 'badgesEarned', 'quizzesCompleted']);
    }

    return '';
}
