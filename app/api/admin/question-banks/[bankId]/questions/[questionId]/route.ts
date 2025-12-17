import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { serializeQuestion } from '@/lib/models/QuestionBank';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bankId: string; questionId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bankId, questionId } = await params;
    const body = await req.json();
    const update: any = { updatedAt: new Date() };

    const editable = ['question', 'type', 'options', 'answerExplanation', 'tags', 'difficulty'];
    for (const key of editable) {
      if (body[key] !== undefined) {
        if (key === 'options' || key === 'tags') {
          update[key] = Array.isArray(body[key]) ? body[key] : [];
        } else {
          update[key] = body[key];
        }
      }
    }

    const db = await getDatabase();
    const result = await db
      .collection('questionBankQuestions')
      .findOneAndUpdate(
        { _id: new ObjectId(questionId), bankId: new ObjectId(bankId) },
        { $set: update },
        { returnDocument: 'after' },
      );

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, question: serializeQuestion(result.value as any) });
  } catch (error: any) {
    console.error('Question update error:', error);
    return NextResponse.json({ error: 'Failed to update question', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ bankId: string; questionId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bankId, questionId } = await params;
    const db = await getDatabase();
    const result = await db
      .collection('questionBankQuestions')
      .deleteOne({ _id: new ObjectId(questionId), bankId: new ObjectId(bankId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Question delete error:', error);
    return NextResponse.json({ error: 'Failed to delete question', message: error.message }, { status: 500 });
  }
}
