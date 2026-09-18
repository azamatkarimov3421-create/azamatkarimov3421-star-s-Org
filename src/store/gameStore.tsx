// =====================================================
// NUR SHAXMAT 100 — O'yin holati boshqaruvi (Context + Reducer)
// =====================================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { GameState, GameStatus, Move, PieceType, Square, squaresEqual } from '../engine/types';
import { createInitialGameState } from '../engine/board';
import { getLegalMoves } from '../engine/moveGenerator';
import { getCastlingMoves } from '../engine/castling';
import { applyMove } from '../engine/gameLogic';
import {
  playMoveSound, playCaptureSound, playCheckSound,
  playCastlingSound, playGameOverSound, playPromotionSound, playNurLeapSound,
  setSoundEnabled, isSoundEnabled
} from '../audio/sounds';
import { speakUzbek, vibrateTouch } from '../audio/speech';
import { onlineManager } from '../services/onlineService';

export type BoardTheme = 'wood' | 'emerald' | 'azure' | 'marble';
export type TimeControl = 0 | 180 | 300 | 600; // 0=unlimited, 180=3m, 300=5m, 600=10m

// ── Holat interfeysi ──────────────────────────────────

export interface AppState {
  game: GameState;
  selectedSquare: Square | null;
  legalMoves: Move[];
  history: GameState[];           // Bekor qilish uchun tarix
  useNumericNotation: boolean;
  gameMode: 'pvp' | 'vsAI' | 'online';
  aiColor: 'black' | 'white';
  aiDepth: number;                // 1=oson, 2=o'rta, 3=qiyin
  aiThinking: boolean;
  showPromotionFor: Square | null;
  pendingMove: Move | null;
  boardTheme: BoardTheme;
  isFlipped: boolean;
  soundEnabled: boolean;
  timeControl: TimeControl;
  whiteTime: number;              // qolgan soniyalar
  blackTime: number;              // qolgan soniyalar
  hintMove: Move | null;          // Maslahat harakati
  roomCode: string | null;
  onlinePlayerColor: 'white' | 'black' | null;
  is3D: boolean;                  // Kitobdagidek 3D fazoviy ko'rinish
}

// ── Harakatlar ────────────────────────────────────────

type Action =
  | { type: 'SELECT_SQUARE'; square: Square }
  | { type: 'APPLY_MOVE'; move: Move }
  | { type: 'APPLY_REMOTE_MOVE'; move: Move }
  | { type: 'REMOTE_RESIGN' }
  | { type: 'REMOTE_DRAW_ACCEPT' }
  | { type: 'PROMOTE'; pieceType: PieceType }
  | { type: 'NEW_GAME' }
  | { type: 'UNDO' }
  | { type: 'TOGGLE_NOTATION' }
  | { type: 'SET_GAME_MODE'; mode: 'pvp' | 'vsAI' | 'online' }
  | { type: 'SET_AI_DEPTH'; depth: number }
  | { type: 'SET_AI_THINKING'; thinking: boolean }
  | { type: 'OFFER_DRAW' }
  | { type: 'RESIGN' }
  | { type: 'DESELECT' }
  | { type: 'SET_THEME'; theme: BoardTheme }
  | { type: 'TOGGLE_FLIP' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_TIME_CONTROL'; seconds: TimeControl }
  | { type: 'TICK_TIMER' }
  | { type: 'SET_HINT'; move: Move | null }
  | { type: 'SET_ONLINE_ROOM'; roomCode: string | null; myColor: 'white' | 'black' | null }
  | { type: 'TOGGLE_3D' }
  | { type: 'SET_3D'; enabled: boolean };

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
    timeControl: 0,
    whiteTime: 0,
    blackTime: 0,
    hintMove: null,
    roomCode: null,
    onlinePlayerColor: null,
    is3D: (() => {
      try {
        const saved = localStorage.getItem('nur_chess_3d_v2');
        if (saved !== null) {
          return saved === 'true';
        }
        localStorage.setItem('nur_chess_3d_v2', 'true');
        return true;
      } catch {
        return true;
      }
    })(),
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
        // Ovoz & Vibratsiya
        if (matchingMove.isCastling) playCastlingSound();
        else if (matchingMove.capturedPiece) {
          if (matchingMove.piece.type === 'Nur') playNurLeapSound();
          else playCaptureSound();
          vibrateTouch([50, 30, 50]);
        } else {
          if (matchingMove.piece.type === 'Nur') playNurLeapSound();
          else playMoveSound();
          vibrateTouch(30);
        }

        const newGame = applyMove(game, matchingMove);

        // Agar onlayn rejimda bo'lsa — raqibga harakatni yuboramiz!
        if (state.gameMode === 'online') {
          onlineManager.sendMessage({ type: 'MOVE', move: matchingMove });
        }

        if (newGame.isInCheck) {
          playCheckSound();
          speakUzbek('Shoh!');
          vibrateTouch([100, 50, 100]);
        }
        if (newGame.status === 'checkmate') {
          playGameOverSound();
          speakUzbek('Shohmat! Oʻyin tugadi.');
        } else if (newGame.status === 'stalemate') {
          playGameOverSound();
          speakUzbek('Pat! Durang natija.');
        }

        return {
          ...state,
          game: newGame,
          selectedSquare: null,
          legalMoves: [],
          hintMove: null,
          history: [...state.history, state.game],
        };
      }

      // Yangi don tanlash
      const piece = game.board[sq.rank]?.[sq.file];
      if (piece && piece.color === game.currentTurn) {
        // Onlayn rejimda faqat o'z donasini tanlay oladi!
        if (state.gameMode === 'online' && state.onlinePlayerColor && piece.color !== state.onlinePlayerColor) {
          return state;
        }

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
      const move = action.move;
      if (move.isPromotion) {
        playPromotionSound();
        speakUzbek(`${move.promotionPiece === 'Queen' ? 'Farzin' : move.promotionPiece === 'Nur' ? 'Nur' : 'Dona'}ga aylandi!`);
      } else if (move.isCastling) {
        playCastlingSound();
      } else if (move.capturedPiece) {
        if (move.piece.type === 'Nur') playNurLeapSound();
        else playCaptureSound();
        vibrateTouch([50, 30, 50]);
      } else {
        if (move.piece.type === 'Nur') playNurLeapSound();
        else playMoveSound();
        vibrateTouch(30);
      }

      const newGame = applyMove(state.game, action.move);
      if (newGame.isInCheck) {
        playCheckSound();
        speakUzbek('Shoh!');
        vibrateTouch([100, 50, 100]);
      }
      if (newGame.status === 'checkmate') {
        playGameOverSound();
        speakUzbek('Shohmat! Oʻyin tugadi.');
      } else if (newGame.status === 'stalemate') {
        playGameOverSound();
        speakUzbek('Pat! Durang natija.');
      }
      return {
        ...state,
        game: newGame,
        selectedSquare: null,
        legalMoves: [],
        hintMove: null,
        history: [...state.history, state.game],
        aiThinking: false,
      };
    }

    case 'APPLY_REMOTE_MOVE': {
      const move = action.move;
      if (move.isPromotion) {
        playPromotionSound();
        speakUzbek(`${move.promotionPiece === 'Queen' ? 'Vazir' : move.promotionPiece === 'Nur' ? 'Nur' : 'Dona'}ga aylandi!`);
      } else if (move.isCastling) {
        playCastlingSound();
      } else if (move.capturedPiece) {
        if (move.piece.type === 'Nur') playNurLeapSound();
        else playCaptureSound();
        vibrateTouch([50, 30, 50]);
      } else {
        if (move.piece.type === 'Nur') playNurLeapSound();
        else playMoveSound();
        vibrateTouch(30);
      }

      const newGame = applyMove(state.game, move);
      if (newGame.isInCheck) {
        playCheckSound();
        speakUzbek('Shoh!');
        vibrateTouch([100, 50, 100]);
      }
      if (newGame.status === 'checkmate') {
        playGameOverSound();
        speakUzbek('Shohmat! Oʻyin tugadi.');
      } else if (newGame.status === 'stalemate') {
        playGameOverSound();
        speakUzbek('Pat! Durang natija.');
      }

      return {
        ...state,
        game: newGame,
        selectedSquare: null,
        legalMoves: [],
        hintMove: null,
        history: [...state.history, state.game],
      };
    }

    case 'REMOTE_RESIGN': {
      const winnerStatus = state.onlinePlayerColor === 'white' ? 'black_resigned' as const : 'white_resigned' as const;
      playGameOverSound();
      speakUzbek("Raqib taslim boʻldi! Siz gʻalaba qozondingiz.");
      return {
        ...state,
        game: { ...state.game, status: winnerStatus },
      };
    }

    case 'REMOTE_DRAW_ACCEPT': {
      playGameOverSound();
      speakUzbek("Raqib durang taklifini qabul qildi!");
      return {
        ...state,
        game: { ...state.game, status: 'draw_mutual' as const },
      };
    }

    case 'PROMOTE': {
      if (!state.pendingMove) return state;
      const moveWithPromo: Move = {
        ...state.pendingMove,
        promotionPiece: action.pieceType,
      };
      const promoMove = state.legalMoves.find(
        m => m.isPromotion && m.promotionPiece === action.pieceType &&
          squaresEqual(m.to, state.pendingMove!.to)
      ) || moveWithPromo;

      playPromotionSound();
      speakUzbek(`${action.pieceType === 'Queen' ? 'Vazir' : action.pieceType === 'Nur' ? 'Nur' : 'Dona'}ga aylandi!`);
      const newGame = applyMove(state.game, promoMove);

      if (state.gameMode === 'online') {
        onlineManager.sendMessage({ type: 'MOVE', move: promoMove });
      }

      if (newGame.isInCheck) playCheckSound();
      if (newGame.status === 'checkmate' || newGame.status === 'stalemate') playGameOverSound();

      return {
        ...state,
        game: newGame,
        selectedSquare: null,
        legalMoves: [],
        showPromotionFor: null,
        pendingMove: null,
        hintMove: null,
        history: [...state.history, state.game],
      };
    }

    case 'SET_TIME_CONTROL':
      return {
        ...state,
        timeControl: action.seconds,
        whiteTime: action.seconds,
        blackTime: action.seconds,
      };

    case 'TICK_TIMER': {
      if (state.timeControl === 0 || state.game.status !== 'playing' && state.game.status !== 'check') {
        return state;
      }
      const isWhiteTurn = state.game.currentTurn === 'white';
      const newWhiteTime = isWhiteTurn ? Math.max(0, state.whiteTime - 1) : state.whiteTime;
      const newBlackTime = !isWhiteTurn ? Math.max(0, state.blackTime - 1) : state.blackTime;

      // Vaqt tugashi
      let newStatus: GameStatus = state.game.status;
      if (newWhiteTime === 0) {
        newStatus = 'white_timeout';
        playGameOverSound();
        speakUzbek('Oq donalar vaqti tugadi! Qora gʻalaba qozondi.');
      } else if (newBlackTime === 0) {
        newStatus = 'black_timeout';
        playGameOverSound();
        speakUzbek('Qora donalar vaqti tugadi! Oq gʻalaba qozondi.');
      }

      return {
        ...state,
        whiteTime: newWhiteTime,
        blackTime: newBlackTime,
        game: { ...state.game, status: newStatus },
      };
    }

    case 'SET_HINT':
      return { ...state, hintMove: action.move };

    case 'SET_ONLINE_ROOM':
      return {
        ...createInitialAppState(),
        boardTheme: state.boardTheme,
        soundEnabled: state.soundEnabled,
        useNumericNotation: state.useNumericNotation,
        is3D: state.is3D,
        roomCode: action.roomCode,
        onlinePlayerColor: action.myColor,
        gameMode: action.roomCode ? 'online' : 'pvp',
        isFlipped: action.myColor === 'black',
      };

    case 'NEW_GAME':
      return {
        ...createInitialAppState(),
        boardTheme: state.boardTheme,
        isFlipped: state.isFlipped,
        soundEnabled: state.soundEnabled,
        useNumericNotation: state.useNumericNotation,
        is3D: state.is3D,
        gameMode: state.gameMode,
        aiDepth: state.aiDepth,
      };

    case 'UNDO': {
      if (state.gameMode === 'online') return state; // Onlaynda orqaga qaytarib bo'lmaydi
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

    case 'TOGGLE_3D': {
      const next = !state.is3D;
      try {
        localStorage.setItem('nur_chess_3d_v2', String(next));
        localStorage.setItem('nur_chess_3d', String(next));
      } catch {}
      return { ...state, is3D: next };
    }

    case 'SET_3D': {
      try {
        localStorage.setItem('nur_chess_3d_v2', String(action.enabled));
        localStorage.setItem('nur_chess_3d', String(action.enabled));
      } catch {}
      return { ...state, is3D: action.enabled };
    }

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
        is3D: state.is3D,
      };

    case 'SET_AI_DEPTH':
      return { ...state, aiDepth: action.depth };

    case 'SET_AI_THINKING':
      return { ...state, aiThinking: action.thinking };

    case 'OFFER_DRAW': {
      if (state.gameMode === 'online') {
        onlineManager.sendMessage({ type: 'ACCEPT_DRAW' });
      }
      const newGame = { ...state.game, status: 'draw_mutual' as const };
      return { ...state, game: newGame };
    }

    case 'RESIGN': {
      if (state.gameMode === 'online') {
        onlineManager.sendMessage({ type: 'RESIGN' });
      }
      const resigningColor = (state.gameMode === 'online' && state.onlinePlayerColor)
        ? state.onlinePlayerColor
        : state.game.currentTurn;
      const resignStatus = resigningColor === 'white' ? 'white_resigned' as const : 'black_resigned' as const;
      const newGame = { ...state.game, status: resignStatus };
      playGameOverSound();
      speakUzbek(resigningColor === state.onlinePlayerColor ? 'Siz taslim boʻldingiz.' : 'Raqib taslim boʻldi.');
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
