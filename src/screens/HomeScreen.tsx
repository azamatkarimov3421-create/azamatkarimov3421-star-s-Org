import React from 'react';
import NurLogo from '../components/NurLogo';

interface HomeScreenProps {
  onStartGameModes: () => void;
  onStartVsAI: () => void;
  onStartLocal: () => void;
  onOpenOnline: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export default function HomeScreen({
  onStartGameModes,
  onStartVsAI,
  onStartLocal,
  onOpenOnline,
  onOpenRules,
  onOpenStats,
  onOpenSettings,
}: HomeScreenProps) {
  const menuItems = [
    {
      id: 'modes',
      title: "Oʻyinni boshlash",
      subtitle: 'Onlayn yoki oflayn',
      icon: '⚔️',
      action: onStartGameModes,
      badge: 'Tavsiya',
      glow: true,
    },
    {
      id: 'vsAI',
      title: 'Kompyuter bilan',
      subtitle: 'AI darajalari',
      icon: '🤖',
      action: onStartVsAI,
    },
    {
      id: 'pvp',
      title: "Doʻst bilan",
      subtitle: 'Bir qurilmada',
      icon: '👥',
      action: onStartLocal,
    },
    {
      id: 'online',
      title: "Onlayn oʻyin",
      subtitle: 'Dunyo boʻylab oʻyinchilar',
      icon: '🌐',
      action: onOpenOnline,
    },
    {
      id: 'rules',
      title: 'Qoidalar',
      subtitle: '10x10 shaxmat qoidalari',
      icon: '📖',
      action: onOpenRules,
    },
    {
      id: 'stats',
      title: 'Statistika',
      subtitle: 'Yutuqlar va reyting',
      icon: '📊',
      action: onOpenStats,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#070b12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,20,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans select-none pb-24 max-w-md mx-auto sm:max-w-xl">
      {/* Yuqori Panel (Header) */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-5 py-3.5 flex items-center justify-between pt-[max(0.8rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <NurLogo size={36} showGlow={false} />
          <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-400">
            NUR CHESS 100
          </h2>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center text-lg transition-all active:scale-95 shadow-inner"
          title="Sozlamalar"
        >
          ⚙️
        </button>
      </header>

      {/* Menyu Kartochkalari */}
      <main className="flex-1 px-4 py-5 flex flex-col gap-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group active:scale-[0.98] ${
              item.glow
                ? 'bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-amber-500/50 shadow-[0_4px_20px_rgba(245,158,11,0.15)] hover:border-amber-400'
                : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 shadow-md'
            }`}
          >
            {/* Chap: Ikonka va Matn */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                  item.glow
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-300 group-hover:text-amber-300 transition-colors'
                }`}
              >
                {item.icon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {item.subtitle}
                </p>
              </div>
            </div>

            {/* O'ng: Ko'rsatkich belgisi */}
            <div className="w-8 h-8 rounded-xl bg-slate-950/50 flex items-center justify-center text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all text-sm font-mono">
              ›
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
