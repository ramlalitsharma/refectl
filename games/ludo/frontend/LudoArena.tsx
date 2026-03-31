'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  LudoEngine,
  type LudoState,
} from '@/games/ludo/core/engine';
import { useGameMode } from '@/games/shared/frontend/GameModeContext';
import { DiceControl } from './components/DiceControl';
import { GameHud } from './components/GameHud';
import { LudoBoard } from './components/LudoBoard';
import { LudoLivePanel } from './components/LudoLivePanel';
import { TurnDock } from './components/TurnDock';
import { FullscreenToggle } from './components/FullscreenToggle';
import { useFullscreen } from './hooks/useFullscreen';
import { useLudoLiveRoom } from './hooks/useLudoLiveRoom';
import { PLAYER_STYLES } from './ludoUiTokens';

type Tone = {
  frequency: number;
  duration: number;
  delay?: number;
  type?: OscillatorType;
  gain?: number;
};

function tokenStepSignature(state: LudoState) {
  return (['red', 'green', 'yellow', 'blue'] as const)
    .flatMap((color) => state.tokens[color].map((token) => `${token.id}:${token.steps}`))
    .join('|');
}

export function LudoArena({ variant: _variant = 'full' }: { variant?: 'full' | 'canvas' }) {
  const [state, setState] = useState<LudoState>(() => LudoEngine.createGame());
  const [rolling, setRolling] = useState(false);
  const [captureBanner, setCaptureBanner] = useState<string | null>(null);
  const { mode } = useGameMode();
  const liveRoom = useLudoLiveRoom(mode);
  const isLiveMode = mode === 'online' || mode === 'friends';

  const rootRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousStateRef = useRef<LudoState | null>(null);
  const { isFullscreen, canFullscreen, toggleFullscreen } = useFullscreen(rootRef);

  const effectiveState = isLiveMode && liveRoom.snapshot ? liveRoom.snapshot.state : state;
  const currentPlayer = LudoEngine.getCurrentPlayer(effectiveState);
  const currentStyle = PLAYER_STYLES[currentPlayer.id];
  const winnerStyle = effectiveState.winner ? PLAYER_STYLES[effectiveState.winner] : null;
  const aiControlledTurn = mode === 'ai' && currentPlayer.id !== 'blue';
  const aiThinking =
    !isLiveMode &&
    mode === 'ai' &&
    aiControlledTurn &&
    !effectiveState.winner &&
    ((!rolling && effectiveState.canRoll) || (!effectiveState.canRoll && effectiveState.movableTokenIds.length > 0));

  const canRollForBoard = isLiveMode
    ? Boolean(liveRoom.snapshot?.started && liveRoom.canAct && effectiveState.canRoll && !liveRoom.acting)
    : effectiveState.canRoll;
  const turnCountdownText =
    liveRoom.turnSecondsRemaining !== null && liveRoom.turnSecondsRemaining !== undefined
      ? `${String(Math.floor(liveRoom.turnSecondsRemaining / 60)).padStart(2, '0')}:${String(liveRoom.turnSecondsRemaining % 60).padStart(2, '0')}`
      : null;

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }
    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume().catch(() => undefined);
    }
    return audioContextRef.current;
  }, []);

  const playTones = useCallback((tones: Tone[]) => {
    const context = getAudioContext();
    if (!context) return;
    const startAt = context.currentTime + 0.01;

    tones.forEach((tone) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const offset = tone.delay ?? 0;
      const noteStart = startAt + offset;
      const noteEnd = noteStart + tone.duration;

      oscillator.type = tone.type ?? 'sine';
      oscillator.frequency.setValueAtTime(tone.frequency, noteStart);
      gainNode.gain.setValueAtTime(0.0001, noteStart);
      gainNode.gain.exponentialRampToValueAtTime(tone.gain ?? 0.08, noteStart + Math.min(0.03, tone.duration / 2));
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.02);
    });
  }, [getAudioContext]);

  const primeAudio = useCallback(() => {
    void getAudioContext();
  }, [getAudioContext]);

  const handleRoll = () => {
    primeAudio();
    if (isLiveMode) {
      if (!liveRoom.snapshot || !liveRoom.canAct || liveRoom.acting) return;
      setRolling(true);
      void liveRoom.roll().finally(() => {
        window.setTimeout(() => setRolling(false), 320);
      });
      return;
    }

    if (!state.canRoll || rolling || state.winner) return;
    setRolling(true);
    const nextRoll = LudoEngine.rollDice();
    window.setTimeout(() => {
      setState((prev) => LudoEngine.rollForState(prev, nextRoll));
      setRolling(false);
    }, 380);
  };

  const handleTokenMove = (tokenId: string) => {
    primeAudio();
    if (isLiveMode) {
      if (!liveRoom.snapshot || !liveRoom.canAct || liveRoom.acting) return;
      void liveRoom.move(tokenId);
      return;
    }

    if (rolling) return;
    setState((prev) => LudoEngine.moveToken(prev, tokenId));
  };

  const handleReset = () => {
    if (isLiveMode) {
      liveRoom.leaveRoom();
      return;
    }

    setState(LudoEngine.createGame());
  };

  useEffect(() => {
    if (isLiveMode) {
      return;
    }

    if (
      state.winner ||
      rolling ||
      aiControlledTurn ||
      state.canRoll ||
      state.diceValue === null ||
      state.movableTokenIds.length !== 1
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setState((prev) => {
        if (
          prev.winner ||
          prev.canRoll ||
          prev.diceValue === null ||
          prev.movableTokenIds.length !== 1
        ) {
          return prev;
        }

        return LudoEngine.moveToken(prev, prev.movableTokenIds[0]);
      });
    }, 420);

    return () => window.clearTimeout(timer);
  }, [aiControlledTurn, isLiveMode, rolling, state.canRoll, state.diceValue, state.movableTokenIds, state.winner]);

  useEffect(() => {
    if (isLiveMode) {
      return;
    }

    if (mode !== 'ai' || state.winner || rolling || !aiControlledTurn) {
      return;
    }

    if (state.canRoll) {
      let resolveTimer: number | undefined;
      const thinkTimer = window.setTimeout(() => {
        setRolling(true);
        const nextRoll = LudoEngine.rollDice();
        resolveTimer = window.setTimeout(() => {
          setState((prev) => LudoEngine.rollForState(prev, nextRoll));
          setRolling(false);
        }, 380);
      }, 700);
      return () => {
        window.clearTimeout(thinkTimer);
        if (resolveTimer) window.clearTimeout(resolveTimer);
      };
    }

    if (!state.canRoll && state.diceValue !== null && state.movableTokenIds.length > 0) {
      const timer = window.setTimeout(() => {
        setState((prev) => {
          const tokenId = LudoEngine.chooseAutoMove(prev);
          return tokenId ? LudoEngine.moveToken(prev, tokenId) : prev;
        });
      }, 850);
      return () => window.clearTimeout(timer);
    }
  }, [aiControlledTurn, isLiveMode, mode, rolling, state]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const resumeAudio = () => {
      primeAudio();
    };
    window.addEventListener('pointerdown', resumeAudio, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', resumeAudio);
    };
  }, [primeAudio]);

  useEffect(() => {
    if (!effectiveState.statusMessage.toLowerCase().includes('captured')) {
      return;
    }

    const showTimer = window.setTimeout(() => setCaptureBanner(effectiveState.statusMessage), 0);
    const clearTimer = window.setTimeout(() => setCaptureBanner(null), 1800);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(clearTimer);
    };
  }, [effectiveState.statusMessage]);

  useEffect(() => {
    const previousState = previousStateRef.current;
    if (!previousState) {
      previousStateRef.current = effectiveState;
      return;
    }

    if (effectiveState.lastRoll !== previousState.lastRoll && effectiveState.lastRoll !== null) {
      playTones([
        { frequency: 460, duration: 0.05, type: 'square', gain: 0.04 },
        { frequency: 580, duration: 0.06, delay: 0.05, type: 'square', gain: 0.05 },
        { frequency: 720, duration: 0.07, delay: 0.11, type: 'square', gain: 0.06 },
      ]);
    }

    if (tokenStepSignature(effectiveState) !== tokenStepSignature(previousState)) {
      playTones([
        { frequency: 330, duration: 0.05, type: 'triangle', gain: 0.035 },
        { frequency: 392, duration: 0.08, delay: 0.05, type: 'triangle', gain: 0.045 },
      ]);
    }

    if (
      effectiveState.statusMessage !== previousState.statusMessage &&
      effectiveState.statusMessage.toLowerCase().includes('captured')
    ) {
      playTones([
        { frequency: 520, duration: 0.08, type: 'square', gain: 0.06 },
        { frequency: 660, duration: 0.09, delay: 0.06, type: 'square', gain: 0.06 },
        { frequency: 880, duration: 0.12, delay: 0.13, type: 'sawtooth', gain: 0.045 },
      ]);
    }

    if (effectiveState.winner && effectiveState.winner !== previousState.winner) {
      playTones([
        { frequency: 523.25, duration: 0.12, type: 'triangle', gain: 0.05 },
        { frequency: 659.25, duration: 0.12, delay: 0.1, type: 'triangle', gain: 0.055 },
        { frequency: 783.99, duration: 0.18, delay: 0.2, type: 'triangle', gain: 0.06 },
        { frequency: 1046.5, duration: 0.28, delay: 0.34, type: 'triangle', gain: 0.07 },
      ]);
    }

    previousStateRef.current = effectiveState;
  }, [effectiveState, playTones]);

  return (
    <div
      ref={rootRef}
      data-variant={_variant}
      className={`relative h-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)] ${
        isFullscreen
          ? 'min-h-screen p-3 md:p-5'
          : 'rounded-[2.75rem] border border-white/10 p-4 md:p-6'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_320px_at_12%_10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(620px_320px_at_90%_12%,rgba(251,191,36,0.14),transparent_60%)]" />

      <div className="relative h-full">
        <div className="pointer-events-auto absolute right-3 top-3 z-50">
          <FullscreenToggle
            isFullscreen={isFullscreen}
            onToggle={() => toggleFullscreen()}
            disabled={!canFullscreen}
          />
        </div>

        {isFullscreen ? (
          <div className="flex min-h-[calc(100vh-2rem)] flex-col justify-center gap-4 pb-3">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="info" size="sm">
                    Focus Mode
                  </Badge>
                  <span className="text-[10px] uppercase tracking-[0.35em] text-slate-400">{mode}</span>
                  <span className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Turn {effectiveState.turn}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${currentStyle.token} ${currentStyle.tokenText} text-lg font-black shadow-lg`}>
                    {currentStyle.label.slice(0, 1)}
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <p className="text-lg font-semibold text-white">{currentStyle.label} is active</p>
                    <p className="mt-1 text-sm text-slate-300">{effectiveState.statusMessage}</p>
                  </div>
                </div>
                {!effectiveState.canRoll && effectiveState.movableTokenIds.length > 0 && (
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-cyan-300">
                    {aiControlledTurn ? 'Computer is choosing the best move.' : isLiveMode ? 'Move one of the highlighted tokens on the shared board.' : 'Select one of the highlighted tokens to move.'}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.6rem] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Board Focus</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Movable</p>
                      <p className="mt-1 text-lg font-semibold text-white">{effectiveState.movableTokenIds.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Last Roll</p>
                      <p className="mt-1 text-lg font-semibold text-white">{effectiveState.lastRoll ?? '-'}</p>
                    </div>
                  </div>
                </div>

                {isLiveMode && liveRoom.snapshot && (
                  <div className="rounded-[1.6rem] border border-cyan-400/20 bg-cyan-500/10 px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-100/80">Live Timer</p>
                    <p className="mt-2 text-2xl font-black text-white">{turnCountdownText ?? '--:--'}</p>
                    <p className="mt-2 text-sm text-cyan-50">
                      {liveRoom.snapshot.started
                        ? liveRoom.canAct
                          ? 'Your turn is live now.'
                          : 'The board will auto-advance if a player stalls.'
                        : 'Waiting for enough ready players to start.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {captureBanner && (
              <div className="relative overflow-hidden rounded-[1.6rem] border border-amber-300/35 bg-[linear-gradient(135deg,rgba(255,214,73,0.18),rgba(255,255,255,0.03),rgba(14,165,233,0.12))] px-5 py-4 shadow-[0_0_36px_rgba(251,191,36,0.16)] backdrop-blur-xl">
                <span className="pointer-events-none absolute -left-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-amber-300/18 blur-2xl" />
                <span className="pointer-events-none absolute -right-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-cyan-300/16 blur-2xl" />
                <p className="text-[10px] uppercase tracking-[0.35em] text-amber-200/85">Capture</p>
                <p className="mt-1 text-base font-semibold text-white">{captureBanner}</p>
              </div>
            )}

            <div className="relative flex-1">
              <LudoBoard
                state={effectiveState}
                movableTokenIds={effectiveState.movableTokenIds}
                aiControlledTurn={aiControlledTurn}
                onTokenMove={handleTokenMove}
                mode={mode}
                fullscreen
                canRoll={canRollForBoard}
                rolling={rolling || liveRoom.acting}
                diceValue={effectiveState.diceValue}
                lastRoll={effectiveState.lastRoll}
                onRoll={handleRoll}
              />

              {winnerStyle && (
                <div className="absolute inset-0 z-40 flex items-center justify-center rounded-[2.6rem] bg-slate-950/62 p-5 backdrop-blur-md">
                  <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-amber-300/35 bg-[linear-gradient(145deg,rgba(255,213,79,0.18),rgba(16,31,74,0.92),rgba(8,17,43,0.96))] px-6 py-7 text-center shadow-[0_0_70px_rgba(251,191,36,0.14)]">
                    <span className="pointer-events-none absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-amber-300/16 blur-3xl" />
                    <span className="pointer-events-none absolute -right-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-cyan-300/14 blur-3xl" />
                    <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/85">Victory</p>
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <span className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/85 shadow-[0_12px_24px_-14px_rgba(0,0,0,0.7)] ${winnerStyle.token}`}>
                        <span className="text-2xl font-black text-white">{winnerStyle.label.slice(0, 1)}</span>
                      </span>
                      <div className="text-left">
                        <p className="text-3xl font-black text-white">{winnerStyle.label} Wins</p>
                        <p className="mt-1 text-sm text-slate-300">All four tokens reached the center. Ready for a rematch.</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        onClick={handleReset}
                        className="h-12 rounded-2xl border border-[#efcf50] bg-[linear-gradient(180deg,#ffe06a,#ffbf21)] px-6 text-[#17315d] shadow-[inset_0_2px_0_rgba(255,255,255,0.65),0_14px_24px_-18px_rgba(255,210,64,0.8)] hover:brightness-105"
                      >
                        Play Again
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="h-12 rounded-2xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10"
                      >
                        New Match
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/60 px-4 py-4">
                <p className="text-sm text-slate-200" aria-live="polite" aria-atomic="true">
                  {effectiveState.statusMessage}
                </p>
                {effectiveState.winner && (
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-amber-300">
                    Match complete. Reset to play again.
                  </p>
                )}
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                  Focus mode keeps the board and only the essential controls on screen.
                </p>
              </div>

              <DiceControl
                compact
                diceValue={effectiveState.diceValue ?? effectiveState.lastRoll}
                lastRoll={effectiveState.lastRoll}
                rolling={rolling || liveRoom.acting}
                canRoll={canRollForBoard}
                winner={effectiveState.winner}
                aiThinking={aiThinking}
                disabledBecauseAi={aiControlledTurn || (isLiveMode && !liveRoom.canAct)}
                actionLabel={
                  rolling
                    ? 'Rolling...'
                    : aiThinking
                      ? 'Computer Thinking...'
                      : isLiveMode
                        ? liveRoom.snapshot?.started
                          ? liveRoom.canAct
                            ? effectiveState.canRoll
                              ? 'Roll Dice'
                              : 'Move A Highlighted Token'
                            : 'Waiting For Turn'
                          : 'Waiting For Players'
                        : effectiveState.canRoll
                          ? 'Roll Dice'
                          : 'Move A Highlighted Token'
                }
                onRoll={handleRoll}
                onReset={handleReset}
                resetLabel={isLiveMode ? 'Leave Room' : 'Reset Match'}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <GameHud mode={mode as any} state={effectiveState} />

            {isLiveMode && (
              <LudoLivePanel mode={mode} room={liveRoom} />
            )}

            {captureBanner && (
              <div className="relative overflow-hidden rounded-[1.6rem] border border-amber-300/35 bg-[linear-gradient(135deg,rgba(255,214,73,0.18),rgba(255,255,255,0.03),rgba(14,165,233,0.12))] px-5 py-4 shadow-[0_0_36px_rgba(251,191,36,0.16)] backdrop-blur-xl">
                <span className="pointer-events-none absolute -left-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-amber-300/18 blur-2xl" />
                <span className="pointer-events-none absolute -right-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-cyan-300/16 blur-2xl" />
                <p className="text-[10px] uppercase tracking-[0.35em] text-amber-200/85">Capture</p>
                <p className="mt-1 text-base font-semibold text-white">{captureBanner}</p>
              </div>
            )}

            <div className="relative">
              <LudoBoard
                state={effectiveState}
                movableTokenIds={effectiveState.movableTokenIds}
                aiControlledTurn={aiControlledTurn}
                onTokenMove={handleTokenMove}
                mode={mode}
                fullscreen={false}
                canRoll={canRollForBoard}
                rolling={rolling || liveRoom.acting}
                diceValue={effectiveState.diceValue}
                lastRoll={effectiveState.lastRoll}
                onRoll={handleRoll}
              />

              {winnerStyle && (
                <div className="absolute inset-0 z-40 flex items-center justify-center rounded-[2.6rem] bg-slate-950/62 p-5 backdrop-blur-md">
                  <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-amber-300/35 bg-[linear-gradient(145deg,rgba(255,213,79,0.18),rgba(16,31,74,0.92),rgba(8,17,43,0.96))] px-6 py-7 text-center shadow-[0_0_70px_rgba(251,191,36,0.14)]">
                    <span className="pointer-events-none absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-amber-300/16 blur-3xl" />
                    <span className="pointer-events-none absolute -right-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-cyan-300/14 blur-3xl" />
                    <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/85">Victory</p>
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <span className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/85 shadow-[0_12px_24px_-14px_rgba(0,0,0,0.7)] ${winnerStyle.token}`}>
                        <span className="text-2xl font-black text-white">{winnerStyle.label.slice(0, 1)}</span>
                      </span>
                      <div className="text-left">
                        <p className="text-3xl font-black text-white">{winnerStyle.label} Wins</p>
                        <p className="mt-1 text-sm text-slate-300">All four tokens reached the center. Ready for a rematch.</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        onClick={handleReset}
                        className="h-12 rounded-2xl border border-[#efcf50] bg-[linear-gradient(180deg,#ffe06a,#ffbf21)] px-6 text-[#17315d] shadow-[inset_0_2px_0_rgba(255,255,255,0.65),0_14px_24px_-18px_rgba(255,210,64,0.8)] hover:brightness-105"
                      >
                        Play Again
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="h-12 rounded-2xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10"
                      >
                        New Match
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/60 px-4 py-4">
                  <p className="text-sm text-slate-200" aria-live="polite" aria-atomic="true">
                    {effectiveState.statusMessage}
                  </p>
                  {!effectiveState.canRoll && effectiveState.movableTokenIds.length > 0 && (
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
                      {aiControlledTurn ? 'Computer is choosing the best move.' : isLiveMode ? 'Live room sync is active. Move when it is your turn.' : 'Select one of the highlighted tokens to move.'}
                    </p>
                  )}
                  {effectiveState.winner && (
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-amber-300">
                      Match complete. Reset to play again.
                    </p>
                  )}
                </div>

                <TurnDock state={effectiveState} />
              </div>

              <div className="space-y-5">
                <DiceControl
                  diceValue={effectiveState.diceValue ?? effectiveState.lastRoll}
                  lastRoll={effectiveState.lastRoll}
                  rolling={rolling || liveRoom.acting}
                  canRoll={canRollForBoard}
                  winner={effectiveState.winner}
                  aiThinking={aiThinking}
                  disabledBecauseAi={aiControlledTurn || (isLiveMode && !liveRoom.canAct)}
                  actionLabel={
                    rolling
                      ? 'Rolling...'
                      : aiThinking
                        ? 'Computer Thinking...'
                        : isLiveMode
                          ? liveRoom.snapshot?.started
                            ? liveRoom.canAct
                              ? effectiveState.canRoll
                                ? 'Roll Dice'
                                : 'Move A Highlighted Token'
                              : 'Waiting For Turn'
                            : 'Waiting For Players'
                          : effectiveState.canRoll
                            ? 'Roll Dice'
                            : 'Move A Highlighted Token'
                  }
                  onRoll={handleRoll}
                  onReset={handleReset}
                  resetLabel={isLiveMode ? 'Leave Room' : 'Reset Match'}
                />

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Current Seat</p>
                      <p className="mt-1 text-lg font-semibold text-white">{currentStyle.label}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Movable</p>
                      <p className="mt-1 text-lg font-semibold text-white">{effectiveState.movableTokenIds.length}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Rule Reminder</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Roll a 6 to unlock a token. Three 6s in a row forfeit the turn. Exact rolls are required to reach the center.
                    </p>
                  </div>
                  {mode === 'ai' && (
                    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-200/80">AI Setup</p>
                      <p className="mt-2 text-sm text-emerald-50">
                        You play as Red. Green, Yellow, and Blue take automatic turns after your move.
                      </p>
                    </div>
                  )}
                  {isLiveMode && liveRoom.snapshot && (
                    <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-100/80">Live Sync</p>
                      <p className="mt-2 text-sm text-cyan-50">
                        {liveRoom.snapshot.started
                          ? liveRoom.canAct
                            ? 'Your seat is active. Roll or move on the shared board.'
                            : 'Another player is taking a turn. Your board stays synced live.'
                          : 'This room will start automatically as soon as at least two players are present.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
