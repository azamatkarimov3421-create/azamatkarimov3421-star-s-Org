import React, { useState } from 'react';
import { BotIcon, PlayIcon } from './Icons';
import { useTranslation } from '../i18n/translations';

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="relative w-full max-w-lg nur-glass-modal rounded-2xl p-5 sm:p-6 flex flex-col max-h-[94dvh] text-zinc-100">
        {/* Sarlavha */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-200 shrink-0">
              <BotIcon size={19} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-zinc-100">Kompyuter bilan oʻyin</h3>
              <p className="text-xs text-zinc-400">Raqib darajasi va donalar rangini tanlang</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Asosiy qism */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Raqib tanlovi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Raqib</span>
              <span className="text-xs text-zinc-400 tabular-nums">
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
                        ? 'bg-white/[0.11] border-white/30 text-white'
                        : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-semibold shrink-0 ${
                        isSelected
                          ? 'bg-[#629924] border-[#73ad30] text-white'
                          : 'bg-white/[0.06] border-white/10 text-zinc-300'
                      }`}
                    >
                      {bot.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-zinc-100 truncate">
                          {bot.name}
                        </span>
                        <span className="text-xs tabular-nums text-zinc-400 shrink-0">
                          {bot.rating}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 truncate mt-0.5">
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
              <span className="text-xs font-medium text-zinc-400">{t('vsai_color_label')}</span>
              <span className="text-xs text-zinc-400">
                {colorChoice === 'white'
                  ? 'Birinchi yurasiz'
                  : colorChoice === 'black'
                  ? 'Ikkinchi yurasiz'
                  : 'Avtomatik'}
              </span>
            </div>

            <div className="grid grid-cols-3 p-1 rounded-xl bg-black/35 border border-white/[0.06] gap-1">
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
                      ? 'bg-white/[0.14] text-white font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 font-medium'
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
        <div className="pt-3 border-t border-white/10 shrink-0">
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
