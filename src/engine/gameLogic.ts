// =====================================================
// NUR SHAXMAT 100 — O'yin mantiqiy qoidalari
// =====================================================

import { GameState, Move, Piece, PieceType, Square, Color, squaresEqual } from './types';
import { cloneBoard, getPiece, setPiece } from './board';
import { getAllLegalMoves, applyMoveToBoard, isInCheck, enemy, getLegalMoves, hasAnyLegalMove } from './moveGenerator';
import { updateCastlingRights, getCastlingMoves } from './castling';
import { generateMoveNotation } from './notation';

// ── Harakatni qo'llash ────────────────────────────────

export function applyMove(state: GameState, move: Move): GameState {
  const newBoard = applyMoveToBoard(state.board, move);

  // Rokirovka huquqlarini yangilash
  const newCastlingRights = updateCastlingRights(state.castlingRights, move);

  // Yo'lda olish maqsadini yangilash
  let newEnPassantTarget: Square | null = null;
  let newEnPassantPawnSquare: Square | null = null;

  if (move.piece.type === 'Pawn') {
    const rankDiff = Math.abs(move.to.rank - move.from.rank);
    if (rankDiff >= 2) {
      // Piyoda 2 yoki 3 qadam o'tdi — yo'lda olish mumkin
      // Har bir o'tilgan kvadrat maqsad bo'lishi mumkin
      // Faqat to'g'ridan-to'g'ri o'tib ketilgan kvadratlar
      const dir = move.piece.color === 'white' ? 1 : -1;
      // Bir nechta maqsad: 2 qadam o'tganda — 1 maqsad, 3 qadam o'tganda — 2 maqsad
      // Soddalik uchun oxirgi kvadrat oldidagini maqsad qilamiz
      // En passant: dushman piyodasi maqsad kvadratda emas, raqib piyodaning yonida turadi
      // Maqsad: piyodaning o'tib ketgan kvadrati (oxirgi harakatdan 1 qadam oldin)
      newEnPassantTarget = { file: move.from.file, rank: move.to.rank - dir };
      // Agar 3 qadam bo'lsa, yana bir maqsad
      if (rankDiff === 3) {
        // Ikki maqsad kvadrat bor, lekin faqat bittasini saqlaymiz
        // (murakkablikdan qochish uchun oxirgisini saqlaymiz)
        newEnPassantTarget = { file: move.from.file, rank: move.to.rank - dir };
      }
      newEnPassantPawnSquare = move.to;
    }
  }

  // Yutib olingan donni qo'shish
  const newCapturedByWhite = [...state.capturedByWhite];
  const newCapturedByBlack = [...state.capturedByBlack];
  if (move.capturedPiece) {
    if (state.currentTurn === 'white') {
      newCapturedByWhite.push(move.capturedPiece);
    } else {
      newCapturedByBlack.push(move.capturedPiece);
    }
  }

  // Aylantirish: darhol qo'llamiz (modal orqali)
  if (move.isPromotion && move.promotionPiece) {
    const promSquare = move.to;
    const promotedPiece: Piece = {
      ...move.piece,
      type: move.promotionPiece,
      id: `${move.promotionPiece}-${move.piece.color}-promo-${Date.now()}`
    };
    setPiece(newBoard, promSquare, promotedPiece);
  }

  const nextTurn: Color = enemy(state.currentTurn);
  const halfMoveClock = (move.piece.type === 'Pawn' || move.capturedPiece)
    ? 0 : state.halfMoveClock + 1;
  const fullMoveNumber = state.currentTurn === 'black'
    ? state.fullMoveNumber + 1 : state.fullMoveNumber;

  // Notatsiya
  const notation = generateMoveNotation(state, move);
  const moveWithNotation = { ...move, notation };

  const newMoveHistory = [...state.moveHistory, moveWithNotation];

  // Pozitsiya xeshini hisoblash (uch marta takrorlash uchun)
  const posHash = generatePositionHash(newBoard, nextTurn, newCastlingRights, newEnPassantTarget);
  const newPositionHistory = [...state.positionHistory, posHash];

  // Yangi holat
  const newState: GameState = {
    board: newBoard,
    currentTurn: nextTurn,
    castlingRights: newCastlingRights,
    enPassantTarget: newEnPassantTarget,
    enPassantPawnSquare: newEnPassantPawnSquare,
    halfMoveClock,
    fullMoveNumber,
    capturedByWhite: newCapturedByWhite,
    capturedByBlack: newCapturedByBlack,
    moveHistory: newMoveHistory,
    positionHistory: newPositionHistory,
    status: 'playing',
    promotionPending: null,
    lastMove: moveWithNotation,
    isInCheck: false,
  };

  // O'yin holatini tekshirish
  newState.isInCheck = isInCheck(newBoard, nextTurn);

  // Uch marta takrorlash
  const posCount = newPositionHistory.filter(h => h === posHash).length;
  if (posCount >= 3) {
    newState.status = 'draw_repetition';
    return newState;
  }

  // 50 ta harakatli qoida
  if (halfMoveClock >= 100) {
    newState.status = 'draw_50move';
    return newState;
  }

  // Shohmat va pat (Tezkor tekshiruv - barcha harakatlarni hisoblamasdan darhol qaytadi)
  const hasMoves = hasAnyLegalMove(newState) || getCastlingMoves(newState).length > 0;
  if (!hasMoves) {
    if (newState.isInCheck) {
      newState.status = 'checkmate';
    } else {
      newState.status = 'stalemate';
    }
  } else if (newState.isInCheck) {
    newState.status = 'check';
  }

  return newState;
}

function getAllLegalMovesForState(state: GameState): Move[] {
  const pseudoMoves = getAllLegalMoves(state);
  const castlingMoves = getCastlingMoves(state);
  return [...pseudoMoves, ...castlingMoves];
}

export function getAllLegalMovesFromState(state: GameState): Move[] {
  return getAllLegalMovesForState(state);
}

export function getLegalMovesForSquare(state: GameState, from: Square): Move[] {
  const normalMoves = getLegalMoves(state, from);
  const castlingMoves = getCastlingMoves(state).filter(m => squaresEqual(m.from, from));
  return [...normalMoves, ...castlingMoves];
}

// ── Pozitsiya xeshi (takrorlash uchun) ───────────────

export function generatePositionHash(
  board: GameState['board'],
  turn: Color,
  castling: GameState['castlingRights'],
  enPassant: Square | null
): string {
  let hash = turn[0];
  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const p = board[r][f];
      if (p) {
        hash += `${r}${f}${p.type[0]}${p.color[0]}`;
      } else {
        hash += '.';
      }
    }
  }
  const c = castling;
  hash += `${+c.whiteShort}${+c.whiteMedium}${+c.whiteLong}${+c.blackShort}${+c.blackMedium}${+c.blackLong}`;
  if (enPassant) hash += `ep${enPassant.file}${enPassant.rank}`;
  return hash;
}

// ── Moddiy balans ─────────────────────────────────────

export function getMaterialBalance(state: GameState): number {
  // Musbat = Oq ustunligi, Manfiy = Qora ustunligi
  const values: Partial<Record<PieceType, number>> = {
    Queen: 9, Nur: 7, Rook: 5, Bishop: 3, Knight: 3, Pawn: 1
  };
  let balance = 0;
  for (const p of state.capturedByWhite) {
    balance += (values[p.type] ?? 0);
  }
  for (const p of state.capturedByBlack) {
    balance -= (values[p.type] ?? 0);
  }
  return balance;
}

// ── O'tgan harakatni bekor qilish ────────────────────

export function undoMove(state: GameState, previousState: GameState): GameState {
  return previousState;
}
