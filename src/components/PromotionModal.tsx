// =====================================================
// NUR SHAXMAT 100 — Piyoda Aylantirish Modali (Royal Promotion)
// =====================================================

import React from 'react';
import { Color, PieceType } from '../engine/types';
import { useGame } from '../store/gameStore';
import PieceIcon from './PieceIcon';

const PROMOTION_PIECES: Array<{ type: PieceType; name: string; score: number; desc: string }> = [
  { type: 'Queen', name: 'Vazir', score: 9, desc: 'Eng kuchli barcha yoʻnalishdagi dona' },
  { type: 'Nur', name: 'Nur', score: 7, desc: 'Donalar ustidan 3 kvadrat sakrovchi maxsus dona' },
  { type: 'Rook', name: 'Tura', score: 5, desc: 'Toʻgʻri chiziqlar boʻylab kuchli qalʼa' },
  { type: 'Bishop', name: 'Fil', score: 3, desc: 'Diagonal chiziqlar ustasi' },
  { type: 'Knight', name: 'Ot', score: 3, desc: 'L-shaklidagi chaqqon sakrovchi' },
];

export default function PromotionModal() {
  const { state, dispatch } = useGame();
  const { showPromotionFor, game } = state;

  if (!showPromotionFor) return null;

  const color: Color = game.currentTurn === 'white' ? 'white' : 'black';

  const handleSelect = (pieceType: PieceType) => {
    dispatch({ type: 'PROMOTE', pieceType });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative max-w-lg w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] border-2 border-amber-500/60 ring-1 ring-amber-400/30">
        {/* Dekorativ nur effekti */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Sarlavha */}
        <div className="text-center mb-6 relative">
          <span className="inline-block p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-2xl mb-2 shadow-inner">
            👑
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            Piyoda Marragacha Yetdi!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {color === 'white' ? 'Oq' : 'Qora'} piyodani qaysi buyuk donga aylantirasiz?
          </p>
        </div>

        {/* Donalar kartalari */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PROMOTION_PIECES.map(({ type, name, score, desc }) => {
            const isNur = type === 'Nur';
            return (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className={`group relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all duration-200 active:scale-95 ${
                  isNur
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-amber-400/60 hover:border-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800 hover:shadow-lg'
                }`}
              >
                {/* Maxsus Nur nishoni */}
                {isNur && (
                  <span className="absolute -top-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-sm">
                    Yangi
                  </span>
                )}

                {/* Don ikonkasi */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center my-1 group-hover:scale-110 transition-transform">
                  <PieceIcon type={type} color={color} size={54} />
                </div>

                {/* Nomi */}
                <span className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300">
                  {name}
                </span>

                {/* Ball belgisi */}
                <span className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-400 border border-slate-700/60">
                  +{score} ball
                </span>
              </button>
            );
          })}
        </div>

        {/* Pastki eslatma */}
        <div className="text-center mt-6 text-slate-500 text-[11px]">
          Tanlangan dona darhol doskada o'z o'rnini egallaydi
        </div>
      </div>
    </div>
  );
}
