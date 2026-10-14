// =====================================================
// NUR CHESS 100 — 8. Yutuqlar Ekrani (Achievements Screen)
// =====================================================

import React from 'react';
import { getAchievements } from '../store/userProfileStore';
import { useTranslation } from '../i18n/translations';
import { useGame } from '../store/gameStore';

interface AchievementsScreenProps {
  onBack: () => void;
}

export default function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const { t } = useTranslation();
  const { state } = useGame();
  const achievements = getAchievements();

  const isLight =
    state.appTheme === 'light' ||
    (state.appTheme === 'system' &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`min-h-screen w-full ${isLight ? 'bg-[#f5f2eb] text-[#1a1917]' : 'bg-[#070b12] text-slate-100'} flex flex-col font-sans select-none pb-12 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl transition-colors duration-200`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-xl ${isLight ? 'bg-white/95 border-b border-[#e2ddd3]' : 'bg-slate-950/85 border-b border-slate-800/80'} px-4 py-3.5 flex items-center gap-3 pt-[max(0.8rem,env(safe-area-inset-top))] transition-colors`}>
        <button
          onClick={onBack}
          className={`w-10 h-10 rounded-2xl ${isLight ? 'bg-zinc-100 border border-zinc-200 text-zinc-700' : 'bg-slate-900 border border-slate-800 text-slate-300'} hover:text-amber-500 flex items-center justify-center text-lg font-bold transition-all active:scale-95 cursor-pointer`}
          title={t('back_btn')}
        >
          ←
        </button>
        <div>
          <h2 className={`text-lg font-black tracking-tight ${isLight ? 'text-[#1a1917]' : 'text-slate-100'}`}>
            {t('achievements_title')}
          </h2>
          <p className={`text-xs ${isLight ? 'text-[#68645e]' : 'text-slate-400'}`}>{t('achievements_subtitle')}</p>
        </div>
      </header>

      {/* Yutuqlar Ro'yxati (Mockup #8 kabi) */}
      <main className="flex-1 px-4 py-5 flex flex-col sm:grid sm:grid-cols-2 gap-3">
        {achievements.map((ach) => {
          const isComplete = ach.unlocked || ach.current >= ach.target;
          const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all shadow-md ${
                isComplete
                  ? isLight
                    ? 'bg-white border-[#e2ddd3]'
                    : 'bg-slate-900/80 border-slate-800'
                  : isLight
                  ? 'bg-white/70 border-zinc-200 opacity-80'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-80'
              }`}
            >
              {/* Ikonka */}
              <div className={`w-12 h-12 rounded-2xl ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-slate-950/90 border-slate-800'} border flex items-center justify-center text-2xl flex-shrink-0 shadow-inner`}>
                {ach.icon}
              </div>

              {/* Matn va Progress */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-extrabold text-sm ${isLight ? 'text-[#1a1917]' : 'text-slate-100'} truncate`}>
                  {ach.title}
                </h4>
                <p className={`text-xs ${isLight ? 'text-[#68645e]' : 'text-slate-400'} truncate mt-0.5`}>
                  {ach.description}
                </p>

                {/* Progress bar (agar target > 1 bo'lsa) */}
                {ach.target > 1 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`flex-1 h-1.5 ${isLight ? 'bg-zinc-200 border-zinc-300' : 'bg-slate-950 border-slate-800'} rounded-full overflow-hidden border`}>
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isComplete ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-[#68645e]' : 'text-slate-400'} flex-shrink-0`}>
                      {ach.current} / {ach.target}
                    </span>
                  </div>
                )}
              </div>

              {/* Status nishoni: Yashil ✅ yoki Qulf 🔒 */}
              <div className="flex-shrink-0">
                {isComplete ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500 font-black text-sm shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                    ✓
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full ${isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-400' : 'bg-slate-800/60 border-slate-700/60 text-slate-500'} border flex items-center justify-center text-xs`}>
                    🔒
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
