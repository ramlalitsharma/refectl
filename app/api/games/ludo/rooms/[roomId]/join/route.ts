import { NextRequest, NextResponse } from 'next/server';
import { getLudoLiveRoomService } from '@/games/ludo/backend/liveRooms';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const service = getLudoLiveRoomService();
    const result = await service.joinFriendsRoom(roomId, body?.playerName, body?.playerToken);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to join room.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
