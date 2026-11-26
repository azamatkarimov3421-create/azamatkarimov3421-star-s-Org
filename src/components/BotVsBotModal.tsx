// =====================================================
// NUR SHAXMAT 100 — Bot vs Bot Sozlamalari Modali
// Oq va qora bot darajalarini hamda o'yin tezligini tanlash
// =====================================================

import React, { useState } from 'react';
import { BotIcon, SwordsIcon, PlayIcon } from './Icons';
import { useTranslation } from '../i18n/translations';
import { useGame } from '../store/gameStore';

interface BotVsBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (whiteDepth: number, blackDepth: number, speed: number) => void;
  initialWhiteDepth?: number;
  initialBlackDepth?: number;
  initialSpeed?: number;
}

const AI_LEVELS = [
  { depth: 1, label: 'Havaskor', sub: 'Oson (D-1)', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { depth: 2, label: 'Tajribali', sub: "Oʻrta (D-2)", badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { depth: 3, label: 'Usta', sub: 'Kuchli (D-3)', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { depth: 4, label: 'Grosmeyster', sub: 'Pro (D-4)', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
];

export default function BotVsBotModal({
  isOpen,
  onClose,
  onStart,
  initialWhiteDepth = 2,
  initialBlackDepth = 2,
  initialSpeed = 2000,
}: BotVsBotModalProps) {
  const { t } = useTranslation();
  const { state } = useGame();
  const isLight =
    state.appTheme === 'light' || (state.appTheme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [whiteDepth, setWhiteDepth] = useState<number>(initialWhiteDepth);
  const [blackDepth, setBlackDepth] = useState<number>(initialBlackDepth);
  const [speed, setSpeed] = useState<number>(initialSpeed);

  const localizedAiLevels = [
    { depth: 1, label: t('ai_lvl_amateur'), sub: t('ai_lvl_amateur_sub'), badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { depth: 2, label: t('ai_lvl_experienced'), sub: t('ai_lvl_experienced_sub'), badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { depth: 3, label: t('ai_lvl_master'), sub: t('ai_lvl_master_sub'), badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { depth: 4, label: t('ai_lvl_grandmaster'), sub: t('ai_lvl_grandmaster_sub'), badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  ];

  const localizedSpeedOptions = [
    { ms: 600, label: t('bvb_speed_fast'), icon: '⚡', desc: t('bvb_speed_fast_desc') },
    { ms: 2000, label: t('bvb_speed_medium'), icon: '⏱️', desc: t('bvb_speed_medium_desc') },
    { ms: 5000, label: t('bvb_speed_deep'), icon: '🧠', desc: t('bvb_speed_deep_desc') },
  ];

  if (!isOpen) return null;

  const handleStartGame = () => {
    onStart(whiteDepth, blackDepth, speed);
  };

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className={`relative w-full max-w-lg landscape:max-w-3xl nur-glass-modal rounded-3xl p-4 sm:p-6 landscape:p-2.5 flex flex-col max-h-[96dvh] landscape:overflow-hidden ${isLight ? 'text-stone-900' : 'text-[#f5f5f4]'}`}>
        {/* Sarlavha */}
        <div className={`flex items-center justify-between pb-3.5 landscape:pb-1 border-b ${isLight ? 'border-black/[0.09]' : 'border-[#2b3d30]'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 landscape:w-7 landscape:h-7 landscape:rounded-xl rounded-2xl border flex items-center justify-center text-[#4ade80] shadow-inner shrink-0 ${isLight ? 'bg-[#5b992e]/15 border-black/[0.09]' : 'bg-[#1e3827] border-[#285535]'}`}>
              <SwordsIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg landscape:text-xs font-black ${isLight ? 'text-stone-900' : 'text-white'}`}>{t('bvb_title')}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 border ${isLight ? 'text-amber-700 border-amber-600/25' : 'text-amber-300 border-amber-400/30'}`}>
                  AVTOMAT
                </span>
              </div>
              <p className={`text-xs landscape:text-[9.5px] ${isLight ? 'text-stone-500' : 'text-[#9ca3af]'}`}>{t('bvb_subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm transition-all cursor-pointer ${isLight ? 'bg-black/[0.06] hover:bg-black/10 text-stone-500 hover:text-stone-900' : 'bg-[#233027] hover:bg-[#2f4235] text-[#9ca3af] hover:text-white'}`}
          >
            ✕
          </button>
        </div>

        {/* Asosiy qism */}
        <div className="py-2.5 landscape:py-1 space-y-3 landscape:space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-3.5">
          {/* 1. Oq Bot Darajasi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-stone-900' : 'text-white'}`}>{t('bvb_white_level')}</span>
              </div>
              <span className="text-xs text-[#4ade80] font-bold font-mono">
                {localizedAiLevels.find((l) => l.depth === whiteDepth)?.label} (D-{whiteDepth})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {localizedAiLevels.map((lvl) => {
                const isSelected = whiteDepth === lvl.depth;
                return (
                  <button
                    key={`white-${lvl.depth}`}
                    type="button"
                    onClick={() => setWhiteDepth(lvl.depth)}
                    className={`p-2 landscape:p-0.5 rounded-2xl landscape:rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
                      isSelected
                        ? (isLight ? 'bg-emerald-50/95 border-[#5b992e] text-stone-900 shadow-sm ring-1 ring-[#5b992e]' : 'bg-[#1e3827] border-[#22c55e] text-white shadow-[0_0_12px_rgba(34,197,94,0.3)] ring-1 ring-[#22c55e]')
                        : (isLight ? 'bg-black/[0.04] border-black/[0.08] text-stone-700 hover:bg-white/80' : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]')
                    }`}
                  >
                    <span className="text-xs font-black">{lvl.label}</span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>{lvl.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Qora Bot Darajasi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#383531] border border-white/60 shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
                <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-stone-900' : 'text-white'}`}>{t('bvb_black_level')}</span>
              </div>
              <span className={`text-xs font-bold font-mono ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                {localizedAiLevels.find((l) => l.depth === blackDepth)?.label} (D-{blackDepth})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {localizedAiLevels.map((lvl) => {
                const isSelected = blackDepth === lvl.depth;
                return (
                  <button
                    key={`black-${lvl.depth}`}
                    type="button"
                    onClick={() => setBlackDepth(lvl.depth)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                      isSelected
                        ? (isLight ? 'bg-amber-50/95 border-amber-500 text-stone-900 shadow-sm ring-1 ring-amber-500' : 'bg-[#332616] border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-500')
                        : (isLight ? 'bg-black/[0.04] border-black/[0.08] text-stone-700 hover:bg-white/80' : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]')
                    }`}
                  >
                    <span className="text-xs font-black">{lvl.label}</span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>{lvl.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
          </div>

          {/* 3. O'yin Tezligi (Yurishlar oralig'i) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-stone-900' : 'text-white'}`}>{t('bvb_speed_label')}</span>
              <span className={`text-xs font-mono ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>
                ⏱️ {speed >= 1000 ? `${speed / 1000} ${t('bvb_seconds')}` : `${speed} ms`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {localizedSpeedOptions.map((opt) => {
                const isSelected = speed === opt.ms;
                return (
                  <button
                    key={`speed-${opt.ms}`}
                    type="button"
                    onClick={() => setSpeed(opt.ms)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                      isSelected
                        ? (isLight ? 'bg-sky-50/95 border-sky-500 text-stone-900 shadow-sm ring-1 ring-sky-500' : 'bg-[#1a282f] border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.25)] ring-1 ring-sky-400')
                        : (isLight ? 'bg-black/[0.04] border-black/[0.08] text-stone-700 hover:bg-white/80' : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]')
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className={`text-[9.5px] ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tezkor Shablonlar (Presets) */}
          <div className={`p-2.5 landscape:p-1 rounded-2xl landscape:rounded-xl border flex items-center justify-between text-xs landscape:text-[10px] ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-[#141b17] border-[#27372d]'}`}>
            <span className={`font-medium ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>{t('bvb_preset_label')}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setWhiteDepth(2);
                  setBlackDepth(2);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${isLight ? 'bg-black/[0.06] hover:bg-black/10 text-stone-900' : 'bg-[#233027] hover:bg-[#2e4235] text-white'}`}
              >
                {t('bvb_preset_equal')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWhiteDepth(3);
                  setBlackDepth(3);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${isLight ? 'bg-black/[0.06] hover:bg-black/10 text-purple-700' : 'bg-[#233027] hover:bg-[#2e4235] text-purple-300'}`}
              >
                {t('bvb_preset_master')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWhiteDepth(1);
                  setBlackDepth(4);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${isLight ? 'bg-black/[0.06] hover:bg-black/10 text-amber-700' : 'bg-[#233027] hover:bg-[#2e4235] text-amber-300'}`}
              >
                {t('bvb_preset_test')}
              </button>
            </div>
          </div>
        </div>

        {/* Start Tugmasi */}
        <div className={`pt-3 border-t ${isLight ? 'border-black/[0.09]' : 'border-[#2b3d30]'}`}>
          <button
            type="button"
            onClick={handleStartGame}
            className={`w-full py-2.5 sm:py-3.5 landscape:py-1.5 landscape:text-xs landscape:rounded-xl px-4 rounded-2xl nur-cta-btn bg-gradient-to-b from-[#6ab832] to-[#48861c] hover:brightness-105 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(34,197,94,0.35)] active:scale-[0.99] transition-all cursor-pointer ${isLight ? 'text-stone-900' : 'text-white'}`}
          >
            <PlayIcon size={20} className="fill-slate-950" />
            <span>{t('bvb_start_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
