// =====================================================
// NUR SHAXMAT 100 — Pozitsiyani Baholash Indikatori (EvalBar)
// =====================================================

import React from 'react';
import { useGame } from '../store/gameStore';
import { getMaterialBalance } from '../engine/gameLogic';

export default function EvalBar() {
  const { state } = useGame();
  const { game, isFlipped } = state;

  const balance = getMaterialBalance(game);

  // Oq va Qora foiz ulushi (-15 dan +15 gacha bo'lgan oraliqda)
  const clamped = Math.max(-15, Math.min(15, balance));
  const whitePercent = 50 + (clamped / 15) * 45; // 5% dan 95% gacha

  const displayBalance = balance > 0 ? `+${balance}` : balance < 0 ? `${balance}` : '0.0';

  return (
    <div
      className="relative w-4 sm:w-5 h-[360px] sm:h-[480px] lg:h-[600px] bg-slate-900 border-2 border-slate-700/80 rounded-full overflow-hidden shadow-2xl flex flex-col justify-between select-none"
      title={`Pozitsion ustunlik: ${displayBalance}`}
    >
      {/* Qora qismi (yuqorida yoki pastda bo'lishi isFlipped ga bog'liq) */}
      <div
        className="w-full bg-slate-900 transition-all duration-300 relative flex items-center justify-center"
        style={{ height: `${100 - (isFlipped ? 100 - whitePercent : whitePercent)}%` }}
      >
        {balance < 0 && (
          <span className="text-[9px] font-black text-slate-300 absolute top-2">
            {displayBalance}
          </span>
        )}
      </div>

      {/* Oq qismi */}
      <div
        className="w-full bg-gradient-to-t from-slate-100 to-amber-100 transition-all duration-300 relative flex items-center justify-center shadow-inner"
        style={{ height: `${isFlipped ? 100 - whitePercent : whitePercent}%` }}
      >
        {balance > 0 && (
          <span className="text-[9px] font-black text-slate-900 absolute bottom-2">
            {displayBalance}
          </span>
        )}
      </div>
    </div>
  );
}
