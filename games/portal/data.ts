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
    thumbnail: '/og/games/ludo.svg',
    logo: '/games/logos/ludo.svg',
    meta: {
      players: '2-4 Players',
      playtime: '10-15 min',
      devices: 'Mobile + Desktop',
    },
    tags: ['Multiplayer', 'Board', 'Classic'],
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
    thumbnail: '/og/games/tictac.svg',
    logo: '/games/logos/tictac.svg',
    meta: {
      players: '2 Players',
      playtime: '2-4 min',
      devices: 'Any Device',
    },
    tags: ['Quick Match', 'Puzzle', 'Competitive'],
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
    thumbnail: '/og/games/chess.svg',
    logo: '/games/logos/chess.svg',
    meta: {
      players: '1v1 Ranked',
      playtime: 'Rapid + Blitz',
      devices: 'Cross-platform',
    },
    tags: ['Ranked', 'Classic', 'Tactics'],
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
    thumbnail: '/og/games/snake.svg',
    logo: '/games/logos/snake.svg',
    meta: {
      players: 'Solo',
      playtime: 'Endless',
      devices: 'Mobile + Desktop',
    },
    tags: ['Arcade', 'Reflex', 'Endless'],
  },
];
