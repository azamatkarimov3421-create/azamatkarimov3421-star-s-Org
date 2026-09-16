// =====================================================
// NUR SHAXMAT 100 — Pozitsiyani Baholash Indikatori (EvalBar)
// =====================================================

import React from 'react';
import { useGame } from '../store/gameStore';
import { getMaterialBalance } from '../engine/gameLogic';

export default function EvalBar({ className = '' }: { className?: string }) {
  const { state } = useGame();
  const { game, isFlipped } = state;

  const balance = getMaterialBalance(game);

  // Oq va Qora foiz ulushi (-15 dan +15 gacha bo'lgan oraliqda)
  const clamped = Math.max(-15, Math.min(15, balance));
  const whitePercent = 50 + (clamped / 15) * 45; // 5% dan 95% gacha

  const displayBalance = balance > 0 ? `+${balance}` : balance < 0 ? `${balance}` : '0.0';

  return (
    <>
      {/* 1. Desktop & Tablet: Vertikal ustun (md+) */}
      <div
        className={`hidden md:flex relative w-4 lg:w-5 h-[380px] lg:h-[540px] bg-slate-900 border-2 border-slate-700/80 rounded-full overflow-hidden shadow-2xl flex-col justify-between select-none flex-shrink-0 ${className}`}
        title={`Pozitsion ustunlik: ${displayBalance}`}
      >
        {/* Qora qismi */}
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

      {/* 2. Mobile: Gorizontal ingichka indikator (< md) */}
      <div
        className="md:hidden w-full max-w-[min(calc(100vw-16px),580px)] mx-auto flex items-center gap-1.5 px-1 py-0.5"
        title={`Pozitsion ustunlik: ${displayBalance}`}
      >
        <div className="flex-1 h-1.5 bg-slate-900 border border-slate-700/60 rounded-full overflow-hidden flex shadow-inner">
          {/* Chap / Qora yoki Oq */}
          <div
            className="h-full bg-slate-800 transition-all duration-300"
            style={{ width: `${100 - (isFlipped ? 100 - whitePercent : whitePercent)}%` }}
          />
          {/* O'ng / Oq yoki Qora */}
          <div
            className="h-full bg-gradient-to-r from-amber-200 to-white transition-all duration-300"
            style={{ width: `${isFlipped ? 100 - whitePercent : whitePercent}%` }}
          />
        </div>
        {balance !== 0 && (
          <span className="text-[9px] font-black text-amber-300 px-1 font-mono">
            {displayBalance}
          </span>
        )}
      </div>
    </>
  );
}
