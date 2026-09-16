import React from 'react';
import NurLogo from '../components/NurLogo';
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
    <div className="min-h-screen w-full bg-[#262421] text-[#f1f1f1] flex flex-col font-sans select-none pb-24 max-w-md mx-auto sm:max-w-xl">
      {/* ── 1. CHESS.COM USLUBIDAGI YUQORI HEADER ── */}
      <header className="sticky top-0 z-30 bg-[#21201d]/95 backdrop-blur-md border-b border-[#383531] px-4 py-3 flex items-center justify-between pt-[max(0.7rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <NurLogo size={36} showGlow={false} />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
              NUR SHAXMAT 100
            </h1>
            <p className="text-[10px] text-[#9b9893] font-semibold tracking-wide uppercase">
              Oʻzbek Shaxmati (10x10)
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
          title="Sozlamalar"
        >
          <SettingsIcon size={18} />
        </button>
      </header>

      {/* ── 2. ASOSIY QISM ── */}
      <main className="flex-1 px-4 py-4 flex flex-col gap-4">
        {/* Chess.com Signature 3D Katta Yashil Boshlash Tugmasi */}
        <div className="p-4 rounded-2xl bg-[#21201d] border border-[#383531] shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#2c2a26] border border-[#383531] flex items-center justify-center text-[#81b64c]">
                <SwordsIcon size={22} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Yangi Oʻyin Boshlash</h2>
                <p className="text-xs text-[#9b9893]">100 katak • Nur donasi • Yangi strategiya</p>
              </div>
            </div>
          </div>

          <button
            onClick={onStartVsAI}
            className="w-full py-3.5 px-4 rounded-xl bg-[#81b64c] hover:bg-[#92c35a] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-[0_4px_0_#537a2e] active:translate-y-1 active:shadow-[0_0_0_#537a2e] transition-all cursor-pointer"
          >
            <PlayIcon size={18} />
            <span>OʻYNASH (Kompyuter bilan)</span>
          </button>
        </div>

        {/* Rejimlar Ro'yxati */}
        <div className="flex flex-col gap-2.5">
          <div className="px-1 text-xs font-bold text-[#9b9893] uppercase tracking-wider">
            Oʻyin Rejimlari
          </div>

          {gameModes.map((mode) => (
            <button
              key={mode.id}
              onClick={mode.action}
              className="w-full p-3.5 rounded-2xl bg-[#21201d] hover:bg-[#282622] border border-[#383531] hover:border-[#4d4942] transition-all text-left flex items-center justify-between group active:scale-[0.99] shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#2a2824] border border-[#3d3a34] flex items-center justify-center flex-shrink-0">
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

              <div className="text-[#686560] group-hover:text-white group-hover:translate-x-0.5 transition-all">
                <ChevronRightIcon size={18} />
              </div>
            </button>
          ))}
        </div>

        {/* Muallif va Qo'llanma Ma'lumoti */}
        <div className="mt-auto pt-3 text-center text-xs text-[#737069] flex flex-col items-center gap-1">
          <p className="font-semibold text-[#9b9893]">
            Muallif: <span className="text-white font-bold">Nurfullo Nurmatov</span>
          </p>
          <p className="text-[11px]">
            10×10 Oʻzbek Shaxmat Federatsiyasi standarti
          </p>
        </div>
      </main>
    </div>
  );
}
