// GET /api/badges - Get master badge list

import { NextRequest, NextResponse } from 'next/server';
import { getBadgeMasterList } from '@/lib/badge-system';

export async function GET(request: NextRequest) {
    try {
        const badges = getBadgeMasterList();

        return NextResponse.json({
            success: true,
            data: {
                badges,
                total: badges.length,
                byRarity: {
                    common: badges.filter(b => b.rarity === 'common').length,
                    rare: badges.filter(b => b.rarity === 'rare').length,
                    epic: badges.filter(b => b.rarity === 'epic').length,
                    legendary: badges.filter(b => b.rarity === 'legendary').length,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching badges:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
