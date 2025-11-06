import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDatabase();
    
    // Collect all user data (GDPR compliant export)
    const [user, progress, bookmarks, completions] = await Promise.all([
      db.collection('users').findOne({ $or: [{ clerkId: userId }, { _id: userId }] }),
      db.collection('userProgress').find({ userId }).toArray(),
      db.collection('bookmarks').find({ userId }).toArray(),
      db.collection('courseCompletions').find({ userId }).toArray(),
    ]);

    // Remove sensitive data
    if (user) {
      delete (user as any).password;
    }

    const exportData = {
      user: user || {},
      progress: progress || [],
      bookmarks: bookmarks || [],
      completions: completions || [],
      exportedAt: new Date().toISOString(),
    };

    // Return as JSON (can be converted to CSV/PDF on frontend)
    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="adaptiq-data-export-${Date.now()}.json"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Export failed', message: e.message }, { status: 500 });
  }
}

