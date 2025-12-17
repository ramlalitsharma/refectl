import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { serializeQuestionBank, serializeQuestion } from '@/lib/models/QuestionBank';
import type { QuestionBank, QuestionItem } from '@/lib/models/QuestionBank';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ bankId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { bankId } = await params;
    const db = await getDatabase();

    const [bank, questions] = await Promise.all([
      db.collection<QuestionBank>('questionBanks').findOne({ _id: new ObjectId(bankId) }),
      db
        .collection<QuestionItem>('questionBankQuestions')
        .find({ bankId: new ObjectId(bankId) })
        .sort({ createdAt: -1 })
        .toArray(),
    ]);

    if (!bank) {
      return NextResponse.json({ error: 'Question bank not found' }, { status: 404 });
    }

    return NextResponse.json({ bank: serializeQuestionBank(bank as any), questions: questions.map(serializeQuestion) });
  } catch (error: any) {
    console.error('Question bank detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch question bank', message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bankId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bankId } = await params;
    const body = await req.json();
    const update: any = { updatedAt: new Date() };
    const mutableFields = ['name', 'description', 'subject', 'examType', 'tags'];

    for (const key of mutableFields) {
      if (body[key] !== undefined) {
        update[key] = key === 'tags' && Array.isArray(body.tags) ? body.tags : body[key];
      }
    }

    const db = await getDatabase();
    const result = await db
      .collection<QuestionBank>('questionBanks')
      .findOneAndUpdate({ _id: new ObjectId(bankId) }, { $set: update }, { returnDocument: 'after' });

    if (!(result as any)?.value) {
      return NextResponse.json({ error: 'Question bank not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, bank: serializeQuestionBank((result as any).value as any) });
  } catch (error: any) {
    console.error('Question bank update error:', error);
    return NextResponse.json({ error: 'Failed to update question bank', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ bankId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bankId } = await params;
    const db = await getDatabase();
    await db.collection('questionBanks').deleteOne({ _id: new ObjectId(bankId) });
    await db.collection('questionBankQuestions').deleteMany({ bankId: new ObjectId(bankId) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Question bank delete error:', error);
    return NextResponse.json({ error: 'Failed to delete question bank', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ bankId: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bankId } = await params;
    const { question, type, options, answerExplanation, tags, difficulty } = await req.json();

    if (!question || !type || !difficulty) {
      return NextResponse.json({ error: 'Missing required question fields' }, { status: 400 });
    }

    const db = await getDatabase();
    const record = {
      bankId: new ObjectId(bankId),
      question,
      type,
      options: Array.isArray(options) ? options : [],
      answerExplanation: answerExplanation || '',
      tags: Array.isArray(tags) ? tags : [],
      difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('questionBankQuestions').insertOne(record);
    return NextResponse.json({ success: true, question: serializeQuestion({ ...record, _id: result.insertedId }) });
  } catch (error: any) {
    console.error('Question create error:', error);
    return NextResponse.json({ error: 'Failed to add question', message: error.message }, { status: 500 });
  }
}
