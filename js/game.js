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

  _moveLeavesKingInCheck(piece, toRow, toCol) {
    const simState = this.state.map(r => [...r]);
    simState[piece.row][piece.col] = null;
    const clone = Object.assign(Object.create(Object.getPrototypeOf(piece)), piece);
    clone.row = toRow;
    clone.col = toCol;
    simState[toRow][toCol] = clone;
    return this._isInCheck(piece.color, simState);
  }

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

    this.board.boardEl.addEventListener('dragstart', (e) => {
      const sq = e.target.closest('.square');
      if (!sq) return;
      const row = parseInt(sq.dataset.row);
      const col = parseInt(sq.dataset.col);
      const piece = this.state[row][col];
      if (!piece || piece.color !== this.currentTurn) {
        e.preventDefault();
        return;
      }
      this._deselect();
      this._select(piece);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', `${row},${col}`);
      sq.classList.add('dragging');
    });

    this.board.boardEl.addEventListener('dragend', (e) => {
      const sq = e.target.closest('.square');
      if (sq) sq.classList.remove('dragging');
    });

    this.board.boardEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    this.board.boardEl.addEventListener('drop', (e) => {
      e.preventDefault();
      const sq = e.target.closest('.square');
      if (!sq) return;
      const toRow = parseInt(sq.dataset.row);
      const toCol = parseInt(sq.dataset.col);
      if (!this.selectedPiece) return;
      const isLegal = this.legalMoves.some(m => m.row === toRow && m.col === toCol);
      if (isLegal) {
        this._movePiece(this.selectedPiece, toRow, toCol);
      }
      this._deselect();
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

  async _movePiece(piece, toRow, toCol) {
    const fromRow = piece.row;
    const fromCol = piece.col;
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

    // Castling — move the rook too
    if (piece instanceof King) {
      const colDiff = toCol - fromCol;
      if (colDiff === 2) {
        const rook = this.state[toRow][7];
        if (rook) {
          this.state[toRow][7] = null;
          rook.col = 5;
          rook.hasMoved = true;
          this.state[toRow][5] = rook;
        }
      } else if (colDiff === -2) {
        const rook = this.state[toRow][0];
        if (rook) {
          this.state[toRow][0] = null;
          rook.col = 3;
          rook.hasMoved = true;
          this.state[toRow][3] = rook;
        }
      }
    }

    // Pawn promotion
    if (piece instanceof Pawn && (toRow === 0 || toRow === 7)) {
      await this._handlePromotion(piece);
    }

    this._renderPieces();
    this._highlightLastMove(fromRow, fromCol, toRow, toCol);
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

  // ── Highlights ─────────────────────────────────────────────────────────────

  _highlightLastMove(fromRow, fromCol, toRow, toCol) {
    document.querySelectorAll('.last-move').forEach(el => el.classList.remove('last-move'));
    this.board.getSquare(fromRow, fromCol).classList.add('last-move');
    this.board.getSquare(toRow, toCol).classList.add('last-move');
  }

  _highlightKingInCheck(color) {
    document.querySelectorAll('.in-check').forEach(el => el.classList.remove('in-check'));
    const king = this._findKing(color, this.state);
    if (king) {
      this.board.getSquare(king.row, king.col).classList.add('in-check');
    }
  }

  // ── Promotion ──────────────────────────────────────────────────────────────

  _handlePromotion(piece) {
    return new Promise((resolve) => {
      const choices = piece.color === 'white'
        ? ['♕','♖','♗','♘']
        : ['♛','♜','♝','♞'];
      const classes = [Queen, Rook, Bishop, Knight];

      const modal = document.createElement('div');
      modal.className = 'promotion-modal';

      choices.forEach((sym, i) => {
        const span = document.createElement('span');
        span.textContent = sym;
        span.title = classes[i].name;
        span.addEventListener('click', () => {
          const newPiece = new classes[i](piece.color, piece.row, piece.col);
          this.state[piece.row][piece.col] = newPiece;
          this._renderPieces();
          document.body.removeChild(modal);
          resolve();
        });
        modal.appendChild(span);
      });

      document.body.appendChild(modal);
    });
  }

  // ── Turn & game state ──────────────────────────────────────────────────────

  _switchTurn() {
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    const icon = this.currentTurn === 'white' ? '⬜' : '⬛';
    const name = this.currentTurn === 'white' ? "White's turn" : "Black's turn";
    document.getElementById('turn-indicator').textContent = `${icon} ${name}`;
  }

  _checkGameState() {
    const color = this.currentTurn;
    const indicator = document.getElementById('turn-indicator');

    document.querySelectorAll('.in-check').forEach(el => el.classList.remove('in-check'));
    indicator.classList.remove('in-check');

    if (this._isCheckmate(color)) {
      const winner = color === 'white' ? 'Black' : 'White';
      setTimeout(() => alert(`Checkmate! ${winner} wins! 🏆`), 100);
      return;
    }

    if (this._isStalemate(color)) {
      setTimeout(() => alert("Stalemate! It's a draw! 🤝"), 100);
      return;
    }

    if (this._isInCheck(color, this.state)) {
      this._highlightKingInCheck(color);
      indicator.classList.add('in-check');
      indicator.textContent = `${color === 'white' ? '⬜' : '⬛'} ${color === 'white' ? 'White' : 'Black'} is in CHECK! ⚠️`;
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
    document.getElementById('turn-indicator').classList.remove('in-check');
    document.getElementById('captured-white').innerHTML = '';
    document.getElementById('captured-black').innerHTML = '';
    document.getElementById('move-history').innerHTML = '';
    document.querySelectorAll('.last-move, .in-check').forEach(el => {
      el.classList.remove('last-move', 'in-check');
    });
  }
}

// ── Bootstrap ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
