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
    return moves;
  }
}
