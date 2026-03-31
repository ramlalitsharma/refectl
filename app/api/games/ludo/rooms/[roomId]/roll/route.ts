import { NextRequest, NextResponse } from 'next/server';
import { getLudoLiveRoomService } from '@/games/ludo/backend/liveRooms';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const playerToken = body?.playerToken;

    if (!playerToken) {
      return NextResponse.json({ error: 'Missing player token.' }, { status: 400 });
    }

    const service = getLudoLiveRoomService();
    const snapshot = await service.roll(roomId, playerToken);
    return NextResponse.json({ snapshot });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to roll.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
