export interface ChessMatchCreateInput {
  mode: 'online' | 'friends' | 'ai';
}

export interface ChessMatchRecord {
  id: string;
  createdAt: string;
  mode: 'online' | 'friends' | 'ai';
}

// Placeholder for future chess backend services (matchmaking, ELO, leaderboards).
export const ChessBackend = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createMatch(_input: ChessMatchCreateInput): Promise<ChessMatchRecord> {
    throw new Error('Chess backend not implemented yet.');
  },
};
