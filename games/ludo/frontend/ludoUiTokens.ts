import type { LudoColor } from '@/games/ludo/core/engine';

export const CELL_COUNT = 15;

export const PLAYER_STYLES: Record<
  LudoColor,
  {
    label: string;
    token: string;
    tokenText: string;
    panel: string;
    lane: string;
    soft: string;
    border: string;
    dicePip: string;
    diceGlow: string;
  }
> = {
  red: {
    label: 'Green',
    token: 'bg-[linear-gradient(180deg,#6cf7a6_0%,#27d56a_38%,#0f983c_72%,#0b7a30_100%)]',
    tokenText: 'text-white',
    panel: 'from-[#1ec457]/35 to-[#0d6f30]/20',
    lane: 'bg-[#18b84d]',
    soft: 'bg-[#0fb047]',
    border: 'border-[#0f7f35]/70',
    dicePip: '#22c55e',
    diceGlow: 'rgba(34,197,94,0.28)',
  },
  green: {
    label: 'Yellow',
    token: 'bg-[linear-gradient(180deg,#fff27a_0%,#ffd84b_38%,#f5b719_72%,#d28d05_100%)]',
    tokenText: 'text-[#4b3500]',
    panel: 'from-[#ffd43b]/35 to-[#d89a09]/20',
    lane: 'bg-[#ffd43b]',
    soft: 'bg-[#ffce26]',
    border: 'border-[#d69f11]/70',
    dicePip: '#facc15',
    diceGlow: 'rgba(250,204,21,0.3)',
  },
  yellow: {
    label: 'Blue',
    token: 'bg-[linear-gradient(180deg,#83ddff_0%,#4fc7ff_38%,#1d97e6_72%,#116ab1_100%)]',
    tokenText: 'text-white',
    panel: 'from-[#42bfff]/35 to-[#167dcb]/20',
    lane: 'bg-[#42bfff]',
    soft: 'bg-[#2ab5fb]',
    border: 'border-[#177dcb]/70',
    dicePip: '#38bdf8',
    diceGlow: 'rgba(56,189,248,0.3)',
  },
  blue: {
    label: 'Red',
    token: 'bg-[linear-gradient(180deg,#ff8488_0%,#ff474d_38%,#e12027_72%,#ad1016_100%)]',
    tokenText: 'text-white',
    panel: 'from-[#ff3135]/35 to-[#b8141a]/20',
    lane: 'bg-[#ff3135]',
    soft: 'bg-[#ff272c]',
    border: 'border-[#bb171d]/70',
    dicePip: '#ef4444',
    diceGlow: 'rgba(239,68,68,0.32)',
  },
};

export const TOKEN_STACK_POSITIONS = [
  'left-[14%] top-[14%]',
  'right-[14%] top-[14%]',
  'left-[14%] bottom-[14%]',
  'right-[14%] bottom-[14%]',
] as const;

export const GOAL_STACK_POSITIONS = [
  'left-[28%] top-[28%]',
  'right-[28%] top-[28%]',
  'left-[28%] bottom-[28%]',
  'right-[28%] bottom-[28%]',
] as const;

export const MODE_META = {
  online: {
    label: 'Play Online',
    description: 'Classic Ludo board with room-style turn flow.',
  },
  friends: {
    label: 'Play With Friends',
    description: 'Pass the device or prepare for private-room play.',
  },
  ai: {
    label: 'Vs Computer',
    description: 'You control Red while the other colors take automatic turns.',
  },
  pass: {
    label: 'Pass N Play',
    description: 'One device, four seats, classic Ludo turn rotation.',
  },
} as const;

