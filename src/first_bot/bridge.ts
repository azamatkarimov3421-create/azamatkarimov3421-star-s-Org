// =====================================================
// NUR SHAXMAT 100 — Birinchi Loyihadagi Asosiy Bot Ko'prigi (Bridge)
// Web Worker orqali UI ni 0ms ham qotirmasdan hisoblaydi
// =====================================================

import { GameState, Move as ReactMove, PieceType } from '../engine/types';
import { getAllLegalMovesFromState } from '../engine/gameLogic';
// @ts-ignore
import { Board, Piece } from './move_generator.js';
// @ts-ignore
import { AIEngine } from './ai_engine.js';
// @ts-ignore
import {
  WHITE,
  BLACK,
  PIECE_PAWN,
  PIECE_KNIGHT,
  PIECE_BISHOP,
  PIECE_NUR,
  PIECE_ROOK,
  PIECE_QUEEN,
  PIECE_KING,
} from './board_constants.js';
import { logger } from '../services/loggerService';

const TYPE_MAP: Record<string, string> = {
  Pawn: PIECE_PAWN,
  Knight: PIECE_KNIGHT,
  Bishop: PIECE_BISHOP,
  Nur: PIECE_NUR,
  Rook: PIECE_ROOK,
  Queen: PIECE_QUEEN,
  King: PIECE_KING,
};

const PROMO_REVERSE_MAP: Record<string, PieceType> = {
  [PIECE_QUEEN]: 'Queen',
  [PIECE_NUR]: 'Nur',
  [PIECE_ROOK]: 'Rook',
  [PIECE_BISHOP]: 'Bishop',
  [PIECE_KNIGHT]: 'Knight',
};

export function convertGameStateToFirstBotBoard(state: GameState): any {
  const board = new Board();
  board.turn = state.currentTurn === 'white' ? WHITE : BLACK;

  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const p = state.board[r]?.[f];
      if (p) {
        const c = p.color === 'white' ? WHITE : BLACK;
        const t = TYPE_MAP[p.type] || PIECE_PAWN;
        board.grid[r][f] = new Piece(c, t);
      } else {
        board.grid[r][f] = null;
      }
    }
  }

  // Rokirovka huquqlarini o'tkazish
  board.castlingRights[WHITE] = {
    K_moved:
      !state.castlingRights.whiteShort &&
      !state.castlingRights.whiteMedium &&
      !state.castlingRights.whiteLong,
    R_A_moved: !state.castlingRights.whiteShort,
    R_H_moved: !state.castlingRights.whiteMedium && !state.castlingRights.whiteLong,
    castled: false,
  };
  board.castlingRights[BLACK] = {
    K_moved:
      !state.castlingRights.blackShort &&
      !state.castlingRights.blackMedium &&
      !state.castlingRights.blackLong,
    R_A_moved: !state.castlingRights.blackShort,
    R_H_moved: !state.castlingRights.blackMedium && !state.castlingRights.blackLong,
    castled: false,
  };

  // En passant maqsadlarini o'tkazish (2 yoki 3 qadam sakrash)
  const epList =
    state.enPassantTargets && state.enPassantTargets.length > 0
      ? state.enPassantTargets
      : state.enPassantTarget
      ? [state.enPassantTarget]
      : [];
  board.enPassantTargets = epList.map((sq) => [sq.file, sq.rank]);
  board.enPassantPawnSq = state.enPassantPawnSquare
    ? [state.enPassantPawnSquare.file, state.enPassantPawnSquare.rank]
    : null;

  // Debyutlar kitobi uchun yurishlar tarixini o'tkazish
  board.moveHistory = (state.moveHistory || []).map((m) => ({
    fromSq: [m.from.file, m.from.rank],
    toSq: [m.to.file, m.to.rank],
  }));

  return board;
}

function matchBotMoveToLegal(
  legalMoves: ReactMove[],
  botMove: { fromSq: [number, number]; toSq: [number, number]; promotion?: string | null }
): ReactMove | null {
  const targetPromo = botMove.promotion ? PROMO_REVERSE_MAP[botMove.promotion] || 'Queen' : null;
  const matched = legalMoves.find(
    (m) =>
      m.from.file === botMove.fromSq[0] &&
      m.from.rank === botMove.fromSq[1] &&
      m.to.file === botMove.toSq[0] &&
      m.to.rank === botMove.toSq[1] &&
      (!m.isPromotion || !targetPromo || m.promotionPiece === targetPromo)
  );
  if (matched) return matched;

  return (
    legalMoves.find(
      (m) =>
        m.from.file === botMove.fromSq[0] &&
        m.from.rank === botMove.fromSq[1] &&
        m.to.file === botMove.toSq[0] &&
        m.to.rank === botMove.toSq[1]
    ) || null
  );
}

// Singleton Web Worker (qotishni 100% yo'qotadi)
let aiWorkerInstance: Worker | null = null;
let workerFailed = false;
let reqCounter = 0;
const pendingWorkerRequests = new Map<
  number,
  { resolve: (val: any) => void; timer: ReturnType<typeof setTimeout> }
>();

function getOrCreateWorker(): Worker | null {
  if (workerFailed || typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }
  if (aiWorkerInstance) return aiWorkerInstance;

  try {
    aiWorkerInstance = new Worker(new URL('../ai/aiWorker.ts', import.meta.url), {
      type: 'module',
    });
    aiWorkerInstance.onmessage = (evt: MessageEvent) => {
      const { id, move } = evt.data || {};
      const entry = pendingWorkerRequests.get(id);
      if (entry) {
        clearTimeout(entry.timer);
        pendingWorkerRequests.delete(id);
        entry.resolve(move);
      }
    };
    aiWorkerInstance.onerror = () => {
      workerFailed = true;
      aiWorkerInstance?.terminate();
      aiWorkerInstance = null;
      pendingWorkerRequests.forEach((entry) => {
        clearTimeout(entry.timer);
        entry.resolve(null);
      });
      pendingWorkerRequests.clear();
    };
    return aiWorkerInstance;
  } catch {
    workerFailed = true;
    return null;
  }
}

export function getFirstBotMove(state: GameState, level: number = 2): ReactMove | null {
  const legalMoves = getAllLegalMovesFromState(state);
  if (legalMoves.length === 0) return null;

  try {
    const board = convertGameStateToFirstBotBoard(state);
    const engine = new AIEngine(board, level);

    let depth = 3;
    let timeLimit = 900;
    if (level === 1) {
      depth = 1;
      timeLimit = 300;
    } else if (level === 2) {
      depth = 2;
      timeLimit = 650;
    } else if (level === 3) {
      depth = 3;
      timeLimit = 1100;
    } else if (level >= 4) {
      depth = 4;
      timeLimit = 1800;
    }

    const res = engine.getBestMoveSync(depth, timeLimit, level);
    if (!res || !res.move) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    return matchBotMoveToLegal(legalMoves, res.move) || legalMoves[0];
  } catch (err) {
    console.error('Xatolik birinchi bot dvigatelida:', err);
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
}

export async function getFirstBotMoveAsync(
  state: GameState,
  level: number = 2
): Promise<ReactMove | null> {
  const legalMoves = getAllLegalMovesFromState(state);
  if (legalMoves.length === 0) return null;

  // 1. Avvalo Web Worker orqali asosiy oqimni umuman band qilmasdan hisoblash
  const worker = getOrCreateWorker();
  if (worker) {
    const workerMove = await new Promise<any>((resolve) => {
      const id = ++reqCounter;
      const timer = setTimeout(() => {
        pendingWorkerRequests.delete(id);
        resolve(null);
      }, 3200);
      pendingWorkerRequests.set(id, { resolve, timer });
      worker.postMessage({ id, state, level });
    });

    if (workerMove) {
      const matched = matchBotMoveToLegal(legalMoves, workerMove);
      if (matched) return matched;
    }
  }

  // 2. Zaxira (Fallback): agar WebView Worker qo'llamasa, bo'lingan asinxron rejimda hisoblash
  try {
    const board = convertGameStateToFirstBotBoard(state);
    const engine = new AIEngine(board, level);

    let depth = 2;
    let timeLimit = 650;
    if (level === 1) {
      depth = 1;
      timeLimit = 280;
    } else if (level === 2) {
      depth = 2;
      timeLimit = 600;
    } else if (level === 3) {
      depth = 3;
      timeLimit = 1000;
    } else if (level >= 4) {
      depth = 4;
      timeLimit = 1600;
    }

    const res = await engine.getBestMoveAsync(depth, timeLimit, null, level);
    if (res && res.move) {
      const matched = matchBotMoveToLegal(legalMoves, res.move);
      if (matched) return matched;
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  } catch (err: any) {
    logger.logError(
      'AI_ENGINE',
      'AI bot dvigatelida kutilmagan xatolik yuz berdi. Xavfsiz yurish tanlandi.',
      err
    );
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
}
