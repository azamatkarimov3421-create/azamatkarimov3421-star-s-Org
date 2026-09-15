// =====================================================
// NUR SHAXMAT 100 — Minimax AI raqib (Tezkor va Yengil)
// =====================================================

import { GameState, Move, PieceType } from '../engine/types';
import { getAllLegalMovesFromState, applyMove } from '../engine/gameLogic';
import { getCastlingMoves } from '../engine/castling';

const PIECE_VALUES: Record<PieceType, number> = {
  King: 9999,
  Queen: 9,
  Nur: 7,
  Rook: 5,
  Bishop: 3,
  Knight: 3,
  Pawn: 1,
};

// Don-kvadrat jadvallari (pozitsion bonus)
const PAWN_TABLE_WHITE = [
  [0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,2,2,2,2,2,2,1,1],
  [1,2,2,3,3,3,3,2,2,1],
  [1,2,3,4,4,4,4,3,2,1],
  [2,3,4,5,5,5,5,4,3,2],
  [2,3,4,5,6,6,5,4,3,2],
  [3,4,5,6,7,7,6,5,4,3],
  [4,5,6,7,8,8,7,6,5,4],
  [5,5,5,5,5,5,5,5,5,5],
];

const CENTER_TABLE = [
  [0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,2,2,2,2,2,2,1,0],
  [0,1,2,3,3,3,3,2,1,0],
  [0,1,2,3,4,4,3,2,1,0],
  [0,1,2,3,4,4,3,2,1,0],
  [0,1,2,3,3,3,3,2,1,0],
  [0,1,2,2,2,2,2,2,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0],
];

function evaluateBoard(state: GameState): number {
  let score = 0;

  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const piece = state.board[r][f];
      if (!piece || piece.type === 'King') continue;

      const value = PIECE_VALUES[piece.type];
      const tableRow = piece.color === 'white' ? r : 9 - r;
      const posBonus = piece.type === 'Pawn'
        ? PAWN_TABLE_WHITE[tableRow][f] * 0.1
        : CENTER_TABLE[tableRow][f] * 0.1;

      if (piece.color === 'white') {
        score += value + posBonus;
      } else {
        score -= value + posBonus;
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

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  if (depth === 0 || state.status !== 'playing' && state.status !== 'check') {
    if (state.status === 'checkmate') {
      return maximizing ? -99999 : 99999;
    }
    if (state.status === 'stalemate') return 0;
    return evaluateBoard(state);
  }

  const moves = getAllMovesFor(state);
  if (moves.length === 0) {
    return evaluateBoard(state);
  }

  // Harakatlarni saralash (yeyish harakatlarini birinchi)
  const sortedMoves = [...moves].sort((a, b) => {
    const aVal = a.capturedPiece ? PIECE_VALUES[a.capturedPiece.type] : 0;
    const bVal = b.capturedPiece ? PIECE_VALUES[b.capturedPiece.type] : 0;
    return bVal - aVal;
  });

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of sortedMoves) {
      const newState = applyMove(state, move);
      const evaluation = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of sortedMoves) {
      const newState = applyMove(state, move);
      const evaluation = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * AI ning eng yaxshi harakatini topadi (O'ta tezkor)
 */
export function getBestMove(state: GameState, depth: number = 2): Move | null {
  const moves = getAllMovesFor(state);
  if (moves.length === 0) return null;

  const isMaximizing = state.currentTurn === 'white';
  let bestMove: Move | null = null;
  let bestValue = isMaximizing ? -Infinity : Infinity;

  const sortedMoves = [...moves].sort((a, b) => {
    const aVal = a.capturedPiece ? PIECE_VALUES[a.capturedPiece.type] : 0;
    const bVal = b.capturedPiece ? PIECE_VALUES[b.capturedPiece.type] : 0;
    return bVal - aVal;
  });

  for (const move of sortedMoves) {
    const newState = applyMove(state, move);
    const value = minimax(newState, Math.min(depth, 2), -Infinity, Infinity, !isMaximizing);

    if (isMaximizing ? value > bestValue : value < bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove;
}
