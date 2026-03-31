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
    const ready = Boolean(body?.ready);

    if (!playerToken) {
      return NextResponse.json({ error: 'Missing player token.' }, { status: 400 });
    }

    const service = getLudoLiveRoomService();
    const snapshot = await service.setReady(roomId, playerToken, ready);
    return NextResponse.json({ snapshot });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update ready state.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
