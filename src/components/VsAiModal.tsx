import React, { useState } from 'react';
import { BotIcon, PlayIcon } from './Icons';
import { useTranslation } from '../i18n/translations';
import { useGame } from '../store/gameStore';

export interface BotCharacter {
  depth: number;
  name: string;
  levelLabel: string;
  desc: string;
  rating: number;
  initials: string;
}

export const BOT_ROSTER: BotCharacter[] = [
  {
    depth: 1,
    name: 'Sardor',
    levelLabel: 'Oson',
    desc: 'Boshlovchilar va sokin mashq uchun',
    rating: 1000,
    initials: 'S',
  },
  {
    depth: 2,
    name: 'Temur',
    levelLabel: 'Oʻrta',
    desc: 'Muvozanatli pozitsion oʻyin',
    rating: 1400,
    initials: 'T',
  },
  {
    depth: 3,
    name: 'Alp Er Toʻnga',
    levelLabel: 'Kuchli',
    desc: 'Aniq taktik hisob va hujumkor uslub',
    rating: 1800,
    initials: 'A',
  },
  {
    depth: 4,
    name: 'Al-Xorazmiy',
    levelLabel: 'Usta',
    desc: 'Chuqur tahlil va yuqori aniqlik',
    rating: 2200,
    initials: 'X',
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
  const { state } = useGame();
  const isLight =
    state.appTheme === 'light' || (state.appTheme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
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
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 ${isLight ? 'bg-black/40' : 'bg-black/60'} backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn`}
    >
      <div className={`relative w-full max-w-lg nur-glass-modal rounded-2xl p-5 sm:p-6 flex flex-col max-h-[94dvh] ${isLight ? 'text-stone-900' : 'text-zinc-100'}`}>
        {/* Sarlavha */}
        <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${isLight ? 'border-black/[0.09]' : 'border-white/10'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${isLight ? 'bg-black/[0.045] border-black/[0.09] text-stone-700' : 'bg-white/[0.06] border-white/10 text-zinc-200'}`}>
              <BotIcon size={19} />
            </div>
            <div>
              <h3 className={`text-[16px] font-semibold ${isLight ? 'text-stone-900' : 'text-zinc-100'}`}>Kompyuter bilan oʻyin</h3>
              <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>Raqib darajasi va donalar rangini tanlang</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors cursor-pointer shrink-0 ${isLight ? 'bg-black/[0.045] hover:bg-black/10 text-stone-500 hover:text-stone-900' : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white'}`}
          >
            ✕
          </button>
        </div>

        {/* Asosiy qism */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Raqib tanlovi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>Raqib</span>
              <span className={`text-xs tabular-nums ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>
                {currentBot.name} · {currentBot.rating}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BOT_ROSTER.map((bot) => {
                const isSelected = selectedDepth === bot.depth;
                return (
                  <button
                    key={'bot-' + bot.depth}
                    type="button"
                    onClick={() => setSelectedDepth(bot.depth)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? (isLight ? 'bg-white/95 border-[#5b992e]/60 text-stone-900 shadow-sm' : 'bg-white/[0.11] border-white/30 text-white')
                        : (isLight ? 'bg-black/[0.04] border-black/[0.08] hover:bg-white/80 hover:border-black/20 text-stone-800' : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15')
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-semibold shrink-0 ${
                        isSelected
                          ? 'bg-[#5b992e] border-[#5b992e] text-white' : (isLight ? 'bg-white/80 border-black/10 text-stone-700' : 'bg-white/[0.06] border-white/10 text-zinc-300')
                      }`}
                    >
                      {bot.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-semibold truncate ${isLight ? 'text-stone-900' : 'text-zinc-100'}`}>
                          {bot.name}
                        </span>
                        <span className={`text-xs tabular-nums shrink-0 ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>
                          {bot.rating}
                        </span>
                      </div>
                      <div className={`text-xs truncate mt-0.5 ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>
                        {bot.levelLabel} · {bot.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tomon tanlovi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>{t('vsai_color_label')}</span>
              <span className={`text-xs ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>
                {colorChoice === 'white'
                  ? 'Birinchi yurasiz'
                  : colorChoice === 'black'
                  ? 'Ikkinchi yurasiz'
                  : 'Avtomatik'}
              </span>
            </div>

            <div className={`grid grid-cols-3 p-1 rounded-xl border gap-1 ${isLight ? 'bg-black/[0.045] border-black/[0.09]' : 'bg-black/35 border-white/[0.06]'}`}>
              {(
                [
                  { id: 'white', label: 'Oq', dot: 'bg-white border-zinc-300' },
                  {
                    id: 'random',
                    label: 'Tasodifiy',
                    dot: 'bg-gradient-to-r from-white to-zinc-900 border-zinc-400',
                  },
                  { id: 'black', label: 'Qora', dot: 'bg-zinc-900 border-zinc-500' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setColorChoice(item.id)}
                  className={`py-2.5 px-2 rounded-[9px] text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    colorChoice === item.id
                      ? (isLight ? 'bg-white text-stone-950 font-semibold shadow-sm' : 'bg-white/[0.14] text-white font-semibold shadow-xs') : (isLight ? 'text-stone-600 hover:text-stone-900 font-medium' : 'text-zinc-400 hover:text-zinc-200 font-medium')
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full border shrink-0 ${item.dot}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Boshlash tugmasi */}
        <div className={`pt-3 border-t shrink-0 ${isLight ? 'border-black/[0.09]' : 'border-white/10'}`}>
          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-3 px-4 rounded-xl bg-[#629924] hover:bg-[#56881f] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PlayIcon size={16} className="fill-white" />
            <span>
              Oʻyinni boshlash ({currentBot.name}, {currentBot.rating})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
