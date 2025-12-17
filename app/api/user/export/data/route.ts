// GET /api/user/export/data - Download user data (JSON)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateUserData } from '@/lib/export-service';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await generateUserData(userId);

        // Set headers to force download
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', `attachment; filename="my-data-${new Date().toISOString().split('T')[0]}.json"`);

        return new NextResponse(JSON.stringify(data, null, 2), {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('User Export Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
