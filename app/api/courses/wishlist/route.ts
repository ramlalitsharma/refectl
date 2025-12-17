import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ wishlist: [] });
    }

    const wishlistIds = user.wishlist || [];
    if (wishlistIds.length === 0) {
      return NextResponse.json({ wishlist: [] });
    }

    const courses = await db
      .collection('courses')
      .find({
        _id: { $in: wishlistIds.map((id: string) => new ObjectId(id)) },
        status: 'published',
      })
      .toArray();

    return NextResponse.json({ wishlist: courses });
  } catch (error: any) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist', message: error.message },
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

    const body = await req.json();
    const { courseId, action } = body; // action: 'add' or 'remove'

    if (!courseId || !action) {
      return NextResponse.json(
        { error: 'courseId and action are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wishlist = user.wishlist || [];
    let updatedWishlist = [...wishlist];

    if (action === 'add') {
      if (!wishlist.includes(courseId)) {
        updatedWishlist.push(courseId);
      }
    } else if (action === 'remove') {
      updatedWishlist = wishlist.filter((id: string) => id !== courseId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await db.collection('users').updateOne(
      { clerkId: userId },
      { $set: { wishlist: updatedWishlist, updatedAt: new Date() } }
    );

    return NextResponse.json({ 
      success: true, 
      wishlist: updatedWishlist,
      message: action === 'add' ? 'Added to wishlist' : 'Removed from wishlist'
    });
  } catch (error: any) {
    console.error('Wishlist update error:', error);
    return NextResponse.json(
      { error: 'Failed to update wishlist', message: error.message },
      { status: 500 }
    );
  }
}

