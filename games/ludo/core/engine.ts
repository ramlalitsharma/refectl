export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoPlayer {
  id: LudoColor;
  name: string;
}

export interface LudoCoord {
  row: number;
  col: number;
}

export interface LudoTokenState {
  id: string;
  color: LudoColor;
  tokenIndex: number;
  steps: number;
}

export interface LudoState {
  currentPlayerIndex: number;
  diceValue: number | null;
  lastRoll: number | null;
  playerLastRolls: Record<LudoColor, number | null>;
  movableTokenIds: string[];
  tokens: Record<LudoColor, LudoTokenState[]>;
  winner: LudoColor | null;
  statusMessage: string;
  turn: number;
  canRoll: boolean;
  consecutiveSixes: number;
}

const GOAL_STEPS = 57;
const TRACK_STEPS = 50;

export class LudoEngine {
  static readonly DEFAULT_PLAYERS: LudoPlayer[] = [
    { id: 'red', name: 'Green' },
    { id: 'green', name: 'Yellow' },
    { id: 'yellow', name: 'Blue' },
    { id: 'blue', name: 'Red' },
  ];

  static readonly TRACK: LudoCoord[] = [
    { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
    { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 0, col: 6 },
    { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 },
    { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 }, { row: 6, col: 14 },
    { row: 7, col: 14 }, { row: 8, col: 14 }, { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 },
    { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 }, { row: 14, col: 8 },
    { row: 14, col: 7 }, { row: 14, col: 6 }, { row: 13, col: 6 }, { row: 12, col: 6 }, { row: 11, col: 6 }, { row: 10, col: 6 }, { row: 9, col: 6 },
    { row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 1 }, { row: 8, col: 0 },
    { row: 7, col: 0 }, { row: 6, col: 0 },
  ];

  static readonly START_TRACK_INDEX: Record<LudoColor, number> = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39,
  };

  static readonly SAFE_TRACK_INDEXES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

  static readonly HOME_LANES: Record<LudoColor, LudoCoord[]> = {
    red: [
      { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 },
    ],
    green: [
      { row: 1, col: 7 }, { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 },
    ],
    yellow: [
      { row: 7, col: 13 }, { row: 7, col: 12 }, { row: 7, col: 11 }, { row: 7, col: 10 }, { row: 7, col: 9 }, { row: 7, col: 8 },
    ],
    blue: [
      { row: 13, col: 7 }, { row: 12, col: 7 }, { row: 11, col: 7 }, { row: 10, col: 7 }, { row: 9, col: 7 }, { row: 8, col: 7 },
    ],
  };

  static readonly BASE_SPOTS: Record<LudoColor, LudoCoord[]> = {
    red: [
      { row: 2, col: 2 }, { row: 2, col: 4 }, { row: 4, col: 2 }, { row: 4, col: 4 },
    ],
    green: [
      { row: 2, col: 10 }, { row: 2, col: 12 }, { row: 4, col: 10 }, { row: 4, col: 12 },
    ],
    yellow: [
      { row: 10, col: 10 }, { row: 10, col: 12 }, { row: 12, col: 10 }, { row: 12, col: 12 },
    ],
    blue: [
      { row: 10, col: 2 }, { row: 10, col: 4 }, { row: 12, col: 2 }, { row: 12, col: 4 },
    ],
  };

  static readonly GOAL_COORD: LudoCoord = { row: 7, col: 7 };

  static createEmptyPlayerLastRolls(): Record<LudoColor, number | null> {
    return {
      red: null,
      green: null,
      yellow: null,
      blue: null,
    };
  }

  static createGame(): LudoState {
    const tokens = {
      red: this.createTokensForColor('red'),
      green: this.createTokensForColor('green'),
      yellow: this.createTokensForColor('yellow'),
      blue: this.createTokensForColor('blue'),
    };

    return {
      currentPlayerIndex: 3,
      diceValue: null,
      lastRoll: null,
      playerLastRolls: this.createEmptyPlayerLastRolls(),
      movableTokenIds: [],
      tokens,
      winner: null,
      statusMessage: 'Red begins. Roll the dice to start the match.',
      turn: 1,
      canRoll: true,
      consecutiveSixes: 0,
    };
  }

  static createTokensForColor(color: LudoColor): LudoTokenState[] {
    return Array.from({ length: 4 }, (_, tokenIndex) => ({
      id: `${color}-${tokenIndex}`,
      color,
      tokenIndex,
      steps: -1,
    }));
  }

  static rollDice(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  static nextPlayerIndex(currentIndex: number, playersCount: number): number {
    if (playersCount <= 0) return 0;
    return (currentIndex + 1) % playersCount;
  }

  static getCurrentPlayer(state: LudoState): LudoPlayer {
    return this.DEFAULT_PLAYERS[state.currentPlayerIndex];
  }

  static getMovableTokenIds(state: LudoState, diceValue: number): string[] {
    const player = this.getCurrentPlayer(state);
    return state.tokens[player.id]
      .filter((token) => this.canTokenMoveInState(state, token, diceValue))
      .map((token) => token.id);
  }

  static canTokenMove(token: LudoTokenState, diceValue: number): boolean {
    if (token.steps === GOAL_STEPS) return false;
    if (token.steps === -1) return diceValue === 6;
    return token.steps + diceValue <= GOAL_STEPS;
  }

  static canTokenMoveInState(state: LudoState, token: LudoTokenState, diceValue: number): boolean {
    if (!this.canTokenMove(token, diceValue)) return false;

    const pathTrackIndexes = this.getMovementTrackIndexes(token, diceValue);
    if (pathTrackIndexes.length > 0) {
      const finalTrackIndex = pathTrackIndexes[pathTrackIndexes.length - 1];

      for (let i = 0; i < pathTrackIndexes.length - 1; i += 1) {
        if (this.isBlockedByOpponentBlockade(state, token.color, pathTrackIndexes[i])) {
          return false;
        }
      }

      if (this.isBlockedByOpponentBlockade(state, token.color, finalTrackIndex)) {
        return false;
      }
    }

    return true;
  }

  static rollForState(state: LudoState, forcedRoll?: number): LudoState {
    if (!state.canRoll || state.winner) return state;

    const diceValue = forcedRoll ?? this.rollDice();
    const consecutiveSixes = diceValue === 6 ? state.consecutiveSixes + 1 : 0;
    const currentPlayer = this.getCurrentPlayer(state);
    const playerLastRolls = state.playerLastRolls ?? this.createEmptyPlayerLastRolls();

    if (consecutiveSixes >= 3) {
      const nextPlayerIndex = this.nextPlayerIndex(state.currentPlayerIndex, this.DEFAULT_PLAYERS.length);
      const nextPlayer = this.DEFAULT_PLAYERS[nextPlayerIndex];

      return {
        ...state,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: null,
        lastRoll: diceValue,
        playerLastRolls: {
          ...playerLastRolls,
          [currentPlayer.id]: diceValue,
        },
        movableTokenIds: [],
        canRoll: true,
        turn: state.turn + 1,
        consecutiveSixes: 0,
        statusMessage: `${currentPlayer.name} rolled three 6s. Turn forfeited. ${nextPlayer.name} is up.`,
      };
    }

    const movableTokenIds = this.getMovableTokenIds(state, diceValue);

    if (movableTokenIds.length === 0) {
      const nextPlayerIndex = this.nextPlayerIndex(state.currentPlayerIndex, this.DEFAULT_PLAYERS.length);
      const nextPlayer = this.DEFAULT_PLAYERS[nextPlayerIndex];

      return {
        ...state,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: null,
        lastRoll: diceValue,
        playerLastRolls: {
          ...playerLastRolls,
          [currentPlayer.id]: diceValue,
        },
        movableTokenIds: [],
        canRoll: true,
        turn: state.turn + 1,
        consecutiveSixes: 0,
        statusMessage: `${currentPlayer.name} rolled ${diceValue} and has no valid move. ${nextPlayer.name} is up.`,
      };
    }

    return {
      ...state,
      diceValue,
      lastRoll: diceValue,
      playerLastRolls: {
        ...playerLastRolls,
        [currentPlayer.id]: diceValue,
      },
      movableTokenIds,
      canRoll: false,
      consecutiveSixes,
      statusMessage:
        movableTokenIds.length === 1
          ? `${currentPlayer.name} rolled ${diceValue}. One move available.`
          : `${currentPlayer.name} rolled ${diceValue}. Choose a token.`,
    };
  }

  static moveToken(state: LudoState, tokenId: string): LudoState {
    if (state.canRoll || state.diceValue === null || state.winner) return state;
    if (!state.movableTokenIds.includes(tokenId)) return state;

    const currentPlayer = this.getCurrentPlayer(state);
    const updatedTokens = this.cloneTokens(state.tokens);
    const token = updatedTokens[currentPlayer.id].find((item) => item.id === tokenId);
    if (!token) return state;

    token.steps = token.steps === -1 ? 0 : token.steps + state.diceValue;

    let captureMessage = '';
    const absoluteTrackIndex = this.getAbsoluteTrackIndex(token);
    if (absoluteTrackIndex !== null && !this.SAFE_TRACK_INDEXES.has(absoluteTrackIndex)) {
      for (const opponentColor of this.colorOrder().filter((color) => color !== currentPlayer.id)) {
        updatedTokens[opponentColor] = updatedTokens[opponentColor].map((opponent) => {
          const opponentTrackIndex = this.getAbsoluteTrackIndex(opponent);
          if (opponentTrackIndex === absoluteTrackIndex) {
            captureMessage = `${currentPlayer.name} captured a ${this.playerLabel(opponent.color)} token.`;
            return { ...opponent, steps: -1 };
          }
          return opponent;
        });
      }
    }

    const hasWon = updatedTokens[currentPlayer.id].every((piece) => piece.steps === GOAL_STEPS);
    if (hasWon) {
      return {
        ...state,
        tokens: updatedTokens,
        movableTokenIds: [],
        canRoll: false,
        winner: currentPlayer.id,
        consecutiveSixes: 0,
        statusMessage: `${currentPlayer.name} wins the match.`,
      };
    }

    const extraTurn = state.diceValue === 6;
    const nextPlayerIndex = extraTurn
      ? state.currentPlayerIndex
      : this.nextPlayerIndex(state.currentPlayerIndex, this.DEFAULT_PLAYERS.length);
    const nextPlayer = this.DEFAULT_PLAYERS[nextPlayerIndex];

    return {
      ...state,
      tokens: updatedTokens,
      currentPlayerIndex: nextPlayerIndex,
      diceValue: null,
      movableTokenIds: [],
      canRoll: true,
      turn: state.turn + 1,
      consecutiveSixes: extraTurn ? state.consecutiveSixes : 0,
      statusMessage:
        captureMessage || extraTurn
          ? `${captureMessage ? `${captureMessage} ` : ''}${extraTurn ? `${currentPlayer.name} rolled a 6 and keeps the turn.` : `${nextPlayer.name} is up.`}`.trim()
          : `${nextPlayer.name} is up.`,
    };
  }

  static chooseAutoMove(state: LudoState): string | null {
    if (state.diceValue === null || state.movableTokenIds.length === 0) return null;

    const currentPlayer = this.getCurrentPlayer(state);
    const currentTokens = state.tokens[currentPlayer.id];

    let bestTokenId: string | null = null;
    let bestScore = -Infinity;

    for (const tokenId of state.movableTokenIds) {
      const token = currentTokens.find((item) => item.id === tokenId);
      if (!token) continue;

      const projectedSteps = token.steps === -1 ? 0 : token.steps + state.diceValue;
      let score = projectedSteps;

      if (token.steps === -1 && state.diceValue === 6) score += 35;
      if (projectedSteps === GOAL_STEPS) score += 120;
      if (projectedSteps > TRACK_STEPS && projectedSteps < GOAL_STEPS) score += 24;
      if (this.wouldCapture(state, token, state.diceValue)) score += 90;
      if (this.wouldLandOnSafeSpot(token, state.diceValue)) score += 16;
      if (this.wouldBuildBlockade(state, token, state.diceValue)) score += 18;

      if (score > bestScore) {
        bestScore = score;
        bestTokenId = tokenId;
      }
    }

    return bestTokenId;
  }

  static wouldCapture(state: LudoState, token: LudoTokenState, diceValue: number): boolean {
    const projectedTrackIndex = this.getProjectedTrackIndex(token, diceValue);
    if (projectedTrackIndex === null || this.SAFE_TRACK_INDEXES.has(projectedTrackIndex)) return false;

    for (const color of this.colorOrder()) {
      if (color === token.color) continue;
      for (const opponent of state.tokens[color]) {
        if (this.getAbsoluteTrackIndex(opponent) === projectedTrackIndex) {
          return true;
        }
      }
    }

    return false;
  }

  static wouldLandOnSafeSpot(token: LudoTokenState, diceValue: number): boolean {
    const projectedTrackIndex = this.getProjectedTrackIndex(token, diceValue);
    return projectedTrackIndex !== null && this.SAFE_TRACK_INDEXES.has(projectedTrackIndex);
  }

  static wouldBuildBlockade(state: LudoState, token: LudoTokenState, diceValue: number): boolean {
    const projectedTrackIndex = this.getProjectedTrackIndex(token, diceValue);
    if (projectedTrackIndex === null) return false;

    const friendlyCount = state.tokens[token.color].filter(
      (piece) => piece.id !== token.id && this.getAbsoluteTrackIndex(piece) === projectedTrackIndex,
    ).length;

    return friendlyCount >= 1;
  }

  static getProjectedTrackIndex(token: LudoTokenState, diceValue: number): number | null {
    if (!this.canTokenMove(token, diceValue)) return null;

    const nextSteps = token.steps === -1 ? 0 : token.steps + diceValue;
    if (nextSteps > TRACK_STEPS) return null;

    return (this.START_TRACK_INDEX[token.color] + nextSteps) % this.TRACK.length;
  }

  static getAbsoluteTrackIndex(token: LudoTokenState): number | null {
    if (token.steps < 0 || token.steps > TRACK_STEPS) return null;
    return (this.START_TRACK_INDEX[token.color] + token.steps) % this.TRACK.length;
  }

  static getMovementTrackIndexes(token: LudoTokenState, diceValue: number): number[] {
    if (!this.canTokenMove(token, diceValue)) return [];

    const indexes: number[] = [];

    if (token.steps === -1) {
      indexes.push(this.START_TRACK_INDEX[token.color]);
      return indexes;
    }

    for (let step = 1; step <= diceValue; step += 1) {
      const nextSteps = token.steps + step;
      if (nextSteps > TRACK_STEPS) break;
      indexes.push((this.START_TRACK_INDEX[token.color] + nextSteps) % this.TRACK.length);
    }

    return indexes;
  }

  static isBlockedByOpponentBlockade(state: LudoState, movingColor: LudoColor, trackIndex: number): boolean {
    if (this.SAFE_TRACK_INDEXES.has(trackIndex)) return false;

    for (const color of this.colorOrder()) {
      if (color === movingColor) continue;
      const occupyingCount = state.tokens[color].filter(
        (token) => this.getAbsoluteTrackIndex(token) === trackIndex,
      ).length;

      if (occupyingCount >= 2) return true;
    }

    return false;
  }

  static getTokenCoord(token: LudoTokenState): LudoCoord {
    if (token.steps === -1) {
      return this.BASE_SPOTS[token.color][token.tokenIndex];
    }

    if (token.steps >= 0 && token.steps <= TRACK_STEPS) {
      return this.TRACK[(this.START_TRACK_INDEX[token.color] + token.steps) % this.TRACK.length];
    }

    if (token.steps >= 51 && token.steps <= 56) {
      return this.HOME_LANES[token.color][token.steps - 51];
    }

    return this.GOAL_COORD;
  }

  static getTokensForCurrentPlayer(state: LudoState): LudoTokenState[] {
    return state.tokens[this.getCurrentPlayer(state).id];
  }

  static colorOrder(): LudoColor[] {
    return ['red', 'green', 'yellow', 'blue'];
  }

  static playerLabel(color: LudoColor): string {
    return this.DEFAULT_PLAYERS.find((player) => player.id === color)?.name ?? color;
  }

  static cloneTokens(tokens: Record<LudoColor, LudoTokenState[]>): Record<LudoColor, LudoTokenState[]> {
    return {
      red: tokens.red.map((token) => ({ ...token })),
      green: tokens.green.map((token) => ({ ...token })),
      yellow: tokens.yellow.map((token) => ({ ...token })),
      blue: tokens.blue.map((token) => ({ ...token })),
    };
  }
}
