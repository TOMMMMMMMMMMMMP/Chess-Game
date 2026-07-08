class Game {
  constructor() {
    this.board = new Board();
    this.state = this._initState();
    this.currentTurn = 'white';
    this.selectedPiece = null;
    this.legalMoves = [];
    this.moveHistory = [];

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

  // ── Check detection ────────────────────────────────────────────────────────

  _findKing(color, boardState) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = boardState[row][col];
        if (p && p.color === color && p instanceof King) {
          return { row, col };
        }
      }
    }
    return null;
  }

  _isInCheck(color, boardState) {
    const king = this._findKing(color, boardState);
    if (!king) return false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = boardState[row][col];
        if (p && p.color !== color) {
          const moves = p.getLegalMoves(boardState);
          if (moves.some(m => m.row === king.row && m.col === king.col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /** Simulate a move and return true if it leaves own king in check */
  _moveLeavesKingInCheck(piece, toRow, toCol) {
    const simState = this.state.map(r => [...r]);
    simState[piece.row][piece.col] = null;
    const clone = Object.assign(Object.create(Object.getPrototypeOf(piece)), piece);
    clone.row = toRow;
    clone.col = toCol;
    simState[toRow][toCol] = clone;
    return this._isInCheck(piece.color, simState);
  }

  /** Get legal moves filtered to only those that don't leave king in check */
  _getSafeMoves(piece) {
    const raw = piece.getLegalMoves(this.state);
    return raw.filter(m => !this._moveLeavesKingInCheck(piece, m.row, m.col));
  }

  _isCheckmate(color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = this.state[row][col];
        if (p && p.color === color) {
          if (this._getSafeMoves(p).length > 0) return false;
        }
      }
    }
    return true;
  }

  _isStalemate(color) {
    if (this._isInCheck(color, this.state)) return false;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = this.state[row][col];
        if (p && p.color === color) {
          if (this._getSafeMoves(p).length > 0) return false;
        }
      }
    }
    return true;
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
    document.getElementById('restart-btn').addEventListener('click', () => this.restart());
  }

  // ── Click logic ────────────────────────────────────────────────────────────

  _handleClick(row, col) {
    const piece = this.state[row][col];

    if (this.selectedPiece) {
      const isLegal = this.legalMoves.some(m => m.row === row && m.col === col);
      if (isLegal) {
        this._movePiece(this.selectedPiece, row, col);
        this._deselect();
        return;
      }
      if (piece && piece.color === this.currentTurn) {
        this._deselect();
        this._select(piece);
        return;
      }
      this._deselect();
      return;
    }

    if (piece && piece.color === this.currentTurn) {
      this._select(piece);
    }
  }

  _select(piece) {
    this.selectedPiece = piece;
    this.legalMoves = this._getSafeMoves(piece);
    this.board.highlight(piece.row, piece.col, 'selected');
    for (const move of this.legalMoves) {
      const target = this.state[move.row][move.col];
      this.board.highlight(move.row, move.col, target ? 'legal-capture' : 'legal-move');
    }
  }

  _deselect() {
    this.board.clearHighlights();
    this.selectedPiece = null;
    this.legalMoves = [];
  }

  // ── Move ───────────────────────────────────────────────────────────────────

  _colToFile(col) {
    return ['a','b','c','d','e','f','g','h'][col];
  }

  _movePiece(piece, toRow, toCol) {
    const captured = this.state[toRow][toCol];
    const fromNotation = `${this._colToFile(piece.col)}${8 - piece.row}`;
    const toNotation   = `${this._colToFile(toCol)}${8 - toRow}`;
    const notation = `${piece.symbol} ${fromNotation}→${toNotation}${captured ? ' x' + captured.symbol : ''}`;

    if (captured) this._addCaptured(captured);

    this.state[piece.row][piece.col] = null;
    piece.row = toRow;
    piece.col = toCol;
    piece.hasMoved = true;
    this.state[toRow][toCol] = piece;

    this._renderPieces();
    this._addMoveHistory(notation);
    this._switchTurn();
    this._checkGameState();
  }

  // ── Captured pieces ────────────────────────────────────────────────────────

  _addCaptured(piece) {
    const id = piece.color === 'white' ? 'captured-white' : 'captured-black';
    const el = document.getElementById(id);
    const span = document.createElement('span');
    span.textContent = piece.symbol;
    el.appendChild(span);
  }

  // ── Move history ───────────────────────────────────────────────────────────

  _addMoveHistory(notation) {
    this.moveHistory.push(notation);
    const el = document.getElementById('move-history');
    const entry = document.createElement('div');
    entry.className = 'move-entry';
    entry.textContent = `${this.moveHistory.length}. ${notation}`;
    el.appendChild(entry);
    el.scrollTop = el.scrollHeight;
  }

  // ── Turn & game state ──────────────────────────────────────────────────────

  _switchTurn() {
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    const icon = this.currentTurn === 'white' ? '⬜' : '⬛';
    document.getElementById('turn-indicator').textContent = `${icon} ${this.currentTurn === 'white' ? "White's turn" : "Black's turn"}`;
  }

  _checkGameState() {
    const color = this.currentTurn;

    if (this._isCheckmate(color)) {
      const winner = color === 'white' ? 'Black' : 'White';
      setTimeout(() => {
        alert(`Checkmate! ${winner} wins! 🏆`);
      }, 100);
      return;
    }

    if (this._isStalemate(color)) {
      setTimeout(() => {
        alert("Stalemate! It's a draw! 🤝");
      }, 100);
      return;
    }

    if (this._isInCheck(color, this.state)) {
      document.getElementById('turn-indicator').textContent =
        `${color === 'white' ? '⬜' : '⬛'} ${color === 'white' ? "White" : "Black"} is in CHECK! ⚠️`;
    }
  }

  // ── Restart ────────────────────────────────────────────────────────────────

  restart() {
    this.state = this._initState();
    this.currentTurn = 'white';
    this.selectedPiece = null;
    this.legalMoves = [];
    this.moveHistory = [];
    this.board.clearHighlights();
    this._renderPieces();
    document.getElementById('turn-indicator').textContent = "⬜ White's turn";
    document.getElementById('captured-white').innerHTML = '';
    document.getElementById('captured-black').innerHTML = '';
    document.getElementById('move-history').innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
