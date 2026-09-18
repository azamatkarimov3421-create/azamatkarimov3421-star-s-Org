import React from 'react';
import NurLogo from '../components/NurLogo';
import { useGame } from '../store/gameStore';
import {
  SwordsIcon,
  BotIcon,
  UsersIcon,
  GlobeIcon,
  BookOpenIcon,
  TrophyIcon,
  SettingsIcon,
  ChevronRightIcon,
  PlayIcon,
} from '../components/Icons';
import { t } from '../i18n/translations';

interface HomeScreenProps {
  onStartVsAI: () => void;
  onStartLocal: () => void;
  onOpenOnline: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export default function HomeScreen({
  onStartVsAI,
  onStartLocal,
  onOpenOnline,
  onOpenRules,
  onOpenStats,
  onOpenSettings,
}: HomeScreenProps) {
  const { state, dispatch } = useGame();

  const gameModes = [
    {
      id: 'vsAI',
      title: 'Kompyuter bilan (Bot)',
      subtitle: 'Oson, oʻrta va kuchli darajalar',
      icon: <BotIcon size={22} className="text-[#81b64c]" />,
      action: onStartVsAI,
      badge: 'Tezkor',
    },
    {
      id: 'pvp',
      title: "Doʻst bilan oʻynash",
      subtitle: 'Bitta qurilmada 2 oʻyinchi',
      icon: <UsersIcon size={22} className="text-[#e0dfdc]" />,
      action: onStartLocal,
    },
    {
      id: 'online',
      title: "Onlayn oʻyin",
      subtitle: 'Internet orqali doʻst bilan',
      icon: <GlobeIcon size={22} className="text-[#5dade2]" />,
      action: onOpenOnline,
    },
    {
      id: 'rules',
      title: 'Qoidalar va Darslik',
      subtitle: '10x10 doska va Nur donasi harakati',
      icon: <BookOpenIcon size={22} className="text-[#f5b041]" />,
      action: onOpenRules,
    },
    {
      id: 'stats',
      title: 'Statistika va Reyting',
      subtitle: 'Shaxsiy yutuqlar va natijalar',
      icon: <TrophyIcon size={22} className="text-[#f1c40f]" />,
      action: onOpenStats,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#262421] text-[#f1f1f1] flex flex-col font-sans select-none pb-24 md:pb-10 max-w-md mx-auto sm:max-w-xl lg:max-w-6xl">
      {/* ── 1. YUQORI HEADER ── */}
      <header className="sticky top-0 z-30 bg-[#21201d]/95 backdrop-blur-md border-b border-[#383531] px-4 md:px-8 py-3 flex items-center justify-between pt-[max(0.7rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <NurLogo size={36} showGlow={false} />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
              NUR SHAXMAT 100
            </h1>
            <p className="text-[10px] text-amber-400 font-bold tracking-wide uppercase">
              v1.0.8 · Oʻzbek Shaxmati (10x10)
            </p>
          </div>
        </div>

        {/* Desktop Navigatsiya Havolalari (md+) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#181715] p-1 rounded-xl border border-[#383531]">
          <button
            onClick={() => {}}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#383531] shadow-sm flex items-center gap-1.5"
          >
            <SwordsIcon size={15} className="text-[#81b64c]" />
            <span>Oʻyin</span>
          </button>
          <button
            onClick={onOpenRules}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#c3c2be] hover:text-white hover:bg-[#2c2a26] transition-all flex items-center gap-1.5"
          >
            <BookOpenIcon size={15} />
            <span>Qoidalar</span>
          </button>
          <button
            onClick={onOpenStats}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#c3c2be] hover:text-white hover:bg-[#2c2a26] transition-all flex items-center gap-1.5"
          >
            <TrophyIcon size={15} />
            <span>Reyting</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#c3c2be] hover:text-white hover:bg-[#2c2a26] transition-all flex items-center gap-1.5"
          >
            <SettingsIcon size={15} />
            <span>Sozlamalar</span>
          </button>
        </nav>

        <button
          onClick={onOpenSettings}
          className="md:hidden w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
          title="Sozlamalar"
        >
          <SettingsIcon size={18} />
        </button>
      </header>

      {/* ── 2. ASOSIY QISM (RESPONSIVE GRID) ── */}
      <main className="flex-1 px-4 md:px-8 py-4 md:py-8 flex flex-col md:grid md:grid-cols-12 gap-5 items-start">
        {/* Chap ustun: Boshlash va 3D tanlov (md:col-span-5) */}
        <div className="w-full md:col-span-5 p-5 rounded-3xl bg-[#21201d] border border-[#383531] shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2c2a26] border border-[#383531] flex items-center justify-center text-[#81b64c] shadow-inner">
                <SwordsIcon size={26} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Yangi Oʻyin Boshlash</h2>
                <p className="text-xs text-[#9b9893]">100 katak • Nur donasi • Yangi strategiya</p>
              </div>
            </div>
          </div>

          {/* 3D Fazoviy Ko'rinish Tanlagich (Kitobdagidek) */}
          <div className="flex items-center justify-between bg-[#181715] px-4 py-3 rounded-2xl border border-[#383531]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎲</span>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>3D Fazoviy Doska</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Kitobdagidek
                  </span>
                </div>
                <div className="text-[11px] text-[#9b9893]">
                  {state.is3D ? 'Yogʻoch taxta va tik donalar faol' : 'Standart 2D tekis koʻrinish'}
                </div>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_3D' })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                state.is3D
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)] active:scale-95'
                  : 'bg-[#383531] text-[#c3c2be] hover:text-white'
              }`}
            >
              {state.is3D ? '🎲 3D FAOL' : '📐 2D TEKIS'}
            </button>
          </div>

          <button
            onClick={onStartVsAI}
            className="w-full py-4 px-4 rounded-2xl bg-[#81b64c] hover:bg-[#92c35a] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-[0_4px_0_#537a2e] active:translate-y-1 active:shadow-[0_0_0_#537a2e] transition-all cursor-pointer"
          >
            <PlayIcon size={20} />
            <span>OʻYNASH (Kompyuter bilan)</span>
          </button>

          {/* Mualliflik ma'lumoti */}
          <div className="pt-2 border-t border-[#383531]/60 flex items-center justify-between text-xs text-[#9b9893]">
            <span>Muallif: <strong className="text-white">Nurfullo Nurmatov</strong></span>
            <span className="text-[11px] text-amber-400/90 font-mono">10×10 Standart</span>
          </div>
        </div>

        {/* O'ng ustun: O'yin Turlari Ro'yxati (md:col-span-7) */}
        <div className="w-full md:col-span-7 flex flex-col gap-3">
          <div className="px-1 text-xs font-bold text-[#9b9893] uppercase tracking-wider flex items-center justify-between">
            <span>Oʻyin Turlari & Boʻlimlar</span>
            <span className="hidden md:inline text-[11px] text-[#81b64c] font-semibold">Kompyuter va mobil uchun moslashtirilgan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gameModes.map((mode) => (
              <button
                key={mode.id}
                onClick={mode.action}
                className="w-full p-4 rounded-2xl bg-[#21201d] hover:bg-[#282622] border border-[#383531] hover:border-[#81b64c]/50 transition-all text-left flex items-center justify-between group active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#2a2824] border border-[#3d3a34] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {mode.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-[#81b64c] transition-colors">
                        {mode.title}
                      </span>
                      {mode.badge && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30">
                          {mode.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9b9893] mt-0.5 font-medium">
                      {mode.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-[#686560] group-hover:text-white group-hover:translate-x-1 transition-all">
                  <ChevronRightIcon size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
