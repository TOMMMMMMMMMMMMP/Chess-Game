class Knight extends Piece {
  get symbol() {
    return this.color === 'white' ? '♘' : '♞';
  }

  getLegalMoves(boardState) {
    const moves = [];
    const jumps = [
      [-2,-1],[-2,1],[-1,-2],[-1,2],
      [ 1,-2],[ 1,2],[ 2,-1],[ 2,1]
    ];
    for (const [dr, dc] of jumps) {
      const r = this.row + dr;
      const c = this.col + dc;
      if (this.isInBounds(r, c) && !this.isFriend(boardState[r][c])) {
        moves.push({ row: r, col: c });
      }
    }
    return moves;
  }
}
