// =====================================================
// NUR SHAXMAT 100 — Kompyuter Bilan (Bot) Sozlamalari Modali
// Bot darajasi va o'yinchi rangini tanlash
// =====================================================

import React, { useState } from 'react';
import { BotIcon, PlayIcon } from './Icons';
import { useTranslation } from '../i18n/translations';

interface VsAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (depth: number, playerColor: 'white' | 'black') => void;
  initialDepth?: number;
  initialColor?: 'white' | 'black';
}

export const AI_LEVELS = [
  { depth: 1, label: 'Havaskor', sub: 'Oson (D-1)', rating: 1000, desc: 'Yangi oʻrganuvchilar uchun' },
  { depth: 2, label: 'Tajribali', sub: 'Oʻrta (D-2)', rating: 1400, desc: 'Balanslashgan faol oʻyin' },
  { depth: 3, label: 'Usta', sub: 'Kuchli (D-3)', rating: 1800, desc: 'Chuqur taktik kombinatsiyalar' },
  { depth: 4, label: 'Grosmeyster', sub: 'Pro (D-4)', rating: 2200, desc: 'Professional hisob-kitob' },
];

export default function VsAiModal({
  isOpen,
  onClose,
  onStart,
  initialDepth = 2,
  initialColor = 'white',
}: VsAiModalProps) {
  const { t } = useTranslation();
  const [selectedDepth, setSelectedDepth] = useState<number>(initialDepth);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>(initialColor);

  const localizedAiLevels = [
    { depth: 1, label: t('ai_lvl_amateur'), sub: t('ai_lvl_amateur_sub'), rating: 1000, desc: t('ai_lvl_amateur_desc') },
    { depth: 2, label: t('ai_lvl_experienced'), sub: t('ai_lvl_experienced_sub'), rating: 1400, desc: t('ai_lvl_experienced_desc') },
    { depth: 3, label: t('ai_lvl_master'), sub: t('ai_lvl_master_sub'), rating: 1800, desc: t('ai_lvl_master_desc') },
    { depth: 4, label: t('ai_lvl_grandmaster'), sub: t('ai_lvl_grandmaster_sub'), rating: 2200, desc: t('ai_lvl_grandmaster_desc') },
  ];

  if (!isOpen) return null;

  const handleStart = () => {
    onStart(selectedDepth, selectedColor);
  };

  const currentLevelObj = localizedAiLevels.find((l) => l.depth === selectedDepth) || localizedAiLevels[1];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#181c19] border border-[#2b3d30] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Sarlavha */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2b3d30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1e3827] border border-[#285535] flex items-center justify-center text-[#4ade80] shadow-inner shrink-0">
              <BotIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">{t('vsai_title')}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI BOT
                </span>
              </div>
              <p className="text-xs text-[#9ca3af]">{t('vsai_subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#233027] hover:bg-[#2f4235] text-[#9ca3af] hover:text-white font-bold flex items-center justify-center text-sm transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Asosiy qism */}
        <div className="py-4 space-y-5">
          {/* 1. Bot Darajasi */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black text-white uppercase tracking-wider">{t('vsai_difficulty')}</span>
              <span className="text-xs text-[#4ade80] font-bold font-mono">
                {currentLevelObj.label} ({currentLevelObj.rating} {t('rating_label')})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {localizedAiLevels.map((lvl) => {
                const isSelected = selectedDepth === lvl.depth;
                return (
                  <button
                    key={'ai-lvl-' + lvl.depth}
                    type="button"
                    onClick={() => setSelectedDepth(lvl.depth)}
                    className={'p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer select-none ' +
                      (isSelected
                        ? 'bg-[#1e3827] border-[#22c55e] text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] ring-1 ring-[#22c55e]'
                        : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black">{lvl.label}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{lvl.rating}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">{lvl.sub}</span>
                    <span className="text-[9.5px] text-zinc-400/80 leading-tight mt-0.5">{lvl.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. O'yinchi Rangi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">{t('vsai_color_label')}</span>
              <span className="text-xs text-zinc-400 font-mono">
                {selectedColor === 'white' ? t('vsai_first_move_white') : t('vsai_first_move_black')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedColor('white')}
                className={'p-3 rounded-2xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer select-none ' +
                  (selectedColor === 'white'
                    ? 'bg-[#233027] border-[#22c55e] text-white shadow-[0_0_12px_rgba(34,197,94,0.25)] ring-1 ring-[#22c55e]'
                    : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]')}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <div className="text-left">
                  <div className="text-xs font-black text-white">{t('vsai_color_white')}</div>
                  <div className="text-[9.5px] text-zinc-400">{t('vsai_white_desc')}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedColor('black')}
                className={'p-3 rounded-2xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer select-none ' +
                  (selectedColor === 'black'
                    ? 'bg-[#233027] border-[#22c55e] text-white shadow-[0_0_12px_rgba(34,197,94,0.25)] ring-1 ring-[#22c55e]'
                    : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]')}
              >
                <span className="w-4 h-4 rounded-full bg-[#111] border border-white/60 shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
                <div className="text-left">
                  <div className="text-xs font-black text-white">{t('vsai_color_black')}</div>
                  <div className="text-[9.5px] text-zinc-400">{t('vsai_black_desc')}</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Start Tugmasi */}
        <div className="pt-3 border-t border-[#2b3d30]">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(34,197,94,0.35)] active:scale-[0.99] transition-all cursor-pointer"
          >
            <PlayIcon size={20} className="fill-slate-950" />
            <span>{t('vsai_start_btn')} ({currentLevelObj.label.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
