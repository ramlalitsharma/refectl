export interface LudoMatchCreateInput {
  players: string[];
  mode: 'online' | 'friends' | 'ai' | 'pass-and-play';
}

export interface LudoMatchRecord {
  id: string;
  createdAt: string;
  players: string[];
  mode: 'online' | 'friends' | 'ai' | 'pass-and-play';
}

// Placeholder for future Ludo backend services (matchmaking, persistence, leaderboards).
export const LudoBackend = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createMatch(_input: LudoMatchCreateInput): Promise<LudoMatchRecord> {
    throw new Error('Ludo backend not implemented yet.');
  },
};
