// Achievement Service - Utility functions for managing achievements

import { getDatabase } from './mongodb';
import {
    Achievement,
    UserAchievement,
    ACHIEVEMENTS_COLLECTION,
    USER_ACHIEVEMENTS_COLLECTION
} from './models/Achievement';
import { ACHIEVEMENT_DEFINITIONS } from './achievement-definitions';

/**
 * Get all achievements from master list
 */
export async function getAllAchievements(options?: {
    category?: string;
    includeSecret?: boolean;
}): Promise<Achievement[]> {
    let achievements = [...ACHIEVEMENT_DEFINITIONS];

    // Filter by category
    if (options?.category) {
        achievements = achievements.filter(a => a.category === options.category);
    }

    // Filter secrets unless requested
    if (!options?.includeSecret) {
        achievements = achievements.map(a => {
            if (a.isSecret) {
                return {
                    ...a,
                    name: '???',
                    description: 'This is a secret achievement. Unlock it to reveal!',
                    tiers: a.tiers.map(t => ({
                        ...t,
                        description: '???',
                    })),
                };
            }
            return a;
        });
    }

    return achievements;
}

/**
 * Get user's achievements with progress
 */
export async function getUserAchievements(
    userId: string,
    options?: { category?: string; status?: 'unlocked' | 'in_progress' | 'locked' }
): Promise<Array<Achievement & Partial<UserAchievement>>> {
    const db = await getDatabase();
    const userAchCol = db.collection<UserAchievement>(USER_ACHIEVEMENTS_COLLECTION);

    // Get user's achievement records
    const userRecords = await userAchCol.find({ userId }).toArray();
    const recordsMap = new Map(userRecords.map(r => [r.achievementId, r]));

    // Get all achievements
    const allAchievements = await getAllAchievements({
        category: options?.category,
        includeSecret: true // Show unlocked secrets
    });

    // Merge with user progress
    let result = allAchievements.map(achievement => {
        const userRecord = recordsMap.get(achievement.id);

        if (userRecord) {
            return {
                ...achievement,
                ...userRecord,
                // Don't hide secret if unlocked
                name: userRecord.unlocked ? achievement.name : (achievement.isSecret ? '???' : achievement.name),
                description: userRecord.unlocked ? achievement.description : (achievement.isSecret ? 'Unlock to reveal!' : achievement.description),
            };
        } else {
            // No progress yet
            return {
                ...achievement,
                currentTier: 0,
                totalTiers: achievement.tiers.length,
                progress: 0,
                currentValue: 0,
                unlocked: false,
                unlockedTiers: [],
                name: achievement.isSecret ? '???' : achievement.name,
                description: achievement.isSecret ? 'Unlock to reveal!' : achievement.description,
            };
        }
    });

    // Filter by status
    if (options?.status === 'unlocked') {
        result = result.filter(a => a.unlocked);
    } else if (options?.status === 'in_progress') {
        result = result.filter(a => !a.unlocked && (a.progress || 0) > 0);
    } else if (options?.status === 'locked') {
        result = result.filter(a => !a.unlocked);
    }

    return result;
}

/**
 * Calculate user's current value for an achievement requirement
 */
export async function calculateCurrentValue(
    userId: string,
    requirementType: string
): Promise<number> {
    const db = await getDatabase();

    switch (requirementType) {
        case 'total_xp': {
            const userStats = await db.collection('userStats').findOne({ userId });
            return userStats?.currentXP || 0;
        }

        case 'level_reached': {
            const userStats = await db.collection('userStats').findOne({ userId });
            return userStats?.currentLevel || 1;
        }

        case 'streak_days': {
            const userStats = await db.collection('userStats').findOne({ userId });
            return userStats?.currentStreak || 0;
        }

        case 'quizzes_completed': {
            const count = await db.collection('studyActivities').countDocuments({
                userId,
                activityType: 'quiz',
            });
            return count;
        }

        case 'courses_completed': {
            const count = await db.collection('userProgress').countDocuments({
                userId,
                completed: true,
            });
            return count;
        }

        case 'badges_earned': {
            const count = await db.collection('userBadges').countDocuments({
                userId,
                earned: true,
            });
            return count;
        }

        case 'perfect_scores': {
            const count = await db.collection('studyActivities').countDocuments({
                userId,
                activityType: 'quiz',
                score: 100,
            });
            return count;
        }

        case 'daily_quests_completed': {
            const quests = await db.collection('dailyQuests').find({ userId }).toArray();
            const completedCount = quests.reduce((sum, q) =>
                sum + q.quests.filter((quest: any) => quest.completed).length, 0
            );
            return completedCount;
        }

        default:
            return 0;
    }
}

/**
 * Check and update achievement progress for a user
 */
export async function checkAchievements(
    userId: string,
    achievementIds?: string[]
): Promise<{
    newUnlocks: Array<{ achievementId: string; tier: number; xpAwarded: number; achievementName: string }>;
    progressUpdates: Array<{ achievementId: string; progress: number; currentValue: number }>;
}> {
    const db = await getDatabase();
    const userAchCol = db.collection<UserAchievement>(USER_ACHIEVEMENTS_COLLECTION);

    const newUnlocks: any[] = [];
    const progressUpdates: any[] = [];

    // Get achievements to check
    const achievementsToCheck = achievementIds
        ? ACHIEVEMENT_DEFINITIONS.filter(a => achievementIds.includes(a.id))
        : ACHIEVEMENT_DEFINITIONS;

    for (const achievement of achievementsToCheck) {
        // Get user's current record
        let userRecord = await userAchCol.findOne({
            userId,
            achievementId: achievement.id
        });

        // Calculate current value
        const currentValue = await calculateCurrentValue(userId, achievement.tiers[0].requirement.type);

        // Initialize if not exists
        if (!userRecord) {
            userRecord = {
                userId,
                achievementId: achievement.id,
                currentTier: 0,
                totalTiers: achievement.tiers.length,
                progress: 0,
                currentValue: 0,
                unlocked: false,
                unlockedTiers: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await userAchCol.insertOne(userRecord);
        }

        // Check each tier
        for (const tier of achievement.tiers) {
            const tierUnlocked = userRecord.unlockedTiers?.includes(tier.level) || false;

            if (!tierUnlocked && currentValue >= tier.requirement.value) {
                // Unlock this tier!
                const unlockedTiers = [...(userRecord.unlockedTiers || []), tier.level];
                const isFullyUnlocked = tier.level === 1 || userRecord.unlocked;

                await userAchCol.updateOne(
                    { userId, achievementId: achievement.id },
                    {
                        $set: {
                            currentTier: tier.level,
                            unlockedTiers,
                            unlocked: isFullyUnlocked,
                            currentValue,
                            updatedAt: new Date(),
                            completedAt: tier.level === achievement.tiers.length ? new Date() : undefined,
                        },
                    }
                );

                newUnlocks.push({
                    achievementId: achievement.id,
                    achievementName: achievement.name,
                    tier: tier.level,
                    tierName: tier.name,
                    xpAwarded: tier.xpReward,
                });
            }
        }

        // Calculate progress to next tier
        const nextTier = achievement.tiers.find(t => !(userRecord.unlockedTiers || []).includes(t.level));
        if (nextTier) {
            const progress = Math.min(100, (currentValue / nextTier.requirement.value) * 100);

            await userAchCol.updateOne(
                { userId, achievementId: achievement.id },
                {
                    $set: {
                        progress,
                        currentValue,
                        updatedAt: new Date(),
                    },
                }
            );

            progressUpdates.push({
                achievementId: achievement.id,
                progress,
                currentValue,
                nextTierRequirement: nextTier.requirement.value,
            });
        }
    }

    return { newUnlocks, progressUpdates };
}

/**
 * Get achievement stats for a user
 */
export async function getAchievementStats(userId: string): Promise<{
    total: number;
    unlocked: number;
    inProgress: number;
    locked: number;
    totalTiersUnlocked: number;
    totalTiersPossible: number;
    achievementPoints: number;
    completionRate: number;
}> {
    const achievements = await getUserAchievements(userId);

    const unlocked = achievements.filter(a => a.unlocked).length;
    const inProgress = achievements.filter(a => !a.unlocked && (a.progress || 0) > 0).length;
    const locked = achievements.filter(a => !a.unlocked && (a.progress || 0) === 0).length;

    const totalTiersUnlocked = achievements.reduce((sum, a) => sum + (a.unlockedTiers?.length || 0), 0);
    const totalTiersPossible = achievements.reduce((sum, a) => sum + a.tiers.length, 0);

    const achievementPoints = achievements
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + a.points, 0);

    const completionRate = (unlocked / achievements.length) * 100;

    return {
        total: achievements.length,
        unlocked,
        inProgress,
        locked,
        totalTiersUnlocked,
        totalTiersPossible,
        achievementPoints,
        completionRate,
    };
}
