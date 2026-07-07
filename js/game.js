document.addEventListener('DOMContentLoaded', () => {
  const board = new Board();
  console.log('Board initialized ✔');
});
class Game {
  /**
   * Orchestrates the chess game: state, turns, click handling.
   */
  constructor() {
    this.board = new Board();
    this.state = this._initState();   // 2D array [row][col] of Piece|null
    this.currentTurn = 'white';
    this.selectedPiece = null;
    this.legalMoves = [];

    this._renderPieces();
    this._bindEvents();
    this._bindRestart();
  }

  // ── State init ─────────────────────────────────────────────────────────────

  _initState() {
    const s = Array.from({ length: 8 }, () => Array(8).fill(null));

    const backRow = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];

    backRow.forEach((PieceClass, col) => {
      s[0][col] = new PieceClass('black', 0, col);
      s[7][col] = new PieceClass('white', 7, col);
    });

    for (let col = 0; col < 8; col++) {
      s[1][col] = new Pawn('black', 1, col);
      s[6][col] = new Pawn('white', 6, col);
    }

    return s;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  _renderPieces() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = this.board.getSquare(row, col);
        const piece = this.state[row][col];
        sq.textContent = piece ? piece.symbol : '';
        sq.draggable = piece !== null;
      }
    }
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  _bindEvents() {
    this.board.boardEl.addEventListener('click', (e) => {
      const sq = e.target.closest('.square');
      if (!sq) return;
      const row = parseInt(sq.dataset.row);
      const col = parseInt(sq.dataset.col);
      this._handleClick(row, col);
    });
  }

  _bindRestart() {
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.restart();
    });
  }

  // ── Click logic ────────────────────────────────────────────────────────────

  _handleClick(row, col) {
    const piece = this.state[row][col];

    // If a piece is already selected
    if (this.selectedPiece) {
      const isLegal = this.legalMoves.some(m => m.row === row && m.col === col);

      if (isLegal) {
        this._movePiece(this.selectedPiece, row, col);
        this._deselect();
        return;
      }

      // Click on own piece → reselect
      if (piece && piece.color === this.currentTurn) {
        this._deselect();
        this._select(piece);
        return;
      }

      this._deselect();
      return;
    }

    // Select a piece of current player
    if (piece && piece.color === this.currentTurn) {
      this._select(piece);
    }
  }

  _select(piece) {
    this.selectedPiece = piece;
    this.legalMoves = piece.getLegalMoves(this.state);
    this.board.highlight(piece.row, piece.col, 'selected');

    for (const move of this.legalMoves) {
      const target = this.state[move.row][move.col];
      const type = target ? 'legal-capture' : 'legal-move';
      this.board.highlight(move.row, move.col, type);
    }
  }

  _deselect() {
    this.board.clearHighlights();
    this.selectedPiece = null;
    this.legalMoves = [];
  }

  // ── Move ───────────────────────────────────────────────────────────────────

  _movePiece(piece, toRow, toCol) {
    // Remove from current position
    this.state[piece.row][piece.col] = null;

    // Move to new position
    piece.row = toRow;
    piece.col = toCol;
    piece.hasMoved = true;
    this.state[toRow][toCol] = piece;

    this._renderPieces();
    this._switchTurn();
  }

  _switchTurn() {
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    const indicator = document.getElementById('turn-indicator');
    const icon = this.currentTurn === 'white' ? '⬜' : '⬛';
    const name = this.currentTurn === 'white' ? "White's turn" : "Black's turn";
    indicator.textContent = `${icon} ${name}`;
  }

  // ── Restart ────────────────────────────────────────────────────────────────

  restart() {
    this.state = this._initState();
    this.currentTurn = 'white';
    this.selectedPiece = null;
    this.legalMoves = [];
    this.board.clearHighlights();
    this._renderPieces();
    document.getElementById('turn-indicator').textContent = '⬜ White\'s turn';
  }
}

// ── Bootstrap ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
