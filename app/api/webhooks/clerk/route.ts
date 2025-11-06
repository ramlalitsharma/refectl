import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // Webhook secret is optional for local development
  // For production, webhooks will be configured later
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️ CLERK_WEBHOOK_SECRET not set - webhooks disabled for local development');
    return NextResponse.json(
      { 
        message: 'Webhook secret not configured. Set CLERK_WEBHOOK_SECRET in .env.local for production.',
        note: 'For local development, users will be created manually on first login.'
      },
      { status: 200 }
    );
  }

  // Get the Svix headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Error occurred -- no svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Create user in MongoDB
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    await usersCollection.insertOne({
      clerkId: id,
      email: email_addresses[0]?.email_address || '',
      name: `${first_name || ''} ${last_name || ''}`.trim(),
      subscriptionTier: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
      learningProgress: {
        totalQuizzesTaken: 0,
        averageScore: 0,
        masteryLevel: 0,
        knowledgeGaps: [],
      },
      preferences: {
        difficultyPreference: 'adaptive',
        language: 'en',
      },
    } as User);
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, public_metadata } = evt.data;

    // Update user in MongoDB
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { clerkId: id },
      {
        $set: {
          email: email_addresses[0]?.email_address || '',
          subscriptionTier: public_metadata?.subscriptionTier || 'free',
          subscriptionStatus: public_metadata?.subscriptionStatus,
          subscriptionCurrentPeriodEnd: public_metadata?.subscriptionCurrentPeriodEnd
            ? new Date(String(public_metadata.subscriptionCurrentPeriodEnd))
            : undefined,
          updatedAt: new Date(),
        },
      }
    );
  }

  // Handle Clerk subscription lifecycle events (if enabled on your Clerk app)
  if (eventType?.startsWith('subscription.')) {
    try {
      const db = await getDatabase();
      const usersCollection = db.collection('users');

      // Clerk subscription events typically include the user id on evt.data.user_id
      // Fall back to evt.data.id if necessary
      const userId = (evt as any).data?.user_id || (evt as any).data?.id;
      const status: string | undefined = (evt as any).data?.status;
      const currentPeriodEndRaw: string | number | undefined = (evt as any).data?.current_period_end || (evt as any).data?.current_period_ends_at;
      const currentPeriodEnd = currentPeriodEndRaw ? new Date(String(currentPeriodEndRaw)) : undefined;

      // Map status to tier
      const isActive = status === 'active' || status === 'trialing';
      const tier: 'free' | 'premium' = isActive ? 'premium' : 'free';

      if (userId) {
        // Update Clerk publicMetadata as source of truth
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              subscriptionTier: tier,
              subscriptionStatus: status,
              subscriptionCurrentPeriodEnd: currentPeriodEnd?.toISOString(),
            },
          });
        } catch (e) {
          console.warn('Could not update Clerk publicMetadata from subscription webhook:', e);
        }

        // Persist in MongoDB mirror
        await usersCollection.updateOne(
          { clerkId: userId },
          {
            $set: {
              subscriptionTier: tier,
              subscriptionStatus: status,
              subscriptionCurrentPeriodEnd: currentPeriodEnd,
              updatedAt: new Date(),
            },
          },
          { upsert: false }
        );
      }
    } catch (e) {
      console.error('Error handling subscription webhook:', e);
    }
  }

  return NextResponse.json({ received: true });
}
