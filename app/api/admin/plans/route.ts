import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { serializePlan } from '@/lib/models/SubscriptionPlan';
import type { SubscriptionPlan } from '@/lib/models/SubscriptionPlan';

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
    const plans = await db
      .collection<SubscriptionPlan>('subscriptionPlans')
      .find({})
      .sort({ price: 1 })
      .toArray();
    return NextResponse.json({ plans: plans.map(serializePlan) });
  } catch (error: any) {
    console.error('Subscription plans fetch error:', error);
    return NextResponse.json({ error: 'Failed to load plans', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, tier, description, price, currency, interval, features, lemonsqueezyVariantId, active, highlight } =
      await req.json();

    if (!name || !tier || !currency || !interval) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const plan = {
      name,
      tier,
      description: description || '',
      price: Number(price) || 0,
      currency: currency.toUpperCase(),
      interval,
      features: Array.isArray(features)
        ? features.filter((item) => typeof item === 'string' && item.trim().length > 0)
        : [],
      lemonsqueezyVariantId: lemonsqueezyVariantId || '',
      active: active !== undefined ? Boolean(active) : true,
      highlight: Boolean(highlight),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('subscriptionPlans').insertOne(plan);
    return NextResponse.json({ success: true, plan: serializePlan({ ...plan, _id: result.insertedId }) });
  } catch (error: any) {
    console.error('Subscription plan create error:', error);
    return NextResponse.json({ error: 'Failed to create plan', message: error.message }, { status: 500 });
  }
}
