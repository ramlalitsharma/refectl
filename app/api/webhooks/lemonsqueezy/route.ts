import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabase } from '@/lib/mongodb';
import { setUserSubscription } from '@/lib/subscriptions';

export const runtime = 'nodejs';

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody, 'utf8').digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ error: 'Webhook secret not set' }, { status: 200 });

    const signature = req.headers.get('x-signature') || req.headers.get('X-Signature');
    const raw = await req.text();

    if (!verifySignature(raw, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(raw);
    const eventName: string = event?.meta?.event_name || '';
    const data = event?.data || {};
    const eventId: string = event?.meta?.event_id || data?.id || signature || crypto.createHash('sha256').update(raw).digest('hex');

    // Extract user id/email from order/subscription metadata
    const userId: string | undefined = data?.attributes?.user_id || data?.attributes?.customer_id || data?.attributes?.identifier || undefined;
    const status: string | undefined = data?.attributes?.status;
    const currentPeriodEnd: string | undefined = data?.attributes?.renews_at || data?.attributes?.ends_at || undefined;

    // Map status to tier
    const isActive = status === 'active' || status === 'on_trial' || status === 'paid';
    const tier: 'free' | 'premium' = isActive ? 'premium' : 'free';

    const db = await getDatabase();
    const users = db.collection('users');
    const events = db.collection('webhookEvents');
    const dup = await events.findOne({ provider: 'lemon', eventId });
    if (dup) {
      return NextResponse.json({ received: true, duplicate: true, event: eventName });
    }

    if (userId) {
      await users.updateOne(
        { $or: [{ clerkId: userId }, { lemonId: userId }] },
        { $set: { subscriptionTier: tier, subscriptionStatus: status, subscriptionCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : undefined, updatedAt: new Date(), lemonId: userId } },
        { upsert: false }
      );

      // Also update via provider abstraction (updates Clerk publicMetadata if provider=clerk)
      await setUserSubscription(userId, { tier, status, currentPeriodEnd });
    }

    await events.insertOne({ provider: 'lemon', eventId, type: eventName, createdAt: new Date() });
    return NextResponse.json({ received: true, event: eventName });
  } catch (e: any) {
    console.error('Lemon Squeezy webhook error:', e);
    return NextResponse.json({ error: 'Webhook failed', message: e.message }, { status: 500 });
  }
}


