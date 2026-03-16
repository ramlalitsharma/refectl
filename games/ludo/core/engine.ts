export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoPlayer {
  id: LudoColor;
  name: string;
}

export interface LudoState {
  currentPlayerIndex: number;
  diceValue: number;
  lastRoll: number | null;
}

export class LudoEngine {
  static readonly DEFAULT_PLAYERS: LudoPlayer[] = [
    { id: 'red', name: 'Ruby' },
    { id: 'green', name: 'Emerald' },
    { id: 'yellow', name: 'Amber' },
    { id: 'blue', name: 'Azure' },
  ];

  static createGame(): LudoState {
    return {
      currentPlayerIndex: 0,
      diceValue: 1,
      lastRoll: null,
    };
  }

  static rollDice(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  static nextPlayerIndex(currentIndex: number, playersCount: number): number {
    if (playersCount <= 0) return 0;
    return (currentIndex + 1) % playersCount;
  }
}
