import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const bundles = await db
      .collection('courseBundles')
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ bundles });
  } catch (error: any) {
    console.error('Bundles fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundles', message: error.message },
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
    const { title, description, courseIds, price, currency = 'USD', discount } = body;

    if (!title || !courseIds || !Array.isArray(courseIds) || courseIds.length < 2) {
      return NextResponse.json(
        { error: 'Title and at least 2 course IDs are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Calculate bundle price
    const { ObjectId } = await import('mongodb');
    const courses = await db
      .collection('courses')
      .find({ _id: { $in: courseIds.map((id: string) => new ObjectId(id)) } })
      .toArray();

    const totalPrice = courses.reduce((sum, course) => sum + (course.price?.amount || 0), 0);
    const bundlePrice = discount ? totalPrice * (1 - discount / 100) : price || totalPrice * 0.8; // 20% discount by default

    const bundle = {
      title: title.trim(),
      description: description?.trim() || undefined,
      courseIds,
      price: {
        amount: bundlePrice,
        currency,
        originalAmount: totalPrice,
        discount: discount || Math.round(((totalPrice - bundlePrice) / totalPrice) * 100),
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('courseBundles').insertOne(bundle);

    return NextResponse.json({ bundle: { ...bundle, id: result.insertedId } });
  } catch (error: any) {
    console.error('Bundle creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create bundle', message: error.message },
      { status: 500 }
    );
  }
}

