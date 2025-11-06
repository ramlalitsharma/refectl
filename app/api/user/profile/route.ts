import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { validateTitle, sanitizeInput } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDatabase();
    const user = await db.collection('users').findOne({
      $or: [{ clerkId: userId }, { _id: userId }]
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data
    delete (user as any).password;
    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch profile', message: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, bio } = body;

    // Validate
    if (name) {
      const nameValidation = validateTitle(name);
      if (!nameValidation.valid) {
        return NextResponse.json({ error: nameValidation.error }, { status: 400 });
      }
    }

    const db = await getDatabase();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = sanitizeInput(name);
    if (bio !== undefined) updateData.bio = sanitizeInput(bio);

    await db.collection('users').updateOne(
      { $or: [{ clerkId: userId }, { _id: userId }] },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update profile', message: e.message }, { status: 500 });
  }
}

