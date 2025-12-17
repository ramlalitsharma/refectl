import { clerkClient } from '@clerk/nextjs/server';
import { getDatabase } from './mongodb';
import type { SubscriptionPlan } from './models/SubscriptionPlan';
import { serializePlan } from './models/SubscriptionPlan';

export async function getActivePlans() {
  const db = await getDatabase();
  const plans = await db
    .collection<SubscriptionPlan>('subscriptionPlans')
    .find({ active: true })
    .sort({ price: 1 })
    .toArray();
  return plans.map(serializePlan);
}

type SubsProvider = 'clerk' | 'lemonsqueezy';

export interface SubscriptionInfo {
  tier: 'free' | 'premium';
  status?: string;
  currentPeriodEnd?: string;
}

function getProvider(): SubsProvider {
  const p = (process.env.SUBSCRIPTIONS_PROVIDER || 'clerk').toLowerCase();
  return p === 'lemonsqueezy' ? 'lemonsqueezy' : 'clerk';
}

export async function setUserSubscription(
  userId: string,
  info: SubscriptionInfo
) {
  const provider = getProvider();
  if (provider === 'clerk') {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscriptionTier: info.tier,
        subscriptionStatus: info.status,
        subscriptionCurrentPeriodEnd: info.currentPeriodEnd,
      },
    });
    return;
  }
  // lemonsqueezy: rely on webhook to set DB and any public metadata mirror if desired
}


