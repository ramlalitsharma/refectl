// Badge System - Database-Driven Version

import { getDatabase } from './mongodb';
import { BadgeDefinition, BADGES_COLLECTION } from './models/BadgeDefinition';
import { INITIAL_BADGES } from './cms-seed'; // Fallback

// Helper to get all active badges
export async function getAllBadges(): Promise<BadgeDefinition[]> {
    try {
        const db = await getDatabase();
        const badges = await db.collection<BadgeDefinition>(BADGES_COLLECTION)
            .find({ active: true })
            .sort({ order: 1 })
            .toArray();

        if (badges.length === 0) {
            console.warn('No badges found in DB, using fallback hardcoded badges.');
            return INITIAL_BADGES as any;
        }

        return badges;
    } catch (e) {
        console.error('Failed to fetch badges:', e);
        return INITIAL_BADGES as any;
    }
}

// Check for new badges
export async function checkBadges(userId: string, stats: any) {
    const db = await getDatabase();
    const badges = await getAllBadges(); // Fetch from DB
    const userBadges = await db.collection('userBadges').find({ userId }).toArray();
    const earnedBadgeIds = new Set(userBadges.map(b => b.badgeId));

    const newBadges: BadgeDefinition[] = [];

    for (const badge of badges) {
        if (earnedBadgeIds.has(badge.id)) continue;

        let earned = false;

        // Evaluate requirement based on dynamic DB fields
        switch (badge.requirementType) {
            case 'streak_days':
                if (stats.currentStreak >= badge.requirementValue) earned = true;
                break;
            case 'quizzes_completed':
                // Assuming we pass this or fetch it. For specific checks we might need more data.
                // For basic stats checks:
                if ((stats.quizzesCompleted || 0) >= badge.requirementValue) earned = true;
                break;
            case 'perfect_scores':
                if ((stats.perfectScores || 0) >= badge.requirementValue) earned = true;
                break;
            // Add more cases as more dynamic types are supported
        }

        if (earned) {
            newBadges.push(badge);
            // Award badge
            await db.collection('userBadges').insertOne({
                userId,
                badgeId: badge.id,
                earned: true,
                earnedAt: new Date(),
                progress: 100
            });

            // Award XP
            // (This would typically call the XP service or logic here)
        }
    }

    return newBadges;
}

export function getBadgeProgress(badge: BadgeDefinition, stats: any): number {
    let progress = 0;

    switch (badge.requirementType) {
        case 'streak_days':
            progress = (stats.currentStreak / badge.requirementValue) * 100;
            break;
        case 'quizzes_completed':
            progress = ((stats.quizzesCompleted || 0) / badge.requirementValue) * 100;
            break;
        // ... others
    }

    return Math.min(100, Math.max(0, progress));
}
