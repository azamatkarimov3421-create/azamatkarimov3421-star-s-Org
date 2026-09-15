// =====================================================
// NUR SHAXMAT 100 — Rokirovka qoidalari
// =====================================================

import { CastlingRights, Color, GameState, Move, Square } from './types';
import { getPiece } from './board';
import { isSquareAttacked } from './moveGenerator';

/**
 * Rokirovka turlari:
 *
 * QISQA (0-0):
 *   Oq: Shoh E1(4,0) -> C1(2,0), Tura A1(0,0) -> N1(3,0)
 *   Qora: Shoh E10(4,9) -> C10(2,9), Tura A10(0,9) -> N10(3,9)
 *
 * O'RTA (-0-0-):
 *   Oq: Shoh E1(4,0) -> M1(6,0), Tura H1(9,0) -> D1(5,0)
 *   Qora: Shoh E10(4,9) -> M10(6,9), Tura H10(9,9) -> D10(5,9)
 *
 * UZUN (0-0-0):
 *   Oq: Shoh E1(4,0) -> G1(8,0), Tura H1(9,0) -> F1(7,0)
 *   Qora: Shoh E10(4,9) -> G10(8,9), Tura H10(9,9) -> F10(7,9)
 */

interface CastlingConfig {
  kingFrom: Square;
  kingTo: Square;
  rookFrom: Square;
  rookTo: Square;
  // Shoh o'tayotgan va qo'nadigan kvadratlar (hujumdan xoli bo'lishi kerak)
  kingPath: Square[];
  // Shoh va Tura o'rtasidagi bo'sh bo'lishi kerak kvadratlar
  clearSquares: Square[];
  rightKey: keyof CastlingRights;
  notation: string;
  type: 'short' | 'medium' | 'long';
}

export const CASTLING_CONFIGS: Record<Color, CastlingConfig[]> = {
  white: [
    {
      type: 'short',
      notation: '0-0',
      rightKey: 'whiteShort',
      kingFrom: { file: 4, rank: 0 },   // E1
      kingTo:   { file: 2, rank: 0 },   // C1
      rookFrom: { file: 0, rank: 0 },   // A1
      rookTo:   { file: 3, rank: 0 },   // N1
      kingPath: [{ file: 3, rank: 0 }, { file: 2, rank: 0 }],  // D1, C1
      clearSquares: [{ file: 1, rank: 0 }, { file: 2, rank: 0 }, { file: 3, rank: 0 }], // B1, C1, D1
    },
    {
      type: 'medium',
      notation: '-0-0-',
      rightKey: 'whiteMedium',
      kingFrom: { file: 4, rank: 0 },   // E1
      kingTo:   { file: 6, rank: 0 },   // M1
      rookFrom: { file: 9, rank: 0 },   // H1
      rookTo:   { file: 5, rank: 0 },   // D1
      kingPath: [{ file: 5, rank: 0 }, { file: 6, rank: 0 }],  // D1, M1
      clearSquares: [{ file: 5, rank: 0 }, { file: 6, rank: 0 }, { file: 7, rank: 0 }, { file: 8, rank: 0 }], // D1,M1,F1,G1
    },
    {
      type: 'long',
      notation: '0-0-0',
      rightKey: 'whiteLong',
      kingFrom: { file: 4, rank: 0 },   // E1
      kingTo:   { file: 8, rank: 0 },   // G1
      rookFrom: { file: 9, rank: 0 },   // H1
      rookTo:   { file: 7, rank: 0 },   // F1
      kingPath: [{ file: 5, rank: 0 }, { file: 6, rank: 0 }, { file: 7, rank: 0 }, { file: 8, rank: 0 }],
      clearSquares: [{ file: 5, rank: 0 }, { file: 6, rank: 0 }, { file: 7, rank: 0 }, { file: 8, rank: 0 }],
    },
  ],
  black: [
    {
      type: 'short',
      notation: '0-0',
      rightKey: 'blackShort',
      kingFrom: { file: 4, rank: 9 },   // E10
      kingTo:   { file: 2, rank: 9 },   // C10
      rookFrom: { file: 0, rank: 9 },   // A10
      rookTo:   { file: 3, rank: 9 },   // N10
      kingPath: [{ file: 3, rank: 9 }, { file: 2, rank: 9 }],
      clearSquares: [{ file: 1, rank: 9 }, { file: 2, rank: 9 }, { file: 3, rank: 9 }],
    },
    {
      type: 'medium',
      notation: '-0-0-',
      rightKey: 'blackMedium',
      kingFrom: { file: 4, rank: 9 },   // E10
      kingTo:   { file: 6, rank: 9 },   // M10
      rookFrom: { file: 9, rank: 9 },   // H10
      rookTo:   { file: 5, rank: 9 },   // D10
      kingPath: [{ file: 5, rank: 9 }, { file: 6, rank: 9 }],
      clearSquares: [{ file: 5, rank: 9 }, { file: 6, rank: 9 }, { file: 7, rank: 9 }, { file: 8, rank: 9 }],
    },
    {
      type: 'long',
      notation: '0-0-0',
      rightKey: 'blackLong',
      kingFrom: { file: 4, rank: 9 },   // E10
      kingTo:   { file: 8, rank: 9 },   // G10
      rookFrom: { file: 9, rank: 9 },   // H10
      rookTo:   { file: 7, rank: 9 },   // F10
      kingPath: [{ file: 5, rank: 9 }, { file: 6, rank: 9 }, { file: 7, rank: 9 }, { file: 8, rank: 9 }],
      clearSquares: [{ file: 5, rank: 9 }, { file: 6, rank: 9 }, { file: 7, rank: 9 }, { file: 8, rank: 9 }],
    },
  ],
};

export function getCastlingMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  const { board, currentTurn, castlingRights } = state;

  // Shoh hozir shahda bo'lsa, rokirovka qilib bo'lmaydi
  const kingIsInCheck = isSquareAttacked(
    board,
    CASTLING_CONFIGS[currentTurn][0].kingFrom,
    currentTurn === 'white' ? 'black' : 'white'
  );
  if (kingIsInCheck) return moves;

  for (const cfg of CASTLING_CONFIGS[currentTurn]) {
    if (!castlingRights[cfg.rightKey]) continue;

    // Shoh to'g'ri joyidami?
    const king = getPiece(board, cfg.kingFrom);
    if (!king || king.type !== 'King' || king.color !== currentTurn) continue;

    // Tura to'g'ri joyidami?
    const rook = getPiece(board, cfg.rookFrom);
    if (!rook || rook.type !== 'Rook' || rook.color !== currentTurn) continue;

    // Oraliq kvadratlar bo'shmi?
    const pathClear = cfg.clearSquares.every(sq => {
      // Shoh va Tura o'zi bu kvadratlarda bo'lishi mumkin, boshqalar bo'sh bo'lishi kerak
      const piece = getPiece(board, sq);
      return piece === null || piece === king || piece === rook;
    });
    if (!pathClear) continue;

    // Shoh o'tadigan kvadratlar hujumdan xolimi?
    const pathSafe = cfg.kingPath.every(sq =>
      !isSquareAttacked(board, sq, currentTurn === 'white' ? 'black' : 'white')
    );
    if (!pathSafe) continue;

    const kingPiece = king;
    moves.push({
      from: cfg.kingFrom,
      to: cfg.kingTo,
      piece: kingPiece,
      isCastling: cfg.type,
      rookFrom: cfg.rookFrom,
      rookTo: cfg.rookTo,
      notation: cfg.notation,
    });
  }

  return moves;
}

export function updateCastlingRights(
  rights: CastlingRights,
  move: Move
): CastlingRights {
  const newRights = { ...rights };

  // Shoh harakat qilsa — o'sha tomonning barcha rokirovka huquqlari bekor
  if (move.piece.type === 'King') {
    if (move.piece.color === 'white') {
      newRights.whiteShort = false;
      newRights.whiteMedium = false;
      newRights.whiteLong = false;
    } else {
      newRights.blackShort = false;
      newRights.blackMedium = false;
      newRights.blackLong = false;
    }
  }

  // Tura harakat qilsa — tegishli rokirovka huquqi bekor
  if (move.piece.type === 'Rook') {
    const { file, rank } = move.from;
    if (rank === 0) {
      if (file === 0) newRights.whiteShort = false;   // A1 Turasi
      if (file === 9) { newRights.whiteMedium = false; newRights.whiteLong = false; } // H1
    }
    if (rank === 9) {
      if (file === 0) newRights.blackShort = false;   // A10 Turasi
      if (file === 9) { newRights.blackMedium = false; newRights.blackLong = false; } // H10
    }
  }

  // Tura yeyilsa — tegishli rokirovka huquqi bekor
  if (move.capturedPiece?.type === 'Rook') {
    const { file, rank } = move.to;
    if (rank === 0) {
      if (file === 0) newRights.whiteShort = false;
      if (file === 9) { newRights.whiteMedium = false; newRights.whiteLong = false; }
    }
    if (rank === 9) {
      if (file === 0) newRights.blackShort = false;
      if (file === 9) { newRights.blackMedium = false; newRights.blackLong = false; }
    }
  }

  return newRights;
}
