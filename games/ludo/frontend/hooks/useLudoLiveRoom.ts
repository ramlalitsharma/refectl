'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameMode } from '@/games/shared/frontend/GameModeContext';
import type { LudoRoomActionResponse, LudoRoomSnapshot } from '@/games/ludo/shared/live';

const NAME_STORAGE_KEY = 'ludo-live-player-name';
const ONLINE_ROOM_STORAGE_KEY = 'ludo-online-room-id';

function tokenStorageKey(roomId: string) {
  return `ludo-live-room-token:${roomId}`;
}

async function readJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? 'Request failed.');
  }

  return data as T;
}

function getRoomIdFromUrl() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('room');
}

function setRoomIdOnUrl(roomId: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);

  if (roomId) {
    url.searchParams.set('room', roomId);
  } else {
    url.searchParams.delete('room');
  }

  window.history.replaceState({}, '', url.toString());
}

export function useLudoLiveRoom(mode: GameMode) {
  const liveMode = mode === 'friends' || mode === 'online';
  const [snapshot, setSnapshot] = useState<LudoRoomSnapshot | null>(null);
  const [playerName, setPlayerName] = useState('Player');
  const [roomIdFromUrl, setRoomIdFromUrl] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [acting, setActing] = useState(false);
  const [sendingFeed, setSendingFeed] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPlayerName(window.localStorage.getItem(NAME_STORAGE_KEY) ?? 'Player');
    setRoomIdFromUrl(getRoomIdFromUrl());
  }, []);

  const persistPlayerName = useCallback((value: string) => {
    setPlayerName(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(NAME_STORAGE_KEY, value);
    }
  }, []);

  const persistRoomSession = useCallback((response: LudoRoomActionResponse) => {
    setSnapshot(response.snapshot);
    setError(null);

    if (typeof window === 'undefined') return;

    if (response.playerToken) {
      window.localStorage.setItem(tokenStorageKey(response.snapshot.roomId), response.playerToken);
    }

    if (response.snapshot.mode === 'friends') {
      setRoomIdOnUrl(response.snapshot.roomId);
      setRoomIdFromUrl(response.snapshot.roomId);
    }

    if (response.snapshot.mode === 'online') {
      window.localStorage.setItem(ONLINE_ROOM_STORAGE_KEY, response.snapshot.roomId);
    }
  }, []);

  const getStoredPlayerToken = useCallback((roomId: string | null) => {
    if (!roomId || typeof window === 'undefined') return null;
    return window.localStorage.getItem(tokenStorageKey(roomId));
  }, []);

  const refreshRoom = useCallback(async (roomId: string, playerToken?: string | null) => {
    try {
      const query = playerToken ? `?playerToken=${encodeURIComponent(playerToken)}` : '';
      const data = await readJson<{ snapshot: LudoRoomSnapshot }>(`/api/games/ludo/rooms/${roomId}${query}`);
      setSnapshot(data.snapshot);
      setError(null);
      return data.snapshot;
    } catch (err) {
      setSnapshot(null);
      setError(err instanceof Error ? err.message : 'Unable to refresh room.');
      return null;
    }
  }, []);

  const toggleReady = useCallback(
    async (ready: boolean) => {
      if (!snapshot) return;
      const playerToken = getStoredPlayerToken(snapshot.roomId);
      if (!playerToken) {
        setError('Missing player session for this room.');
        return;
      }

      setActing(true);
      try {
        const response = await readJson<{ snapshot: LudoRoomSnapshot }>(`/api/games/ludo/rooms/${snapshot.roomId}/ready`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerToken,
            ready,
          }),
        });
        setSnapshot(response.snapshot);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to update ready state.');
      } finally {
        setActing(false);
      }
    },
    [getStoredPlayerToken, snapshot],
  );

  const createFriendsRoom = useCallback(async () => {
    setConnecting(true);
    try {
      const response = await readJson<LudoRoomActionResponse>('/api/games/ludo/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName }),
      });
      persistRoomSession(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create room.');
    } finally {
      setConnecting(false);
    }
  }, [persistRoomSession, playerName]);

  const joinFriendsRoom = useCallback(async (roomId: string) => {
    setConnecting(true);
    try {
      const response = await readJson<LudoRoomActionResponse>(`/api/games/ludo/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          playerToken: getStoredPlayerToken(roomId),
        }),
      });
      persistRoomSession(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to join room.');
    } finally {
      setConnecting(false);
    }
  }, [getStoredPlayerToken, persistRoomSession, playerName]);

  const quickMatch = useCallback(async () => {
    setConnecting(true);
    try {
      const onlineRoomId =
        typeof window !== 'undefined' ? window.localStorage.getItem(ONLINE_ROOM_STORAGE_KEY) : null;
      const response = await readJson<LudoRoomActionResponse>('/api/games/ludo/rooms/matchmake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          playerToken: getStoredPlayerToken(onlineRoomId),
        }),
      });
      persistRoomSession(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to enter matchmaking.');
    } finally {
      setConnecting(false);
    }
  }, [getStoredPlayerToken, persistRoomSession, playerName]);

  const act = useCallback(
    async (action: 'roll' | 'move', payload?: { tokenId?: string }) => {
      if (!snapshot) return;
      const playerToken = getStoredPlayerToken(snapshot.roomId);
      if (!playerToken) {
        setError('Missing player session for this room.');
        return;
      }

      setActing(true);
      try {
        const response = await readJson<{ snapshot: LudoRoomSnapshot }>(`/api/games/ludo/rooms/${snapshot.roomId}/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerToken,
            tokenId: payload?.tokenId,
          }),
        });
        setSnapshot(response.snapshot);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to update room.');
      } finally {
        setActing(false);
      }
    },
    [getStoredPlayerToken, snapshot],
  );

  const postFeed = useCallback(
    async (action: 'chat' | 'emote', payload: { text?: string; emote?: string }) => {
      if (!snapshot) return;
      const playerToken = getStoredPlayerToken(snapshot.roomId);
      if (!playerToken) {
        setError('Missing player session for this room.');
        return;
      }

      setSendingFeed(true);
      try {
        const response = await readJson<{ snapshot: LudoRoomSnapshot }>(
          `/api/games/ludo/rooms/${snapshot.roomId}/${action}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerToken,
              ...payload,
            }),
          },
        );
        setSnapshot(response.snapshot);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to update room chat.');
      } finally {
        setSendingFeed(false);
      }
    },
    [getStoredPlayerToken, snapshot],
  );

  const leaveRoom = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (snapshot?.mode === 'friends') {
        setRoomIdOnUrl(null);
        setRoomIdFromUrl(null);
      }

      if (snapshot?.mode === 'online') {
        window.localStorage.removeItem(ONLINE_ROOM_STORAGE_KEY);
      }
    }

    setSnapshot(null);
    setError(null);
  }, [snapshot]);

  useEffect(() => {
    if (!liveMode) return;

    if (mode === 'friends') {
      const roomId = getRoomIdFromUrl();
      setRoomIdFromUrl(roomId);

      if (!roomId) {
        setSnapshot(null);
        return;
      }

      const playerToken = getStoredPlayerToken(roomId);
      if (playerToken) {
        void refreshRoom(roomId, playerToken);
      }
      return;
    }

    const onlineRoomId =
      typeof window !== 'undefined' ? window.localStorage.getItem(ONLINE_ROOM_STORAGE_KEY) : null;
    if (!onlineRoomId) {
      setSnapshot(null);
      return;
    }

    const playerToken = getStoredPlayerToken(onlineRoomId);
    if (playerToken) {
      void refreshRoom(onlineRoomId, playerToken);
    }
  }, [getStoredPlayerToken, liveMode, mode, refreshRoom]);

  useEffect(() => {
    if (!liveMode || !snapshot?.roomId) return;
    const playerToken = getStoredPlayerToken(snapshot.roomId);
    const streamUrl = `/api/games/ludo/rooms/${snapshot.roomId}/stream${playerToken ? `?playerToken=${encodeURIComponent(playerToken)}` : ''}`;
    let fallbackInterval: number | null = null;

    if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
      fallbackInterval = window.setInterval(() => {
        void refreshRoom(snapshot.roomId, playerToken);
      }, 1200);

      return () => {
        if (fallbackInterval) window.clearInterval(fallbackInterval);
      };
    }

    const source = new window.EventSource(streamUrl);

    source.onopen = () => {
      setReconnecting(false);
    };

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { type: 'snapshot' | 'error'; snapshot?: LudoRoomSnapshot; message?: string };
        if (payload.type === 'snapshot' && payload.snapshot) {
          setSnapshot(payload.snapshot);
          setError(null);
        }
        if (payload.type === 'error' && payload.message) {
          setError(payload.message);
        }
      } catch {
        // ignore malformed events
      }
    };

    source.onerror = () => {
      setReconnecting(true);
    };

    return () => {
      source.close();
      setReconnecting(false);
      if (fallbackInterval) window.clearInterval(fallbackInterval);
    };
  }, [getStoredPlayerToken, liveMode, refreshRoom, snapshot?.roomId]);

  useEffect(() => {
    if (!snapshot?.turnDeadlineAt) return;
    setNow(Date.now());
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => window.clearInterval(timer);
  }, [snapshot?.turnDeadlineAt]);

  const shareLink = useMemo(() => {
    if (!snapshot || snapshot.mode !== 'friends' || typeof window === 'undefined') return null;
    const url = new URL(window.location.href);
    url.searchParams.set('room', snapshot.roomId);
    return url.toString();
  }, [snapshot]);

  const canAct =
    snapshot?.started &&
    !snapshot.state.winner &&
    snapshot.meColor !== null &&
    snapshot.seats.some((seat) => seat.color === snapshot.meColor && seat.isCurrent);
  const meSeat = snapshot?.meColor
    ? snapshot.seats.find((seat) => seat.color === snapshot.meColor) ?? null
    : null;
  const turnSecondsRemaining =
    snapshot?.turnDeadlineAt
      ? Math.max(0, Math.ceil((snapshot.turnDeadlineAt - now) / 1000))
      : null;

  return {
    liveMode,
    snapshot,
    roomIdFromUrl,
    playerName,
    setPlayerName: persistPlayerName,
    connecting,
    acting,
    sendingFeed,
    reconnecting,
    error,
    shareLink,
    canAct: Boolean(canAct),
    meSeat,
    turnSecondsRemaining,
    createFriendsRoom,
    joinFriendsRoom,
    quickMatch,
    refreshRoom,
    roll: () => act('roll'),
    move: (tokenId: string) => act('move', { tokenId }),
    sendMessage: (text: string) => postFeed('chat', { text }),
    sendEmote: (emote: string) => postFeed('emote', { emote }),
    setReady: toggleReady,
    leaveRoom,
  };
}
