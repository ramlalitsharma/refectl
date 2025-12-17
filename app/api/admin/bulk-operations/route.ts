import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

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
    const { operation, type, ids, data } = body; // operation: 'update', 'delete', 'publish', 'unpublish'

    if (!operation || !type || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Operation, type, and IDs array are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = type === 'course' ? 'courses' : type === 'blog' ? 'blogs' : 'users';

    const { ObjectId } = await import('mongodb');
    let result;
    const objectIds = ids.map((id: string) => new ObjectId(id));

    switch (operation) {
      case 'delete':
        result = await db.collection(collection).deleteMany({
          _id: { $in: objectIds },
        });
        break;

      case 'publish':
        result = await db.collection(collection).updateMany(
          { _id: { $in: objectIds } },
          { $set: { status: 'published', updatedAt: new Date() } }
        );
        break;

      case 'unpublish':
        result = await db.collection(collection).updateMany(
          { _id: { $in: objectIds } },
          { $set: { status: 'draft', updatedAt: new Date() } }
        );
        break;

      case 'update':
        if (!data) {
          return NextResponse.json({ error: 'Data is required for update operation' }, { status: 400 });
        }
        result = await db.collection(collection).updateMany(
          { _id: { $in: objectIds } },
          { $set: { ...data, updatedAt: new Date() } }
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    const modifiedCount = (('modifiedCount' in result) ? (result as any).modifiedCount : (('deletedCount' in result) ? (result as any).deletedCount : 0)) || 0;
    return NextResponse.json({
      success: true,
      modifiedCount,
    });
  } catch (error: any) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation', message: error.message },
      { status: 500 }
    );
  }
}

