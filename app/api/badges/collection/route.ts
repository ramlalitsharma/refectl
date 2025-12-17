// GET /api/badges/collection - Get user's badge collection

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { UserBadge, createUserBadge } from '@/lib/models/UserBadge';
import { UserStats } from '@/lib/models/UserStats';
import { getAllBadges, getBadgeProgress } from '@/lib/badge-system';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await getDatabase();
        const badgeCollection = db.collection<UserBadge>('userBadges');
        const statsCollection = db.collection<UserStats>('userStats');

        // Get all available badges
        const allBadges = await getAllBadges();

        // Get user's badge records
        const userBadges = await badgeCollection.find({ userId }).toArray();

        // Get user stats for progress calculation
        const userStats = await statsCollection.findOne({ userId });
        const stats = userStats || {
            currentLevel: 1,
            currentStreak: 0,
            totalQuizzes: 0,
            perfectScores: 0,
            completedCourses: 0,
        };

        // Build collection with progress
        const collection = allBadges.map(badge => {
            const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
            const progress = (getBadgeProgress as any)(badge, stats);

            if (userBadge) {
                return {
                    ...badge,
                    earned: userBadge.earned,
                    earnedDate: userBadge.earnedDate,
                    progress: userBadge.earned ? 100 : progress,
                };
            }

            return {
                ...badge,
                earned: false,
                earnedDate: null,
                progress,
            };
        });

        // Calculate stats
        const earnedCount = collection.filter(b => b.earned).length;
        const rarityCounts = {
            common: collection.filter(b => b.earned && b.rarity === 'common').length,
            rare: collection.filter(b => b.earned && b.rarity === 'rare').length,
            epic: collection.filter(b => b.earned && b.rarity === 'epic').length,
            legendary: collection.filter(b => b.earned && b.rarity === 'legendary').length,
        };

        return NextResponse.json({
            success: true,
            data: {
                badges: collection,
                stats: {
                    total: allBadges.length,
                    earned: earnedCount,
                    locked: allBadges.length - earnedCount,
                    completionRate: (earnedCount / allBadges.length) * 100,
                    rarityCounts,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching badge collection:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
