import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { serializePlan } from '@/lib/models/SubscriptionPlan';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { planId } = await params;
    const body = await req.json();
    const update: any = { updatedAt: new Date() };

    const allowedFields = ['name', 'tier', 'description', 'price', 'currency', 'interval', 'features', 'lemonsqueezyVariantId', 'active', 'highlight'];
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        switch (key) {
          case 'price':
            update.price = Number(body.price) || 0;
            break;
          case 'currency':
            update.currency = String(body.currency).toUpperCase();
            break;
          case 'features':
            update.features = Array.isArray(body.features)
              ? body.features.filter((item: any) => typeof item === 'string' && item.trim().length > 0)
              : [];
            break;
          case 'active':
          case 'highlight':
            update[key] = Boolean(body[key]);
            break;
          default:
            update[key] = body[key];
        }
      }
    }

    const db = await getDatabase();
    const result = await db
      .collection('subscriptionPlans')
      .findOneAndUpdate({ _id: new ObjectId(planId) }, { $set: update }, { returnDocument: 'after' });

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, plan: serializePlan(result.value as any) });
  } catch (error: any) {
    console.error('Subscription plan update error:', error);
    return NextResponse.json({ error: 'Failed to update plan', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { planId } = await params;
    const db = await getDatabase();
    const result = await db
      .collection('subscriptionPlans')
      .findOneAndUpdate({ _id: new ObjectId(planId) }, { $set: { active: false, updatedAt: new Date() } }, { returnDocument: 'after' });

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, plan: serializePlan(result.value as any) });
  } catch (error: any) {
    console.error('Subscription plan delete error:', error);
    return NextResponse.json({ error: 'Failed to archive plan', message: error.message }, { status: 500 });
  }
}
