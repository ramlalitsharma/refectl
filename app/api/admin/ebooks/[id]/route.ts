import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await requireAdmin();

        const ebook = await prisma.ebook.findUnique({
            where: { id: params.id },
        });

        if (!ebook) {
            return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
        }

        return NextResponse.json(ebook);
    } catch (error: any) {
        console.error('Ebook fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch ebook', message: error.message }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await requireAdmin();

        await prisma.ebook.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Ebook delete error:', error);
        return NextResponse.json({ error: 'Failed to delete ebook', message: error.message }, { status: 500 });
    }
}
