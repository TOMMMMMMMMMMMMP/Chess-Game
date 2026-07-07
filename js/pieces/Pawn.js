class Pawn extends Piece {
  get symbol() {
    return this.color === 'white' ? '♙' : '♟';
  }

  getLegalMoves(boardState) {
    const moves = [];
    const dir = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;

    // Move forward one square
    const r1 = this.row + dir;
    if (this.isInBounds(r1, this.col) && boardState[r1][this.col] === null) {
      moves.push({ row: r1, col: this.col });

      // Move forward two squares from start
      const r2 = this.row + dir * 2;
      if (this.row === startRow && boardState[r2][this.col] === null) {
        moves.push({ row: r2, col: this.col });
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const c = this.col + dc;
      if (this.isInBounds(r1, c) && this.isEnemy(boardState[r1][c])) {
        moves.push({ row: r1, col: c });
      }
    }

    return moves;
  }
}
