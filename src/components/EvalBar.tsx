// =====================================================
// NUR SHAXMAT 100 — Pozitsiyani Baholash Indikatori (EvalBar)
// =====================================================

import React from 'react';
import { useGame } from '../store/gameStore';
import { getMaterialBalance } from '../engine/gameLogic';

interface EvalBarProps {
  orientation?: 'vertical' | 'horizontal' | 'auto';
  className?: string;
}

export default function EvalBar({ orientation = 'auto', className = '' }: EvalBarProps) {
  const { state } = useGame();
  const { game, isFlipped } = state;

  const balance = getMaterialBalance(game);

  // Oq va Qora foiz ulushi (-15 dan +15 gacha bo'lgan oraliqda)
  const clamped = Math.max(-15, Math.min(15, balance));
  const whitePercent = 50 + (clamped / 15) * 45; // 5% dan 95% gacha

  const displayBalance = balance > 0 ? `+${balance}` : balance < 0 ? `${balance}` : '0.0';

  const renderVertical = () => (
    <div
      className={`relative w-3 lg:w-3.5 self-stretch my-1 bg-slate-950 border border-slate-700/80 rounded-full overflow-hidden shadow-lg flex flex-col justify-between select-none flex-shrink-0 ${className}`}
      title={`Pozitsion ustunlik: ${displayBalance}`}
    >
      {/* Qora qismi */}
      <div
        className="w-full bg-[#1c1a17] transition-all duration-300 relative flex items-center justify-center"
        style={{ height: `${100 - (isFlipped ? 100 - whitePercent : whitePercent)}%` }}
      >
        {balance < 0 && (
          <span className="text-[8px] font-black text-slate-300 absolute top-1.5 font-mono">
            {displayBalance}
          </span>
        )}
      </div>

      {/* Oq qismi */}
      <div
        className="w-full bg-gradient-to-t from-slate-200 to-white transition-all duration-300 relative flex items-center justify-center shadow-inner"
        style={{ height: `${isFlipped ? 100 - whitePercent : whitePercent}%` }}
      >
        {balance > 0 && (
          <span className="text-[8px] font-black text-slate-900 absolute bottom-1.5 font-mono">
            {displayBalance}
          </span>
        )}
      </div>
    </div>
  );

  const renderHorizontal = () => (
    <div
      className={`w-full h-2.5 flex items-center gap-1.5 px-0.5 shrink-0 select-none pointer-events-none ${className}`}
      title={`Pozitsion ustunlik: ${displayBalance}`}
    >
      <div className="flex-1 h-1 bg-slate-950 border border-slate-700/60 rounded-full overflow-hidden flex shadow-inner">
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
        <span className="text-[8px] font-black text-amber-300 font-mono">
          {displayBalance}
        </span>
      )}
    </div>
  );

  if (orientation === 'vertical') return renderVertical();
  if (orientation === 'horizontal') return renderHorizontal();

  return (
    <>
      <div className="hidden md:flex self-stretch">{renderVertical()}</div>
      <div className="md:hidden w-full">{renderHorizontal()}</div>
    </>
  );
}

