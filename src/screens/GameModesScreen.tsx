// =====================================================
// NUR CHESS 100 — 5. O'yin Rejimlarini Tanlash Ekrani
// =====================================================

import React from 'react';

interface GameModesScreenProps {
  onBack: () => void;
  onSelectVsAI: () => void;
  onSelectLocal: () => void;
  onSelectOnline: () => void;
}

export default function GameModesScreen({
  onBack,
  onSelectVsAI,
  onSelectLocal,
  onSelectOnline,
}: GameModesScreenProps) {
  const modes = [
    {
      id: 'vsAI',
      title: 'Kompyuter bilan',
      desc: 'Turli darajadagi sunʼiy intellekt',
      icon: '🤖',
      action: onSelectVsAI,
      gradient: 'from-blue-900/30 via-slate-900 to-slate-950',
      border: 'border-blue-500/30',
      badge: '3 daraja',
    },
    {
      id: 'pvp',
      title: "Doʻst bilan",
      desc: "Bir qurilmada doʻstingiz bilan oʻynang",
      icon: '👥',
      action: onSelectLocal,
      gradient: 'from-amber-900/30 via-slate-900 to-slate-950',
      border: 'border-amber-500/30',
      badge: '2 kishi',
    },
    {
      id: 'online',
      title: "Onlayn oʻyin",
      desc: "Dunyo boʻylab jonli raqiblar bilan P2P",
      icon: '🌐',
      action: onSelectOnline,
      gradient: 'from-purple-900/30 via-slate-900 to-slate-950',
      border: 'border-purple-500/30',
      badge: 'Real-time',
    },
    {
      id: 'tournaments',
      title: 'Turnirlar',
      desc: 'Onlayn musobaqalar va medallar',
      icon: '🏆',
      action: () => alert("Turnirlar tizimi tez kunda ishga tushiriladi!"),
      gradient: 'from-yellow-900/20 via-slate-900 to-slate-950',
      border: 'border-yellow-500/20',
      badge: 'Tez kunda',
      locked: true,
    },
    {
      id: 'practice',
      title: 'Mashq rejimi',
      desc: 'Shaxmat mahorati va Nur donasi taktikasi',
      icon: '🎯',
      action: onSelectVsAI,
      gradient: 'from-emerald-900/20 via-slate-900 to-slate-950',
      border: 'border-emerald-500/20',
      badge: 'Trening',
    },
  ];

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
            Oʻyinni tanlang
          </h2>
          <p className="text-xs text-slate-400">Oʻzingizga maʼqul rejimni tanlang</p>
        </div>
      </header>

      {/* Rejimlar Ro'yxati */}
      <main className="flex-1 px-4 py-5 flex flex-col gap-3.5">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={mode.action}
            className={`w-full p-4 rounded-2xl border bg-gradient-to-r ${mode.gradient} ${mode.border} text-left flex items-center justify-between group transition-all active:scale-[0.98] shadow-lg relative overflow-hidden`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                {mode.icon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                    {mode.title}
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700">
                    {mode.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium max-w-[220px]">
                  {mode.desc}
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-slate-950/60 flex items-center justify-center text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all text-sm font-mono">
              {mode.locked ? '🔒' : '›'}
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
