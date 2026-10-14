// =====================================================
// NUR SHAXMAT 100 — Doimiy Mobil Pastki Menyu (Bottom Navigation Bar)
// Chess.com uslubidagi vektorli va minimalist navigatsiya paneli
// =====================================================

import React from 'react';
import { SwordsIcon, TrophyIcon, UserIcon } from './Icons';
import { useTranslation } from '../i18n/translations';
import { useGame } from '../store/gameStore';

export type TabType = 'home' | 'leaderboard' | 'profile';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export default function BottomNavBar({ activeTab, onSelectTab }: BottomNavBarProps) {
  const { state } = useGame();
  const { t } = useTranslation();

  const isLight =
    state.appTheme === 'light' ||
    (state.appTheme === 'system' &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t('nav_game'), icon: <SwordsIcon size={21} /> },
    { id: 'leaderboard', label: t('nav_leaderboard'), icon: <TrophyIcon size={21} /> },
    { id: 'profile', label: t('nav_profile'), icon: <UserIcon size={21} /> },
  ];

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md px-3 py-1.5 flex items-center justify-around pb-[max(0.6rem,env(safe-area-inset-bottom))] max-w-md mx-auto sm:max-w-none transition-colors duration-200 ${
      isLight
        ? 'bg-white/95 border-t border-[#e2ddd3] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
        : 'bg-[#21201d]/95 border-t border-[#383531] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]'
    }`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isActive
                ? isLight ? 'text-emerald-700 font-bold' : 'text-[#81b64c] font-bold'
                : isLight ? 'text-[#78746d] hover:text-[#1a1917] font-medium' : 'text-[#9b9893] hover:text-[#e0dfdc] font-medium'
            }`}
          >
            <div className="relative flex items-center justify-center mb-0.5">
              {tab.icon}
            </div>
            <span className={`text-[11px] tracking-tight ${
              isActive
                ? isLight ? 'text-emerald-700 font-bold' : 'text-[#81b64c]'
                : isLight ? 'text-[#78746d]' : 'text-[#9b9893]'
            }`}>
              {tab.label}
            </span>
            {isActive && (
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                isLight ? 'bg-emerald-600 shadow-[0_0_6px_#059669]' : 'bg-[#81b64c] shadow-[0_0_6px_#81b64c]'
              }`} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
