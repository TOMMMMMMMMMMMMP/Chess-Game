class King extends Piece {
  get symbol() {
    return this.color === 'white' ? '♔' : '♚';
  }

  getLegalMoves(boardState) {
    const moves = [];

    const dirs = [
      [-1,-1],[-1,0],[-1,1],
      [ 0,-1],       [ 0,1],
      [ 1,-1],[ 1,0],[ 1,1]
    ];
    for (const [dr, dc] of dirs) {
      const r = this.row + dr;
      const c = this.col + dc;
      if (this.isInBounds(r, c) && !this.isFriend(boardState[r][c])) {
        moves.push({ row: r, col: c });
      }
    }

    // Castling
    if (!this.hasMoved) {
      const row = this.row;

      // Kingside
      const rookKingside = boardState[row][7];
      if (
        rookKingside && rookKingside instanceof Rook &&
        !rookKingside.hasMoved &&
        boardState[row][5] === null &&
        boardState[row][6] === null
      ) {
        moves.push({ row, col: 6, castling: 'kingside' });
      }

      // Queenside
      const rookQueenside = boardState[row][0];
      if (
        rookQueenside && rookQueenside instanceof Rook &&
        !rookQueenside.hasMoved &&
        boardState[row][1] === null &&
        boardState[row][2] === null &&
        boardState[row][3] === null
      ) {
        moves.push({ row, col: 2, castling: 'queenside' });
      }
    }

    return moves;
  }
}
