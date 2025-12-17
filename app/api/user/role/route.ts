import { NextRequest, NextResponse } from 'next/server';
import { getUserRole } from '@/lib/admin-check';

export async function GET(req: NextRequest) {
  try {
    const role = await getUserRole();
    return NextResponse.json({ role: role || 'student' });
  } catch (error: any) {
    return NextResponse.json({ role: 'student' });
  }
}

