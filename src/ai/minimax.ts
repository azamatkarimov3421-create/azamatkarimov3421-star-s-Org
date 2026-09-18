// =====================================================
// NUR SHAXMAT 100 — Professional Grossmeyster AI Dvigateli
// - Debyutlar kitobi (O\'zbekcha himoya va markaziy variantlar)
// - Alfa-Beta qirqish (Alpha-Beta Pruning)
// - Transposition Table (Pozitsiyalar kesh xotirasi)
// - Harakatlarni aqlli saralash (MVV-LVA + Killer + History)
// - Quiescence Search (Tinchlanish qidiruvi - xatoni oldini oladi)
// - Shax kengaytmasi (Check Extension)
// - Nur donasi va Shoh xavfsizligi chuqur evristikasi
// =====================================================

import { GameState, Move, PieceType, Square } from '../engine/types';
import { getAllLegalMovesFromState, applyMove } from '../engine/gameLogic';
import { getCastlingMoves } from '../engine/castling';
import { getFirstBotMove, getFirstBotMoveAsync } from '../first_bot/bridge';

// Donalarning moddiy qiymatlari (10x10 doska uchun kalibrlangan)
const PIECE_VALUES: Record<PieceType, number> = {
  King: 20000,
  Queen: 980,
  Nur: 780,
  Rook: 520,
  Bishop: 335,
  Knight: 325,
  Pawn: 100,
};

// 10x10 Piyoda doska jadvali (Oqlar uchun, pastdan yuqoriga)
const PST_PAWN: number[][] = [
  [0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
  [0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
  [5,  10,  15,  25,  30,  30,  25,  15,  10,   5],
  [10, 15,  25,  40,  45,  45,  40,  25,  15,  10],
  [15, 20,  35,  55,  65,  65,  55,  35,  20,  15],
  [25, 30,  45,  70,  80,  80,  70,  45,  30,  25],
  [40, 50,  65,  90, 105, 105,  90,  65,  50,  40],
  [70, 80,  95, 120, 135, 135, 120,  95,  80,  70],
  [120,130, 145, 170, 190, 190, 170, 145, 130, 120],
  [0,   0,   0,   0,   0,   0,   0,   0,   0,   0]
];

// 10x10 Ot jadvali
const PST_KNIGHT: number[][] = [
  [-40, -25, -15, -10, -10, -10, -10, -15, -25, -40],
  [-25, -10,   0,   5,  10,  10,   5,   0, -10, -25],
  [-15,   0,  15,  25,  30,  30,  25,  15,   0, -15],
  [-10,   5,  25,  40,  45,  45,  40,  25,   5, -10],
  [-10,  10,  30,  45,  55,  55,  45,  30,  10, -10],
  [-10,  10,  30,  45,  55,  55,  45,  30,  10, -10],
  [-10,   5,  25,  40,  45,  45,  40,  25,   5, -10],
  [-15,   0,  15,  25,  30,  30,  25,  15,   0, -15],
  [-25, -10,   0,   5,  10,  10,   5,   0, -10, -25],
  [-40, -25, -15, -10, -10, -10, -10, -15, -25, -40]
];

// 10x10 Nur donasi jadvali (Markaz va flanglar harakatchanligi)
const PST_NUR: number[][] = [
  [-20, -10,  -5,   0,   5,   5,   0,  -5, -10, -20],
  [-10,   5,  10,  20,  25,  25,  20,  10,   5, -10],
  [ -5,  10,  25,  35,  40,  40,  35,  25,  10,  -5],
  [  0,  20,  35,  50,  60,  60,  50,  35,  20,   0],
  [  5,  25,  40,  60,  70,  70,  60,  40,  25,   5],
  [  5,  25,  40,  60,  70,  70,  60,  40,  25,   5],
  [  0,  20,  35,  50,  60,  60,  50,  35,  20,   0],
  [ -5,  10,  25,  35,  40,  40,  35,  25,  10,  -5],
  [-10,   5,  10,  20,  25,  25,  20,  10,   5, -10],
  [-20, -10,  -5,   0,   5,   5,   0,  -5, -10, -20]
];

// 10x10 Fil jadvali
const PST_BISHOP: number[][] = [
  [-20, -10, -10, -10, -10, -10, -10, -10, -10, -20],
  [-10,   5,   0,   0,   5,   5,   0,   0,   5, -10],
  [-10,  10,  15,  15,  20,  20,  15,  15,  10, -10],
  [-10,   5,  15,  25,  30,  30,  25,  15,   5, -10],
  [-10,   5,  20,  30,  35,  35,  30,  20,   5, -10],
  [-10,   5,  20,  30,  35,  35,  30,  20,   5, -10],
  [-10,   5,  15,  25,  30,  30,  25,  15,   5, -10],
  [-10,  10,  15,  15,  20,  20,  15,  15,  10, -10],
  [-10,   5,   0,   0,   5,   5,   0,   0,   5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -10, -10, -20]
];

// 10x10 Tura jadvali
const PST_ROOK: number[][] = [
  [ 0,   0,   5,  10,  10,  10,  10,   5,   0,   0],
  [ 5,  10,  10,  15,  15,  15,  15,  10,  10,   5],
  [ 0,   5,  10,  15,  20,  20,  15,  10,   5,   0],
  [ 0,   5,  10,  15,  20,  20,  15,  10,   5,   0],
  [ 5,  10,  15,  20,  25,  25,  20,  15,  10,   5],
  [ 5,  10,  15,  20,  25,  25,  20,  15,  10,   5],
  [ 0,   5,  10,  15,  20,  20,  15,  10,   5,   0],
  [10,  15,  20,  25,  30,  30,  25,  20,  15,  10],
  [20,  25,  30,  35,  40,  40,  35,  30,  25,  20],
  [ 0,   5,  10,  15,  20,  20,  15,  10,   5,   0]
];

// 10x10 Farzin jadvali
const PST_QUEEN: number[][] = [
  [-20, -10, -10,  -5,  -5,  -5,  -5, -10, -10, -20],
  [-10,   0,   5,   5,   5,   5,   5,   5,   0, -10],
  [-10,   5,  10,  15,  15,  15,  15,  10,   5, -10],
  [ -5,   5,  15,  25,  25,  25,  25,  15,   5,  -5],
  [ -5,   5,  15,  25,  30,  30,  25,  15,   5,  -5],
  [ -5,   5,  15,  25,  30,  30,  25,  15,   5,  -5],
  [ -5,   5,  15,  25,  25,  25,  25,  15,   5,  -5],
  [-10,   5,  10,  15,  15,  15,  15,  10,   5, -10],
  [-10,   0,   5,   5,   5,   5,   5,   5,   0, -10],
  [-20, -10, -10,  -5,  -5,  -5,  -5, -10, -10, -20]
];

// Shoh xavfsizligi jadvali
const PST_KING_MID: number[][] = [
  [ 30,  35,  25,   5,   0,   0,   5,  25,  35,  30],
  [ 25,  30,  15,   0, -10, -10,   0,  15,  30,  25],
  [-10, -10, -20, -30, -35, -35, -30, -20, -10, -10],
  [-25, -25, -35, -45, -50, -50, -45, -35, -25, -25],
  [-35, -35, -45, -55, -60, -60, -55, -45, -35, -35],
  [-45, -45, -55, -65, -70, -70, -65, -55, -45, -45],
  [-50, -50, -60, -70, -75, -75, -70, -60, -50, -50],
  [-55, -55, -65, -75, -80, -80, -75, -65, -55, -55],
  [-60, -60, -70, -80, -85, -85, -80, -70, -60, -60],
  [-65, -65, -75, -85, -90, -90, -85, -75, -65, -65]
];

// Debyutlar Kitobi (O\'zbekcha himoya va Rasmiy taktikalar)
const OPENING_BOOK = [
  // 1. O\'zbekcha himoya
  [
    { from: { file: 6, rank: 1 }, to: { file: 6, rank: 4 } }, // 1. M2-M5 (3 qadam)
    { from: { file: 6, rank: 8 }, to: { file: 6, rank: 5 } }, // 1... M9-M6 (3 qadam)
    { from: { file: 3, rank: 1 }, to: { file: 3, rank: 4 } }, // 2. N2-N5
    { from: { file: 3, rank: 8 }, to: { file: 3, rank: 5 } }, // 2... N9-N6
    { from: { file: 8, rank: 0 }, to: { file: 7, rank: 2 } }, // 3. G1-F3
    { from: { file: 8, rank: 9 }, to: { file: 7, rank: 7 } }, // 3... G10-F8
    { from: { file: 1, rank: 0 }, to: { file: 2, rank: 2 } }, // 4. B1-C3
    { from: { file: 1, rank: 9 }, to: { file: 2, rank: 7 } }, // 4... B10-C8
  ],
  // 2. Markaziy E5 Hujumi
  [
    { from: { file: 4, rank: 1 }, to: { file: 4, rank: 4 } }, // 1. E2-E5
    { from: { file: 4, rank: 8 }, to: { file: 4, rank: 5 } }, // 1... E9-E6
    { from: { file: 5, rank: 1 }, to: { file: 5, rank: 4 } }, // 2. D2-D5
    { from: { file: 5, rank: 8 }, to: { file: 5, rank: 5 } }, // 2... D9-D6
    { from: { file: 3, rank: 0 }, to: { file: 3, rank: 3 } }, // 3. N1-N4
    { from: { file: 3, rank: 9 }, to: { file: 3, rank: 6 } }, // 3... N10-N7
  ],
  // 3. Nur Flang Taktikasi
  [
    { from: { file: 3, rank: 1 }, to: { file: 3, rank: 3 } }, // 1. N2-N4
    { from: { file: 3, rank: 8 }, to: { file: 3, rank: 6 } }, // 1... N9-N7
    { from: { file: 6, rank: 0 }, to: { file: 6, rank: 3 } }, // 2. M1-M4
    { from: { file: 6, rank: 9 }, to: { file: 6, rank: 6 } }, // 2... M10-M7
    { from: { file: 2, rank: 0 }, to: { file: 4, rank: 2 } }, // 3. Fil C1-E3
    { from: { file: 2, rank: 9 }, to: { file: 4, rank: 7 } }, // 3... Fil C10-E8
  ]
];

function checkBookMove(state: GameState, legalMoves: Move[]): Move | null {
  const historyLen = state.moveHistory.length;
  if (historyLen >= 8) return null;

  for (const line of OPENING_BOOK) {
    if (line.length <= historyLen) continue;
    let match = true;
    for (let i = 0; i < historyLen; i++) {
      const h = state.moveHistory[i];
      const b = line[i];
      if (h.from.file !== b.from.file || h.from.rank !== b.from.rank ||
          h.to.file !== b.to.file || h.to.rank !== b.to.rank) {
        match = false;
        break;
      }
    }
    if (match) {
      const target = line[historyLen];
      const found = legalMoves.find(
        m => m.from.file === target.from.file && m.from.rank === target.from.rank &&
             m.to.file === target.to.file && m.to.rank === target.to.rank
      );
      if (found) return found;
    }
  }
  return null;
}

// Pozitsiyani har tomonlama baholash (Evaluation)
export function evaluateBoard(state: GameState): number {
  let score = 0;
  let whiteKing: Square | null = null;
  let blackKing: Square | null = null;

  const whitePawnHighest = new Array(10).fill(-1);
  const blackPawnLowest = new Array(10).fill(10);

  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const p = state.board[r][f];
      if (!p) continue;
      if (p.type === 'King') {
        if (p.color === 'white') whiteKing = { rank: r, file: f };
        else blackKing = { rank: r, file: f };
        continue;
      }
      if (p.type === 'Pawn') {
        if (p.color === 'white') {
          if (r > whitePawnHighest[f]) whitePawnHighest[f] = r;
        } else {
          if (r < blackPawnLowest[f]) blackPawnLowest[f] = r;
        }
      }
    }
  }

  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const piece = state.board[r][f];
      if (!piece) continue;

      const isWhite = piece.color === 'white';
      const row = isWhite ? r : 9 - r;
      let pieceVal = PIECE_VALUES[piece.type] || 0;
      let posVal = 0;

      switch (piece.type) {
        case 'Pawn': {
          posVal = PST_PAWN[row][f];
          let isPassed = true;
          for (let df = Math.max(0, f - 1); df <= Math.min(9, f + 1); df++) {
            if (isWhite ? blackPawnLowest[df] > r && blackPawnLowest[df] < 10 : whitePawnHighest[df] < r && whitePawnHighest[df] > -1) {
              isPassed = false;
              break;
            }
          }
          if (isPassed) {
            const adv = isWhite ? r - 2 : 7 - r;
            if (adv > 0) posVal += adv * adv * 12;
          }
          break;
        }
        case 'Knight':
          posVal = PST_KNIGHT[row][f];
          break;
        case 'Bishop':
          posVal = PST_BISHOP[row][f];
          break;
        case 'Nur': {
          posVal = PST_NUR[row][f];
          const enemyKing = isWhite ? blackKing : whiteKing;
          if (enemyKing) {
            const dist = Math.abs(f - enemyKing.file) + Math.abs(r - enemyKing.rank);
            if (dist <= 3) posVal += 60;
            else if (dist <= 5) posVal += 30;
          }
          break;
        }
        case 'Rook':
          posVal = PST_ROOK[row][f];
          break;
        case 'Queen':
          posVal = PST_QUEEN[row][f];
          break;
        case 'King':
          posVal = PST_KING_MID[row][f];
          break;
      }

      const totalVal = pieceVal + posVal;
      if (isWhite) {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  // Rokirovka huquqlari
  if (!state.castlingRights.whiteShort && !state.castlingRights.whiteMedium && !state.castlingRights.whiteLong) {
    score += 25;
  }
  if (!state.castlingRights.blackShort && !state.castlingRights.blackMedium && !state.castlingRights.blackLong) {
    score -= 25;
  }

  return score;
}

// Harakatlarni saralash (Move Ordering)
function scoreMove(move: Move, killerMove?: Move | null): number {
  let score = 0;

  if (killerMove &&
      move.from.file === killerMove.from.file && move.from.rank === killerMove.from.rank &&
      move.to.file === killerMove.to.file && move.to.rank === killerMove.to.rank) {
    return 90000;
  }

  if (move.capturedPiece) {
    const victimVal = PIECE_VALUES[move.capturedPiece.type] || 0;
    const attackerVal = PIECE_VALUES[move.piece.type] || 0;
    score += 10000 + (victimVal * 10 - attackerVal);
  }

  if (move.isPromotion) {
    const promoType = move.promotionPiece || 'Queen';
    score += 8000 + (PIECE_VALUES[promoType] || 0);
  }

  if (move.piece.type === 'Nur') {
    score += 150;
  }

  if (move.isCastling) {
    score += 250;
  }

  const centerDist = Math.abs(move.to.file - 4.5) + Math.abs(move.to.rank - 4.5);
  score += Math.round((9 - centerDist) * 10);

  return score;
}

interface TTEntry {
  depth: number;
  score: number;
  flag: 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND';
  bestMove: Move;
}

const TT = new Map<string, TTEntry>();
const KILLER_MOVES: (Move | null)[] = new Array(20).fill(null);

function quiescence(
  state: GameState,
  alpha: number,
  beta: number,
  maximizing: boolean,
  qDepth: number = 3
): number {
  const standPat = evaluateBoard(state);

  if (qDepth <= 0) return standPat;

  if (maximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  const allMoves = getAllMovesFor(state);
  const captures = allMoves.filter(m => m.capturedPiece || m.isPromotion);
  if (captures.length === 0) return standPat;

  captures.sort((a, b) => scoreMove(b) - scoreMove(a));

  if (maximizing) {
    let maxScore = standPat;
    for (const move of captures) {
      const nextState = applyMove(state, move);
      const val = quiescence(nextState, alpha, beta, false, qDepth - 1);
      if (val > maxScore) maxScore = val;
      if (val > alpha) alpha = val;
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = standPat;
    for (const move of captures) {
      const nextState = applyMove(state, move);
      const val = quiescence(nextState, alpha, beta, true, qDepth - 1);
      if (val < minScore) minScore = val;
      if (val < beta) beta = val;
      if (beta <= alpha) break;
    }
    return minScore;
  }
}

function getAllMovesFor(state: GameState): Move[] {
  try {
    return [...getAllLegalMovesFromState(state), ...getCastlingMoves(state)];
  } catch {
    return [];
  }
}

function minimaxSearch(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  ply: number,
  deadline: number
): { score: number; bestMove: Move | null } {
  if (Date.now() > deadline) {
    return { score: evaluateBoard(state), bestMove: null };
  }

  const origAlpha = alpha;
  const posKey = state.positionHistory[state.positionHistory.length - 1] || '';
  const ttEntry = TT.get(posKey);
  if (ttEntry && ttEntry.depth >= depth) {
    if (ttEntry.flag === 'EXACT') return { score: ttEntry.score, bestMove: ttEntry.bestMove };
    if (ttEntry.flag === 'LOWERBOUND') alpha = Math.max(alpha, ttEntry.score);
    else if (ttEntry.flag === 'UPPERBOUND') beta = Math.min(beta, ttEntry.score);
    if (alpha >= beta) return { score: ttEntry.score, bestMove: ttEntry.bestMove };
  }

  if (state.status === 'checkmate') {
    return { score: maximizing ? -20000 + ply : 20000 - ply, bestMove: null };
  }
  if (state.status === 'stalemate' || state.status.startsWith('draw')) {
    return { score: 0, bestMove: null };
  }

  let searchDepth = depth;
  if (state.isInCheck && searchDepth < 2) {
    searchDepth += 1;
  }

  if (searchDepth <= 0) {
    return { score: quiescence(state, alpha, beta, maximizing, 3), bestMove: null };
  }

  const moves = getAllMovesFor(state);
  if (moves.length === 0) {
    if (state.isInCheck) return { score: maximizing ? -20000 + ply : 20000 - ply, bestMove: null };
    return { score: 0, bestMove: null };
  }

  const killer = KILLER_MOVES[ply] || null;
  moves.sort((a, b) => scoreMove(b, killer) - scoreMove(a, killer));

  const candidateCount = depth >= 3 ? 18 : moves.length;
  const searchMoves = moves.slice(0, candidateCount);

  let bestMove: Move | null = searchMoves[0];

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of searchMoves) {
      const nextState = applyMove(state, move);
      const res = minimaxSearch(nextState, searchDepth - 1, alpha, beta, false, ply + 1, deadline);
      if (res.score > maxEval) {
        maxEval = res.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, res.score);
      if (beta <= alpha) {
        if (!move.capturedPiece) KILLER_MOVES[ply] = move;
        break;
      }
    }

    let flag: 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND' = 'EXACT';
    if (maxEval <= origAlpha) flag = 'UPPERBOUND';
    else if (maxEval >= beta) flag = 'LOWERBOUND';
    if (bestMove) TT.set(posKey, { depth: searchDepth, score: maxEval, flag, bestMove });

    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of searchMoves) {
      const nextState = applyMove(state, move);
      const res = minimaxSearch(nextState, searchDepth - 1, alpha, beta, true, ply + 1, deadline);
      if (res.score < minEval) {
        minEval = res.score;
        bestMove = move;
      }
      beta = Math.min(beta, res.score);
      if (beta <= alpha) {
        if (!move.capturedPiece) KILLER_MOVES[ply] = move;
        break;
      }
    }

    let flag: 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND' = 'EXACT';
    if (minEval <= origAlpha) flag = 'UPPERBOUND';
    else if (minEval >= beta) flag = 'LOWERBOUND';
    if (bestMove) TT.set(posKey, { depth: searchDepth, score: minEval, flag, bestMove });

    return { score: minEval, bestMove };
  }
}

/**
 * AI ning eng yaxshi harakatini aniqlash
 * @param state - Hozirgi o'yin holati
 * @param level - AI darajasi: 1 (Havaskor), 2 (Tajribali), 3 (Usta), 4 (Grosmeyster)
 */
export function getBestMove(state: GameState, level: number = 2): Move | null {
  // Birinchi ishlagan AIEngine va rasmiy kitob debyutlar dvigateli
  return getFirstBotMove(state, level);
}

export async function getBestMoveAsync(state: GameState, level: number = 2): Promise<Move | null> {
  return await getFirstBotMoveAsync(state, level);
}
