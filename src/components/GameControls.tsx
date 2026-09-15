// =====================================================
// NUR SHAXMAT 100 — Boshqaruv va Sozlamalar Paneli
// =====================================================

import React, { useEffect, useCallback } from 'react';
import { useGame } from '../store/gameStore';
import { getBestMove } from '../ai/minimax';
import { TimeControlSelector } from './ChessClock';

const DIFFICULTY_LABELS = ['', 'Oson', "O'rta", 'Kuchli'];

interface GameControlsProps {
  onOpenOnlineModal?: () => void;
}

export default function GameControls({ onOpenOnlineModal }: GameControlsProps) {
  const { state, dispatch } = useGame();
  const { game, gameMode, aiColor, aiDepth, aiThinking, history, isFlipped, soundEnabled } = state;

  const isGameOver = game.status !== 'playing' && game.status !== 'check';

  // AI harakatini boshqarish
  const makeAIMove = useCallback(() => {
    if (gameMode !== 'vsAI') return;
    if (game.currentTurn !== aiColor) return;
    if (isGameOver) return;
    if (aiThinking) return;

    dispatch({ type: 'SET_AI_THINKING', thinking: true });

    setTimeout(() => {
      try {
        const bestMove = getBestMove(game, aiDepth);
        if (bestMove) {
          dispatch({ type: 'APPLY_MOVE', move: bestMove });
        }
      } catch (e) {
        console.error('AI hisoblash xatosi:', e);
      } finally {
        dispatch({ type: 'SET_AI_THINKING', thinking: false });
      }
    }, 400);
  }, [game, gameMode, aiColor, aiDepth, aiThinking, isGameOver, dispatch]);

  useEffect(() => {
    if (gameMode === 'vsAI' && game.currentTurn === aiColor && !isGameOver) {
      makeAIMove();
    }
  }, [game.currentTurn, gameMode, aiColor, isGameOver, makeAIMove]);

  const [hintLoading, setHintLoading] = React.useState(false);

  // Harakat maslahatini olish (Asinxron)
  const handleGetHint = () => {
    if (isGameOver || hintLoading) return;
    setHintLoading(true);
    setTimeout(() => {
      try {
        const bestMove = getBestMove(game, 2);
        if (bestMove) {
          dispatch({ type: 'SET_HINT', move: bestMove });
        }
      } catch (e) {
        console.error('Maslahat hisoblash xatosi:', e);
      } finally {
        setHintLoading(false);
      }
    }, 40);
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-2xl">
      {/* 1. O'yin Rejimi */}
      <div>
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 block">
          O'yin Rejimi
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800/80">
          <button
            onClick={() => dispatch({ type: 'SET_GAME_MODE', mode: 'pvp' })}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              gameMode === 'pvp'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>👥</span>
            <span>2 Kishi</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_GAME_MODE', mode: 'vsAI' })}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              gameMode === 'vsAI'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🤖</span>
            <span>vs AI</span>
          </button>
        </div>
      </div>

      {/* 2. Vaqt Nazorati (Timer) */}
      <div>
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 block">
          Shaxmat Soati (Vaqt)
        </label>
        <TimeControlSelector />
      </div>

      {/* 3. AI Darajasi (faqat vs AI rejimida) */}
      {gameMode === 'vsAI' && (
        <div className="animate-fadeIn">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              AI Kuchliligi
            </label>
            <span className="text-[11px] font-bold text-amber-400">
              {DIFFICULTY_LABELS[aiDepth]}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800/80">
            {[1, 2, 3].map((depth) => (
              <button
                key={depth}
                onClick={() => dispatch({ type: 'SET_AI_DEPTH', depth })}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  aiDepth === depth
                    ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                {DIFFICULTY_LABELS[depth]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Asosiy Tugmalar */}
      <div className="space-y-2 pt-1 border-t border-slate-800/80">
        <button
          onClick={() => dispatch({ type: 'NEW_GAME' })}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 hover:shadow-emerald-700/40 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>✨</span>
          <span>Yangi O'yin Boshlash</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleGetHint}
            disabled={isGameOver || hintLoading}
            className="py-2 px-3 bg-cyan-950/60 hover:bg-cyan-900/60 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-300 font-bold text-xs rounded-xl border border-cyan-800/60 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            title="AI maslahatini doskada nurlantirish"
          >
            <span>💡</span>
            <span>{hintLoading ? 'Qidirilmoqda...' : 'Maslahat'}</span>
          </button>

          <button
            onClick={onOpenOnlineModal}
            className="py-2 px-3 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 font-bold text-xs rounded-xl border border-purple-800/60 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            title="Onlayn Multiplayer xona yaratish yoki kirish"
          >
            <span>🌐</span>
            <span>Onlayn</span>
          </button>
        </div>

        <button
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={history.length === 0 || isGameOver}
          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>↩️</span>
          <span>Bekor Qilish</span>
          {history.length > 0 && (
            <span className="bg-slate-900 text-slate-400 text-[10px] px-1.5 py-0.2 rounded-full">
              {history.length}
            </span>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              if (window.confirm('Raqibga durang taklif qilasizmi?')) {
                dispatch({ type: 'OFFER_DRAW' });
              }
            }}
            disabled={isGameOver}
            className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-sky-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>🤝</span>
            <span>Durang</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Haqiqatan ham taslim bo'lmoqchimisiz?")) {
                dispatch({ type: 'RESIGN' });
              }
            }}
            disabled={isGameOver}
            className="py-2 px-3 bg-slate-800/80 hover:bg-red-950/50 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 font-semibold text-xs rounded-xl border border-slate-700 hover:border-red-800/60 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>🏳️</span>
            <span>Taslim</span>
          </button>
        </div>
      </div>

      {/* 5. Tezkor Qulayliklar */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
          className={`py-2 px-2 rounded-xl border transition-all flex items-center justify-center gap-1 font-medium ${
            isFlipped
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/50'
          }`}
          title="Doska ko'rinishini Oq yoki Qora tomondan qarashga aylantirish"
        >
          <span>🔄</span>
          <span>Aylantirish</span>
        </button>

        <button
          onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
          className={`py-2 px-2 rounded-xl border transition-all flex items-center justify-center gap-1 font-medium ${
            soundEnabled
              ? 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/50'
              : 'bg-red-500/15 text-red-300 border-red-500/40 shadow-sm'
          }`}
          title="Ovoz effektlarini yoqish yoki o'chirish"
        >
          <span>{soundEnabled ? '🔊' : '🔇'}</span>
          <span>{soundEnabled ? 'Ovoz: Yoq' : 'Ovoz: Oʻch'}</span>
        </button>
      </div>
    </div>
  );
}
