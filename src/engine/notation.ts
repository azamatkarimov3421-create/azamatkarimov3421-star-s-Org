// =====================================================
// NUR SHAXMAT 100 — Notatsiya generatori (O'zbek tili)
// =====================================================

import { FILES, GameState, Move, PIECE_SYMBOLS, Square, squareToAlgebraic, squareToNumeric } from './types';

/**
 * Harakat notatsiyasini yaratadi
 * Misol: pN2-N5, Nr N1-N4, 0-0, -0-0-, 0-0-0
 * Aylantirish: pE9-E10=F (Vazirga aylantirish)
 * Shoh: + belgisi
 * Shohmat: x belgisi
 */
export function generateMoveNotation(state: GameState, move: Move, useNumeric = false): string {
  // Rokirovka
  if (move.isCastling) {
    return move.notation || (move.isCastling === 'short' ? '0-0' : move.isCastling === 'medium' ? '-0-0-' : '0-0-0');
  }

  const pieceSymbol = PIECE_SYMBOLS[move.piece.type];
  const fromStr = useNumeric
    ? String(squareToNumeric(move.from))
    : squareToAlgebraic(move.from);
  const toStr = useNumeric
    ? String(squareToNumeric(move.to))
    : squareToAlgebraic(move.to);

  let notation = '';

  // Piyoda uchun maxsus format
  if (move.piece.type === 'Pawn') {
    notation = `p${fromStr}-${toStr}`;
    if (move.isEnPassant) notation += 'e.p.';
    if (move.isPromotion && move.promotionPiece) {
      notation += `=${PIECE_SYMBOLS[move.promotionPiece]}`;
    }
  } else {
    notation = `${pieceSymbol} ${fromStr}-${toStr}`;
    if (move.capturedPiece) {
      // Yeyish belgisi (oldingi joyni ham ko'rsatish)
      notation = `${pieceSymbol} ${fromStr}x${toStr}`;
    }
  }

  return notation;
}

/**
 * To'liq harakatlar tarixini formatlash
 * Misol: 1. pN2-N5 pN9-N6
 *        2. Nr N1-N4 ...
 */
export function formatMoveHistory(moves: Move[], useNumeric = false): string[] {
  const lines: string[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const whiteMove = moves[i]?.notation || '...';
    const blackMove = moves[i + 1]?.notation || '';
    lines.push(`${moveNum}. ${whiteMove}${blackMove ? ' ' + blackMove : ''}`);
  }
  return lines;
}

export function getSquareLabel(sq: Square, useNumeric: boolean): string {
  if (useNumeric) return String(squareToNumeric(sq));
  return squareToAlgebraic(sq);
}
