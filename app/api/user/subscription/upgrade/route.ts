// POST /api/user/subscription/upgrade
// Handles User Upgrade requests (Mock or Real)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SubscriptionService } from '@/lib/subscription-service';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In a real app, this would create a Stripe Checkout Session
        // For this portfolio implementation, we simulate a successful payment flow.

        await SubscriptionService.mockUpgrade(userId);

        return NextResponse.json({
            success: true,
            message: 'Upgraded to Pro successfully'
        });

    } catch (error) {
        console.error('Upgrade Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
