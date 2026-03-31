import { NextRequest, NextResponse } from 'next/server';
import { getLudoLiveRoomService } from '@/games/ludo/backend/liveRooms';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await context.params;
    const playerToken = request.nextUrl.searchParams.get('playerToken') ?? undefined;
    const service = getLudoLiveRoomService();
    const snapshot = await service.getSnapshot(roomId, playerToken);
    return NextResponse.json({ snapshot });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load room.';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
