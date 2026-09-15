// =====================================================
// NUR SHAXMAT 100 — O'yin Yakuni Ekrani (Game Over Modal)
// =====================================================

import React, { useState } from 'react';
import { useGame } from '../store/gameStore';

export default function GameOverModal() {
  const { state, dispatch } = useGame();
  const { game, gameMode, aiColor } = state;
  const { status, moveHistory } = game;

  const [dismissed, setDismissed] = useState(false);

  // O'yin davom etayotgan bo'lsa yoki modal vaqtincha yopilgan bo'lsa
  if (status === 'playing' || status === 'check' || dismissed) {
    return null;
  }

  let title = "O'yin Yakunlandi";
  let subtitle = '';
  let icon = '🏆';
  let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  switch (status) {
    case 'checkmate': {
      // Shohmat bo'lganda yurish navbati qaysi tomonda bo'lsa, o'sha yutqazdi
      const winner = game.currentTurn === 'white' ? 'Qora' : 'Oq';
      const isWinnerAI = gameMode === 'vsAI' && (
        (winner === 'Qora' && aiColor === 'black') || (winner === 'Oq' && aiColor === 'white')
      );
      title = `${winner} G'alaba Qozondi!`;
      subtitle = isWinnerAI
        ? "Sun'iy Intellekt shohmat qildi!"
        : "Ajoyib shohmat bilan g'alaba qozonildi!";
      icon = '👑';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      break;
    }
    case 'stalemate': {
      title = "PAT — Durang!";
      subtitle = "Shohga hujum yo'q, ammo birorta ham qonuniy yurish qolmadi.";
      icon = '⚖️';
      badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      break;
    }
    case 'draw_repetition': {
      title = "Durang!";
      subtitle = "Bir xil pozitsiya uch marta takrorlandi.";
      icon = '🔄';
      badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      break;
    }
    case 'draw_mutual': {
      title = "Durang — Kelishuv";
      subtitle = "Har ikki tomon teng natijaga rozi bo'ldi.";
      icon = '🤝';
      badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      break;
    }
    case 'draw_50move': {
      title = "Durang — 50 Harakat";
      subtitle = "Piyoda surilmasdan va dona urilmasdan 50 harakat o'tdi.";
      icon = '⏱️';
      badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      break;
    }
    case 'white_resigned': {
      title = "Qora G'alaba Qozondi!";
      subtitle = "Oq donalar taslim bo'ldi.";
      icon = '🏳️';
      break;
    }
    case 'black_resigned': {
      title = "Oq G'alaba Qozondi!";
      subtitle = "Qora donalar taslim bo'ldi.";
      icon = '🏳️';
      break;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-slate-700/80 text-center">
        {/* Yuqori yorug'lik g'ubori */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Natija Ikonkasi */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700 text-4xl mb-4 shadow-inner">
          {icon}
        </div>

        {/* Holat nishoni */}
        <div className="mb-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badgeColor}`}>
            O'yin Yakuni
          </span>
        </div>

        {/* Asosiy Sarlavha */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2">
          {title}
        </h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* Statistika qutisi */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-6 text-xs">
          <div>
            <div className="text-slate-500 font-medium">Jami Harakatlar</div>
            <div className="text-slate-200 font-bold text-base mt-0.5">
              {Math.ceil(moveHistory.length / 2)} ta
            </div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Yutib Olingan Donlar</div>
            <div className="text-slate-200 font-bold text-base mt-0.5">
              {game.capturedByWhite.length + game.capturedByBlack.length} ta
            </div>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              setDismissed(false);
              dispatch({ type: 'NEW_GAME' });
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>✨</span>
            <span>Yangi O'yin Boshlash</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all"
          >
            Doskani ko'zdan kechirish
          </button>
        </div>
      </div>
    </div>
  );
}
