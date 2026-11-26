// =====================================================
// NUR SHAXMAT 100 — Harakatlar generatori (Rasmiy Kitob Qoidalari)
// =====================================================

import { Board, Color, GameState, Move, Piece, Square, isOnBoard, squaresEqual } from './types';
import { cloneBoard, findKing, getPiece, setPiece } from './board';

// ── Yordamchi funksiyalar ────────────────────────────

function enemy(color: Color): Color {
  return color === 'white' ? 'black' : 'white';
}

// Surish harakatlari (Farzin, Rux, Fil uchun — bo'sh kataklar bo'ylab)
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

// ── Donalar harakatlarini yaratish ───────────────────

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
 * NUR donasi harakatlari (Kitob bo'yicha):
 * To'rt to'g'ri yo'nalishda (↑, ↓, ←, →) 1, 2 yoki 3 katakka sakrab yuradi.
 * Yo'lidagi o'z va raqib donalari ustidan bemalol sakrab o'ta oladi.
 * Qo'ngan katagidagi raqib donasini urib oladi (o'z donasi ustiga qo'na olmaydi).
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
        // Nur raqib donasi ustidan ham sakrab keyingi (2 yoki 3-chi) katakka o'ta oladi
      } else {
        // O'z donasi — bu katakka qo'nolmaydi, lekin ustidan sakrab o'tadi
        continue;
      }
    }
  }
  return moves;
}

/**
 * Piyoda harakatlari (Nurfullo Nurmatov rasmiy qo'llanmasi bo'yicha):
 * 1. O'z hududida (Oqlar: 2–5 qatorlar, ya'ni rank 1..4 chegaragacha; Qoralar: 9–6 qatorlar, ya'ni rank 8..5 chegaragacha)
 *    bo'sh kataklar bo'ylab xohishiga ko'ra 1, 2 yoki 3 qadam oldinga siljiy oladi:
 *    - Oqlar: 2-qatorda (rank 1) -> 1, 2 yoki 3 qadam (3, 4, 5-qatorgacha);
 *             3-qatorda (rank 2) -> 1 yoki 2 qadam (4, 5-qatorgacha);
 *             4-qatorda (rank 3) -> 1 qadam (5-qatorgacha).
 *    - Qoralar: 9-qatorda (rank 8) -> 1, 2 yoki 3 qadam (8, 7, 6-qatorgacha);
 *               8-qatorda (rank 7) -> 1 yoki 2 qadam (7, 6-qatorgacha);
 *               7-qatorda (rank 6) -> 1 qadam (6-qatorgacha).
 * 2. Chegaradan va raqib hududida (Oqlar 5-qatordan 6,7,8,9,10 ga; Qoralar 6-qatordan 5,4,3,2,1 ga) FAQAT 1 qadamdan yuradi.
 * 3. Diagonal bo'yicha 1 qadam oldindagi raqib donasini urib oladi.
 * 4. O'tishda urib olish (En Passant):
 *    Raqib piyodasi 2 yoki 3 qadam oldinga siljib, o'zimizning piyodamiz hujum qilib turgan
 *    katak ustidan sakrab (kesib) o'tsa (masalan: Oq piyoda 6-qatorda turganda Qora piyoda 9->6 yoki 8->6 yursa —
 *    Oq piyoda 6 dan 7-qatorga diagonal o'tib urib oladi; yoki 7-qatorda turganda 9->6 / 9->7 yursa — 7 dan 8-qatorga o'tib urib oladi!),
 *    navbatdagi javob yurishidayoq uni o'tishda urib olish mumkin.
 * 5. Oxirgi qatorga (Oq: 10-qator, Qora: 1-qator) yetganda Farzin, Nur, Rux, Fil yoki Otga aylanadi.
 */
function generatePawnMoves(board: Board, from: Square, piece: Piece, state: GameState): Move[] {
  const moves: Move[] = [];
  const dir = piece.color === 'white' ? 1 : -1;

  let maxSteps = 1;
  if (piece.color === 'white') {
    if (from.rank >= 1 && from.rank <= 3) {
      maxSteps = Math.min(3, 4 - from.rank);
    }
  } else {
    if (from.rank >= 6 && from.rank <= 8) {
      maxSteps = Math.min(3, from.rank - 5);
    }
  }

  // Oldinga bo'sh kataklar bo'ylab siljish
  for (let steps = 1; steps <= maxSteps; steps++) {
    const to = { rank: from.rank + dir * steps, file: from.file };
    if (!isOnBoard(to)) break;
    if (board[to.rank][to.file] !== null) break; // Oldi to'silgan — ustidan sakrab o'ta olmaydi
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

  // Yo'l-yo'lakay (o'tishda) urib olish kataklar ro'yxati (2 yoki 3 qadam sakrashda barcha kesib o'tilgan kataklar)
  const epTargets: Square[] =
    state.enPassantTargets && state.enPassantTargets.length > 0
      ? state.enPassantTargets
      : state.enPassantTarget
      ? [state.enPassantTarget]
      : [];

  // Diagonal bo'yicha urish va O'tishda urib olish (En Passant)
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
    } else if (!target && state.enPassantPawnSquare && epTargets.some(ep => squaresEqual(to, ep))) {
      // O'tishda urib olish (En passant): maqsad katak bo'sh bo'lib, raqib piyodasi shu yo'lakdan sakrab o'tgan
      const capSq = state.enPassantPawnSquare;
      const captured = board[capSq.rank]?.[capSq.file];
      if (captured && captured.type === 'Pawn' && captured.color !== piece.color) {
        moves.push({
          from,
          to,
          piece,
          capturedPiece: captured,
          isEnPassant: true,
          enPassantCaptureSquare: capSq,
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

  // Rux + Farzin (to'g'ri chiziq)
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

  // Fil + Farzin (diagonal)
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

  // Ot ("G" shaklida sakrash)
  for (const [dr, df] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]] as [number,number][]) {
    const r = sq.rank + dr, f = sq.file + df;
    if (r >= 0 && r <= 9 && f >= 0 && f <= 9) {
      const p = board[r][f];
      if (p && p.color === byColor && p.type === 'Knight') return true;
    }
  }

  // Nur (1-2-3 qadam to'g'ri yo'nalishda sakrab hujum qiladi)
  for (const [dr, df] of [[1,0],[-1,0],[0,1],[0,-1]] as [number,number][]) {
    for (let steps = 1; steps <= 3; steps++) {
      const r = sq.rank + dr * steps, f = sq.file + df * steps;
      if (r < 0 || r > 9 || f < 0 || f > 9) break;
      const p = board[r][f];
      if (p && p.color === byColor && p.type === 'Nur') return true;
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

// ── Soxta harakatni qo'llash (qonuniylikni tekshirish uchun) ──────

function applyMoveToBoard(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);
  const piece = { ...move.piece };

  if (move.isPromotion && move.promotionPiece) {
    piece.type = move.promotionPiece;
  }

  // Yo'lda olish: avval yutib olingan piyodani o'chirish
  if (move.isEnPassant && move.enPassantCaptureSquare) {
    setPiece(newBoard, move.enPassantCaptureSquare, null);
  }

  setPiece(newBoard, move.to, piece);
  setPiece(newBoard, move.from, null);

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
