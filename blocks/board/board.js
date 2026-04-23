// Vestaboard character encoding — index = character code.
// Codes 0-62: printable characters. Codes 63-70: colour tiles.
const CODE_CHARS = [
  ' ', // 0: blank
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  '!', '@', '#', '$', '(', ')',
  '-', '-', ' ', '+', '&', '=', ';', ':',
  ' ', "'", '"', '%', ',', '.', ' ', ' ', '/',
  '?', ' ', '°',
];

// Colour tile CSS values for codes 63-70
const TILE_COLORS = {
  63: '#ff2c2c',
  64: '#ff8c00',
  65: '#ffe600',
  66: '#00c04b',
  67: '#00bcd4',
  68: '#2979ff',
  69: '#9c27b0',
  70: '#f0e6c8',
};

// Build reverse lookup: character → code
const CHAR_TO_CODE = { ' ': 0 };
CODE_CHARS.forEach((ch, code) => {
  if (ch.trim() && !CHAR_TO_CODE[ch]) CHAR_TO_CODE[ch] = code;
});

function charToCode(ch) {
  return CHAR_TO_CODE[ch.toUpperCase()] ?? 0;
}

function trimBlanks(codes) {
  let s = 0;
  let e = codes.length - 1;
  while (s <= e && codes[s] === 0) s += 1;
  while (e >= s && codes[e] === 0) e -= 1;
  return s > e ? [] : codes.slice(s, e + 1);
}

/**
 * Convert a text line (may contain {NN} inline colour codes) to an array of
 * Vestaboard character codes, padded/truncated to `cols`.
 */
function lineToRow(text, cols, align) {
  const raw = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === '{') {
      const end = text.indexOf('}', i + 1);
      if (end !== -1) {
        const n = parseInt(text.slice(i + 1, end), 10);
        if (!Number.isNaN(n) && n >= 0 && n <= 71) {
          raw.push(n);
          i = end + 1;
          // eslint-disable-next-line no-continue
          continue;
        }
      }
    }
    raw.push(charToCode(text[i]));
    i += 1;
  }

  while (raw.length < cols) raw.push(0);
  const clamped = raw.slice(0, cols);

  if (align === 'left') return clamped;

  const trimmed = trimBlanks(clamped);
  const pad = cols - trimmed.length;

  if (align === 'right') {
    return [...new Array(pad).fill(0), ...trimmed];
  }
  // center (default)
  const left = Math.floor(pad / 2);
  return [...new Array(left).fill(0), ...trimmed, ...new Array(pad - left).fill(0)];
}

/**
 * Count the number of display tiles a text string produces.
 * Each {NN} code counts as one tile; every other character counts as one.
 */
function countTiles(text) {
  return text.replace(/\{\d+\}/g, 'X').length;
}

function parseConfig(block) {
  const cfg = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const val = cells[1].textContent.trim();
    if (key && val) cfg[key] = val;
  });
  return cfg;
}

/**
 * Extract raw text lines from content rows (skipping two-cell config rows).
 */
function getRawLines(block) {
  const lines = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const isConfig = cells.length >= 2
      && cells[0].textContent.trim()
      && cells[1].textContent.trim();
    if (!isConfig) {
      lines.push(cells.map((c) => c.textContent.trim()).join(' ').trim());
    }
  });
  return lines;
}

function parseRows(rawLines, rows, cols, align) {
  const lines = [...rawLines];
  while (lines.length < rows) lines.push('');
  return lines.slice(0, rows).map((line) => lineToRow(line, cols, align));
}

// ── DOM helpers ──────────────────────────────────────────────

function createTile() {
  const tile = document.createElement('div');
  tile.className = 'board-tile';
  tile.dataset.code = '0';
  tile.innerHTML = `
    <div class="board-tile-top"><span> </span></div>
    <div class="board-tile-bottom"><span> </span></div>
    <div class="board-tile-fold-top"><span> </span></div>
    <div class="board-tile-fold-bottom"><span> </span></div>
  `;
  return tile;
}

function animateTile(tile, code) {
  const oldCode = parseInt(tile.dataset.code, 10);
  if (code === oldCode) return;

  const oldCh = (oldCode > 0 && oldCode < 63) ? (CODE_CHARS[oldCode] || ' ') : ' ';
  const newCh = (code > 0 && code < 63) ? (CODE_CHARS[code] || ' ') : ' ';

  tile.querySelector('.board-tile-fold-top span').textContent = oldCh;
  tile.querySelector('.board-tile-fold-bottom span').textContent = newCh;
  tile.querySelector('.board-tile-top span').textContent = newCh;
  tile.querySelector('.board-tile-bottom span').textContent = newCh;

  const color = TILE_COLORS[code];
  tile.dataset.code = String(code);
  tile.classList.toggle('board-tile-color', !!color);
  if (color) {
    tile.style.setProperty('--tile-color', color);
  } else {
    tile.style.removeProperty('--tile-color');
  }

  tile.classList.remove('is-flipping');
  void tile.offsetWidth; // eslint-disable-line no-void
  tile.classList.add('is-flipping');
  setTimeout(() => tile.classList.remove('is-flipping'), 700);
}

// ── Main export ──────────────────────────────────────────────

export default function decorate(block) {
  const cfg = parseConfig(block);
  const rawLines = getRawLines(block);

  const isNote = block.classList.contains('note');
  const isAuto = block.classList.contains('auto');
  const rows = isNote ? 3 : parseInt(cfg.rows || '6', 10);

  let cols;
  if (isAuto) {
    // Expand columns to fit the longest content line — never truncate text
    const maxTiles = rawLines.reduce((m, l) => Math.max(m, countTiles(l)), 0);
    cols = Math.max(maxTiles, isNote ? 15 : 22);
  } else {
    cols = isNote ? 15 : parseInt(cfg.cols || '22', 10);
  }

  let align = 'center';
  if (block.classList.contains('left')) align = 'left';
  else if (block.classList.contains('right')) align = 'right';

  const grid = parseRows(rawLines, rows, cols, align);

  const inner = document.createElement('div');
  inner.className = 'board-inner';

  const display = document.createElement('div');
  display.className = 'board-display';
  display.style.setProperty('--board-cols', String(cols));

  const allTiles = [];
  grid.forEach((rowCodes) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'board-row';
    rowCodes.forEach((code) => {
      const tile = createTile();
      rowEl.append(tile);
      allTiles.push({ tile, code });
    });
    display.append(rowEl);
  });

  // Apply colour tokens from config rows
  if (cfg.background) block.style.setProperty('--board-bg', cfg.background);
  if (cfg.housing) block.style.setProperty('--board-housing', cfg.housing);
  if (cfg.color) block.style.setProperty('--board-char-override', cfg.color);
  if (cfg.tile) {
    block.style.setProperty('--board-tile-top', cfg.tile);
    block.style.setProperty('--board-tile-bottom', cfg.tile);
  }
  if (cfg['tile-top']) block.style.setProperty('--board-tile-top', cfg['tile-top']);
  if (cfg['tile-bottom']) block.style.setProperty('--board-tile-bottom', cfg['tile-bottom']);

  inner.append(display);
  block.replaceChildren(inner);

  // Staggered reveal: each non-blank tile flips in left→right, row→row
  allTiles.forEach(({ tile, code }, i) => {
    if (code === 0) return;
    setTimeout(() => animateTile(tile, code), i * 20);
  });
}
