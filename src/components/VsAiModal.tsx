// =====================================================
// NUR SHAXMAT 100 — AI Botlar Ro'yxati Modali (VsAiModal)
// Chess.com uslubidagi vektorli va interaktiv botlar tanlovi
// =====================================================

import React, { useState } from 'react';
import { BotIcon, PlayIcon, SwordsIcon } from './Icons';
import { useTranslation } from '../i18n/translations';

export interface BotCharacter {
  depth: number;
  name: string;
  titleKey: string;
  subKey: string;
  descKey: string;
  rating: number;
  avatar: string;
  accentColor: string;
  badgeColor: string;
}

export const BOT_ROSTER: BotCharacter[] = [
  {
    depth: 1,
    name: 'Bot Sardor',
    titleKey: 'ai_lvl_amateur',
    subKey: 'ai_lvl_amateur_sub',
    descKey: 'ai_lvl_amateur_desc',
    rating: 1000,
    avatar: '🤖',
    accentColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    depth: 2,
    name: 'Bot Temur',
    titleKey: 'ai_lvl_experienced',
    subKey: 'ai_lvl_experienced_sub',
    descKey: 'ai_lvl_experienced_desc',
    rating: 1400,
    avatar: '⚡',
    accentColor: 'border-blue-500 bg-blue-500/10 text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    depth: 3,
    name: 'Bot Alp Er Toʻnga',
    titleKey: 'ai_lvl_master',
    subKey: 'ai_lvl_master_sub',
    descKey: 'ai_lvl_master_desc',
    rating: 1800,
    avatar: '👑',
    accentColor: 'border-purple-500 bg-purple-500/10 text-purple-400',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    depth: 4,
    name: 'Bot Al-Xorazmiy',
    titleKey: 'ai_lvl_grandmaster',
    subKey: 'ai_lvl_grandmaster_sub',
    descKey: 'ai_lvl_grandmaster_desc',
    rating: 2200,
    avatar: '💎',
    accentColor: 'border-amber-500 bg-amber-500/10 text-amber-400',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

interface VsAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (depth: number, playerColor: 'white' | 'black') => void;
  initialDepth?: number;
  initialColor?: 'white' | 'black';
}

export default function VsAiModal({
  isOpen,
  onClose,
  onStart,
  initialDepth = 2,
  initialColor = 'white',
}: VsAiModalProps) {
  const { t } = useTranslation();
  const [selectedDepth, setSelectedDepth] = useState<number>(initialDepth);
  const [colorChoice, setColorChoice] = useState<'white' | 'random' | 'black'>(
    initialColor === 'black' ? 'black' : 'white'
  );

  if (!isOpen) return null;

  const currentBot = BOT_ROSTER.find((b) => b.depth === selectedDepth) || BOT_ROSTER[1];

  const handleStartGame = () => {
    let finalColor: 'white' | 'black' = 'white';
    if (colorChoice === 'random') {
      finalColor = Math.random() < 0.5 ? 'white' : 'black';
    } else {
      finalColor = colorChoice;
    }
    onStart(selectedDepth, finalColor);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#181c19] border border-[#2b3d30] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#f1f1f1]">
        {/* ── 1. MODAL SARLAVHASI ──────────────────────────────── */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#2b3d30] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1e3827] border border-[#285535] flex items-center justify-center text-[#4ade80] shadow-inner shrink-0">
              <BotIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {t('vsai_title')}
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  4 TA RAQIB
                </span>
              </div>
              <p className="text-xs text-[#9ca3af]">
                {t('vsai_subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#233027] hover:bg-[#2f4235] text-[#9ca3af] hover:text-white font-bold flex items-center justify-center text-sm transition-all cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* ── 2. SCROLLABLE ASOSIY QISM ───────────────────────── */}
        <div className="flex-1 overflow-y-auto py-3.5 space-y-4 pr-1">
          {/* BOTLAR RO'YXATI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-[#9ca3af] uppercase tracking-wider">
                {t('vsai_difficulty')}
              </span>
              <span className="text-xs text-[#4ade80] font-bold font-mono">
                {currentBot.name} ({currentBot.rating} {t('rating_label')})
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {BOT_ROSTER.map((bot) => {
                const isSelected = selectedDepth === bot.depth;
                return (
                  <button
                    key={'bot-' + bot.depth}
                    type="button"
                    onClick={() => setSelectedDepth(bot.depth)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer select-none relative ${
                      isSelected
                        ? 'bg-[#1b2b20] border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.2)] ring-1 ring-[#22c55e]'
                        : 'bg-[#141b17] border-[#27372d] hover:border-[#384f3f] hover:bg-[#18211c]'
                    }`}
                  >
                    {/* Bot Avatari */}
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-md shrink-0 ${
                        isSelected ? bot.accentColor : 'bg-[#1d2720] border-[#2a3a2e]'
                      }`}
                    >
                      {bot.avatar}
                    </div>

                    {/* Bot Ma'lumotlari */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-black text-white truncate">
                            {bot.name}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${bot.badgeColor}`}>
                            {t(bot.titleKey)}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                          ⭐ {bot.rating}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#9ca3af] mt-0.5 line-clamp-1 leading-snug">
                        {t(bot.descKey)}
                      </div>
                    </div>

                    {/* Tanlanganlik nishoni (Radio) */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        isSelected ? 'border-[#22c55e] bg-[#22c55e]' : 'border-[#4b5563]'
                      }`}
                    >
                      {isSelected && <span className="text-[10px] text-slate-950 font-black">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DONALAR RANGINI TANLASH (Oqlar / Tasodifiy / Qoralar) */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-black text-[#9ca3af] uppercase tracking-wider">
                {t('vsai_color_label')}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {colorChoice === 'white'
                  ? t('vsai_first_move_white')
                  : colorChoice === 'black'
                  ? t('vsai_first_move_black')
                  : t('vsai_random_desc')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Oqlar */}
              <button
                type="button"
                onClick={() => setColorChoice('white')}
                className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                  colorChoice === 'white'
                    ? 'bg-[#223627] border-[#22c55e] text-white shadow-[0_0_12px_rgba(34,197,94,0.25)] ring-1 ring-[#22c55e]'
                    : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                <span className="text-xs font-black text-white">{t('vsai_color_white')}</span>
                <span className="text-[9px] text-zinc-400">{t('vsai_white_desc')}</span>
              </button>

              {/* Tasodifiy (50/50) */}
              <button
                type="button"
                onClick={() => setColorChoice('random')}
                className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                  colorChoice === 'random'
                    ? 'bg-[#223627] border-[#22c55e] text-white shadow-[0_0_12px_rgba(34,197,94,0.25)] ring-1 ring-[#22c55e]'
                    : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-white to-black border border-zinc-500 shadow-sm" />
                <span className="text-xs font-black text-white">{t('vsai_color_random')}</span>
                <span className="text-[9px] text-zinc-400">{t('vsai_random_desc')}</span>
              </button>

              {/* Qoralar */}
              <button
                type="button"
                onClick={() => setColorChoice('black')}
                className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                  colorChoice === 'black'
                    ? 'bg-[#223627] border-[#22c55e] text-white shadow-[0_0_12px_rgba(34,197,94,0.25)] ring-1 ring-[#22c55e]'
                    : 'bg-[#141b17] border-[#27372d] text-[#9ca3af] hover:border-[#3a5241]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-[#111] border border-white/60 shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
                <span className="text-xs font-black text-white">{t('vsai_color_black')}</span>
                <span className="text-[9px] text-zinc-400">{t('vsai_black_desc')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. ASOSIY BOSHLASH TUGMASI (STICKY BOTTOM) ───────── */}
        <div className="pt-3 border-t border-[#2b3d30] shrink-0">
          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(34,197,94,0.35)] active:scale-[0.99] transition-all cursor-pointer"
          >
            <PlayIcon size={20} className="fill-slate-950" />
            <span>
              {t('vsai_start_btn')}: {currentBot.name} ({currentBot.rating})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
