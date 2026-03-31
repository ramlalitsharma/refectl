import { Redis } from '@upstash/redis';
import { getDatabase } from '@/lib/mongodb';
import type { LudoLiveMode, LudoRoomFeedItem } from '@/games/ludo/shared/live';

type PersistedLudoSeat = {
  playerToken: string;
  playerName: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  joinedAt: number;
  ready: boolean;
  avatarSeed: string;
  lastSeenAt: number;
};

export type PersistedLudoRoom = {
  roomId: string;
  mode: LudoLiveMode;
  revision: number;
  state: any;
  seats: Partial<Record<'red' | 'green' | 'yellow' | 'blue', PersistedLudoSeat>>;
  turnDeadlineAt: number | null;
  feed: LudoRoomFeedItem[];
  createdAt: number;
  updatedAt: number;
};

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const ROOM_PREFIX = 'ludo:room:';
const MODE_INDEX_PREFIX = 'ludo:rooms:';

function roomKey(roomId: string) {
  return `${ROOM_PREFIX}${roomId}`;
}

function modeIndexKey(mode: LudoLiveMode) {
  return `${MODE_INDEX_PREFIX}${mode}`;
}

export class LudoRoomStore {
  async getRoom(roomId: string): Promise<PersistedLudoRoom | null> {
    const normalized = roomId.toUpperCase();

    if (redis) {
      const data = await redis.get<PersistedLudoRoom>(roomKey(normalized));
      if (data) return data;
    }

    try {
      const db = await getDatabase();
      const doc = await db.collection('ludo_live_rooms').findOne({ roomId: normalized });
      return (doc as PersistedLudoRoom | null) ?? null;
    } catch {
      return null;
    }
  }

  async saveRoom(room: PersistedLudoRoom) {
    const normalized = room.roomId.toUpperCase();
    const payload = { ...room, roomId: normalized };

    if (redis) {
      await redis.set(roomKey(normalized), payload, { ex: 60 * 60 * 6 });
      await redis.sadd(modeIndexKey(room.mode), normalized);
    }

    try {
      const db = await getDatabase();
      await db.collection('ludo_live_rooms').updateOne(
        { roomId: normalized },
        {
          $set: payload,
        },
        { upsert: true },
      );
    } catch {
      // ignore db fallback failure in local-only mode
    }
  }

  async listRoomIdsByMode(mode: LudoLiveMode): Promise<string[]> {
    if (redis) {
      const ids = await redis.smembers<string[]>(modeIndexKey(mode));
      return (ids ?? []).map((id) => id.toUpperCase());
    }

    try {
      const db = await getDatabase();
      const docs = await db
        .collection('ludo_live_rooms')
        .find({ mode }, { projection: { roomId: 1 } })
        .toArray();
      return docs.map((doc: any) => String(doc.roomId).toUpperCase());
    } catch {
      return [];
    }
  }

  async deleteRoom(roomId: string, mode: LudoLiveMode) {
    const normalized = roomId.toUpperCase();

    if (redis) {
      await redis.del(roomKey(normalized));
      await redis.srem(modeIndexKey(mode), normalized);
    }

    try {
      const db = await getDatabase();
      await db.collection('ludo_live_rooms').deleteOne({ roomId: normalized });
    } catch {
      // ignore db fallback failure in local-only mode
    }
  }
}

declare global {
  var __ludoRoomStore__: LudoRoomStore | undefined;
}

export function getLudoRoomStore() {
  if (!globalThis.__ludoRoomStore__) {
    globalThis.__ludoRoomStore__ = new LudoRoomStore();
  }

  return globalThis.__ludoRoomStore__;
}
