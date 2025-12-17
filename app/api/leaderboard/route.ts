// GET /api/leaderboard - Get global rankings with tier assignments

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { UserStats } from '@/lib/models/UserStats';
import { calculateRankings, getTier } from '@/lib/leaderboard-system';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Leaderboard requires authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDatabase();
    const collection = db.collection<UserStats>('userStats');

    // Get all users with stats, sorted by XP
    const allUsers = await collection
      .find({})
      .sort({ currentXP: -1, currentLevel: -1 })
      .toArray();

    // Transform to format expected by calculateRankings
    const usersForRanking = allUsers.map(u => ({
      userId: u.userId,
      userName: `User ${u.userId.slice(0, 8)}`, // Simple user name from ID
      avatar: '👤',
      xp: u.currentXP,
      level: u.currentLevel,
    }));

    // Calculate rankings using utility function
    const rankings = calculateRankings(usersForRanking);

    // Apply pagination
    const paginatedRankings = rankings.slice(offset, offset + limit);

    // Calculate tier distribution
    const tierCounts = {
      platinum: rankings.filter(r => r.rank === 1).length,
      gold: rankings.filter(r => r.rank > 1 && r.rank <= 10).length,
      silver: rankings.filter(r => r.rank > 10 && r.rank <= 50).length,
      bronze: rankings.filter(r => r.rank > 50).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: paginatedRankings,
        totalUsers: rankings.length,
        page: {
          offset,
          limit,
          hasMore: offset + limit < rankings.length,
        },
        tierCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
