import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * Clerk webhook handler for subscription/payment events
 * Handles subscription.created, subscription.updated, subscription.deleted
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body;

    // Verify webhook signature if Clerk provides one
    // For now, we'll trust the webhook (in production, verify signature)

    const db = await getDatabase();
    const client = await clerkClient();

    // Handle subscription events
    if (event.type?.startsWith('subscription.')) {
      const userId = event.data?.user_id || event.data?.id;
      const status = event.data?.status;
      const currentPeriodEnd = event.data?.current_period_end
        ? new Date(event.data.current_period_end * 1000)
        : undefined;

      if (userId) {
        // Update Clerk user metadata
        try {
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              subscriptionTier: status === 'active' || status === 'trialing' ? 'premium' : 'free',
              subscriptionStatus: status,
              subscriptionCurrentPeriodEnd: currentPeriodEnd?.toISOString(),
            },
          });
        } catch (e) {
          console.warn('Could not update Clerk metadata:', e);
        }

        // Update MongoDB
        await db.collection('users').updateOne(
          { clerkId: userId },
          {
            $set: {
              subscriptionTier: status === 'active' || status === 'trialing' ? 'premium' : 'free',
              subscriptionStatus: status,
              subscriptionCurrentPeriodEnd: currentPeriodEnd,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    }

    // Handle payment events
    if (event.type?.startsWith('payment.')) {
      const userId = event.data?.user_id;
      const amount = event.data?.amount;
      const currency = event.data?.currency;
      const courseId = event.data?.metadata?.courseId;

      if (userId && courseId) {
        // Create enrollment
        await db.collection('enrollments').insertOne({
          userId,
          courseId,
          status: 'approved',
          paymentId: event.data?.id,
          paymentMethod: 'clerk',
          amount: amount ? amount / 100 : 0, // Convert from cents
          currency: currency || 'USD',
          createdAt: new Date(),
        });

        // Record payment
        await db.collection('payments').insertOne({
          userId,
          courseId,
          type: 'course',
          amount: amount ? amount / 100 : 0,
          currency: currency || 'USD',
          paymentId: event.data?.id,
          status: 'completed',
          provider: 'clerk',
          createdAt: new Date(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}


