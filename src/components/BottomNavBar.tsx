// =====================================================
// NUR SHAXMAT 100 — Doimiy Mobil Pastki Menyu (Bottom Navigation Bar)
// Chess.com uslubidagi vektorli va minimalist navigatsiya paneli
// =====================================================

import React from 'react';
import { SwordsIcon, TrophyIcon, UserIcon } from './Icons';
import { t } from '../i18n/translations';

export type TabType = 'home' | 'leaderboard' | 'profile';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export default function BottomNavBar({ activeTab, onSelectTab }: BottomNavBarProps) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t('nav_game'), icon: <SwordsIcon size={21} /> },
    { id: 'leaderboard', label: t('nav_achievements'), icon: <TrophyIcon size={21} /> },
    { id: 'profile', label: 'Profil', icon: <UserIcon size={21} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#21201d]/95 backdrop-blur-md border-t border-[#383531] px-3 py-1.5 flex items-center justify-around pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] max-w-md mx-auto sm:max-w-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isActive
                ? 'text-[#81b64c] font-bold'
                : 'text-[#9b9893] hover:text-[#e0dfdc] font-medium'
            }`}
          >
            <div className="relative flex items-center justify-center mb-0.5">
              {tab.icon}
            </div>
            <span className={`text-[11px] tracking-tight ${isActive ? 'text-[#81b64c]' : 'text-[#9b9893]'}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#81b64c] mt-0.5 shadow-[0_0_6px_#81b64c]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
