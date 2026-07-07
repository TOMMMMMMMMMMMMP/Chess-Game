class Queen extends Piece {
  get symbol() {
    return this.color === 'white' ? '♕' : '♛';
  }

  getLegalMoves(boardState) {
    return this.getSlidingMoves(boardState, [
      [-1,0],[1,0],[0,-1],[0,1],
      [-1,-1],[-1,1],[1,-1],[1,1]
    ]);
  }
}
