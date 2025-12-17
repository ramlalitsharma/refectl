import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { serializeExamTemplate } from '@/lib/models/ExamTemplate';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { examId } = await params;
    const body = await req.json();
    const update: any = { updatedAt: new Date() };

    const mutable = [
      'name',
      'description',
      'questionBankIds',
      'questionIds',
      'durationMinutes',
      'totalMarks',
      'category',
      'examType',
      'tags',
      'sections',
      'releaseAt',
      'closeAt',
      'visibility',
      'cohorts',
      'passingScore',
      'price',
    ];

    for (const key of mutable) {
      if (body[key] !== undefined) {
        if (key === 'durationMinutes' || key === 'totalMarks' || key === 'passingScore') {
          update[key] = Number(body[key]);
        } else if (key === 'questionBankIds' || key === 'questionIds' || key === 'tags' || key === 'sections' || key === 'cohorts') {
          update[key] = Array.isArray(body[key]) ? body[key] : [];
        } else if (key === 'price' && body.price) {
          update[key] = body.price.amount ? { currency: body.price.currency || 'USD', amount: Number(body.price.amount) } : undefined;
        } else {
          update[key] = body[key];
        }
      }
    }

    const db = await getDatabase();
    const result = await db
      .collection('examTemplates')
      .findOneAndUpdate({ _id: new ObjectId(examId) }, { $set: update }, { returnDocument: 'after' });

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam: serializeExamTemplate(result.value as any) });
  } catch (error: any) {
    console.error('Exam update error:', error);
    return NextResponse.json({ error: 'Failed to update exam', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { examId } = await params;
    const db = await getDatabase();
    const result = await db.collection('examTemplates').deleteOne({ _id: new ObjectId(examId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Exam delete error:', error);
    return NextResponse.json({ error: 'Failed to delete exam', message: error.message }, { status: 500 });
  }
}
