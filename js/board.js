class Board {
  /**
   * Manages the visual rendering of the 8x8 chess board.
   * Generates squares dynamically and handles coordinate labels.
   */
  constructor() {
    this.boardEl = document.getElementById('board');
    this.squares = []; // 2D array [row][col] of DOM elements
    this._buildLabels();
    this._buildSquares();
  }

    _buildLabels() {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    // Top labels (columns a-h)
    const topEl = document.querySelector('.board-labels-top');
    topEl.innerHTML = ''; // clear any existing content

    const spacer = document.createElement('div');
    spacer.style.width = '24px';
    topEl.appendChild(spacer);

    files.forEach(f => {
        const label = document.createElement('div');
        label.className = 'coord-label-top';
        label.textContent = f;
        topEl.appendChild(label);
    });

    // Left labels (rows 8 down to 1)
    const leftEl = document.querySelector('.board-labels-left');
    leftEl.innerHTML = ''; // clear any existing content

    for (let row = 0; row < 8; row++) {
        const label = document.createElement('div');
        label.className = 'coord-label';
        label.textContent = 8 - row;
        leftEl.appendChild(label);
    }
    }

  _buildSquares() {
    this.boardEl.innerHTML = '';
    this.squares = [];

    for (let row = 0; row < 8; row++) {
      this.squares[row] = [];
      for (let col = 0; col < 8; col++) {
        const sq = document.createElement('div');
        sq.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
        sq.dataset.row = row;
        sq.dataset.col = col;
        this.boardEl.appendChild(sq);
        this.squares[row][col] = sq;
      }
    }
  }

  getSquare(row, col) {
    return this.squares[row][col];
  }

  clearHighlights() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = this.squares[row][col];
        sq.classList.remove('selected', 'legal-move', 'legal-capture');
      }
    }
  }

  highlight(row, col, type) {
    // type: 'selected' | 'legal-move' | 'legal-capture'
    this.squares[row][col].classList.add(type);
  }
}
