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
  const { showPromotionFor, game, pendingMove } = state;
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm sm:max-w-lg landscape:max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl p-3 sm:p-5 landscape:p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-2 border-amber-500/60 ring-1 ring-amber-400/30 max-h-[96dvh] overflow-y-auto">
        {/* Dekorativ nur effekti */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Sarlavha */}
        <div className="text-center mb-2.5 sm:mb-4 landscape:mb-1 relative">
          <span className="inline-block p-1.5 sm:p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xl sm:text-2xl mb-1 shadow-inner">
            👑
          </span>
          <h2 className="text-lg sm:text-2xl landscape:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            {t('promotion_title') || 'Piyoda Marragacha Yetdi!'}
          </h2>
          <p className="text-slate-300 text-[11px] sm:text-xs mt-0.5">
            {t('promotion_desc') || 'Piyodani qaysi donaga aylantirasiz?'}
          </p>
        </div>

        {/* Donalar kartalari: Portrait telefonlarda 2 ustun (katta, qulay va markazda), Landscape va Desktopda 5 ta bir qatorda */}
        <div className="grid grid-cols-2 sm:grid-cols-5 landscape:grid-cols-5 gap-2 sm:gap-2.5 landscape:gap-1.5">
          {PROMOTION_PIECES.map(({ type, name, score }, index) => {
            const isNur = type === 'Nur';
            const isLast = index === 4;
            return (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className={`group relative flex flex-col items-center justify-between p-2 sm:p-2.5 landscape:p-1 rounded-xl sm:rounded-2xl border transition-all duration-200 active:scale-95 cursor-pointer min-w-0 ${
                  isLast ? 'col-span-2 sm:col-span-1 landscape:col-span-1 max-w-[50%] sm:max-w-none landscape:max-w-none mx-auto w-full' : ''
                } ${
                  isNur
                    ? 'bg-gradient-to-b from-amber-500/25 to-amber-950/50 border-amber-400/70 hover:border-amber-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-400 hover:bg-slate-800 hover:shadow-lg'
                }`}
              >
                {/* Don ikonkasi */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 landscape:w-8 landscape:h-8 flex items-center justify-center my-0.5 group-hover:scale-110 transition-transform">
                  <PieceIcon type={type} color={color} size={38} is3D={false} />
                </div>

                {/* Nomi */}
                <span className="font-bold text-[11px] sm:text-xs landscape:text-[10px] text-slate-100 group-hover:text-amber-300 truncate w-full text-center">
                  {name}
                </span>

                {/* Ball belgisi */}
                <span className="mt-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-950/80 text-amber-400 border border-slate-700/60">
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
