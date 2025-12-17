import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 10;
const rateMap = new Map<string, { ts: number; count: number }>();

/**
 * This route handles subscription checkout for Clerk
 * In production, you would integrate with Clerk's billing/subscription management
 * For now, this updates the user's metadata to indicate premium subscription
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = `subscription-checkout:${userId}`;
    const nowTs = Date.now();
    const existing = rateMap.get(key);
    if (existing && nowTs - existing.ts < RATE_LIMIT_WINDOW_MS) {
      if (existing.count >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateMap.set(key, { ts: existing.ts, count: existing.count + 1 });
    } else {
      rateMap.set(key, { ts: nowTs, count: 1 });
    }

    // In production, integrate with Clerk's subscription/billing system
    // For development, you can manually update user metadata or use Clerk's billing API
    
    // Option 1: Redirect to Clerk's subscription management (if configured)
    // Option 2: Update user metadata directly (for testing)
    
    // Example: Update user to premium (for development/testing)
    // await clerkClient.users.updateUserMetadata(userId, {
    //   publicMetadata: {
    //     subscriptionTier: 'premium',
    //     subscriptionStatus: 'active',
    //     subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    //   },
    // });

    // For production, use Clerk's billing API or redirect to their subscription portal
    return NextResponse.json({
      message: 'Subscription checkout',
      instructions: 'Configure Clerk billing in the Clerk Dashboard to enable subscriptions. For now, update user metadata manually or via webhook.',
      clerkBillingUrl: 'https://dashboard.clerk.com',
    });
  } catch (error: any) {
    console.error('Error in checkout:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to handle subscription activation (called by Clerk webhook)
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, tier, status, currentPeriodEnd } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const allowedTiers = new Set(['free', 'premium']);
    const finalTier = allowedTiers.has(String(tier)) ? String(tier) : 'premium';
    const allowedStatus = new Set(['active', 'on_trial', 'paused', 'canceled']);
    const finalStatus = allowedStatus.has(String(status)) ? String(status) : 'active';

    // Update user subscription status
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscriptionTier: finalTier,
        subscriptionStatus: finalStatus,
        subscriptionCurrentPeriodEnd: currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription', message: error.message },
      { status: 500 }
    );
  }
}
