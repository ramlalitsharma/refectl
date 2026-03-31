'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { GameMode } from '@/games/shared/frontend/GameModeContext';
import { Copy, MessageSquare, Radio, SmilePlus, TimerReset, Users, Wifi } from 'lucide-react';
import type { useLudoLiveRoom } from '../hooks/useLudoLiveRoom';

type LiveRoomController = ReturnType<typeof useLudoLiveRoom>;

const QUICK_EMOTES = ['🎲', '🔥', '⚡', '😄', '🏆', '🙌'];

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 360;
  }
  return hash;
}

function avatarSurface(seed?: string | null) {
  const hue = hashSeed(seed ?? 'reflect');
  const accent = (hue + 52) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue} 88% 64%), hsl(${accent} 82% 54%))`,
    boxShadow: `0 10px 24px -16px hsla(${hue}, 90%, 60%, 0.95), inset 0 1px 0 rgba(255,255,255,0.35)`,
  };
}

function formatCountdown(seconds: number | null) {
  if (seconds === null) return '--';
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function formatFeedTime(createdAt: number) {
  const delta = Math.max(0, Math.round((Date.now() - createdAt) / 1000));
  if (delta < 8) return 'now';
  if (delta < 60) return `${delta}s`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m`;
  return `${Math.floor(delta / 3600)}h`;
}

export function LudoLivePanel({
  mode,
  room,
}: {
  mode: GameMode;
  room: LiveRoomController;
}) {
  const [draft, setDraft] = useState('');

  if (mode !== 'online' && mode !== 'friends') return null;

  const liveTitle = mode === 'online' ? 'Play Online' : 'Play With Friends';
  const liveDescription =
    mode === 'online'
      ? 'Jump into a live room on this server and play turns against other joined players.'
      : 'Create a room, share the link, and let friends join the same live Ludo board.';

  const canSendMessage = draft.trim().length > 0 && !!room.snapshot;

  const copyShareLink = async () => {
    if (!room.shareLink) return;
    try {
      await navigator.clipboard.writeText(room.shareLink);
    } catch {
      // no-op fallback
    }
  };

  const handleSendMessage = async () => {
    const clean = draft.trim();
    if (!clean) return;
    await room.sendMessage(clean);
    setDraft('');
  };

  return (
    <div className="rounded-[2rem] border border-[#2f5db8]/45 bg-[radial-gradient(circle_at_top,rgba(77,123,229,0.55),rgba(20,45,108,0.96)_58%,rgba(10,22,60,1)_100%)] p-5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {mode === 'online' ? <Wifi className="h-5 w-5 text-cyan-300" /> : <Users className="h-5 w-5 text-fuchsia-300" />}
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300">Live Room</p>
          </div>
          <h3 className="text-2xl font-[var(--font-lora)] font-semibold text-white">{liveTitle}</h3>
          <p className="max-w-2xl text-sm text-slate-300">{liveDescription}</p>
        </div>

        {room.snapshot && (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Room Code</p>
            <p className="mt-1 text-xl font-black text-white">{room.snapshot.roomId}</p>
            {room.reconnecting && <p className="mt-2 text-xs text-amber-200">Reconnecting live stream...</p>}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          value={room.playerName}
          onChange={(event) => room.setPlayerName(event.target.value)}
          placeholder="Your name"
          className="h-12 min-w-[220px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
        />

        {mode === 'friends' && !room.snapshot && (
          <>
            <Button
              onClick={() => room.createFriendsRoom()}
              disabled={room.connecting}
              className="h-12 rounded-2xl bg-cyan-500 px-5 text-slate-950 hover:bg-cyan-400"
            >
              {room.connecting ? 'Creating...' : 'Create Room'}
            </Button>
            {room.roomIdFromUrl && (
              <Button
                onClick={() => room.joinFriendsRoom(room.roomIdFromUrl as string)}
                disabled={room.connecting}
                variant="outline"
                className="h-12 rounded-2xl border-white/20 px-5 text-white hover:bg-white/10"
              >
                {room.connecting ? 'Joining...' : `Join ${room.roomIdFromUrl}`}
              </Button>
            )}
          </>
        )}

        {mode === 'online' && !room.snapshot && (
          <Button
            onClick={() => room.quickMatch()}
            disabled={room.connecting}
            className="h-12 rounded-2xl bg-cyan-500 px-5 text-slate-950 hover:bg-cyan-400"
          >
            {room.connecting ? 'Matching...' : 'Quick Match'}
          </Button>
        )}

        {room.snapshot?.mode === 'friends' && room.shareLink && (
          <Button
            onClick={copyShareLink}
            variant="outline"
            className="h-12 rounded-2xl border-white/20 px-5 text-white hover:bg-white/10"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Invite Link
          </Button>
        )}

        {room.snapshot && (
          <Button
            onClick={() => room.leaveRoom()}
            variant="outline"
            className="h-12 rounded-2xl border-white/20 px-5 text-white hover:bg-white/10"
          >
            Leave Room
          </Button>
        )}
      </div>

      {room.snapshot && (
        <>
          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-300" />
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300">Room Status</p>
              </div>
              <p className="mt-3 text-sm text-slate-200">{room.snapshot.state.statusMessage}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {room.snapshot.seats.map((seat) => (
                  <div key={seat.color} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-sm font-black text-white" style={avatarSurface(seat.avatarSeed ?? seat.label)}>
                        <span>{seat.playerName?.slice(0, 2).toUpperCase() ?? seat.label.slice(0, 1)}</span>
                        <span className={`absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border border-slate-950 ${seat.connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{seat.label}</p>
                          {seat.isCurrent && <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-cyan-200">Turn</span>}
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-400">{seat.playerName ?? 'Open seat'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em]">
                      <span className={`rounded-full px-2 py-1 ${seat.ready ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/5 text-slate-400'}`}>
                        {seat.ready ? 'Ready' : seat.joined ? 'Not Ready' : 'Waiting'}
                      </span>
                      {room.snapshot.meColor === seat.color && (
                        <span className="rounded-full bg-fuchsia-500/15 px-2 py-1 text-fuchsia-200">You</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2">
                <TimerReset className="h-4 w-4 text-amber-200" />
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300">Turn Timer</p>
              </div>
              <p className="mt-3 text-4xl font-black text-white">{formatCountdown(room.turnSecondsRemaining)}</p>
              <p className="mt-2 text-sm text-slate-300">
                {room.snapshot.started
                  ? room.canAct
                    ? 'Your seat is active. The timer auto-skips idle turns.'
                    : 'Live sync is active. The timer advances the room if someone stalls.'
                  : 'Need at least two ready players in the room before the match begins.'}
              </p>
              {room.snapshot.mode === 'friends' && room.meSeat && (
                <Button
                  onClick={() => room.setReady(!room.meSeat?.ready)}
                  disabled={room.acting}
                  className="mt-4 h-11 w-full rounded-2xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  {room.meSeat.ready ? 'Mark Not Ready' : 'Mark Ready'}
                </Button>
              )}
              {room.error && <p className="mt-3 text-sm text-rose-300">{room.error}</p>}
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-300" />
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300">Room Feed</p>
              </div>
              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                {room.snapshot.feed.length > 0 ? (
                  room.snapshot.feed.slice().reverse().map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] ${item.type === 'system' ? 'bg-amber-500/10 text-amber-100' : item.type === 'emote' ? 'bg-fuchsia-500/10 text-fuchsia-100' : 'bg-cyan-500/10 text-cyan-100'}`}>
                              {item.type}
                            </span>
                            {item.playerName && <span className="text-xs font-semibold text-white">{item.playerName}</span>}
                          </div>
                          <p className={`mt-2 text-sm ${item.type === 'emote' ? 'text-2xl leading-none' : 'text-slate-200'}`}>{item.text}</p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-500">{formatFeedTime(item.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-6 text-sm text-slate-400">
                    Chat, emotes, ready state, and auto-skip updates will appear here.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2">
                <SmilePlus className="h-4 w-4 text-fuchsia-300" />
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300">Quick Emotes</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {QUICK_EMOTES.map((emote) => (
                  <button
                    key={emote}
                    type="button"
                    disabled={!room.snapshot || room.sendingFeed}
                    onClick={() => room.sendEmote(emote)}
                    className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-2xl transition hover:border-fuchsia-300/35 hover:bg-fuchsia-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {emote}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Send Message</p>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={3}
                  maxLength={180}
                  placeholder="Call your move, hype the room, or share the next plan..."
                  className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{draft.trim().length}/180</span>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!canSendMessage || room.sendingFeed}
                    className="h-10 rounded-2xl bg-cyan-500 px-4 text-slate-950 hover:bg-cyan-400"
                  >
                    {room.sendingFeed ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!room.snapshot && room.error && (
        <p className="mt-4 text-sm text-rose-300">{room.error}</p>
      )}
    </div>
  );
}
