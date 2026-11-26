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
  forceVisible?: boolean;
}

export default function BottomNavBar({ activeTab, onSelectTab, forceVisible = false }: BottomNavBarProps) {
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
    <nav className={`${forceVisible ? 'flex bottom-3 max-w-[420px] rounded-2xl border' : 'md:hidden landscape:hidden flex bottom-0 max-w-md sm:max-w-none border-t'} fixed left-0 right-0 z-40 nur-glass-nav px-3 py-1.5 items-center justify-around pb-[max(0.55rem,env(safe-area-inset-bottom))] mx-auto transition-all duration-200`}>
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
