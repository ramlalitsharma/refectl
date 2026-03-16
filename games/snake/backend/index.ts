export interface SnakeMatchRecord {
  id: string;
  createdAt: string;
  score: number;
}

// Placeholder for future snake backend services (leaderboards, ghosts).
export const SnakeBackend = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async saveScore(_score: number): Promise<SnakeMatchRecord> {
    throw new Error('Snake backend not implemented yet.');
  },
};
