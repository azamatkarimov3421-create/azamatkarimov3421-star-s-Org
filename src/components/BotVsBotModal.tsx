// =====================================================
// NUR SHAXMAT 100 — Bot vs Bot Sozlamalari Modali
// Oq va qora bot darajalarini hamda o'yin tezligini tanlash
// =====================================================

import React, { useState } from 'react';
import { BotIcon, SwordsIcon, PlayIcon } from './Icons';
import { useTranslation } from '../i18n/translations';

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#181c19] border border-[#2b3d30] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Sarlavha */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2b3d30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1e3827] border border-[#285535] flex items-center justify-center text-[#4ade80] shadow-inner shrink-0">
              <SwordsIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">{t('bvb_title')}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  AVTOMAT
                </span>
              </div>
              <p className="text-xs text-[#9ca3af]">{t('bvb_subtitle')}</p>
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
          {/* 1. Oq Bot Darajasi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span className="text-xs font-black text-white uppercase tracking-wider">{t('bvb_white_level')}</span>
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
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#1e3827] border-[#22c55e] text-white shadow-[0_0_12px_rgba(34,197,94,0.3)] ring-1 ring-[#22c55e]'
                        : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]'
                    }`}
                  >
                    <span className="text-xs font-black">{lvl.label}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{lvl.sub}</span>
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
                <span className="text-xs font-black text-white uppercase tracking-wider">{t('bvb_black_level')}</span>
              </div>
              <span className="text-xs text-amber-400 font-bold font-mono">
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
                        ? 'bg-[#332616] border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-500'
                        : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]'
                    }`}
                  >
                    <span className="text-xs font-black">{lvl.label}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{lvl.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. O'yin Tezligi (Yurishlar oralig'i) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">{t('bvb_speed_label')}</span>
              <span className="text-xs text-zinc-400 font-mono">
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
                        ? 'bg-[#1a282f] border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.25)] ring-1 ring-sky-400'
                        : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]'
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[9.5px] text-zinc-400">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tezkor Shablonlar (Presets) */}
          <div className="p-3 rounded-2xl bg-[#141b17] border border-[#27372d] flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">{t('bvb_preset_label')}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setWhiteDepth(2);
                  setBlackDepth(2);
                }}
                className="px-2 py-1 rounded-lg bg-[#233027] hover:bg-[#2e4235] text-white text-[11px] font-bold cursor-pointer"
              >
                {t('bvb_preset_equal')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWhiteDepth(3);
                  setBlackDepth(3);
                }}
                className="px-2 py-1 rounded-lg bg-[#233027] hover:bg-[#2e4235] text-purple-300 text-[11px] font-bold cursor-pointer"
              >
                {t('bvb_preset_master')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWhiteDepth(1);
                  setBlackDepth(4);
                }}
                className="px-2 py-1 rounded-lg bg-[#233027] hover:bg-[#2e4235] text-amber-300 text-[11px] font-bold cursor-pointer"
              >
                {t('bvb_preset_test')}
              </button>
            </div>
          </div>
        </div>

        {/* Start Tugmasi */}
        <div className="pt-3 border-t border-[#2b3d30]">
          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(34,197,94,0.35)] active:scale-[0.99] transition-all cursor-pointer"
          >
            <PlayIcon size={20} className="fill-slate-950" />
            <span>{t('bvb_start_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
