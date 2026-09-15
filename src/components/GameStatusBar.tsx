// =====================================================
// NUR SHAXMAT 100 — Holat va Ogohlantirish Paneli
// =====================================================

import React from 'react';
import { useGame } from '../store/gameStore';
import { GameStatus } from '../engine/types';

const STATUS_MESSAGES: Record<GameStatus, string> = {
  playing: '',
  check: '⚠️ SHOH! Shohingiz xavf ostida!',
  checkmate: '♛ SHOHMAT! Oʻyin tugadi!',
  stalemate: '⚖️ PAT! Durang natija.',
  draw_repetition: '🔄 Uch marta takrorlash — Durang!',
  draw_mutual: '🤝 Kelishuv boʻyicha Durang!',
  draw_50move: '⏱️ 50 ta harakatli qoida — Durang!',
  white_resigned: '🏳️ Oq taslim boʻldi!',
  black_resigned: '🏳️ Qora taslim boʻldi!',
  white_timeout: '⏱️ Oq vaqti tugadi!',
  black_timeout: '⏱️ Qora vaqti tugadi!',
};

export default function GameStatusBar() {
  const { state } = useGame();
  const { game, aiThinking } = state;
  const { status, currentTurn } = game;

  if (status === 'playing' && !aiThinking) {
    return null; // O'yinchi kartasi navbatni ko'rsatib turadi
  }

  const isCheck = status === 'check';

  return (
    <div className="w-full animate-fadeIn">
      {isCheck && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-950/80 border border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-red-200 text-xs font-bold animate-pulse">
          <span className="text-lg">🔥</span>
          <div className="flex-1">
            <span>{STATUS_MESSAGES.check}</span>
            <div className="text-[10px] text-red-300 font-normal">
              {currentTurn === 'white' ? 'Oq' : 'Qora'} shohni qutqarish kerak
            </div>
          </div>
        </div>
      )}

      {status !== 'playing' && status !== 'check' && (
        <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-200 text-xs font-bold text-center shadow-lg">
          {STATUS_MESSAGES[status]}
        </div>
      )}

      {status === 'playing' && aiThinking && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          <span>Sun'iy Intellekt eng yaxshi harakatni qidirmoqda...</span>
        </div>
      )}
    </div>
  );
}
