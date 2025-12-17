// GET /api/achievements - Get all achievements (master list)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllAchievements } from '@/lib/achievement-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const includeSecret = searchParams.get('includeSecret') === 'true';

    const achievements = await getAllAchievements({ category, includeSecret });

    // Calculate category breakdown
    const byCategory = achievements.reduce((acc: any, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        total: achievements.length,
        byCategory,
      },
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
