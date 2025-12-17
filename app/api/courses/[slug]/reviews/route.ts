import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth, currentUser } from '@/lib/auth';
import { validateSlug, validateRating, sanitizeInput } from '@/lib/validation';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

const APPROVED_QUERY = {
  $or: [{ status: 'approved' }, { status: { $exists: false } }],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!validateSlug(slug)) {
      return NextResponse.json({ error: 'Invalid course slug' }, { status: 400 });
    }
    const db = await getDatabase();

    const reviewsCollection = db.collection('reviews');
    const reviews = await reviewsCollection
      .find({ courseSlug: slug, ...APPROVED_QUERY })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const statsAgg = await reviewsCollection
      .aggregate([
        { $match: { courseSlug: slug, ...APPROVED_QUERY } },
        {
          $group: {
            _id: '$courseSlug',
            total: { $sum: 1 },
            sum: { $sum: '$rating' },
          },
        },
      ])
      .toArray();

    const statsRecord = statsAgg[0] || { total: 0, sum: 0 };

    return NextResponse.json({
      reviews: reviews.map((review: any) => ({
        ...review,
        userName: review.userName || 'Learner',
      })),
      stats: {
        total: statsRecord.total,
        sum: statsRecord.sum,
        average: statsRecord.total > 0 ? (statsRecord.sum / statsRecord.total).toFixed(1) : '0',
      },
    });
  } catch (e: any) {
    console.error('Fetch reviews error:', e);
    return NextResponse.json({ error: 'Failed to fetch reviews', message: e.message }, { status: 500 });
  }
}

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 5;
const rateMap = new Map<string, { ts: number; count: number }>();

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    if (!validateSlug(slug)) {
      return NextResponse.json({ error: 'Invalid course slug' }, { status: 400 });
    }

    const { rating, comment } = await req.json();

    const r = validateRating(Number(rating));
    if (!r.valid) {
      return NextResponse.json({ error: r.error || 'Invalid rating' }, { status: 400 });
    }

    const key = `${userId}:${slug}`;
    const now = Date.now();
    const entry = rateMap.get(key);
    if (entry && now - entry.ts < RATE_LIMIT_WINDOW_MS) {
      if (entry.count >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateMap.set(key, { ts: entry.ts, count: entry.count + 1 });
    } else {
      rateMap.set(key, { ts: now, count: 1 });
    }

    const safeComment = typeof comment === 'string' ? sanitizeInput(comment) : '';

    const user = await currentUser();
    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Learner';

    const db = await getDatabase();
    const reviews = db.collection('reviews');
    const nowDate = new Date();

    const baseDoc = {
      courseSlug: slug,
      userId,
      userName: displayName,
      rating,
      comment: safeComment,
      status: 'pending',
      createdAt: nowDate,
      updatedAt: nowDate,
    };

    const existing = await reviews.findOne({ userId, courseSlug: slug });
    if (existing) {
      await reviews.updateOne(
        { _id: new ObjectId(existing._id) },
        {
          $set: {
            ...baseDoc,
            createdAt: existing.createdAt || nowDate,
            status: 'pending',
          },
        },
      );
    } else {
      await reviews.insertOne(baseDoc);
    }

    return NextResponse.json({ success: true, pending: true, message: 'Review submitted for moderation.' });
  } catch (e: any) {
    console.error('Create review error:', e);
    return NextResponse.json({ error: 'Failed to submit review', message: e.message }, { status: 500 });
  }
}

