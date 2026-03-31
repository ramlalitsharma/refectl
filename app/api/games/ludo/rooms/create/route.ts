import { NextRequest, NextResponse } from 'next/server';
import { getLudoLiveRoomService } from '@/games/ludo/backend/liveRooms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const service = getLudoLiveRoomService();
    const result = await service.createFriendsRoom(body?.playerName);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create room.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
