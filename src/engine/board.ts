// =====================================================
// NUR SHAXMAT 100 — Doskani boshlang'ich holga keltirish
// =====================================================

import { Board, CastlingRights, Color, GameState, Piece, Square } from './types';

let pieceIdCounter = 0;
function newPiece(type: Piece['type'], color: Piece['color']): Piece {
  return { type, color, id: `${type}-${color}-${pieceIdCounter++}` };
}

/**
 * Boshlang'ich doskani yaratadi
 * Oq: 1-2 qatorlar; Qora: 9-10 qatorlar
 *
 * Ustunlar: A(0) B(1) C(2) N(3) E(4) D(5) M(6) F(7) G(8) H(9)
 *
 * Oq Rank 1 (index 0):
 *   A1: Tura (L), B1: Ot (K), C1: Fil (S), N1: Nur (Nr),
 *   E1: Shoh (Kr), D1: Vazir (F), M1: Nur (Nr), F1: Fil (S),
 *   G1: Ot (K), H1: Tura (L)
 */
export function createInitialBoard(): Board {
  pieceIdCounter = 0;
  // 10 satr, 10 ustun — [rank][file]
  const board: Board = Array.from({ length: 10 }, () => Array(10).fill(null));

  // ── OQ DONLAR ──────────────────────────────────────────
  // Rank 1 (index 0)
  board[0][0] = newPiece('Rook', 'white');    // A1
  board[0][1] = newPiece('Knight', 'white');  // B1
  board[0][2] = newPiece('Bishop', 'white');  // C1
  board[0][3] = newPiece('Nur', 'white');     // N1
  board[0][4] = newPiece('King', 'white');    // E1
  board[0][5] = newPiece('Queen', 'white');   // D1
  board[0][6] = newPiece('Nur', 'white');     // M1
  board[0][7] = newPiece('Bishop', 'white');  // F1
  board[0][8] = newPiece('Knight', 'white');  // G1
  board[0][9] = newPiece('Rook', 'white');    // H1

  // Rank 2 (index 1) — 10 ta Oq Piyoda
  for (let f = 0; f < 10; f++) {
    board[1][f] = newPiece('Pawn', 'white');
  }

  // ── QORA DONLAR ────────────────────────────────────────
  // Rank 9 (index 8) — 10 ta Qora Piyoda
  for (let f = 0; f < 10; f++) {
    board[8][f] = newPiece('Pawn', 'black');
  }

  // Rank 10 (index 9) — Simmetrik tartib
  board[9][0] = newPiece('Rook', 'black');    // A10
  board[9][1] = newPiece('Knight', 'black');  // B10
  board[9][2] = newPiece('Bishop', 'black');  // C10
  board[9][3] = newPiece('Nur', 'black');     // N10
  board[9][4] = newPiece('King', 'black');    // E10
  board[9][5] = newPiece('Queen', 'black');   // D10
  board[9][6] = newPiece('Nur', 'black');     // M10
  board[9][7] = newPiece('Bishop', 'black');  // F10
  board[9][8] = newPiece('Knight', 'black');  // G10
  board[9][9] = newPiece('Rook', 'black');    // H10

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
}

export function createInitialCastlingRights(): CastlingRights {
  return {
    whiteShort: true,
    whiteMedium: true,
    whiteLong: true,
    blackShort: true,
    blackMedium: true,
    blackLong: true,
  };
}

export function createInitialGameState(): GameState {
  const board = createInitialBoard();
  return {
    board,
    currentTurn: 'white',
    castlingRights: createInitialCastlingRights(),
    enPassantTarget: null,
    enPassantPawnSquare: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    capturedByWhite: [],
    capturedByBlack: [],
    moveHistory: [],
    positionHistory: [],
    status: 'playing',
    promotionPending: null,
    lastMove: null,
    isInCheck: false,
  };
}

export function getPiece(board: Board, sq: Square): Piece | null {
  if (sq.rank < 0 || sq.rank > 9 || sq.file < 0 || sq.file > 9) return null;
  return board[sq.rank][sq.file];
}

export function setPiece(board: Board, sq: Square, piece: Piece | null): void {
  board[sq.rank][sq.file] = piece;
}

export function findKing(board: Board, color: Color): Square | null {
  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const p = board[r][f];
      if (p && p.type === 'King' && p.color === color) {
        return { file: f, rank: r };
      }
    }
  }
  return null;
}
