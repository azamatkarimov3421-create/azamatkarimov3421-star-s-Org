// =====================================================
// NUR SHAXMAT 100 — Yuqori Tezlikdagi Minimax AI (0 Freeze)
// =====================================================

import { GameState, Move, PieceType } from '../engine/types';
import { getAllLegalMovesFromState, applyMove } from '../engine/gameLogic';
import { getCastlingMoves } from '../engine/castling';

const PIECE_VALUES: Record<PieceType, number> = {
  King: 9999,
  Queen: 9.5,
  Nur: 7.5,
  Rook: 5.0,
  Bishop: 3.2,
  Knight: 3.1,
  Pawn: 1.0,
};

// 10x10 Dosqa uchun Pozitsion Baholash Jadvallari
const PAWN_TABLE_WHITE = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 2, 2, 2, 2, 2, 2, 1, 1],
  [1, 2, 2, 3, 3, 3, 3, 2, 2, 1],
  [1, 2, 3, 4, 4, 4, 4, 3, 2, 1],
  [2, 3, 4, 5, 5, 5, 5, 4, 3, 2],
  [2, 3, 4, 5, 6, 6, 5, 4, 3, 2],
  [3, 4, 5, 6, 7, 7, 6, 5, 4, 3],
  [5, 6, 7, 8, 9, 9, 8, 7, 6, 5],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const PIECE_CENTER_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
  [0, 1, 2, 3, 3, 3, 3, 2, 1, 0],
  [0, 1, 2, 3, 4, 4, 3, 2, 1, 0],
  [0, 1, 2, 3, 4, 4, 3, 2, 1, 0],
  [0, 1, 2, 3, 3, 3, 3, 2, 1, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function evaluateBoard(state: GameState): number {
  let score = 0;

  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const piece = state.board[r][f];
      if (!piece) continue;
      if (piece.type === 'King') continue;

      const val = PIECE_VALUES[piece.type] || 1;
      const row = piece.color === 'white' ? r : 9 - r;
      const bonus = piece.type === 'Pawn'
        ? PAWN_TABLE_WHITE[row][f] * 0.08
        : PIECE_CENTER_TABLE[row][f] * 0.06;

      if (piece.color === 'white') {
        score += val + bonus;
      } else {
        score -= (val + bonus);
      }
    }
  }

  return score;
}

function getAllMovesFor(state: GameState): Move[] {
  try {
    return [...getAllLegalMovesFromState(state), ...getCastlingMoves(state)];
  } catch {
    return [];
  }
}

// Harakatlarni saralash: yeyish va oldinga siljish birinchi
function scoreMove(m: Move): number {
  let score = 0;
  if (m.capturedPiece) {
    score += (PIECE_VALUES[m.capturedPiece.type] || 1) * 10 - (PIECE_VALUES[m.piece.type] || 1);
  }
  if (m.isPromotion) score += 90;
  if (m.piece.type === 'Nur') score += 2; // Nur faolligi
  return score;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  if (depth === 0 || state.status !== 'playing' && state.status !== 'check') {
    if (state.status === 'checkmate') return maximizing ? -9999 : 9999;
    if (state.status === 'stalemate') return 0;
    return evaluateBoard(state);
  }

  const moves = getAllMovesFor(state);
  if (moves.length === 0) return evaluateBoard(state);

  // Faqat eng istiqbolli harakatlarni ko'rib chiqish (10x10 da qotib qolmaslik uchun)
  moves.sort((a, b) => scoreMove(b) - scoreMove(a));
  const candidateMoves = moves.slice(0, 16);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of candidateMoves) {
      const nextState = applyMove(state, move);
      const val = minimax(nextState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of candidateMoves) {
      const nextState = applyMove(state, move);
      const val = minimax(nextState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * AI ning eng yaxshi harakatini topadi (0 freeze, o'ta silliq)
 * @param state - Hozirgi holat
 * @param level - AI darajasi (1=Oson, 2=O'rta, 3=Kuchli)
 */
export function getBestMove(state: GameState, level: number = 2): Move | null {
  const moves = getAllMovesFor(state);
  if (moves.length === 0) return null;

  // Harakatlarni muhimligi bo'yicha tartiblash
  moves.sort((a, b) => scoreMove(b) - scoreMove(a));

  const isWhite = state.currentTurn === 'white';
  let bestMove: Move | null = moves[0];
  let bestValue = isWhite ? -Infinity : Infinity;

  // Qidirish chuqurligi:
  // 1 (Oson): 1 qadam
  // 2 (O'rta): 1 qadam + chuqur yeyish tahlili
  // 3 (Kuchli): 2 qadam alfa-beta
  const searchDepth = level >= 3 ? 2 : 1;
  const candidateMoves = moves.slice(0, level >= 3 ? 22 : 14);

  for (const move of candidateMoves) {
    const nextState = applyMove(state, move);
    const value = searchDepth > 1
      ? minimax(nextState, searchDepth - 1, -Infinity, Infinity, !isWhite)
      : evaluateBoard(nextState);

    if (isWhite ? value > bestValue : value < bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove;
}
