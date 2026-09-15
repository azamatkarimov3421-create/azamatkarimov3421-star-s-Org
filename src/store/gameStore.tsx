// =====================================================
// NUR SHAXMAT 100 — O'yin holati boshqaruvi (Context + Reducer)
// =====================================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { GameState, Move, PieceType, Square, squaresEqual } from '../engine/types';
import { createInitialGameState } from '../engine/board';
import { getLegalMoves } from '../engine/moveGenerator';
import { getCastlingMoves } from '../engine/castling';
import { applyMove } from '../engine/gameLogic';
import {
  playMoveSound, playCaptureSound, playCheckSound,
  playCastlingSound, playGameOverSound, playPromotionSound, playNurLeapSound,
  setSoundEnabled, isSoundEnabled
} from '../audio/sounds';

export type BoardTheme = 'wood' | 'emerald' | 'azure' | 'marble';

// ── Holat interfeysi ──────────────────────────────────

interface AppState {
  game: GameState;
  selectedSquare: Square | null;
  legalMoves: Move[];
  history: GameState[];           // Bekor qilish uchun tarix
  useNumericNotation: boolean;
  gameMode: 'pvp' | 'vsAI';
  aiColor: 'black' | 'white';
  aiDepth: number;                // 1=oson, 2=o'rta, 3=qiyin
  aiThinking: boolean;
  showPromotionFor: Square | null;
  pendingMove: Move | null;
  boardTheme: BoardTheme;
  isFlipped: boolean;
  soundEnabled: boolean;
}

// ── Harakatlar ────────────────────────────────────────

type Action =
  | { type: 'SELECT_SQUARE'; square: Square }
  | { type: 'APPLY_MOVE'; move: Move }
  | { type: 'PROMOTE'; pieceType: PieceType }
  | { type: 'NEW_GAME' }
  | { type: 'UNDO' }
  | { type: 'TOGGLE_NOTATION' }
  | { type: 'SET_GAME_MODE'; mode: 'pvp' | 'vsAI' }
  | { type: 'SET_AI_DEPTH'; depth: number }
  | { type: 'SET_AI_THINKING'; thinking: boolean }
  | { type: 'OFFER_DRAW' }
  | { type: 'RESIGN' }
  | { type: 'DESELECT' }
  | { type: 'SET_THEME'; theme: BoardTheme }
  | { type: 'TOGGLE_FLIP' }
  | { type: 'TOGGLE_SOUND' };

// ── Boshlang'ich holat ────────────────────────────────

function createInitialAppState(): AppState {
  return {
    game: createInitialGameState(),
    selectedSquare: null,
    legalMoves: [],
    history: [],
    useNumericNotation: false,
    gameMode: 'pvp',
    aiColor: 'black',
    aiDepth: 2,
    aiThinking: false,
    showPromotionFor: null,
    pendingMove: null,
    boardTheme: 'wood',
    isFlipped: false,
    soundEnabled: isSoundEnabled(),
  };
}

// ── Reducer ───────────────────────────────────────────

function gameReducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'SELECT_SQUARE': {
      const sq = action.square;
      const { game, selectedSquare, legalMoves } = state;

      // O'yin tugagan bo'lsa — hech narsa
      if (game.status !== 'playing' && game.status !== 'check') {
        return state;
      }

      // Aylantirish kutilmoqda bo'lsa — hech narsa
      if (state.showPromotionFor) return state;

      // Agar qonuniy harakat maqsadi bo'lsa — harakatni bajar
      const matchingMove = legalMoves.find(m => squaresEqual(m.to, sq));
      if (selectedSquare && matchingMove) {
        // Aylantirish kerakmi?
        if (matchingMove.isPromotion) {
          return {
            ...state,
            showPromotionFor: sq,
            pendingMove: matchingMove,
          };
        }
        // Ovoz
        if (matchingMove.isCastling) playCastlingSound();
        else if (matchingMove.capturedPiece) {
          if (matchingMove.piece.type === 'Nur') playNurLeapSound();
          else playCaptureSound();
        } else {
          if (matchingMove.piece.type === 'Nur') playNurLeapSound();
          else playMoveSound();
        }

        const newGame = applyMove(game, matchingMove);
        if (newGame.isInCheck) playCheckSound();
        if (newGame.status === 'checkmate' || newGame.status === 'stalemate') playGameOverSound();

        return {
          ...state,
          game: newGame,
          selectedSquare: null,
          legalMoves: [],
          history: [...state.history, state.game],
        };
      }

      // Yangi don tanlash
      const piece = game.board[sq.rank]?.[sq.file];
      if (piece && piece.color === game.currentTurn) {
        const normalMoves = getLegalMoves(game, sq);
        const castling = getCastlingMoves(game).filter(m => squaresEqual(m.from, sq));
        const allMoves = [...normalMoves, ...castling];
        return {
          ...state,
          selectedSquare: sq,
          legalMoves: allMoves,
        };
      }

      // Bo'sh kvadrat — tanlashni bekor qilish
      return { ...state, selectedSquare: null, legalMoves: [] };
    }

    case 'APPLY_MOVE': {
      const newGame = applyMove(state.game, action.move);
      return {
        ...state,
        game: newGame,
        selectedSquare: null,
        legalMoves: [],
        history: [...state.history, state.game],
        aiThinking: false,
      };
    }

    case 'PROMOTE': {
      if (!state.pendingMove) return state;
      const moveWithPromo: Move = {
        ...state.pendingMove,
        promotionPiece: action.pieceType,
      };
      // Aylantirish harakatini bajaring, lekin faqat aylantirish turiga mos kelganini oling
      const promoMove = state.legalMoves.find(
        m => m.isPromotion && m.promotionPiece === action.pieceType &&
          squaresEqual(m.to, state.pendingMove!.to)
      ) || moveWithPromo;

      playPromotionSound();
      const newGame = applyMove(state.game, promoMove);
      if (newGame.isInCheck) playCheckSound();
      if (newGame.status === 'checkmate' || newGame.status === 'stalemate') playGameOverSound();

      return {
        ...state,
        game: newGame,
        selectedSquare: null,
        legalMoves: [],
        showPromotionFor: null,
        pendingMove: null,
        history: [...state.history, state.game],
      };
    }

    case 'NEW_GAME':
      return {
        ...createInitialAppState(),
        boardTheme: state.boardTheme,
        isFlipped: state.isFlipped,
        soundEnabled: state.soundEnabled,
        useNumericNotation: state.useNumericNotation,
        gameMode: state.gameMode,
        aiDepth: state.aiDepth,
      };

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const prevHistory = [...state.history];
      const prevGame = prevHistory.pop()!;
      return {
        ...state,
        game: prevGame,
        history: prevHistory,
        selectedSquare: null,
        legalMoves: [],
        showPromotionFor: null,
        pendingMove: null,
        aiThinking: false,
      };
    }

    case 'TOGGLE_NOTATION':
      return { ...state, useNumericNotation: !state.useNumericNotation };

    case 'SET_THEME':
      return { ...state, boardTheme: action.theme };

    case 'TOGGLE_FLIP':
      return { ...state, isFlipped: !state.isFlipped };

    case 'TOGGLE_SOUND': {
      const nextSound = !state.soundEnabled;
      setSoundEnabled(nextSound);
      return { ...state, soundEnabled: nextSound };
    }

    case 'SET_GAME_MODE':
      return {
        ...createInitialAppState(),
        gameMode: action.mode,
        aiDepth: state.aiDepth,
        boardTheme: state.boardTheme,
        isFlipped: state.isFlipped,
        soundEnabled: state.soundEnabled,
        useNumericNotation: state.useNumericNotation,
      };

    case 'SET_AI_DEPTH':
      return { ...state, aiDepth: action.depth };

    case 'SET_AI_THINKING':
      return { ...state, aiThinking: action.thinking };

    case 'OFFER_DRAW': {
      const newGame = { ...state.game, status: 'draw_mutual' as const };
      return { ...state, game: newGame };
    }

    case 'RESIGN': {
      const resignStatus = state.game.currentTurn === 'white' ? 'white_resigned' as const : 'black_resigned' as const;
      const newGame = { ...state.game, status: resignStatus };
      playGameOverSound();
      return { ...state, game: newGame };
    }

    case 'DESELECT':
      return { ...state, selectedSquare: null, legalMoves: [] };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────

interface GameContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialAppState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
