import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import {
  LudoEngine,
  type LudoColor,
  type LudoCoord,
  type LudoState,
  type LudoTokenState,
} from '@/games/ludo/core/engine';
import {
  CELL_COUNT,
  PLAYER_STYLES,
} from '../ludoUiTokens';
import { LudoDiceFace } from './LudoDiceFace';

const TOKEN_SIZE_RATIO = 0.42;
const TOKEN_STACK_OFFSETS = [
  { x: 0.14, y: 0.14 },
  { x: 0.44, y: 0.14 },
  { x: 0.14, y: 0.44 },
  { x: 0.44, y: 0.44 },
] as const;

const GOAL_STACK_OFFSETS = [
  { x: 0.28, y: 0.28 },
  { x: 0.30, y: 0.28 },
  { x: 0.28, y: 0.30 },
  { x: 0.30, y: 0.30 },
] as const;

const HOME_PAD_OVERLAYS: Array<{
  color: LudoColor;
  container: string;
}> = [
  { color: 'red', container: 'left-[6.7%] top-[6.7%]' },
  { color: 'green', container: 'right-[6.7%] top-[6.7%]' },
  { color: 'blue', container: 'bottom-[6.7%] left-[6.7%]' },
  { color: 'yellow', container: 'bottom-[6.7%] right-[6.7%]' },
];

const BASE_TOKEN_CENTERS: Record<LudoColor, Array<{ x: number; y: number }>> = {
  red: [
    { x: 0.165, y: 0.165 },
    { x: 0.235, y: 0.165 },
    { x: 0.165, y: 0.235 },
    { x: 0.235, y: 0.235 },
  ],
  green: [
    { x: 0.765, y: 0.165 },
    { x: 0.835, y: 0.165 },
    { x: 0.765, y: 0.235 },
    { x: 0.835, y: 0.235 },
  ],
  yellow: [
    { x: 0.765, y: 0.765 },
    { x: 0.835, y: 0.765 },
    { x: 0.765, y: 0.835 },
    { x: 0.835, y: 0.835 },
  ],
  blue: [
    { x: 0.165, y: 0.765 },
    { x: 0.235, y: 0.765 },
    { x: 0.165, y: 0.835 },
    { x: 0.235, y: 0.835 },
  ],
};

function coordKey(coord: LudoCoord) {
  return `${coord.row}-${coord.col}`;
}

function isQuadrantCell(row: number, col: number, color: LudoColor) {
  if (color === 'red') return row <= 5 && col <= 5;
  if (color === 'green') return row <= 5 && col >= 9;
  if (color === 'yellow') return row >= 9 && col >= 9;
  return row >= 9 && col <= 5;
}

function getQuadrantColor(row: number, col: number) {
  if (isQuadrantCell(row, col, 'red')) return 'red' as const;
  if (isQuadrantCell(row, col, 'green')) return 'green' as const;
  if (isQuadrantCell(row, col, 'yellow')) return 'yellow' as const;
  if (isQuadrantCell(row, col, 'blue')) return 'blue' as const;
  return null;
}

function getHomePadColor(row: number, col: number) {
  if (row >= 1 && row <= 4 && col >= 1 && col <= 4) return 'red' as const;
  if (row >= 1 && row <= 4 && col >= 10 && col <= 13) return 'green' as const;
  if (row >= 10 && row <= 13 && col >= 10 && col <= 13) return 'yellow' as const;
  if (row >= 10 && row <= 13 && col >= 1 && col <= 4) return 'blue' as const;
  return null;
}

const TRACK_INDEX_BY_COORDKEY = new Map<string, number>(
  LudoEngine.TRACK.map((coord, index) => [coordKey(coord), index]),
);

const HOME_LANE_BY_KEY = new Map<string, { color: LudoColor }>(
  LudoEngine.colorOrder().flatMap((color) =>
    LudoEngine.HOME_LANES[color].map((coord) => [coordKey(coord), { color }]),
  ),
);

const START_MARKERS_BY_TRACK_INDEX = new Map<number, string>([
  [0, '→'],
  [13, '↓'],
  [26, '←'],
  [39, '↑'],
]);

function SafeStarMarker() {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.94),rgba(233,238,246,0.92))] shadow-[0_5px_10px_-7px_rgba(0,0,0,0.45)]">
      <svg viewBox="0 0 24 24" className="h-[70%] w-[70%] fill-slate-500 drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]" aria-hidden="true">
        <path d="M12 2.8l2.78 5.63 6.22.91-4.5 4.39 1.06 6.19L12 17.02 6.44 19.92 7.5 13.73 3 9.34l6.22-.91L12 2.8z" />
      </svg>
    </span>
  );
}

function StartArrowMarker({ direction }: { direction: string }) {
  const rotation =
    direction === '→' ? 'rotate-0' :
    direction === '↓' ? 'rotate-90' :
    direction === '←' ? 'rotate-180' :
    '-rotate-90';

  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.96),rgba(240,244,250,0.92))] shadow-[0_5px_10px_-7px_rgba(0,0,0,0.45)]">
      <span className={`flex items-center justify-center ${rotation}`}>
        <span className="block h-0 w-0 border-b-[8px] border-l-[13px] border-t-[8px] border-b-transparent border-l-slate-600 border-t-transparent drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]" />
      </span>
    </span>
  );
}

function getTokenPathCoordKeys(token: LudoTokenState, diceValue: number): string[] {
  if (!LudoEngine.canTokenMove(token, diceValue)) return [];

  if (token.steps === -1) {
    return [coordKey(LudoEngine.TRACK[LudoEngine.START_TRACK_INDEX[token.color]])];
  }

  const keys: string[] = [];

  for (let step = 1; step <= diceValue; step += 1) {
    const nextSteps = token.steps + step;

    if (nextSteps >= 0 && nextSteps <= 50) {
      keys.push(
        coordKey(
          LudoEngine.TRACK[(LudoEngine.START_TRACK_INDEX[token.color] + nextSteps) % LudoEngine.TRACK.length],
        ),
      );
      continue;
    }

    if (nextSteps >= 51 && nextSteps <= 56) {
      keys.push(coordKey(LudoEngine.HOME_LANES[token.color][nextSteps - 51]));
      continue;
    }

    if (nextSteps === 57) {
      keys.push(coordKey(LudoEngine.GOAL_COORD));
    }
  }

  return keys;
}

function getCellClasses(row: number, col: number) {
  const key = `${row}-${col}`;
  const trackIndex = TRACK_INDEX_BY_COORDKEY.get(key);
  const homeLane = HOME_LANE_BY_KEY.get(key);
  const quadrant = getQuadrantColor(row, col);
  const homePadColor = getHomePadColor(row, col);
  const baseSpotColor = LudoEngine.colorOrder().find((color) =>
    LudoEngine.BASE_SPOTS[color].some((spot) => spot.row === row && spot.col === col),
  );

  const classes = 'relative aspect-square border border-[#727986] transition-colors';

  if (row === LudoEngine.GOAL_COORD.row && col === LudoEngine.GOAL_COORD.col) {
    return `${classes} bg-transparent border-transparent`;
  }

  if (homeLane) {
    return `${classes} ${PLAYER_STYLES[homeLane.color].lane} shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]`;
  }

  if (trackIndex !== undefined) {
    return `${classes} bg-[linear-gradient(180deg,#ffffff,#f4f6fa)]`;
  }

  if (homePadColor) {
    return `${classes} bg-[linear-gradient(180deg,#ffffff,#f7f8fb)]`;
  }

  if (baseSpotColor) {
    return `${classes} bg-[linear-gradient(180deg,#ffffff,#f7f8fb)]`;
  }

  if (quadrant) {
    return `${classes} ${PLAYER_STYLES[quadrant].soft} border-[color:rgba(0,0,0,0.18)]`;
  }

  if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
    return `${classes} bg-white border-[#6f7680]`;
  }

  return `${classes} bg-transparent border-transparent`;
}

function getSeatCaption(color: LudoColor, mode: 'online' | 'friends' | 'ai' | 'pass') {
  if (mode === 'ai') {
    if (color === 'blue') return 'You';
    if (color === 'red') return 'Computer 1';
    if (color === 'green') return 'Computer 2';
    return 'Computer 3';
  }

  if (mode === 'pass') {
    if (color === 'blue') return 'Seat 1';
    if (color === 'red') return 'Seat 2';
    if (color === 'green') return 'Seat 3';
    return 'Seat 4';
  }

  if (mode === 'friends') return 'Friends Room';
  return 'Live Room';
}

function PawnShape({
  tone,
  className = '',
  ghost = false,
  scale = 1,
}: {
  tone: string;
  className?: string;
  ghost?: boolean;
  scale?: number;
}) {
  const opacity = ghost ? 'opacity-60' : '';

  return (
    <span
      className={`pointer-events-none relative block h-full w-full ${className} ${opacity}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
    >
      <span className={`absolute bottom-[6%] left-1/2 h-[28%] w-[72%] -translate-x-1/2 rounded-full border border-white/75 shadow-[0_6px_10px_-6px_rgba(0,0,0,0.45)] ${tone}`} />
      <span className={`absolute bottom-[22%] left-1/2 h-[28%] w-[28%] -translate-x-1/2 rounded-[45%] border border-white/75 shadow-[0_4px_8px_-5px_rgba(0,0,0,0.45)] ${tone}`} />
      <span className={`absolute bottom-[36%] left-1/2 h-[42%] w-[52%] -translate-x-1/2 rounded-[48%] border border-white/75 shadow-[0_8px_14px_-8px_rgba(0,0,0,0.5)] ${tone}`} />
      <span className={`absolute bottom-[54%] left-1/2 h-[28%] w-[28%] -translate-x-1/2 rounded-full border border-white/80 shadow-[0_8px_12px_-8px_rgba(0,0,0,0.45)] ${tone}`} />
      <span className="absolute left-1/2 top-[18%] h-[20%] w-[14%] -translate-x-1/2 rounded-full bg-white/34 blur-[1px]" />
      <span className="absolute bottom-[18%] left-1/2 h-[16%] w-[38%] -translate-x-1/2 rounded-full bg-white/16 blur-[1px]" />
    </span>
  );
}

type PlayerCardProps = {
  color: LudoColor;
  state: LudoState;
  mode: 'online' | 'friends' | 'ai' | 'pass';
  canRoll: boolean;
  rolling: boolean;
  aiControlledTurn: boolean;
  diceValue: number | null;
  lastRoll: number | null;
  onRoll: () => void;
  compact?: boolean;
};

function PlayerCard({
  color,
  state,
  mode,
  canRoll,
  rolling,
  aiControlledTurn,
  diceValue,
  lastRoll,
  onRoll,
  compact = false,
}: PlayerCardProps) {
  const player = LudoEngine.DEFAULT_PLAYERS.find((entry) => entry.id === color);
  if (!player) return null;

  const style = PLAYER_STYLES[color];
  const playerTokens = state.tokens[color];
  const homeCount = playerTokens.filter((token) => token.steps === 57).length;
  const baseCount = playerTokens.filter((token) => token.steps === -1).length;
  const isActive = LudoEngine.DEFAULT_PLAYERS[state.currentPlayerIndex]?.id === color;
  const isWinner = state.winner === color;
  const canUseDice = isActive && canRoll && !state.winner && !aiControlledTurn;
  const playerLastRolls = state.playerLastRolls ?? LudoEngine.createEmptyPlayerLastRolls();
  const showDieValue = playerLastRolls[color] ?? (isActive && !canRoll ? diceValue ?? lastRoll : null);
  const diceCaption = isWinner
    ? 'Won'
    : isActive
      ? aiControlledTurn
        ? 'AI'
        : canRoll
          ? rolling
            ? 'Rolling'
            : 'Roll'
          : 'Move'
      : 'Wait';

  return (
    <div
      className={`relative overflow-hidden rounded-[1.6rem] border ${compact ? 'px-3 py-3' : 'px-3 py-3 sm:px-4'} shadow-[0_18px_35px_-24px_rgba(0,0,0,0.7)] transition ${
        isActive
          ? `${style.border} bg-[linear-gradient(180deg,rgba(56,95,198,0.98),rgba(32,66,156,0.98)_58%,rgba(20,47,115,0.98))] shadow-[0_0_0_2px_rgba(255,255,255,0.05),0_0_32px_rgba(93,201,255,0.18),0_18px_35px_-24px_rgba(0,0,0,0.7)]`
          : 'border-[#2a56b6]/55 bg-[linear-gradient(180deg,rgba(44,82,180,0.96),rgba(28,57,132,0.96)_58%,rgba(18,39,95,0.98))]'
      }`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_32%)]" />
      {isActive && (
        <span className="pointer-events-none absolute inset-x-4 top-0 h-[3px] rounded-full bg-cyan-300/80 shadow-[0_0_12px_rgba(103,232,249,0.85)]" />
      )}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/18 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-200">
          <span className={`h-2.5 w-2.5 rounded-full ${style.token}`} />
          {getSeatCaption(color, mode)}
        </div>
        {isActive && (
          <span className="rounded-full bg-cyan-400/14 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">
            Active
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white/95 shadow-[inset_0_3px_0_rgba(255,255,255,0.65)]">
            <PawnShape tone={style.token} className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{style.label}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.22em] text-slate-300">Seat Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isWinner ? (
            <Badge variant="warning" size="sm">Winner</Badge>
          ) : isActive ? (
            <Badge variant="info" size="sm">Turn</Badge>
          ) : null}
          <button
            type="button"
            onClick={canUseDice ? onRoll : undefined}
            disabled={!canUseDice}
            className={`relative flex ${compact ? 'h-[72px] w-[72px]' : 'h-16 w-16'} items-center justify-center rounded-[1.15rem] border p-1.5 transition ${
              canUseDice
                ? 'border-[#f0cf52] bg-[linear-gradient(180deg,#fee8ef,#e0b4c2)] shadow-[inset_0_2px_0_rgba(255,255,255,0.72),0_0_0_3px_rgba(240,207,82,0.18),0_14px_22px_-16px_rgba(255,215,64,0.85)] hover:scale-[1.04]'
                : isActive
                  ? 'border-[#f0cf52]/35 bg-[linear-gradient(180deg,rgba(247,223,229,0.45),rgba(223,184,194,0.26))] shadow-[0_0_0_2px_rgba(240,207,82,0.08)]'
                  : 'border-white/10 bg-black/16'
            }`}
            aria-label={`${style.label} dice`}
          >
            <span className="pointer-events-none absolute inset-[8%] rounded-[0.9rem] border border-[#f0cf52]/65 bg-[linear-gradient(180deg,rgba(23,49,93,0.12),rgba(23,49,93,0.02))]" />
            <LudoDiceFace
              value={showDieValue}
              rolling={isActive && rolling}
              pipColor={style.dicePip}
              glowColor={style.diceGlow}
              className={`${canUseDice ? '' : 'opacity-85'} ${compact ? 'h-[58px] w-[58px]' : 'h-[52px] w-[52px]'} border-[2px]`}
            />
            <span className={`absolute -bottom-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] ${
              canUseDice
                ? 'bg-[#f0cf52] text-[#17315d]'
                : 'bg-[#0e1f4b] text-slate-200'
            }`}>
              {diceCaption}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className={`rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(7,15,42,0.52),rgba(3,8,28,0.34))] ${compact ? 'px-2.5 py-2' : 'px-3 py-2'}`}>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Base</p>
          <p className="mt-1 text-base font-semibold text-white">{baseCount}</p>
        </div>
        <div className={`rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(7,15,42,0.52),rgba(3,8,28,0.34))] ${compact ? 'px-2.5 py-2' : 'px-3 py-2'}`}>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Home</p>
          <p className="mt-1 text-base font-semibold text-white">{homeCount}</p>
        </div>
      </div>
    </div>
  );
}

type LudoBoardProps = {
  state: LudoState;
  movableTokenIds: string[];
  aiControlledTurn: boolean;
  onTokenMove: (tokenId: string) => void;
  mode: 'online' | 'friends' | 'ai' | 'pass';
  fullscreen?: boolean;
  canRoll: boolean;
  rolling: boolean;
  diceValue: number | null;
  lastRoll: number | null;
  onRoll: () => void;
};

export function LudoBoard({
  state,
  movableTokenIds,
  aiControlledTurn,
  onTokenMove,
  mode,
  fullscreen = false,
  canRoll,
  rolling,
  diceValue,
  lastRoll,
  onRoll,
}: LudoBoardProps) {
  const movableTokenIdSet = useMemo(() => new Set(movableTokenIds), [movableTokenIds]);
  const previousTokensRef = useRef(state.tokens);
  const [recentlyMovedTokenId, setRecentlyMovedTokenId] = useState<string | null>(null);

  useEffect(() => {
    let movedTokenId: string | null = null;

    for (const color of LudoEngine.colorOrder()) {
      const previousTokens = previousTokensRef.current[color] ?? [];
      const currentTokens = state.tokens[color] ?? [];

      for (const token of currentTokens) {
        const previousToken = previousTokens.find((entry) => entry.id === token.id);
        if (previousToken && previousToken.steps !== token.steps) {
          movedTokenId = token.id;
        }
      }
    }

    previousTokensRef.current = state.tokens;

    if (!movedTokenId) return;

    const startTimer = window.setTimeout(() => setRecentlyMovedTokenId(movedTokenId), 0);
    const clearTimer = window.setTimeout(() => setRecentlyMovedTokenId(null), 700);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(clearTimer);
    };
  }, [state.tokens]);

  const tokensByCell = useMemo(() => {
    const map = new Map<string, LudoTokenState[]>();
    for (const color of LudoEngine.colorOrder()) {
      for (const token of state.tokens[color]) {
        const coord = LudoEngine.getTokenCoord(token);
        const key = coordKey(coord);
        const list = map.get(key) ?? [];
        list.push(token);
        map.set(key, list);
      }
    }
    return map;
  }, [state.tokens]);

  const tokenOverlayData = useMemo(() => {
    const cellSize = 100 / CELL_COUNT;

    return LudoEngine.colorOrder().flatMap((color) =>
      state.tokens[color].map((token) => {
        if (token.steps === -1) {
          const baseSize = cellSize * 0.62;
          const center = BASE_TOKEN_CENTERS[token.color][token.tokenIndex] ?? BASE_TOKEN_CENTERS[token.color][0];

          return {
            token,
            left: `${center.x * 100 - baseSize / 2}%`,
            top: `${center.y * 100 - baseSize / 2}%`,
            size: `${baseSize}%`,
          };
        }

        const coord = LudoEngine.getTokenCoord(token);
        const cellTokens = tokensByCell.get(coordKey(coord)) ?? [];
        const tokenStackIndex = Math.max(
          0,
          cellTokens.findIndex((entry) => entry.id === token.id),
        );
        const offset =
          token.steps === 57
            ? GOAL_STACK_OFFSETS[token.tokenIndex] ?? GOAL_STACK_OFFSETS[tokenStackIndex] ?? GOAL_STACK_OFFSETS[0]
            : TOKEN_STACK_OFFSETS[tokenStackIndex] ?? TOKEN_STACK_OFFSETS[token.tokenIndex] ?? TOKEN_STACK_OFFSETS[0];

        return {
          token,
          left: `${(coord.col + offset.x) * cellSize}%`,
          top: `${(coord.row + offset.y) * cellSize}%`,
          size: `${cellSize * TOKEN_SIZE_RATIO}%`,
        };
      }),
    );
  }, [state.tokens, tokensByCell]);

  const destinationKeys = useMemo(() => {
    const keys = new Set<string>();
    const showMoveDestinations = !aiControlledTurn && !state.canRoll && state.diceValue !== null && movableTokenIds.length > 0;
    if (!showMoveDestinations || state.diceValue === null) return keys;

    for (const tokenId of movableTokenIds) {
      const token = LudoEngine.colorOrder()
        .flatMap((color) => state.tokens[color])
        .find((entry) => entry.id === tokenId);
      if (!token) continue;

      const nextSteps = token.steps === -1 ? 0 : token.steps + state.diceValue;

      if (nextSteps === 57) {
        keys.add(coordKey(LudoEngine.GOAL_COORD));
        continue;
      }

      if (nextSteps >= 0 && nextSteps <= 50) {
        const trackIndex = (LudoEngine.START_TRACK_INDEX[token.color] + nextSteps) % LudoEngine.TRACK.length;
        keys.add(coordKey(LudoEngine.TRACK[trackIndex]));
        continue;
      }

      if (nextSteps >= 51 && nextSteps <= 56) {
        keys.add(coordKey(LudoEngine.HOME_LANES[token.color][nextSteps - 51]));
      }
    }

    return keys;
  }, [aiControlledTurn, movableTokenIds, state.canRoll, state.diceValue, state.tokens]);

  const pathHighlightKeys = useMemo(() => {
    const keys = new Set<string>();
    const showMovePaths = !aiControlledTurn && !state.canRoll && state.diceValue !== null && movableTokenIds.length > 0;
    if (!showMovePaths || state.diceValue === null) return keys;

    for (const tokenId of movableTokenIds) {
      const token = LudoEngine.colorOrder()
        .flatMap((color) => state.tokens[color])
        .find((entry) => entry.id === tokenId);

      if (!token) continue;

      const pathKeys = getTokenPathCoordKeys(token, state.diceValue);
      pathKeys.forEach((key) => keys.add(key));
    }

    destinationKeys.forEach((key) => keys.delete(key));
    return keys;
  }, [aiControlledTurn, destinationKeys, movableTokenIds, state.canRoll, state.diceValue, state.tokens]);

  const showMoveDestinations =
    !aiControlledTurn && !state.canRoll && state.diceValue !== null && movableTokenIds.length > 0;

  const boardSurface = (
    <div
      className={`mx-auto rounded-[2.1rem] border-[6px] border-[#f3d45f] bg-[linear-gradient(180deg,#2b64d3,#173d8f_54%,#11275f)] p-2.5 shadow-[0_26px_60px_-36px_rgba(0,0,0,0.85)] md:p-3 ${
        fullscreen ? 'max-w-[1180px]' : 'max-w-[860px]'
      }`}
    >
      <div className="relative rounded-[1.6rem] border border-white/25 bg-[linear-gradient(180deg,#fcfdff,#eef3f9)] p-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.72)] md:p-3">
        <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.55),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.32),transparent_28%),linear-gradient(135deg,rgba(32,66,156,0.06),transparent_28%),linear-gradient(45deg,rgba(255,212,59,0.08),transparent_25%)]" />
        <div className="relative aspect-square overflow-hidden rounded-[1.3rem] border border-[#2d4582]/30 bg-[#f9f9fc]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.04),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-45 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_7%),linear-gradient(45deg,rgba(19,39,95,0.03)_0%,rgba(19,39,95,0.03)_1px,transparent_1px,transparent_8%)] bg-[size:44px_44px]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[20%] w-[20%] -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-[#6f7680] bg-white shadow-[0_10px_20px_-12px_rgba(0,0,0,0.4)]">
          <span className="absolute inset-0 [clip-path:polygon(50%_50%,0_0,100%_0)] bg-[#ffd43b]" />
          <span className="absolute inset-0 [clip-path:polygon(50%_50%,100%_0,100%_100%)] bg-[#42bfff]" />
          <span className="absolute inset-0 [clip-path:polygon(50%_50%,100%_100%,0_100%)] bg-[#ff3135]" />
          <span className="absolute inset-0 [clip-path:polygon(50%_50%,0_100%,0_0)] bg-[#18b84d]" />
          </div>

          <div
            className="relative grid h-full w-full"
            style={{ gridTemplateColumns: `repeat(${CELL_COUNT}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: CELL_COUNT * CELL_COUNT }, (_, index) => {
              const row = Math.floor(index / CELL_COUNT);
              const col = index % CELL_COUNT;
              const key = `${row}-${col}`;
              const isDestination = showMoveDestinations && destinationKeys.has(key);
              const isPathHighlight = showMoveDestinations && !isDestination && pathHighlightKeys.has(key);
              const trackIndex = TRACK_INDEX_BY_COORDKEY.get(key);
              const isSafe = trackIndex !== undefined && LudoEngine.SAFE_TRACK_INDEXES.has(trackIndex);
              const isGoal = row === LudoEngine.GOAL_COORD.row && col === LudoEngine.GOAL_COORD.col;
              const startMarker = trackIndex !== undefined ? START_MARKERS_BY_TRACK_INDEX.get(trackIndex) : null;
              return (
                <div key={key} className={getCellClasses(row, col)}>
                  {isPathHighlight && (
                    <>
                      <span className="pointer-events-none absolute inset-[18%] z-0 rounded-[38%] border border-cyan-200/28 bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(255,255,255,0.08))] shadow-[0_0_18px_rgba(34,211,238,0.18)]" />
                      <span className="pointer-events-none absolute inset-[30%] z-0 rounded-full bg-cyan-200/28" />
                    </>
                  )}
                  {isDestination && (
                    <>
                      <span className="pointer-events-none absolute inset-[11%] z-0 rounded-full border-2 border-cyan-200/40 animate-ping" />
                      <span className="pointer-events-none absolute inset-[16%] z-0 rounded-full bg-cyan-400/18 ring-2 ring-cyan-300/55 shadow-[0_0_18px_rgba(34,211,238,0.35)]" />
                    </>
                  )}

                  {isSafe && !isGoal && <SafeStarMarker />}

                  {startMarker && <StartArrowMarker direction={startMarker} />}
                </div>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-0 z-[5]">
            {HOME_PAD_OVERLAYS.map(({ color, container }) => {
              const style = PLAYER_STYLES[color];
              return (
                <div
                  key={color}
                  className={`absolute ${container} h-[26.6%] w-[26.6%] rounded-[1.6rem] border-[3px] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.45)] ${style.border} ${style.soft}`}
                >
                  <span className="absolute inset-[13%] rounded-[1.15rem] border-[3px] border-[#ecf1f8] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,252,0.95))] shadow-[inset_0_2px_0_rgba(255,255,255,0.82)]" />
                </div>
              );
            })}
            {LudoEngine.colorOrder().flatMap((color) =>
              BASE_TOKEN_CENTERS[color].map((center, index) => (
                <span
                  key={`${color}-slot-${index}`}
                  className="absolute rounded-full border-[2px] border-slate-300/85 bg-white/72 shadow-[inset_0_2px_0_rgba(255,255,255,0.82),0_2px_4px_rgba(0,0,0,0.06)]"
                  style={{
                    width: '4.6%',
                    height: '4.6%',
                    left: `${center.x * 100 - 2.3}%`,
                    top: `${center.y * 100 - 2.3}%`,
                  }}
                />
              )),
            )}
          </div>
          <div className="absolute inset-0 z-20">
            {tokenOverlayData.map(({ token, left, top, size }) => {
              const style = PLAYER_STYLES[token.color];
              const isMovable = movableTokenIdSet.has(token.id);
              const interactive = isMovable && !aiControlledTurn;
              const isJustMoved = recentlyMovedTokenId === token.id;

              return (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => onTokenMove(token.id)}
                  disabled={!interactive}
                  className={`absolute rounded-full border-[2.5px] border-white/90 shadow-[0_10px_18px_-10px_rgba(0,0,0,0.85)] transition-[left,top,transform,box-shadow] duration-500 ease-out ${style.token} ${
                    interactive
                      ? 'scale-[1.12] ring-4 ring-cyan-300/50 hover:scale-[1.18] animate-[pulse_1.35s_ease-in-out_infinite]'
                      : ''
                  } ${isJustMoved ? 'animate-[bounce_0.55s_ease-out] ring-4 ring-amber-300/55 shadow-[0_0_24px_rgba(253,224,71,0.55)]' : ''} ${!interactive ? 'cursor-default' : 'cursor-pointer'}`}
                  style={{ left, top, width: size, height: size }}
                  aria-label={`${style.label} token ${token.tokenIndex + 1}`}
                >
                  {isJustMoved && (
                    <span className="pointer-events-none absolute -inset-[18%] rounded-full border-2 border-amber-200/65 animate-ping" />
                  )}
                  {interactive && (
                    <>
                      <span className="pointer-events-none absolute -inset-[16%] rounded-full border-2 border-cyan-200/55 animate-ping" />
                      <span className="pointer-events-none absolute -top-[28%] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[7px] border-r-[7px] border-b-[12px] border-l-transparent border-r-transparent border-b-cyan-200 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                    </>
                  )}
                  <PawnShape tone={style.token} className="absolute inset-[6%]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`rounded-[2.6rem] border border-[#2b56b8]/70 bg-[radial-gradient(circle_at_top,#2c68da,#143684_58%,#0a173f_100%)] shadow-[0_25px_70px_-30px_rgba(0,0,0,0.9)] ${fullscreen ? 'p-3 md:p-4' : 'p-3 md:p-5'}`}>
      <div className={`mx-auto space-y-4 ${fullscreen ? 'max-w-[1500px]' : 'max-w-[1120px]'}`}>
        <div className="grid grid-cols-2 gap-3 lg:hidden">
          <PlayerCard color="red" state={state} mode={mode} canRoll={canRoll} rolling={rolling} aiControlledTurn={aiControlledTurn} diceValue={diceValue} lastRoll={lastRoll} onRoll={onRoll} />
          <PlayerCard color="green" state={state} mode={mode} canRoll={canRoll} rolling={rolling} aiControlledTurn={aiControlledTurn} diceValue={diceValue} lastRoll={lastRoll} onRoll={onRoll} />
        </div>

        <div className={`hidden lg:grid lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:items-center ${fullscreen ? 'gap-3 xl:grid-cols-[190px_minmax(0,1fr)_190px] 2xl:grid-cols-[205px_minmax(0,1fr)_205px]' : 'gap-4 lg:grid-cols-[220px_minmax(0,1fr)_220px]'}`}>
          <div className="lg:col-start-1 lg:row-start-1">
            <PlayerCard color="red" state={state} mode={mode} canRoll={canRoll} rolling={rolling} aiControlledTurn={aiControlledTurn} diceValue={diceValue} lastRoll={lastRoll} onRoll={onRoll} compact={fullscreen} />
          </div>
          <div className="lg:col-start-3 lg:row-start-1">
            <PlayerCard color="green" state={state} mode={mode} canRoll={canRoll} rolling={rolling} aiControlledTurn={aiControlledTurn} diceValue={diceValue} lastRoll={lastRoll} onRoll={onRoll} compact={fullscreen} />
          </div>
          <div className="lg:col-start-2 lg:row-[1/4]">
            {boardSurface}
          </div>
          <div className="lg:col-start-1 lg:row-start-3">
            <PlayerCard color="blue" state={state} mode={mode} canRoll={canRoll} rolling={rolling} aiControlledTurn={aiControlledTurn} diceValue={diceValue} lastRoll={lastRoll} onRoll={onRoll} compact={fullscreen} />
          </div>
          <div className="lg:col-start-3 lg:row-start-3">
            <PlayerCard color="yellow" state={state} mode={mode} canRoll={canRoll} rolling={rolling} aiControlledTurn={aiControlledTurn} diceValue={diceValue} lastRoll={lastRoll} onRoll={onRoll} compact={fullscreen} />
          </div>
        </div>

        <div className="lg:hidden">
          {boardSurface}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:hidden">
          <PlayerCard color="blue" state={state} mode={mode} canRoll={canRoll} rolling={rolling} aiControlledTurn={aiControlledTurn} diceValue={diceValue} lastRoll={lastRoll} onRoll={onRoll} />
          <PlayerCard color="yellow" state={state} mode={mode} canRoll={canRoll} rolling={rolling} aiControlledTurn={aiControlledTurn} diceValue={diceValue} lastRoll={lastRoll} onRoll={onRoll} />
        </div>
      </div>
    </div>
  );
}
