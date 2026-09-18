// =====================================================
// NUR CHESS 100 — 5. O'yin Rejimlarini Tanlash Ekrani
// Chess.com uslubidagi vektorli va minimalist rejimlar ro'yxati
// =====================================================

import React from 'react';
import {
  ArrowLeftIcon,
  BotIcon,
  UsersIcon,
  GlobeIcon,
  TrophyIcon,
  SwordsIcon,
  ChevronRightIcon,
} from '../components/Icons';

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
      title: 'Kompyuter bilan (Bot)',
      desc: 'Oson, oʻrta va kuchli sunʼiy intellekt',
      icon: <BotIcon size={26} className="text-[#81b64c]" />,
      action: onSelectVsAI,
      badge: '3 daraja',
    },
    {
      id: 'pvp',
      title: "Doʻst bilan oʻynash",
      desc: "Bitta qurilmada doʻstingiz bilan navbatma-navbat",
      icon: <UsersIcon size={26} className="text-[#e0dfdc]" />,
      action: onSelectLocal,
      badge: '2 kishi',
    },
    {
      id: 'online',
      title: "Onlayn P2P oʻyin",
      desc: "Xona ochib havolani doʻstingizga yuboring",
      icon: <GlobeIcon size={26} className="text-[#5dade2]" />,
      action: onSelectOnline,
      badge: 'Real-time',
    },
    {
      id: 'tournaments',
      title: 'Turnirlar va Musobaqalar',
      desc: 'Respublika va Navoiy shaxmat musobaqalari',
      icon: <TrophyIcon size={26} className="text-[#f1c40f]" />,
      action: () => alert("Turnirlar tizimi tez kunda ishga tushiriladi!"),
      badge: 'Tez kunda',
      locked: true,
    },
    {
      id: 'practice',
      title: 'Mashq va Taktika',
      desc: 'Nur donasining 3 xil rokirovka va sakrash usullari',
      icon: <SwordsIcon size={26} className="text-[#f5b041]" />,
      action: onSelectVsAI,
      badge: 'Trening',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#262421] text-[#f1f1f1] flex flex-col font-sans select-none pb-12 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#21201d]/95 backdrop-blur-md border-b border-[#383531] px-4 py-3 flex items-center gap-3 pt-[max(0.7rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
          title="Orqaga"
        >
          <ArrowLeftIcon size={18} />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-white">
            Oʻyin Rejimini Tanlang
          </h2>
          <p className="text-xs text-[#9b9893]">Oʻzingizga mos oʻyin turini tanlang</p>
        </div>
      </header>

      {/* Rejimlar Ro'yxati */}
      <main className="flex-1 px-4 py-4 flex flex-col sm:grid sm:grid-cols-2 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={mode.action}
            className="w-full p-4 rounded-2xl border bg-[#21201d] hover:bg-[#282622] border-[#383531] hover:border-[#4d4942] text-left flex items-center justify-between group transition-all active:scale-[0.99] shadow-sm relative"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#2a2824] border border-[#3d3a34] flex items-center justify-center flex-shrink-0">
                {mode.icon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white group-hover:text-[#81b64c] transition-colors">
                    {mode.title}
                  </h3>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#81b64c]/15 text-[#81b64c] border border-[#81b64c]/25">
                    {mode.badge}
                  </span>
                </div>
                <p className="text-xs text-[#9b9893] mt-0.5 font-medium leading-snug">
                  {mode.desc}
                </p>
              </div>
            </div>

            <div className="text-[#686560] group-hover:text-white group-hover:translate-x-0.5 transition-all">
              <ChevronRightIcon size={18} />
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
