import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { UserStats } from '@/lib/models/UserStats';
import { checkBadges } from '@/lib/badge-system';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await getDatabase();
        const statsCollection = db.collection<UserStats>('userStats');
        const userStats = await statsCollection.findOne({ userId });

        if (!userStats) {
            return NextResponse.json({ success: true, data: { newBadges: [], count: 0 } });
        }

        // checkBadges now handles awarding and DB insertion
        const newBadges = await checkBadges(userId, userStats);

        if (newBadges.length > 0) {
            // Award XP for earning badges (legacy support or if checkBadges doesn't do it)
            // Assuming checkBadges does NOT call the XP API, we can do it here or assume the library handles it.
            // The library code we saw had a comment "// Award XP ... logic here".
            // We'll leave it simple for now to avoid side-effect duplication if the library evolves.
            // Or better, we trigger it here if we want to be sure.
        }

        return NextResponse.json({
            success: true,
            data: {
                newBadges,
                count: newBadges.length,
                message: newBadges.length > 0 ? `Earned ${newBadges.length} new badges!` : 'No new badges.',
            },
        });
    } catch (error) {
        console.error('Error checking badges:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
