export interface SnakeState {
  length: number;
  score: number;
  speed: number;
}

export const DEFAULT_SNAKE_STATE: SnakeState = {
  length: 3,
  score: 0,
  speed: 1,
};
