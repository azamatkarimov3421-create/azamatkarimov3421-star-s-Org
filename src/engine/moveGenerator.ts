// =====================================================
// NUR SHAXMAT 100 — Harakatlar generatori
// =====================================================

import { Board, Color, GameState, Move, Piece, Square, isOnBoard, squaresEqual } from './types';
import { cloneBoard, findKing, getPiece, setPiece } from './board';

// ── Yordamchi funksiyalar ────────────────────────────

function enemy(color: Color): Color {
  return color === 'white' ? 'black' : 'white';
}

// Surish harakatlari (Vazir, Tura, Fil uchun)
function generateSlidingMoves(
  board: Board,
  from: Square,
  piece: Piece,
  directions: [number, number][]
): Move[] {
  const moves: Move[] = [];
  for (const [dr, df] of directions) {
    let r = from.rank + dr;
    let f = from.file + df;
    while (r >= 0 && r <= 9 && f >= 0 && f <= 9) {
      const target = board[r][f];
      if (target === null) {
        moves.push({ from, to: { rank: r, file: f }, piece });
      } else {
        if (target.color !== piece.color) {
          moves.push({ from, to: { rank: r, file: f }, piece, capturedPiece: target });
        }
        break; // Bloklandi
      }
      r += dr;
      f += df;
    }
  }
  return moves;
}

// ── Don harakatlarini yaratish ───────────────────────

function generateKingMoves(board: Board, from: Square, piece: Piece): Move[] {
  const moves: Move[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      if (dr === 0 && df === 0) continue;
      const to = { rank: from.rank + dr, file: from.file + df };
      if (!isOnBoard(to)) continue;
      const target = board[to.rank][to.file];
      if (!target || target.color !== piece.color) {
        moves.push({ from, to, piece, capturedPiece: target || undefined });
      }
    }
  }
  return moves;
}

function generateQueenMoves(board: Board, from: Square, piece: Piece): Move[] {
  const dirs: [number, number][] = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];
  return generateSlidingMoves(board, from, piece, dirs);
}

function generateRookMoves(board: Board, from: Square, piece: Piece): Move[] {
  return generateSlidingMoves(board, from, piece, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
}

function generateBishopMoves(board: Board, from: Square, piece: Piece): Move[] {
  return generateSlidingMoves(board, from, piece, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
}

function generateKnightMoves(board: Board, from: Square, piece: Piece): Move[] {
  const moves: Move[] = [];
  const jumps: [number, number][] = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ];
  for (const [dr, df] of jumps) {
    const to = { rank: from.rank + dr, file: from.file + df };
    if (!isOnBoard(to)) continue;
    const target = board[to.rank][to.file];
    if (!target || target.color !== piece.color) {
      moves.push({ from, to, piece, capturedPiece: target || undefined });
    }
  }
  return moves;
}

/**
 * NUR donasi harakatlari:
 * To'rt yo'nalishda 1, 2 yoki 3 kvadrat sakrash (ustidagi donlarni oshib o'tadi)
 * Qo'ngan joyda dushman donini yeydi
 */
function generateNurMoves(board: Board, from: Square, piece: Piece): Move[] {
  const moves: Move[] = [];
  const directions: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [dr, df] of directions) {
    for (let steps = 1; steps <= 3; steps++) {
      const to = { rank: from.rank + dr * steps, file: from.file + df * steps };
      if (!isOnBoard(to)) break;
      const target = board[to.rank][to.file];
      if (!target) {
        moves.push({ from, to, piece });
      } else if (target.color !== piece.color) {
        moves.push({ from, to, piece, capturedPiece: target });
        // Dushman donini yegandan so'ng ham davom etadi (sakrab o'tib yeydi)
        // Lekin faqat shu kvadratga qo'nadi, undan narisi yo'q
        break;
      } else {
        // O'z doni — bu yo'nalishda to'xtab, lekin keyingi urinishlarda sakrab o'tadi
        // Nur o'z donlari USTIDAN sakrashi mumkin (3 ta qadam ichida)
        // Bu yo'nalishda tugmani o'tkazish davom etadi, lekin qo'nolmaydi
        // (Sakrab o'tadi, lekin o'z doniga qo'nolmaydi)
        continue;
      }
    }
  }
  return moves;
}

/**
 * Piyoda harakatlari:
 * - Boshlanish pozitsiyasidan (Oq: rank 1, Qora: rank 8) 1, 2, yoki 3 qadam
 * - Dushman hududida (Oq: rank 5+, Qora: rank 4-) faqat 1 qadam
 * - Diagonal yeyish
 * - Yo'lda olish (En passant)
 * - Aylantirish (Rank 9 ga yetganda)
 */
function generatePawnMoves(board: Board, from: Square, piece: Piece, state: GameState): Move[] {
  const moves: Move[] = [];
  const dir = piece.color === 'white' ? 1 : -1;
  const startRank = piece.color === 'white' ? 1 : 8;
  // Dushman hududi: Oq uchun rank 5-9 (index 5-9), Qora uchun rank 0-4 (index 0-4)
  const isInEnemyTerritory = piece.color === 'white'
    ? from.rank >= 5
    : from.rank <= 4;

  const maxSteps = (from.rank === startRank && !isInEnemyTerritory) ? 3 : 1;

  // Oldinga harakatlar
  for (let steps = 1; steps <= maxSteps; steps++) {
    const to = { rank: from.rank + dir * steps, file: from.file };
    if (!isOnBoard(to)) break;
    if (board[to.rank][to.file] !== null) break; // Bloklandi
    const isPromo = (piece.color === 'white' && to.rank === 9) ||
                    (piece.color === 'black' && to.rank === 0);
    if (isPromo) {
      for (const pt of ['Queen', 'Nur', 'Rook', 'Bishop', 'Knight'] as const) {
        moves.push({ from, to, piece, isPromotion: true, promotionPiece: pt });
      }
    } else {
      moves.push({ from, to, piece });
    }
  }

  // Diagonal yeyish
  for (const df of [-1, 1]) {
    const to = { rank: from.rank + dir, file: from.file + df };
    if (!isOnBoard(to)) continue;
    const target = board[to.rank][to.file];
    if (target && target.color !== piece.color) {
      const isPromo = (piece.color === 'white' && to.rank === 9) ||
                      (piece.color === 'black' && to.rank === 0);
      if (isPromo) {
        for (const pt of ['Queen', 'Nur', 'Rook', 'Bishop', 'Knight'] as const) {
          moves.push({ from, to, piece, capturedPiece: target, isPromotion: true, promotionPiece: pt });
        }
      } else {
        moves.push({ from, to, piece, capturedPiece: target });
      }
    }

    // Yo'lda olish (En passant)
    if (state.enPassantTarget && squaresEqual(to, state.enPassantTarget)) {
      const capSq = state.enPassantPawnSquare!;
      const captured = board[capSq.rank][capSq.file];
      if (captured && captured.color !== piece.color) {
        moves.push({
          from, to, piece,
          capturedPiece: captured,
          isEnPassant: true,
          enPassantCaptureSquare: capSq
        });
      }
    }
  }

  return moves;
}

// ── Shoh hujum ostida ekanligini tekshirish ──────────

export function isSquareAttacked(board: Board, sq: Square, byColor: Color): boolean {
  // Raqib shoh tomonidan hujum
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      if (dr === 0 && df === 0) continue;
      const r = sq.rank + dr, f = sq.file + df;
      if (r >= 0 && r <= 9 && f >= 0 && f <= 9) {
        const p = board[r][f];
        if (p && p.type === 'King' && p.color === byColor) return true;
      }
    }
  }

  // Tura + Vazir (to'g'ri chiziq)
  for (const [dr, df] of [[1,0],[-1,0],[0,1],[0,-1]] as [number,number][]) {
    let r = sq.rank + dr, f = sq.file + df;
    while (r >= 0 && r <= 9 && f >= 0 && f <= 9) {
      const p = board[r][f];
      if (p) {
        if (p.color === byColor && (p.type === 'Rook' || p.type === 'Queen')) return true;
        break;
      }
      r += dr; f += df;
    }
  }

  // Fil + Vazir (diagonal)
  for (const [dr, df] of [[1,1],[1,-1],[-1,1],[-1,-1]] as [number,number][]) {
    let r = sq.rank + dr, f = sq.file + df;
    while (r >= 0 && r <= 9 && f >= 0 && f <= 9) {
      const p = board[r][f];
      if (p) {
        if (p.color === byColor && (p.type === 'Bishop' || p.type === 'Queen')) return true;
        break;
      }
      r += dr; f += df;
    }
  }

  // Ot (L-shakl sakrash)
  for (const [dr, df] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]] as [number,number][]) {
    const r = sq.rank + dr, f = sq.file + df;
    if (r >= 0 && r <= 9 && f >= 0 && f <= 9) {
      const p = board[r][f];
      if (p && p.color === byColor && p.type === 'Knight') return true;
    }
  }

  // Nur (1-2-3 qadam to'g'ri yo'nalishda qo'nish)
  for (const [dr, df] of [[1,0],[-1,0],[0,1],[0,-1]] as [number,number][]) {
    for (let steps = 1; steps <= 3; steps++) {
      const r = sq.rank + dr * steps, f = sq.file + df * steps;
      if (r < 0 || r > 9 || f < 0 || f > 9) break;
      const p = board[r][f];
      if (p) {
        if (p.color === byColor && p.type === 'Nur') return true;
        // Dushman doni bo'lsa, Nur undan o'tolmaydi (maqsad kvadrat bu)
        // o'z doni bo'lsa, Nur sakrab o'tadi
        if (p.color !== byColor) break;
        // o'z doni — davom etadi (Nur sakrashi)
      }
    }
  }

  // Piyoda hujumi
  const pawnDir = byColor === 'white' ? 1 : -1;
  for (const df of [-1, 1]) {
    const r = sq.rank - pawnDir, f = sq.file + df;
    if (r >= 0 && r <= 9 && f >= 0 && f <= 9) {
      const p = board[r][f];
      if (p && p.color === byColor && p.type === 'Pawn') return true;
    }
  }

  return false;
}

export function isInCheck(board: Board, color: Color): boolean {
  const kingSquare = findKing(board, color);
  if (!kingSquare) return false;
  return isSquareAttacked(board, kingSquare, enemy(color));
}

// ── Soxta harakatni qo'llash (tekshirish uchun) ──────

function applyMoveToBoard(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);
  const piece = { ...move.piece };

  if (move.isPromotion && move.promotionPiece) {
    piece.type = move.promotionPiece;
  }

  setPiece(newBoard, move.to, piece);
  setPiece(newBoard, move.from, null);

  // Yo'lda olish: yutib olingan piyodani o'chirish
  if (move.isEnPassant && move.enPassantCaptureSquare) {
    setPiece(newBoard, move.enPassantCaptureSquare, null);
  }

  // Rokirovka: turani ham ko'chirish
  if (move.isCastling && move.rookFrom && move.rookTo) {
    const rook = getPiece(newBoard, move.rookFrom);
    setPiece(newBoard, move.rookTo, rook);
    setPiece(newBoard, move.rookFrom, null);
  }

  return newBoard;
}

// ── Qonuniy harakatlar generatori ───────────────────

export function getPseudoLegalMoves(state: GameState, from: Square): Move[] {
  const piece = getPiece(state.board, from);
  if (!piece || piece.color !== state.currentTurn) return [];

  switch (piece.type) {
    case 'King':   return generateKingMoves(state.board, from, piece);
    case 'Queen':  return generateQueenMoves(state.board, from, piece);
    case 'Rook':   return generateRookMoves(state.board, from, piece);
    case 'Bishop': return generateBishopMoves(state.board, from, piece);
    case 'Knight': return generateKnightMoves(state.board, from, piece);
    case 'Nur':    return generateNurMoves(state.board, from, piece);
    case 'Pawn':   return generatePawnMoves(state.board, from, piece, state);
    default: return [];
  }
}

export function getLegalMoves(state: GameState, from: Square): Move[] {
  const pseudoMoves = getPseudoLegalMoves(state, from);
  return pseudoMoves.filter(move => {
    const newBoard = applyMoveToBoard(state.board, move);
    return !isInCheck(newBoard, state.currentTurn);
  });
}

export function getAllLegalMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const piece = state.board[r][f];
      if (piece && piece.color === state.currentTurn) {
        moves.push(...getLegalMoves(state, { rank: r, file: f }));
      }
    }
  }
  return moves;
}

export function hasAnyLegalMove(state: GameState): boolean {
  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const piece = state.board[r][f];
      if (piece && piece.color === state.currentTurn) {
        const moves = getLegalMoves(state, { rank: r, file: f });
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

export { applyMoveToBoard, enemy };
