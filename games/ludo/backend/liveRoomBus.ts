import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import { createClient, type RedisClientType } from 'redis';

type RoomListener = () => void;

const ROOM_UPDATE_CHANNEL = 'ludo:room-updates';
const INSTANCE_ID = randomUUID();

declare global {
  var __ludoLiveRoomBus__: EventEmitter | undefined;
  var __ludoLiveRoomRedisPub__: RedisClientType | undefined;
  var __ludoLiveRoomRedisSub__: RedisClientType | undefined;
  var __ludoLiveRoomRedisInit__: Promise<boolean> | undefined;
}

function getEmitter() {
  if (!globalThis.__ludoLiveRoomBus__) {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(300);
    globalThis.__ludoLiveRoomBus__ = emitter;
  }

  return globalThis.__ludoLiveRoomBus__;
}

function getRedisUrl() {
  return (
    process.env.LUDO_REDIS_URL ??
    process.env.REDIS_URL ??
    process.env.UPSTASH_REDIS_TCP_URL ??
    null
  );
}

async function ensureRedisBridge() {
  if (globalThis.__ludoLiveRoomRedisInit__) {
    return globalThis.__ludoLiveRoomRedisInit__;
  }

  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    globalThis.__ludoLiveRoomRedisInit__ = Promise.resolve(false);
    return globalThis.__ludoLiveRoomRedisInit__;
  }

  globalThis.__ludoLiveRoomRedisInit__ = (async () => {
    try {
      if (!globalThis.__ludoLiveRoomRedisPub__) {
        globalThis.__ludoLiveRoomRedisPub__ = createClient({ url: redisUrl });
        globalThis.__ludoLiveRoomRedisPub__.on('error', () => undefined);
        await globalThis.__ludoLiveRoomRedisPub__.connect();
      }

      if (!globalThis.__ludoLiveRoomRedisSub__) {
        globalThis.__ludoLiveRoomRedisSub__ = createClient({ url: redisUrl });
        globalThis.__ludoLiveRoomRedisSub__.on('error', () => undefined);
        await globalThis.__ludoLiveRoomRedisSub__.connect();
        await globalThis.__ludoLiveRoomRedisSub__.subscribe(ROOM_UPDATE_CHANNEL, (message) => {
          try {
            const payload = JSON.parse(message) as { roomId?: string; sourceId?: string };
            const roomId = payload.roomId?.toUpperCase();
            if (!roomId || payload.sourceId === INSTANCE_ID) {
              return;
            }
            getEmitter().emit(`room:${roomId}`);
          } catch {
            // ignore malformed remote events
          }
        });
      }

      return true;
    } catch {
      globalThis.__ludoLiveRoomRedisInit__ = Promise.resolve(false);
      return false;
    }
  })();

  return globalThis.__ludoLiveRoomRedisInit__;
}

export function publishLudoRoomUpdate(roomId: string) {
  const normalizedRoomId = roomId.toUpperCase();
  getEmitter().emit(`room:${normalizedRoomId}`);

  void ensureRedisBridge().then((ready) => {
    if (!ready || !globalThis.__ludoLiveRoomRedisPub__) return;
    void globalThis.__ludoLiveRoomRedisPub__!.publish(
      ROOM_UPDATE_CHANNEL,
      JSON.stringify({
        roomId: normalizedRoomId,
        sourceId: INSTANCE_ID,
      }),
    ).catch(() => undefined);
  });
}

export function subscribeToLudoRoom(roomId: string, listener: RoomListener) {
  const eventName = `room:${roomId.toUpperCase()}`;
  const emitter = getEmitter();
  emitter.on(eventName, listener);
  void ensureRedisBridge();
  return () => emitter.off(eventName, listener);
}
