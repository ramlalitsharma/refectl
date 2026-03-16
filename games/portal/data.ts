import { Crown, Gamepad2, ChessKing, Puzzle, Users } from 'lucide-react';

export const GAME_MODES = [
  {
    title: 'Arcade',
    description: 'Fast sessions built for quick breaks.',
    icon: Gamepad2,
  },
  {
    title: 'Puzzle',
    description: 'Logic, memory, and brain training challenges.',
    icon: Puzzle,
  },
  {
    title: 'Strategy',
    description: 'Turn-based tactics that reward planning.',
    icon: ChessKing,
  },
  {
    title: 'Multiplayer',
    description: 'Play with friends and the community.',
    icon: Users,
  },
];

export const FEATURED_GAMES = [
  {
    id: 'ludo',
    title: 'Ludo Royale',
    category: 'Strategy',
    status: 'LIVE' as const,
    description: 'Classic board game meets modern competitive play.',
    href: '/games/ludo',
    accent: '#f59e0b',
    gradient: 'from-amber-400/25 via-orange-500/10 to-slate-900/0',
  },
  {
    id: 'tictac',
    title: 'Tic Tac Toe',
    category: 'Strategy',
    status: 'LIVE' as const,
    description: 'A timeless duel of prediction and quick thinking.',
    href: '/games/tictac',
    accent: '#22d3ee',
    gradient: 'from-cyan-400/25 via-sky-500/10 to-slate-900/0',
  },
  {
    id: 'chess',
    title: 'Nebula Chess',
    category: 'Strategy',
    status: 'COMING SOON' as const,
    description: 'Master openings and tactics with modern UI.',
    href: '/games/chess',
    accent: '#a855f7',
    gradient: 'from-purple-400/25 via-fuchsia-500/10 to-slate-900/0',
  },
  {
    id: 'snake',
    title: 'Neon Snake',
    category: 'Arcade',
    status: 'COMING SOON' as const,
    description: 'High-speed reflex play in a neon arena.',
    href: '/games/snake',
    accent: '#34d399',
    gradient: 'from-emerald-400/25 via-green-500/10 to-slate-900/0',
  },
];
