class Bishop extends Piece {
  get symbol() {
    return this.color === 'white' ? '♗' : '♝';
  }

  getLegalMoves(boardState) {
    return this.getSlidingMoves(boardState, [
      [-1,-1],[-1,1],[1,-1],[1,1]
    ]);
  }
}
