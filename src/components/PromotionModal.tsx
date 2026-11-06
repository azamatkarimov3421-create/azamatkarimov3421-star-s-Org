// =====================================================
// NUR SHAXMAT 100 — Piyoda Aylantirish Modali (Royal Promotion)
// Farzin, Nur, Rux, Fil, Ot — tanlash modali
// =====================================================

import React from 'react';
import { Color, PieceType } from '../engine/types';
import { useGame } from '../store/gameStore';
import PieceIcon from './PieceIcon';
import { useTranslation } from '../i18n/translations';

export default function PromotionModal() {
  const { state, dispatch } = useGame();
  const { showPromotionFor, game, is3D, pendingMove } = state;
  const { t } = useTranslation();

  if (!showPromotionFor) return null;

  // Qaysi rangdagi piyoda marraga yetganini aniqlash
  const color: Color = pendingMove?.piece?.color || (game.currentTurn === 'white' ? 'white' : 'black');

  const PROMOTION_PIECES: Array<{ type: PieceType; name: string; score: number }> = [
    { type: 'Queen', name: t('piece_queen') || 'Farzin', score: 9 },
    { type: 'Nur', name: t('piece_nur') || 'Nur', score: 7 },
    { type: 'Rook', name: t('piece_rook') || 'Rux', score: 5 },
    { type: 'Bishop', name: t('piece_bishop') || 'Fil', score: 3 },
    { type: 'Knight', name: t('piece_knight') || 'Ot', score: 3 },
  ];

  const handleSelect = (pieceType: PieceType) => {
    dispatch({ type: 'PROMOTE', pieceType });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="relative max-w-lg landscape:max-w-xl w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-4 sm:p-6 landscape:p-3 shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-2 border-amber-500/60 ring-1 ring-amber-400/30 max-h-[92dvh] overflow-y-auto">
        {/* Dekorativ nur effekti */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Sarlavha */}
        <div className="text-center mb-3 sm:mb-6 landscape:mb-2 relative">
          <span className="inline-block p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-2xl mb-2 shadow-inner">
            👑
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            {t('promotion_title') || 'Piyoda Marragacha Yetdi!'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            {t('promotion_desc') || 'Piyodani qaysi donaga aylantirasiz?'}
          </p>
        </div>

        {/* Donalar kartalari */}
        <div className="grid grid-cols-2 sm:grid-cols-5 landscape:grid-cols-5 gap-2 sm:gap-3">
          {PROMOTION_PIECES.map(({ type, name, score }) => {
            const isNur = type === 'Nur';
            return (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className={`group relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all duration-200 active:scale-95 cursor-pointer ${
                  isNur
                    ? 'bg-gradient-to-b from-amber-500/25 to-amber-950/50 border-amber-400/70 hover:border-amber-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-400 hover:bg-slate-800 hover:shadow-lg'
                }`}
              >
                {/* Don ikonkasi */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center my-1 group-hover:scale-110 transition-transform">
                  <PieceIcon type={type} color={color} size={46} is3D={false} />
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
      </div>
    </div>
  );
}
