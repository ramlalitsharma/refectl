import type { LudoColor, LudoState } from '@/games/ludo/core/engine';

export type LudoLiveMode = 'friends' | 'online';

export type LudoRoomFeedItem = {
  id: string;
  type: 'chat' | 'emote' | 'system';
  text: string;
  color: LudoColor | null;
  playerName: string | null;
  createdAt: number;
};

export type LudoSeatSnapshot = {
  color: LudoColor;
  label: string;
  playerName: string | null;
  avatarSeed: string | null;
  joined: boolean;
  ready: boolean;
  connected: boolean;
  isCurrent: boolean;
};

export type LudoRoomSnapshot = {
  roomId: string;
  mode: LudoLiveMode;
  revision: number;
  playerCount: number;
  started: boolean;
  turnDeadlineAt: number | null;
  state: LudoState;
  seats: LudoSeatSnapshot[];
  feed: LudoRoomFeedItem[];
  meColor: LudoColor | null;
  meName: string | null;
};

export type LudoRoomActionResponse = {
  snapshot: LudoRoomSnapshot;
  playerToken?: string;
};
