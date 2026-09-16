// =====================================================
// NUR CHESS 100 — 8. Yutuqlar Ekrani (Achievements Screen)
// =====================================================

import React from 'react';
import { getAchievements } from '../store/userProfileStore';

interface AchievementsScreenProps {
  onBack: () => void;
}

export default function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const achievements = getAchievements();

  return (
    <div className="min-h-screen w-full bg-[#070b12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,20,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans select-none pb-12 max-w-md mx-auto sm:max-w-xl">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-4 py-3.5 flex items-center gap-3 pt-[max(0.8rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center text-lg font-bold transition-all active:scale-95"
          title="Orqaga"
        >
          ←
        </button>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-100">
            Yutuqlar
          </h2>
          <p className="text-xs text-slate-400">Oʻyindagi yutuq va medallaringiz</p>
        </div>
      </header>

      {/* Yutuqlar Ro'yxati (Mockup #8 kabi) */}
      <main className="flex-1 px-4 py-5 space-y-3">
        {achievements.map((ach) => {
          const isComplete = ach.unlocked || ach.current >= ach.target;
          const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all shadow-md ${
                isComplete
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-80'
              }`}
            >
              {/* Ikonka */}
              <div className="w-12 h-12 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                {ach.icon}
              </div>

              {/* Matn va Progress */}
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-slate-100 truncate">
                  {ach.title}
                </h4>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {ach.description}
                </p>

                {/* Progress bar (agar target > 1 bo'lsa) */}
                {ach.target > 1 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isComplete ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 flex-shrink-0">
                      {ach.current} / {ach.target}
                    </span>
                  </div>
                )}
              </div>

              {/* Status nishoni: Yashil ✅ yoki Qulf 🔒 */}
              <div className="flex-shrink-0">
                {isComplete ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-black text-sm shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                    ✓
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 text-xs">
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
