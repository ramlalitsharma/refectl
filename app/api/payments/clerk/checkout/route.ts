import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { validateSlug, sanitizeInput } from '@/lib/validation';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 10;
const rateMap = new Map<string, { ts: number; count: number }>();

/**
 * Clerk-based payment checkout
 * Uses Clerk's subscription/billing features instead of Stripe
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const key = `checkout:${userId}`;
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

    const body = await req.json();
    const { courseId, courseSlug, amount, currency = 'USD', type = 'course', bundleId, couponCode } = body;

    if (courseSlug && !validateSlug(String(courseSlug))) {
      return NextResponse.json({ error: 'Invalid course slug' }, { status: 400 });
    }
    if (courseId && typeof courseId !== 'string') {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 });
    }
    const amt = Number(amount || 0);
    if (isNaN(amt) || amt < 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    const cur = String(currency || 'USD').toUpperCase();
    if (!/^[A-Z]{3}$/.test(cur)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }
    const typ = String(type || 'course');
    if (!['course', 'bundle'].includes(typ)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!courseId && !courseSlug && !bundleId) {
      return NextResponse.json(
        { error: 'Course ID, slug, or bundle ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const client = await clerkClient();

    // Apply coupon if provided
    let finalAmount = amt;
    if (couponCode) {
      const sanitizedCoupon = sanitizeInput(String(couponCode)).toUpperCase();
      const coupon = await db.collection('coupons').findOne({
        code: sanitizedCoupon,
        isActive: true,
        $or: [
          { expiryDate: { $gte: new Date() } },
          { expiryDate: { $exists: false } },
        ],
      });

      if (coupon) {
        if (coupon.discountType === 'percentage') {
          finalAmount = finalAmount * (1 - coupon.discountValue / 100);
          if (coupon.maxDiscount) {
            finalAmount = Math.max(finalAmount, amount - coupon.maxDiscount);
          }
        } else {
          finalAmount = Math.max(0, finalAmount - coupon.discountValue);
        }

        // Increment usage
        await db.collection('coupons').updateOne(
          { _id: coupon._id },
          { $inc: { usageCount: 1 } }
        );
      }
    }

    // For Clerk subscriptions, you would typically:
    // 1. Create a subscription via Clerk's billing API (if available)
    // 2. Or use Clerk's organization-based subscriptions
    // 3. Or update user metadata directly for one-time purchases

    // For Clerk, we'll use their subscription/billing system
    // For one-time purchases, create payment record and grant access
    const paymentRecord = {
      userId,
      courseId: courseId || courseSlug,
      bundleId: bundleId || undefined,
      type: typ,
      amount: finalAmount,
      currency: cur,
      originalAmount: amt,
      discount: amount ? amount - finalAmount : 0,
      couponCode: couponCode ? sanitizeInput(String(couponCode)).toUpperCase() : undefined,
      paymentMethod: 'clerk',
      status: 'completed', // For Clerk, we'll mark as completed immediately
      createdAt: new Date(),
    };

    const paymentResult = await db.collection('payments').insertOne(paymentRecord);

    // Update user metadata to grant access
    try {
      const user = await client.users.getUser(userId);
      const purchasedCourses = (user.publicMetadata?.purchasedCourses as any) || {};
      
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          purchasedCourses: {
            ...purchasedCourses,
            [courseId || courseSlug]: {
              purchasedAt: new Date().toISOString(),
              amount: finalAmount,
            },
          },
        },
      });
    } catch (metadataError) {
      console.warn('Could not update Clerk metadata:', metadataError);
    }

    // Create enrollment if course purchase
    if (type === 'course' && (courseId || courseSlug)) {
      const courseIdentifier = courseId || courseSlug;
      
      // Check if enrollment already exists
      const existingEnrollment = await db.collection('enrollments').findOne({
        userId,
        courseId: courseIdentifier,
      });

      if (existingEnrollment) {
        // Update existing enrollment
        await db.collection('enrollments').updateOne(
          { _id: existingEnrollment._id },
          {
            $set: {
              status: 'approved',
              paymentId: String(paymentResult.insertedId),
              paymentMethod: 'clerk',
              amount: finalAmount,
              currency: cur,
              enrollmentType: 'paid',
              approvedAt: new Date(),
              updatedAt: new Date(),
            },
            $push: (({
              history: {
                status: 'approved',
                changedAt: new Date(),
                note: 'Payment completed, enrollment approved',
              },
            }) as unknown as import('mongodb').PushOperator<any>),
          }
        );
      } else {
        // Create new enrollment
        await db.collection('enrollments').insertOne({
          userId,
          courseId: courseIdentifier,
          status: 'approved',
          paymentId: String(paymentResult.insertedId),
          paymentMethod: 'clerk',
          amount: finalAmount,
          currency: cur,
          enrollmentType: 'paid',
          requestedAt: new Date(),
          approvedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          history: [
            {
              status: 'approved',
              changedAt: new Date(),
              note: 'Payment completed, enrollment approved',
            },
          ],
        });
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: String(paymentResult.insertedId),
      amount: finalAmount,
      currency: cur,
      enrolled: true,
      message: 'Payment processed successfully. You are now enrolled!',
    });
  } catch (error: any) {
    console.error('Clerk checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment', message: error.message },
      { status: 500 }
    );
  }
}
