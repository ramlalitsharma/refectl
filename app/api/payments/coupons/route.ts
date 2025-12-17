import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    const db = await getDatabase();
    const query: any = { isActive: true };

    if (code) {
      query.code = code.toUpperCase();
      query.$or = [
        { expiryDate: { $gte: new Date() } },
        { expiryDate: { $exists: false } },
      ];
    }

    const coupons = await db.collection('coupons').find(query).toArray();

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons', message: error.message },
      { status: 500 }
    );
  }
}

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
    const {
      code,
      discountType, // 'percentage' or 'fixed'
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate,
      usageLimit,
      applicableTo, // 'all', 'courses', 'bundles', or specific IDs
    } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { error: 'Code, discountType, and discountValue are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if code already exists
    const existing = await db.collection('coupons').findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const coupon = {
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      usageLimit: usageLimit || undefined,
      usageCount: 0,
      applicableTo: applicableTo || 'all',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('coupons').insertOne(coupon);

    return NextResponse.json({ coupon: { ...coupon, id: result.insertedId } });
  } catch (error: any) {
    console.error('Coupon creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon', message: error.message },
      { status: 500 }
    );
  }
}

