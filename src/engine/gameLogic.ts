// =====================================================
// NUR SHAXMAT 100 — O'yin mantiqiy qoidalari (Kitob bo'yicha)
// =====================================================

import { GameState, Move, Piece, PieceType, Square, Color, squaresEqual } from './types';
import { setPiece } from './board';
import { getAllLegalMoves, applyMoveToBoard, isInCheck, enemy, getLegalMoves, hasAnyLegalMove } from './moveGenerator';
import { updateCastlingRights, getCastlingMoves } from './castling';
import { generateMoveNotation } from './notation';

// ── Harakatni qo'llash ────────────────────────────────

export function applyMove(state: GameState, move: Move): GameState {
  const newBoard = applyMoveToBoard(state.board, move);

  // Rokirovka huquqlarini yangilash
  const newCastlingRights = updateCastlingRights(state.castlingRights, move);

  // Yo'lda olish (En Passant) maqsadlarini yangilash:
  // Piyoda 2 yoki 3 qadam oldinga siljiganda, u kesib o'tgan BARCHA oraliq kataklar
  // (masalan Qora 9->6 yurganda 8- va 7-qator kataklari; Oq 2->5 yurganda 3- va 4-qator kataklari)
  // raqib piyodasi tomonidan o'tishda urib olinishi mumkin!
  let newEnPassantTarget: Square | null = null;
  let newEnPassantTargets: Square[] = [];
  let newEnPassantPawnSquare: Square | null = null;

  if (move.piece.type === 'Pawn') {
    const rankDiff = Math.abs(move.to.rank - move.from.rank);
    if (rankDiff >= 2) {
      const dir = move.piece.color === 'white' ? 1 : -1;
      for (let step = 1; step < rankDiff; step++) {
        newEnPassantTargets.push({
          file: move.from.file,
          rank: move.from.rank + dir * step,
        });
      }
      newEnPassantTarget = newEnPassantTargets[newEnPassantTargets.length - 1] || null;
      newEnPassantPawnSquare = move.to;
    }
  }

  // Yutib olingan donani qo'shish (oddiy urish hamda o'tishda urib olish uchun)
  const newCapturedByWhite = [...state.capturedByWhite];
  const newCapturedByBlack = [...state.capturedByBlack];
  const captured =
    move.capturedPiece ||
    (move.isEnPassant && move.enPassantCaptureSquare
      ? state.board[move.enPassantCaptureSquare.rank]?.[move.enPassantCaptureSquare.file] || undefined
      : undefined);

  if (captured) {
    if (state.currentTurn === 'white') {
      newCapturedByWhite.push(captured);
    } else {
      newCapturedByBlack.push(captured);
    }
  }

  // Aylantirish: darhol qo'llaymiz
  if (move.isPromotion && move.promotionPiece) {
    const promSquare = move.to;
    const promotedPiece: Piece = {
      ...move.piece,
      type: move.promotionPiece,
      id: `${move.promotionPiece}-${move.piece.color}-promo-${state.moveHistory.length}-${promSquare.file}`
    };
    setPiece(newBoard, promSquare, promotedPiece);
  }

  const nextTurn: Color = enemy(state.currentTurn);
  const halfMoveClock = (move.piece.type === 'Pawn' || captured)
    ? 0 : state.halfMoveClock + 1;
  const fullMoveNumber = state.currentTurn === 'black'
    ? state.fullMoveNumber + 1 : state.fullMoveNumber;

  // Keyingi tomon shah ostida qolganini va yurishlari borligini tekshirish
  const nextIsInCheck = isInCheck(newBoard, nextTurn);

  // Vaqtincha keyingi holat (qonuniy yurishlar bor-yo'qligini aniqlash uchun)
  const tempState: GameState = {
    board: newBoard,
    currentTurn: nextTurn,
    castlingRights: newCastlingRights,
    enPassantTarget: newEnPassantTarget,
    enPassantTargets: newEnPassantTargets,
    enPassantPawnSquare: newEnPassantPawnSquare,
    halfMoveClock,
    fullMoveNumber,
    capturedByWhite: newCapturedByWhite,
    capturedByBlack: newCapturedByBlack,
    moveHistory: state.moveHistory,
    positionHistory: state.positionHistory,
    status: 'playing',
    promotionPending: null,
    lastMove: move,
    isInCheck: nextIsInCheck,
  };

  const hasMoves = hasAnyLegalMove(tempState) || getCastlingMoves(tempState).length > 0;
  let finalStatus: GameState['status'] = 'playing';
  if (!hasMoves) {
    finalStatus = nextIsInCheck ? 'checkmate' : 'stalemate';
  } else if (nextIsInCheck) {
    finalStatus = 'check';
  }

  // Notatsiya (+ shah, X mot belgilari bilan)
  let notation = generateMoveNotation(state, { ...move, capturedPiece: captured });
  if (finalStatus === 'checkmate') {
    notation += 'X';
  } else if (nextIsInCheck) {
    notation += '+';
  }
  const moveWithNotation: Move = { ...move, capturedPiece: captured, notation };
  const newMoveHistory = [...state.moveHistory, moveWithNotation];

  // Pozitsiya xeshini hisoblash (uch marta takrorlash uchun)
  const posHash = generatePositionHash(newBoard, nextTurn, newCastlingRights, newEnPassantTargets);
  const newPositionHistory = [...state.positionHistory, posHash];

  if (finalStatus === 'playing' || finalStatus === 'check') {
    const posCount = newPositionHistory.filter(h => h === posHash).length;
    if (posCount >= 3) {
      finalStatus = 'draw_repetition';
    } else if (halfMoveClock >= 100) {
      finalStatus = 'draw_50move';
    }
  }

  return {
    board: newBoard,
    currentTurn: nextTurn,
    castlingRights: newCastlingRights,
    enPassantTarget: newEnPassantTarget,
    enPassantTargets: newEnPassantTargets,
    enPassantPawnSquare: newEnPassantPawnSquare,
    halfMoveClock,
    fullMoveNumber,
    capturedByWhite: newCapturedByWhite,
    capturedByBlack: newCapturedByBlack,
    moveHistory: newMoveHistory,
    positionHistory: newPositionHistory,
    status: finalStatus,
    promotionPending: null,
    lastMove: moveWithNotation,
    isInCheck: nextIsInCheck,
  };
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
  enPassant: Square | Square[] | null
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
  if (Array.isArray(enPassant)) {
    for (const ep of enPassant) {
      hash += `ep${ep.file}${ep.rank}`;
    }
  } else if (enPassant) {
    hash += `ep${enPassant.file}${enPassant.rank}`;
  }
  return hash;
}

// ── Moddiy balans ─────────────────────────────────────

export function getMaterialBalance(state: GameState): number {
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

export function undoMove(_state: GameState, previousState: GameState): GameState {
  return previousState;
}
