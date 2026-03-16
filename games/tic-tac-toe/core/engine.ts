export type Player = 'X' | 'O';
export type SquareValue = Player | null;

export class TicTacToeEngine {
  static readonly WINNING_LINES: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  static createEmptyBoard(): SquareValue[] {
    return Array(9).fill(null);
  }

  static calculateWinner(squares: SquareValue[]): Player | null {
    for (const [a, b, c] of TicTacToeEngine.WINNING_LINES) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }

  static getWinningLine(squares: SquareValue[]): number[] | null {
    for (const line of TicTacToeEngine.WINNING_LINES) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return line;
      }
    }
    return null;
  }

  static isDraw(squares: SquareValue[]): boolean {
    return !TicTacToeEngine.calculateWinner(squares) && squares.every(Boolean);
  }

  static applyMove(squares: SquareValue[], index: number, player: Player): SquareValue[] {
    if (index < 0 || index >= squares.length) return squares;
    if (squares[index]) return squares;
    const next = squares.slice();
    next[index] = player;
    return next;
  }
}
