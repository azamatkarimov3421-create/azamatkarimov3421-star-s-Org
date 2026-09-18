// =====================================================
// NUR SHAXMAT 100 — Birinchi Loyihadagi Asosiy Bot Ko\'prigi (Bridge)
// Birinchi mukammal ishlagan AIEngine va Board tizimini
// ikkinchi loyihaning zamonaviy dizayniga to\'liq ulaydi.
// =====================================================

import { GameState, Move as ReactMove } from '../engine/types';
import { getAllLegalMovesFromState } from '../engine/gameLogic';
// @ts-ignore
import { Board, Piece } from './move_generator.js';
// @ts-ignore
import { AIEngine } from './ai_engine.js';
// @ts-ignore
import { WHITE, BLACK, PIECE_PAWN, PIECE_KNIGHT, PIECE_BISHOP, PIECE_NUR, PIECE_ROOK, PIECE_QUEEN, PIECE_KING } from './board_constants.js';
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

export function convertGameStateToFirstBotBoard(state: GameState): any {
  const board = new Board();
  board.turn = state.currentTurn === 'white' ? WHITE : BLACK;

  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 10; f++) {
      const p = state.board[r][f];
      if (p) {
        const c = p.color === 'white' ? WHITE : BLACK;
        const t = TYPE_MAP[p.type] || PIECE_PAWN;
        board.grid[r][f] = new Piece(c, t);
      } else {
        board.grid[r][f] = null;
      }
    }
  }

  // Rokirovka huquqlarini o\'tkazish
  board.castlingRights[WHITE] = {
    K_moved: !state.castlingRights.whiteShort && !state.castlingRights.whiteMedium && !state.castlingRights.whiteLong,
    R_A_moved: !state.castlingRights.whiteShort,
    R_H_moved: !state.castlingRights.whiteMedium && !state.castlingRights.whiteLong,
    castled: false,
  };
  board.castlingRights[BLACK] = {
    K_moved: !state.castlingRights.blackShort && !state.castlingRights.blackMedium && !state.castlingRights.blackLong,
    R_A_moved: !state.castlingRights.blackShort,
    R_H_moved: !state.castlingRights.blackMedium && !state.castlingRights.blackLong,
    castled: false,
  };

  // Debyutlar kitobi uchun yurishlar tarixini o\'tkazish
  board.moveHistory = state.moveHistory.map(m => ({
    fromSq: [m.from.file, m.from.rank],
    toSq: [m.to.file, m.to.rank],
  }));

  return board;
}

/**
 * Birinchi ishlagan AIEngine orqali eng kuchli yurishni topish (Sinxron)
 */
export function getFirstBotMove(state: GameState, level: number = 2): ReactMove | null {
  const legalMoves = getAllLegalMovesFromState(state);
  if (legalMoves.length === 0) return null;

  try {
    const board = convertGameStateToFirstBotBoard(state);
    const engine = new AIEngine(board);

    // AI darajalari (1-Havaskor, 2-Tajribali, 3-Usta, 4-Grossmeyster)
    let depth = 3;
    let timeLimit = 1000;
    if (level === 1) {
      depth = 1;
      timeLimit = 250;
    } else if (level === 2) {
      depth = 2;
      timeLimit = 500;
    } else if (level === 3) {
      depth = 3;
      timeLimit = 1000;
    } else if (level >= 4) {
      depth = 5;
      timeLimit = 1800;
    }

    const res = engine.getBestMoveSync(depth, timeLimit);
    if (!res || !res.move) {
      return legalMoves[0];
    }

    const botMove = res.move;
    const matched = legalMoves.find(m =>
      m.from.file === botMove.fromSq[0] &&
      m.from.rank === botMove.fromSq[1] &&
      m.to.file === botMove.toSq[0] &&
      m.to.rank === botMove.toSq[1]
    );

    return matched || legalMoves[0];
  } catch (err) {
    console.error('Xatolik birinchi bot dvigatelida:', err);
    return legalMoves[0];
  }
}

/**
 * Asinxron va UI ni qotirmaydigan Bot hisoblash funksiyasi
 */
export async function getFirstBotMoveAsync(state: GameState, level: number = 2): Promise<ReactMove | null> {
  const legalMoves = getAllLegalMovesFromState(state);
  if (legalMoves.length === 0) return null;

  try {
    const board = convertGameStateToFirstBotBoard(state);
    const engine = new AIEngine(board);

    let depth = 3;
    let timeLimit = 800;
    if (level === 1) {
      depth = 1;
      timeLimit = 250;
    } else if (level === 2) {
      depth = 2;
      timeLimit = 500;
    } else if (level === 3) {
      depth = 3;
      timeLimit = 800;
    } else if (level >= 4) {
      depth = 4;
      timeLimit = 1400;
    }

    // Qat'iy qotib qolishdan himoya (Timeout Guard)
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        logger.logWarn('AI_ENGINE', `AI hisoblash vaqti chegaradan oshdi (${timeLimit + 300}ms). Qotishning oldi olindi.`);
        resolve(null);
      }, timeLimit + 300);
    });

    const searchPromise = engine.getBestMoveAsync(depth, timeLimit);
    const res = await Promise.race([searchPromise, timeoutPromise]);

    if (!res || !res.move) {
      return legalMoves[0];
    }

    const botMove = res.move;
    const matched = legalMoves.find(m =>
      m.from.file === botMove.fromSq[0] &&
      m.from.rank === botMove.fromSq[1] &&
      m.to.file === botMove.toSq[0] &&
      m.to.rank === botMove.toSq[1]
    );

    return matched || legalMoves[0];
  } catch (err: any) {
    logger.logError('AI_ENGINE', "AI bot dvigatelida kutilmagan xatolik yuz berdi. Xavfsiz yurish tanlandi.", err);
    return legalMoves[0];
  }
}
