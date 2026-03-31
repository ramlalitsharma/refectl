import { subscribeToLudoRoom } from '@/games/ludo/backend/liveRoomBus';
import { getLudoLiveRoomService } from '@/games/ludo/backend/liveRooms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function encodeEvent(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await context.params;
  const url = new URL(request.url);
  const playerToken = url.searchParams.get('playerToken') ?? undefined;
  const service = getLudoLiveRoomService();

  const stream = new ReadableStream({
    async start(controller) {
      let lastRevision = -1;

      const sendSnapshot = async () => {
        try {
          const snapshot = await service.peekSnapshot(roomId, playerToken);
          if (snapshot.revision === lastRevision) {
            return;
          }
          lastRevision = snapshot.revision;
          controller.enqueue(encodeEvent({ type: 'snapshot', snapshot }));
        } catch (error) {
          controller.enqueue(
            encodeEvent({
              type: 'error',
              message: error instanceof Error ? error.message : 'Room stream failed.',
            }),
          );
        }
      };

      await service.heartbeat(roomId, playerToken);
      await sendSnapshot();

      const unsubscribe = subscribeToLudoRoom(roomId.toUpperCase(), () => {
        void sendSnapshot();
      });

      const pollTimer = setInterval(() => {
        void sendSnapshot();
      }, 1000);

      const heartbeatTimer = setInterval(() => {
        void service.heartbeat(roomId, playerToken);
      }, 10000);

      const keepAlive = setInterval(() => {
        controller.enqueue(': keep-alive\n\n');
      }, 15000);

      const abortHandler = () => {
        clearInterval(pollTimer);
        clearInterval(heartbeatTimer);
        clearInterval(keepAlive);
        unsubscribe();
        controller.close();
      };

      request.signal.addEventListener('abort', abortHandler);
    },
    cancel() {
      // noop
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
