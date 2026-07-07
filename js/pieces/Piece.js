class Piece {
  /**
   * Abstract base class for all chess pieces.
   * @param {string} color - 'white' or 'black'
   * @param {number} row
   * @param {number} col
   */
  constructor(color, row, col) {
    this.color = color;
    this.row = row;
    this.col = col;
    this.hasMoved = false;
  }

  get symbol() {
    throw new Error('symbol must be implemented by subclass');
  }

  /**
   * Returns array of {row, col} objects representing legal destination squares.
   * @param {Array} boardState - 2D array of Piece|null
   */
  getLegalMoves(boardState) {
    throw new Error('getLegalMoves must be implemented by subclass');
  }

  isEnemy(piece) {
    return piece !== null && piece.color !== this.color;
  }

  isFriend(piece) {
    return piece !== null && piece.color === this.color;
  }

  isInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  /** Helper for sliding pieces (Rook, Bishop, Queen) */
  getSlidingMoves(boardState, directions) {
    const moves = [];
    for (const [dr, dc] of directions) {
      let r = this.row + dr;
      let c = this.col + dc;
      while (this.isInBounds(r, c)) {
        const target = boardState[r][c];
        if (target === null) {
          moves.push({ row: r, col: c });
        } else {
          if (this.isEnemy(target)) moves.push({ row: r, col: c });
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return moves;
  }
}
