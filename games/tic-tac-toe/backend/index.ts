export interface TicTacToeMatchRecord {
  id: string;
  createdAt: string;
  moves: number[];
  winner: 'X' | 'O' | 'draw';
}

export interface TicTacToeMatchCreateInput {
  moves: number[];
  winner: 'X' | 'O' | 'draw';
}

// Placeholder module for future API/database integrations.
export const TicTacToeBackend = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createMatch(_input: TicTacToeMatchCreateInput): Promise<TicTacToeMatchRecord> {
    throw new Error('TicTacToe backend not implemented yet.');
  }
};
