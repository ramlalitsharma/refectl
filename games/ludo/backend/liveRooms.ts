import { randomUUID } from 'crypto';
import { LudoEngine, type LudoColor, type LudoState } from '@/games/ludo/core/engine';
import { publishLudoRoomUpdate } from '@/games/ludo/backend/liveRoomBus';
import { getLudoRoomStore, type PersistedLudoRoom } from '@/games/ludo/backend/liveRoomStore';
import type {
  LudoLiveMode,
  LudoRoomFeedItem,
  LudoRoomSnapshot,
  LudoSeatSnapshot,
} from '@/games/ludo/shared/live';

type LudoSeat = {
  playerToken: string;
  playerName: string;
  color: LudoColor;
  joinedAt: number;
  ready: boolean;
  avatarSeed: string;
  lastSeenAt: number;
};

type LudoRoom = {
  roomId: string;
  mode: LudoLiveMode;
  revision: number;
  state: LudoState;
  seats: Partial<Record<LudoColor, LudoSeat>>;
  turnDeadlineAt: number | null;
  feed: LudoRoomFeedItem[];
  createdAt: number;
  updatedAt: number;
};

const ROOM_TTL_MS = 1000 * 60 * 60 * 6;
const ONLINE_ROOM_STALE_MS = 1000 * 60 * 20;
const ACTIVE_CONNECTION_MS = 1000 * 15;
const TURN_TIMEOUT_MS = 1000 * 18;
const ROOM_FEED_LIMIT = 30;
const SEAT_ORDER: LudoColor[] = ['blue', 'red', 'green', 'yellow'];

declare global {
  var __ludoLiveRooms__: Map<string, LudoRoom> | undefined;
}

function getStore() {
  if (!globalThis.__ludoLiveRooms__) {
    globalThis.__ludoLiveRooms__ = new Map<string, LudoRoom>();
  }

  return globalThis.__ludoLiveRooms__;
}

function createRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function sanitizeName(input?: string) {
  const clean = (input ?? '').trim().slice(0, 24);
  return clean.length > 0 ? clean : 'Player';
}

function sanitizeChatText(input?: string) {
  const clean = (input ?? '').replace(/\s+/g, ' ').trim().slice(0, 180);
  return clean;
}

function sanitizeEmote(input?: string) {
  const clean = (input ?? '').trim().slice(0, 16);
  return clean.length > 0 ? clean : '🎲';
}

function buildAvatarSeed(playerName: string, color: LudoColor) {
  return `${playerName.trim().toLowerCase().replace(/\s+/g, '-') || 'player'}-${color}`;
}

export class LudoLiveRoomService {
  private store = getStore();

  private roomStore = getLudoRoomStore();

  private toPersistedRoom(room: LudoRoom): PersistedLudoRoom {
    return {
      roomId: room.roomId,
      mode: room.mode,
      revision: room.revision,
      state: room.state,
      seats: room.seats,
      turnDeadlineAt: room.turnDeadlineAt,
      feed: room.feed,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  private fromPersistedRoom(room: PersistedLudoRoom): LudoRoom {
    return {
      roomId: room.roomId,
      mode: room.mode,
      revision: room.revision ?? 0,
      state: room.state,
      seats: room.seats as Partial<Record<LudoColor, LudoSeat>>,
      turnDeadlineAt: room.turnDeadlineAt ?? null,
      feed: room.feed ?? [],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  private isExpired(room: LudoRoom) {
    const now = Date.now();
    const expired = now - room.updatedAt > ROOM_TTL_MS;
    const staleOnline = room.mode === 'online' && now - room.updatedAt > ONLINE_ROOM_STALE_MS;
    return expired || staleOnline;
  }

  private async saveRoom(room: LudoRoom, notify = true, bumpRevision = notify) {
    room.revision = bumpRevision ? (room.revision ?? 0) + 1 : room.revision ?? 0;
    this.store.set(room.roomId, room);
    await this.roomStore.saveRoom(this.toPersistedRoom(room));
    if (notify) {
      publishLudoRoomUpdate(room.roomId);
    }
  }

  private async deleteRoom(room: LudoRoom) {
    this.store.delete(room.roomId);
    await this.roomStore.deleteRoom(room.roomId, room.mode);
    publishLudoRoomUpdate(room.roomId);
  }

  private async pruneRooms() {
    const memoryRooms = [...this.store.values()];
    for (const room of memoryRooms) {
      if (this.isExpired(room)) {
        await this.deleteRoom(room);
      }
    }

    const persistedIds = [
      ...(await this.roomStore.listRoomIdsByMode('online')),
      ...(await this.roomStore.listRoomIdsByMode('friends')),
    ];

    for (const roomId of persistedIds) {
      if (this.store.has(roomId)) continue;
      const persisted = await this.roomStore.getRoom(roomId);
      if (!persisted) continue;
      const room = this.fromPersistedRoom(persisted);
      if (this.isExpired(room)) {
        await this.deleteRoom(room);
      }
    }
  }

  private createWaitingState() {
    const state = LudoEngine.createGame();
    return {
      ...state,
      canRoll: false,
      statusMessage: 'Waiting for at least one more player to join the room.',
    };
  }

  private getJoinedColors(room: LudoRoom) {
    return SEAT_ORDER.filter((color) => room.seats[color]);
  }

  private getJoinedSeats(room: LudoRoom) {
    return SEAT_ORDER.map((color) => room.seats[color]).filter(Boolean) as LudoSeat[];
  }

  private isStarted(room: LudoRoom) {
    const joinedSeats = this.getJoinedSeats(room);
    return joinedSeats.length >= 2 && joinedSeats.every((seat) => seat.ready);
  }

  private findSeatByToken(room: LudoRoom, playerToken?: string) {
    if (!playerToken) return null;
    return SEAT_ORDER
      .map((color) => room.seats[color] ?? null)
      .find((seat) => seat?.playerToken === playerToken) ?? null;
  }

  private turnSignature(state: LudoState) {
    return [
      state.currentPlayerIndex,
      state.turn,
      state.canRoll ? 'roll' : 'move',
      state.diceValue ?? 'none',
      state.movableTokenIds.join(','),
      state.winner ?? 'open',
    ].join('|');
  }

  private setRoomState(room: LudoRoom, nextState: LudoState) {
    const previousSignature = this.turnSignature(room.state);
    room.state = nextState;
    if (this.turnSignature(nextState) !== previousSignature) {
      room.turnDeadlineAt = null;
    }
  }

  private pushFeedItem(room: LudoRoom, item: Omit<LudoRoomFeedItem, 'id' | 'createdAt'>) {
    room.feed = [
      ...room.feed.slice(-(ROOM_FEED_LIMIT - 1)),
      {
        ...item,
        id: randomUUID(),
        createdAt: Date.now(),
      },
    ];
  }

  private pushSystemMessage(room: LudoRoom, text: string) {
    this.pushFeedItem(room, {
      type: 'system',
      text,
      color: null,
      playerName: null,
    });
  }

  private syncTurnDeadline(room: LudoRoom) {
    const shouldTrack = this.isStarted(room) && !room.state.winner && (room.state.canRoll || room.state.movableTokenIds.length > 0);

    if (!shouldTrack) {
      if (room.turnDeadlineAt !== null) {
        room.turnDeadlineAt = null;
        return true;
      }
      return false;
    }

    if (room.turnDeadlineAt === null) {
      room.turnDeadlineAt = Date.now() + TURN_TIMEOUT_MS;
      return true;
    }

    return false;
  }

  private async maybeProcessTurnTimeout(room: LudoRoom) {
    if (room.turnDeadlineAt === null || room.turnDeadlineAt > Date.now()) {
      return false;
    }

    if (!this.isStarted(room) || room.state.winner) {
      room.turnDeadlineAt = null;
      room.updatedAt = Date.now();
      await this.saveRoom(room);
      return true;
    }

    const activePlayer = LudoEngine.getCurrentPlayer(room.state);
    let nextState = room.state;
    let timeoutMessage = `${activePlayer.name} ran out of time and the turn was skipped.`;

    if (!room.state.canRoll && room.state.movableTokenIds.length > 0) {
      const autoTokenId = room.state.movableTokenIds.length === 1
        ? room.state.movableTokenIds[0]
        : LudoEngine.chooseAutoMove(room.state);

      if (autoTokenId) {
        const movedState = LudoEngine.moveToken(room.state, autoTokenId);
        nextState = {
          ...movedState,
          statusMessage: movedState.winner
            ? `Timer expired. Auto-play finished the move for ${activePlayer.name}. ${movedState.statusMessage}`
            : `Timer expired. Best move played automatically for ${activePlayer.name}. ${movedState.statusMessage}`,
        };
        timeoutMessage = `${activePlayer.name} timed out, so the best move was played automatically.`;
      }
    }

    if (nextState === room.state) {
      const joinedColors = this.getJoinedColors(room);
      const nextPlayerIndex = this.findNextJoinedPlayerIndex(
        LudoEngine.nextPlayerIndex(room.state.currentPlayerIndex, LudoEngine.DEFAULT_PLAYERS.length),
        joinedColors,
      );
      const nextPlayer = LudoEngine.DEFAULT_PLAYERS[nextPlayerIndex];
      nextState = {
        ...room.state,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: null,
        movableTokenIds: [],
        canRoll: true,
        turn: room.state.turn + 1,
        consecutiveSixes: 0,
        statusMessage: `${activePlayer.name} ran out of time. ${nextPlayer.name} is up.`,
      };
    }

    this.setRoomState(room, nextState);
    this.setRoomState(room, this.normalizeRoomState(room));
    room.updatedAt = Date.now();
    this.pushSystemMessage(room, timeoutMessage);
    this.syncTurnDeadline(room);
    await this.saveRoom(room);
    return true;
  }

  private roomToSnapshot(room: LudoRoom, playerToken?: string): LudoRoomSnapshot {
    const seat = this.findSeatByToken(room, playerToken);
    const now = Date.now();
    const seats: LudoSeatSnapshot[] = SEAT_ORDER.map((color, index) => ({
      color,
      label: LudoEngine.playerLabel(color),
      playerName: room.seats[color]?.playerName ?? null,
      avatarSeed: room.seats[color]?.avatarSeed ?? null,
      joined: Boolean(room.seats[color]),
      ready: room.seats[color]?.ready ?? false,
      connected: room.seats[color] ? now - room.seats[color]!.lastSeenAt < ACTIVE_CONNECTION_MS : false,
      isCurrent: room.state.currentPlayerIndex === index,
    }));

    return {
      roomId: room.roomId,
      mode: room.mode,
      revision: room.revision,
      playerCount: seats.filter((item) => item.joined).length,
      started: this.isStarted(room),
      turnDeadlineAt: room.turnDeadlineAt,
      state: room.state,
      seats,
      feed: room.feed,
      meColor: seat?.color ?? null,
      meName: seat?.playerName ?? null,
    };
  }

  private async getRoomOrThrow(roomId: string) {
    await this.pruneRooms();
    const normalizedRoomId = roomId.toUpperCase();
    let room = this.store.get(normalizedRoomId);

    if (!room) {
      const persisted = await this.roomStore.getRoom(normalizedRoomId);
      if (persisted) {
        room = this.fromPersistedRoom(persisted);
        this.store.set(normalizedRoomId, room);
      }
    }

    if (!room) {
      throw new Error('Room not found.');
    }

    if (this.isExpired(room)) {
      await this.deleteRoom(room);
      throw new Error('Room expired.');
    }

    const previousSignature = this.turnSignature(room.state);
    this.setRoomState(room, this.normalizeRoomState(room));

    if (await this.maybeProcessTurnTimeout(room)) {
      return room;
    }

    const normalizedChanged = this.turnSignature(room.state) !== previousSignature;
    const deadlineChanged = this.syncTurnDeadline(room);
    if (normalizedChanged || deadlineChanged) {
      room.updatedAt = Date.now();
      await this.saveRoom(room);
    }

    return room;
  }

  private touchSeat(room: LudoRoom, playerToken?: string, nextName?: string) {
    const seat = this.findSeatByToken(room, playerToken);
    if (!seat) return null;
    seat.lastSeenAt = Date.now();
    if (nextName) {
      seat.playerName = sanitizeName(nextName);
      seat.avatarSeed = buildAvatarSeed(seat.playerName, seat.color);
    }
    room.updatedAt = Date.now();
    return seat;
  }

  private async allocateSeat(room: LudoRoom, playerName: string, mode: LudoLiveMode) {
    const openColor = SEAT_ORDER.find((color) => !room.seats[color]);
    if (!openColor) {
      throw new Error('This room is full.');
    }

    const seat: LudoSeat = {
      color: openColor,
      playerName,
      playerToken: randomUUID(),
      joinedAt: Date.now(),
      ready: mode === 'online',
      avatarSeed: buildAvatarSeed(playerName, openColor),
      lastSeenAt: Date.now(),
    };

    room.seats[openColor] = seat;
    room.updatedAt = Date.now();
    this.pushSystemMessage(room, `${seat.playerName} joined as ${LudoEngine.playerLabel(openColor)}.`);
    this.setRoomState(
      room,
      this.normalizeRoomState(room, {
        forceMessage:
          this.isStarted(room) && room.state.turn === 1
            ? `${LudoEngine.getCurrentPlayer(room.state).name} begins. Roll the dice to start the match.`
            : undefined,
      }),
    );
    this.syncTurnDeadline(room);
    await this.saveRoom(room);
    return seat;
  }

  private findNextJoinedPlayerIndex(fromIndex: number, joinedColors: LudoColor[]) {
    for (let offset = 0; offset < LudoEngine.DEFAULT_PLAYERS.length; offset += 1) {
      const candidateIndex = (fromIndex + offset) % LudoEngine.DEFAULT_PLAYERS.length;
      const candidateColor = LudoEngine.DEFAULT_PLAYERS[candidateIndex]?.id;
      if (candidateColor && joinedColors.includes(candidateColor)) {
        return candidateIndex;
      }
    }

    return fromIndex;
  }

  private normalizeRoomState(
    room: LudoRoom,
    options?: {
      forceMessage?: string;
    },
  ) {
    const joinedColors = this.getJoinedColors(room);
    const currentColor = LudoEngine.DEFAULT_PLAYERS[room.state.currentPlayerIndex]?.id;
    const started = this.isStarted(room);

    let nextState: LudoState = {
      ...room.state,
      playerLastRolls: room.state.playerLastRolls ?? LudoEngine.createEmptyPlayerLastRolls(),
    };
    let normalizedTurn = false;

    if (joinedColors.length < 2) {
      return {
        ...nextState,
        canRoll: false,
        diceValue: null,
        movableTokenIds: [],
        statusMessage: options?.forceMessage ?? 'Waiting for at least one more player to join the room.',
      };
    }

    if (!started) {
      return {
        ...nextState,
        canRoll: false,
        diceValue: null,
        movableTokenIds: [],
        statusMessage: options?.forceMessage ?? 'Waiting for all joined players to ready up.',
      };
    }

    if (!currentColor || !joinedColors.includes(currentColor)) {
      const normalizedIndex = this.findNextJoinedPlayerIndex(nextState.currentPlayerIndex, joinedColors);
      nextState = {
        ...nextState,
        currentPlayerIndex: normalizedIndex,
      };
      normalizedTurn = true;
    }

    if (options?.forceMessage) {
      return {
        ...nextState,
        canRoll:
          nextState.winner
            ? false
            : nextState.diceValue === null && nextState.movableTokenIds.length === 0
              ? true
              : nextState.canRoll,
        statusMessage: options.forceMessage,
      };
    }

    const activeColor = LudoEngine.DEFAULT_PLAYERS[nextState.currentPlayerIndex]?.id;
    if (!activeColor) {
      return nextState;
    }

    if (joinedColors.includes(activeColor) && !normalizedTurn) {
      return nextState;
    }

    const normalizedIndex = joinedColors.includes(activeColor)
      ? nextState.currentPlayerIndex
      : this.findNextJoinedPlayerIndex(nextState.currentPlayerIndex, joinedColors);
    return {
      ...nextState,
      currentPlayerIndex: normalizedIndex,
      canRoll: true,
      diceValue: null,
      movableTokenIds: [],
      statusMessage: `${LudoEngine.DEFAULT_PLAYERS[normalizedIndex].name} is up.`,
    };
  }

  async createFriendsRoom(playerName?: string) {
    await this.pruneRooms();

    let roomId = createRoomCode();
    while (await this.roomStore.getRoom(roomId)) {
      roomId = createRoomCode();
    }

    const room: LudoRoom = {
      roomId,
      mode: 'friends',
      revision: 0,
      state: this.createWaitingState(),
      seats: {},
      turnDeadlineAt: null,
      feed: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.pushSystemMessage(room, 'Room created. Share the code to bring friends into the match.');
    await this.saveRoom(room);
    const seat = await this.allocateSeat(room, sanitizeName(playerName), 'friends');

    return {
      snapshot: this.roomToSnapshot(room, seat.playerToken),
      playerToken: seat.playerToken,
    };
  }

  async joinFriendsRoom(roomId: string, playerName?: string, existingPlayerToken?: string) {
    const room = await this.getRoomOrThrow(roomId);

    if (room.mode !== 'friends') {
      throw new Error('This room is not a friends room.');
    }

    const existingSeat = this.touchSeat(room, existingPlayerToken, playerName);
    if (existingSeat) {
      this.setRoomState(room, this.normalizeRoomState(room));
      await this.saveRoom(room);
      return {
        snapshot: this.roomToSnapshot(room, existingSeat.playerToken),
        playerToken: existingSeat.playerToken,
      };
    }

    const seat = await this.allocateSeat(room, sanitizeName(playerName), 'friends');
    return {
      snapshot: this.roomToSnapshot(room, seat.playerToken),
      playerToken: seat.playerToken,
    };
  }

  async matchmake(playerName?: string, existingPlayerToken?: string) {
    await this.pruneRooms();

    if (existingPlayerToken) {
      const onlineRoomIds = await this.roomStore.listRoomIdsByMode('online');
      for (const roomId of onlineRoomIds) {
        const room = await this.getRoomOrThrow(roomId).catch(() => null);
        if (!room || room.mode !== 'online') continue;
        const seat = this.touchSeat(room, existingPlayerToken, playerName);
        if (seat) {
          this.setRoomState(room, this.normalizeRoomState(room));
          await this.saveRoom(room);
          return {
            snapshot: this.roomToSnapshot(room, seat.playerToken),
            playerToken: seat.playerToken,
          };
        }
      }
    }

    const onlineRoomIds = await this.roomStore.listRoomIdsByMode('online');
    const candidateRooms = (
      await Promise.all(
        onlineRoomIds.map(async (roomId) => this.getRoomOrThrow(roomId).catch(() => null)),
      )
    )
      .filter((room): room is LudoRoom => Boolean(room && room.mode === 'online' && !room.state.winner))
      .sort((a, b) => this.getJoinedColors(b).length - this.getJoinedColors(a).length);

    const openRoom = candidateRooms.find((room) => this.getJoinedColors(room).length < 4);

    if (openRoom) {
      const seat = await this.allocateSeat(openRoom, sanitizeName(playerName), 'online');
      return {
        snapshot: this.roomToSnapshot(openRoom, seat.playerToken),
        playerToken: seat.playerToken,
      };
    }

    let roomId = createRoomCode();
    while (await this.roomStore.getRoom(roomId)) {
      roomId = createRoomCode();
    }

    const room: LudoRoom = {
      roomId,
      mode: 'online',
      revision: 0,
      state: this.createWaitingState(),
      seats: {},
      turnDeadlineAt: null,
      feed: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.pushSystemMessage(room, 'Matchmaking is live. New players will be seated automatically.');
    await this.saveRoom(room);
    const seat = await this.allocateSeat(room, sanitizeName(playerName), 'online');
    return {
      snapshot: this.roomToSnapshot(room, seat.playerToken),
      playerToken: seat.playerToken,
    };
  }

  async getSnapshot(roomId: string, playerToken?: string) {
    const room = await this.getRoomOrThrow(roomId);
    this.touchSeat(room, playerToken);
    this.setRoomState(room, this.normalizeRoomState(room));
    room.updatedAt = Date.now();
    await this.saveRoom(room, false, false);
    return this.roomToSnapshot(room, playerToken);
  }

  async peekSnapshot(roomId: string, playerToken?: string) {
    const room = await this.getRoomOrThrow(roomId);
    return this.roomToSnapshot(room, playerToken);
  }

  async heartbeat(roomId: string, playerToken?: string) {
    if (!playerToken) return;
    const room = await this.getRoomOrThrow(roomId);
    if (!this.touchSeat(room, playerToken)) return;
    await this.saveRoom(room, false, false);
  }

  async setReady(roomId: string, playerToken: string, ready: boolean) {
    const room = await this.getRoomOrThrow(roomId);
    const seat = this.findSeatByToken(room, playerToken);
    if (!seat) {
      throw new Error('Player session is not part of this room.');
    }

    if (room.mode !== 'friends') {
      throw new Error('Ready toggles are only available for friends rooms.');
    }

    if (room.state.turn > 1 || room.state.lastRoll !== null) {
      throw new Error('This match already started. Ready state can no longer be changed.');
    }

    seat.ready = ready;
    seat.lastSeenAt = Date.now();
    room.updatedAt = Date.now();
    this.pushSystemMessage(room, `${seat.playerName} is ${ready ? 'ready' : 'not ready'} for the room.`);
    this.setRoomState(
      room,
      this.normalizeRoomState(room, {
        forceMessage: this.isStarted(room)
          ? `${LudoEngine.getCurrentPlayer(room.state).name} begins. Roll the dice to start the match.`
          : undefined,
      }),
    );
    this.syncTurnDeadline(room);
    await this.saveRoom(room);
    return this.roomToSnapshot(room, playerToken);
  }

  async sendMessage(roomId: string, playerToken: string, text: string) {
    const room = await this.getRoomOrThrow(roomId);
    const seat = this.findSeatByToken(room, playerToken);
    if (!seat) {
      throw new Error('Player session is not part of this room.');
    }

    const clean = sanitizeChatText(text);
    if (!clean) {
      throw new Error('Message cannot be empty.');
    }

    this.touchSeat(room, playerToken);
    this.pushFeedItem(room, {
      type: 'chat',
      text: clean,
      color: seat.color,
      playerName: seat.playerName,
    });
    await this.saveRoom(room);
    return this.roomToSnapshot(room, playerToken);
  }

  async sendEmote(roomId: string, playerToken: string, emote: string) {
    const room = await this.getRoomOrThrow(roomId);
    const seat = this.findSeatByToken(room, playerToken);
    if (!seat) {
      throw new Error('Player session is not part of this room.');
    }

    const clean = sanitizeEmote(emote);
    this.touchSeat(room, playerToken);
    this.pushFeedItem(room, {
      type: 'emote',
      text: clean,
      color: seat.color,
      playerName: seat.playerName,
    });
    await this.saveRoom(room);
    return this.roomToSnapshot(room, playerToken);
  }

  private assertCanAct(room: LudoRoom, playerToken: string) {
    const seat = this.findSeatByToken(room, playerToken);
    if (!seat) {
      throw new Error('Player session is not part of this room.');
    }

    if (!this.isStarted(room)) {
      throw new Error('Need at least two ready players in the room to start.');
    }

    const currentColor = LudoEngine.DEFAULT_PLAYERS[room.state.currentPlayerIndex]?.id;
    if (seat.color !== currentColor) {
      throw new Error('It is not your turn yet.');
    }

    seat.lastSeenAt = Date.now();
    return seat;
  }

  async roll(roomId: string, playerToken: string) {
    const room = await this.getRoomOrThrow(roomId);
    this.assertCanAct(room, playerToken);

    this.setRoomState(room, this.normalizeRoomState(room));
    this.setRoomState(room, LudoEngine.rollForState(room.state));

    if (room.state.movableTokenIds.length === 1) {
      this.setRoomState(room, LudoEngine.moveToken(room.state, room.state.movableTokenIds[0]));
    }

    this.setRoomState(room, this.normalizeRoomState(room));
    room.updatedAt = Date.now();
    this.syncTurnDeadline(room);
    await this.saveRoom(room);

    return this.roomToSnapshot(room, playerToken);
  }

  async move(roomId: string, playerToken: string, tokenId: string) {
    const room = await this.getRoomOrThrow(roomId);
    const seat = this.assertCanAct(room, playerToken);

    if (!tokenId.startsWith(`${seat.color}-`)) {
      throw new Error('That token does not belong to your seat.');
    }

    this.setRoomState(room, this.normalizeRoomState(room));
    this.setRoomState(room, LudoEngine.moveToken(room.state, tokenId));
    this.setRoomState(room, this.normalizeRoomState(room));
    room.updatedAt = Date.now();
    this.syncTurnDeadline(room);
    await this.saveRoom(room);

    return this.roomToSnapshot(room, playerToken);
  }
}

declare global {
  var __ludoLiveRoomService__: LudoLiveRoomService | undefined;
}

export function getLudoLiveRoomService() {
  if (!globalThis.__ludoLiveRoomService__) {
    globalThis.__ludoLiveRoomService__ = new LudoLiveRoomService();
  }

  return globalThis.__ludoLiveRoomService__;
}
