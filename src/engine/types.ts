// =====================================================
// NUR SHAXMAT 100 — Asosiy turlar (Types)
// =====================================================

export type PieceType = 'King' | 'Queen' | 'Nur' | 'Rook' | 'Bishop' | 'Knight' | 'Pawn';
export type Color = 'white' | 'black';

// Ustun harflari: A B C N E D M F G H (chapdan o'ngga)
export const FILES = ['A', 'B', 'C', 'N', 'E', 'D', 'M', 'F', 'G', 'H'] as const;
export type File = typeof FILES[number];

// Qator raqamlari: 1 dan 10 gacha (pastdan yuqoriga, Oq tomoni)
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type Rank = typeof RANKS[number];

export interface Piece {
  type: PieceType;
  color: Color;
  id: string; // Noyob identifikator (harakatlanishi kuzatish uchun)
}

export interface Square {
  file: number; // 0–9 (A=0, B=1, C=2, N=3, E=4, D=5, M=6, F=7, G=8, H=9)
  rank: number; // 0–9 (rank 1 = index 0, rank 10 = index 9)
}

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  capturedPiece?: Piece;
  isEnPassant?: boolean;
  enPassantCaptureSquare?: Square;
  isCastling?: 'short' | 'medium' | 'long';
  rookFrom?: Square;
  rookTo?: Square;
  isPromotion?: boolean;
  promotionPiece?: PieceType;
  notation?: string;
}

export interface CastlingRights {
  whiteShort: boolean;   // 0-0: Shoh E1->C1, Tура A1->N1
  whiteMedium: boolean;  // -0-0-: Shoh E1->M1, Tura H1->D1
  whiteLong: boolean;    // 0-0-0: Shoh E1->G1, Tura H1->F1
  blackShort: boolean;
  blackMedium: boolean;
  blackLong: boolean;
}

export type Board = (Piece | null)[][];

export interface GameState {
  board: Board;
  currentTurn: Color;
  castlingRights: CastlingRights;
  enPassantTarget: Square | null;    // Yo'lda olish maqsadi
  enPassantPawnSquare: Square | null; // Yo'lda olinadigan piyodaning o'rni
  halfMoveClock: number;             // 50 ta harakatli qoida uchun
  fullMoveNumber: number;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  moveHistory: Move[];
  positionHistory: string[];         // Uch marta takrorlash uchun
  status: GameStatus;
  promotionPending: Square | null;   // Aylantirish kutilmoqda
  lastMove: Move | null;
  isInCheck: boolean;
}

export type GameStatus =
  | 'playing'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw_repetition'
  | 'draw_mutual'
  | 'draw_50move'
  | 'white_resigned'
  | 'black_resigned';

// Don qiymatlari
export const PIECE_VALUES: Record<PieceType, number> = {
  King: 9999,
  Queen: 9,
  Nur: 7,
  Rook: 5,
  Bishop: 3,
  Knight: 3,
  Pawn: 1,
};

// O'zbek notatsiyasidagi don belgilari
export const PIECE_SYMBOLS: Record<PieceType, string> = {
  King: 'Kr',
  Queen: 'F',
  Nur: 'Nr',
  Rook: 'L',
  Bishop: 'S',
  Knight: 'K',
  Pawn: 'p',
};

// Raqamli notatsiya: kvadrat indeksini 1-100 raqamiga aylantirish
// Rank 1: A1=1 ... H1=10; Rank 2: A2=11 ... H2=20 ... Rank 10: A10=91 ... H10=100
export function squareToNumeric(sq: Square): number {
  return sq.rank * 10 + sq.file + 1;
}

export function numericToSquare(n: number): Square {
  const idx = n - 1;
  return { file: idx % 10, rank: Math.floor(idx / 10) };
}

export function squareToAlgebraic(sq: Square): string {
  return `${FILES[sq.file]}${sq.rank + 1}`;
}

export function algebraicToSquare(alg: string): Square | null {
  const file = FILES.indexOf(alg[0] as File);
  const rank = parseInt(alg.slice(1)) - 1;
  if (file === -1 || isNaN(rank) || rank < 0 || rank > 9) return null;
  return { file, rank };
}

export function squaresEqual(a: Square, b: Square): boolean {
  return a.file === b.file && a.rank === b.rank;
}

export function isOnBoard(sq: Square): boolean {
  return sq.file >= 0 && sq.file <= 9 && sq.rank >= 0 && sq.rank <= 9;
}
