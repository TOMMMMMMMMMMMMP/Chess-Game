class Board {
  constructor() {
    this.boardEl    = document.getElementById('board');
    this.colLabels  = document.getElementById('col-labels');
    this.rowLabels  = document.getElementById('row-labels');
    this._buildLabels();
    this._buildSquares();
  }

  // Build column labels a-h
  _buildLabels() {
    const cols = ['a','b','c','d','e','f','g','h'];
    cols.forEach(c => {
      const span = document.createElement('span');
      span.textContent = c;
      this.colLabels.appendChild(span);
    });

    // Row labels 8 → 1
    for (let r = 8; r >= 1; r--) {
      const span = document.createElement('span');
      span.textContent = r;
      this.rowLabels.appendChild(span);
    }
  }

  // Build 64 squares
  _buildSquares() {
    this.boardEl.innerHTML = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = document.createElement('div');
        sq.classList.add('square');
        sq.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
        sq.dataset.row = row;
        sq.dataset.col = col;
        this.boardEl.appendChild(sq);
      }
    }
  }

  // Get a square element by row/col
  getSquare(row, col) {
    return this.boardEl.querySelector(
      `.square[data-row="${row}"][data-col="${col}"]`
    );
  }

  // Clear all highlights
  clearHighlights() {
    document.querySelectorAll('.square').forEach(sq => {
      sq.classList.remove('selected', 'legal-move', 'legal-capture');
    });
  }

  // Place a piece symbol on a square
  renderPiece(row, col, symbol) {
    const sq = this.getSquare(row, col);
    if (sq) sq.textContent = symbol || '';
  }

  // Render all pieces from a 2D array
  renderAll(grid) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = grid[r][c];
        this.renderPiece(r, c, piece ? piece.symbol : '');
      }
    }
  }
}
