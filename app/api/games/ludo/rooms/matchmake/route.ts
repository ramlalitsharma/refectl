import { NextRequest, NextResponse } from 'next/server';
import { getLudoLiveRoomService } from '@/games/ludo/backend/liveRooms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const service = getLudoLiveRoomService();
    const result = await service.matchmake(body?.playerName, body?.playerToken);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to join matchmaking.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
