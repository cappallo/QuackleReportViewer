export const BOARD_SIZE = 15;

export enum SquareType {
  NORMAL,
  TW, // Triple Word
  DW, // Double Word
  TL, // Triple Letter
  DL, // Double Letter
  CENTER // Center Star (also DW)
}

// Scrabble Board Layout
// 0,0 is top-left (A1)
const _layout: number[][] = [
  [1, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 1],
  [0, 2, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 2, 0],
  [0, 0, 2, 0, 0, 0, 4, 0, 4, 0, 0, 0, 2, 0, 0],
  [4, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 2, 0, 0, 4],
  [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
  [0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0],
  [0, 0, 4, 0, 0, 0, 4, 0, 4, 0, 0, 0, 4, 0, 0],
  [1, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 4, 0, 0, 1], // Center at 7,7
  [0, 0, 4, 0, 0, 0, 4, 0, 4, 0, 0, 0, 4, 0, 0],
  [0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0],
  [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
  [4, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 2, 0, 0, 4],
  [0, 0, 2, 0, 0, 0, 4, 0, 4, 0, 0, 0, 2, 0, 0],
  [0, 2, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 2, 0],
  [1, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 1],
];

// Mapping helper
export const getSquareType = (row: number, col: number): SquareType => {
  const val = _layout[row][col];
  switch (val) {
    case 1: return SquareType.TW;
    case 2: return SquareType.DW;
    case 3: return SquareType.TL;
    case 4: return SquareType.DL;
    case 5: return SquareType.CENTER;
    default: return SquareType.NORMAL;
  }
};

export const TILE_SCORES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
  '?': 0, ' ': 0
};
