import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { validateTitle } from '@/lib/validation';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 5;
const rateMap = new Map<string, { ts: number; count: number }>();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { requireAdmin } = await import('@/lib/admin-check');
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const paymentId = String(body?.paymentId || '').trim();
    const refundType = String(body?.refundType || 'full');
    const amountRaw = body?.amount;
    const reason = String(body?.reason || '').trim();

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }
    if (!['full', 'partial'].includes(refundType)) {
      return NextResponse.json({ error: 'Invalid refund type' }, { status: 400 });
    }
    if (refundType === 'partial') {
      const amt = Number(amountRaw);
      if (isNaN(amt) || amt <= 0) {
        return NextResponse.json({ error: 'Invalid partial refund amount' }, { status: 400 });
      }
    }
    const r = validateTitle(reason || 'requested_by_customer');
    if (!r.valid) {
      return NextResponse.json({ error: r.error || 'Invalid reason' }, { status: 400 });
    }

    const key = `refund:${userId}:${paymentId}`;
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

    const db = await getDatabase();
    const payment = await db.collection('payments').findOne({ paymentId });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'completed') {
      return NextResponse.json({ error: 'Only completed payments can be refunded' }, { status: 400 });
    }

    // Process refund via Clerk
    // Note: Clerk doesn't have built-in refund API, so we'll handle it manually
    // In production, you would integrate with Clerk's billing system or handle refunds manually
    const refundAmount = refundType === 'partial' && amountRaw ? Number(amountRaw) : payment.amount;
    
    // For Clerk, refunds are typically handled through:
    // 1. Manual refund via Clerk Dashboard
    // 2. Or through your own refund processing system
    // We'll just record the refund in our database

    // Idempotency: avoid duplicate refunds for the same paymentId within a short window
    const existingRefund = await db.collection('refunds').findOne({ paymentId });
    if (existingRefund) {
      return NextResponse.json({ refund: existingRefund, duplicate: true });
    }

    // Record refund in database
    const refundRecord = {
      paymentId,
      userId: payment.userId,
      courseId: payment.courseId,
      amount: refundAmount,
      currency: payment.currency || 'USD',
      reason: reason || 'requested_by_customer',
      refundId: `refund_${Date.now()}`,
      status: 'processed', // Manual processing for Clerk
      provider: 'clerk',
      createdAt: new Date(),
    };

    await db.collection('refunds').insertOne(refundRecord);

    // Update payment status
    await db.collection('payments').updateOne(
      { paymentId },
      {
        $set: {
          status: refundType === 'partial' ? 'partially_refunded' : 'refunded',
          refundedAt: new Date(),
        },
      }
    );

    // Revoke course access if full refund
    if (refundType === 'full') {
      await db.collection('enrollments').updateOne(
        { userId: payment.userId, courseId: payment.courseId },
        { $set: { status: 'refunded' } }
      );
    }

    return NextResponse.json({ refund: refundRecord });
  } catch (error: unknown) {
    console.error('Refund error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to process refund', message: msg },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { requireAdmin } = await import('@/lib/admin-check');
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const sp = req.nextUrl.searchParams;
    const limit = Math.max(1, Math.min(200, parseInt(sp.get('limit') || '100', 10)));
    const db = await getDatabase();
    const refunds = await db
      .collection('refunds')
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ refunds });
  } catch (error: unknown) {
    console.error('Refunds fetch error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch refunds', message: msg },
      { status: 500 }
    );
  }
}
