// =====================================================
// NUR SHAXMAT 100 — Dedicated Web Worker for AI Engine
// Asosiy ekran oqimini (UI va 3D WebGL) 0.00ms ham band qilmasdan
// alohida fonda chuqur shaxmat hisoblashni bajaradi!
// =====================================================

import { GameState } from '../engine/types';
// @ts-ignore
import { Board, Piece } from '../first_bot/move_generator.js';
// @ts-ignore
import { AIEngine } from '../first_bot/ai_engine.js';
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
} from '../first_bot/board_constants.js';

const TYPE_MAP: Record<string, string> = {
  Pawn: PIECE_PAWN,
  Knight: PIECE_KNIGHT,
  Bishop: PIECE_BISHOP,
  Nur: PIECE_NUR,
  Rook: PIECE_ROOK,
  Queen: PIECE_QUEEN,
  King: PIECE_KING,
};

function buildWorkerBoard(state: GameState): any {
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

  // En passant maqsadlarini o'tkazish
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

  board.moveHistory = (state.moveHistory || []).map((m) => ({
    fromSq: [m.from.file, m.from.rank],
    toSq: [m.to.file, m.to.rank],
  }));

  return board;
}

self.onmessage = (evt: MessageEvent) => {
  const { id, state, level } = evt.data || {};
  try {
    const board = buildWorkerBoard(state);
    const engine = new AIEngine(board, level);

    let depth = 3;
    let timeLimit = 900;
    if (level === 1) {
      depth = 1;
      timeLimit = 280;
    } else if (level === 2) {
      depth = 2;
      timeLimit = 600;
    } else if (level === 3) {
      depth = 3;
      timeLimit = 1100;
    } else if (level >= 4) {
      depth = 4;
      timeLimit = 1800;
    }

    const res = engine.getBestMoveSync(depth, timeLimit, level);
    if (res && res.move) {
      self.postMessage({
        id,
        move: {
          fromSq: res.move.fromSq,
          toSq: res.move.toSq,
          promotion: res.move.promotion || null,
          isEnPassant: Boolean(res.move.isEnPassant),
          castlingType: res.move.castlingType || null,
        },
      });
    } else {
      self.postMessage({ id, move: null });
    }
  } catch (err: any) {
    self.postMessage({ id, move: null, error: err?.message || 'Worker error' });
  }
};
