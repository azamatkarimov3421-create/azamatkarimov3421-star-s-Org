// =====================================================
// NUR SHAXMAT 100 — Doimiy Mobil Pastki Menyu (Bottom Navigation Bar)
// =====================================================

import React from 'react';

export type TabType = 'home' | 'friends' | 'leaderboard' | 'profile';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export default function BottomNavBar({ activeTab, onSelectTab }: BottomNavBarProps) {
  const tabs = [
    { id: 'home' as const, label: 'Bosh sahifa', icon: '🏠' },
    { id: 'friends' as const, label: "Do'stlar", icon: '👥' },
    { id: 'leaderboard' as const, label: 'Reyting', icon: '📊' },
    { id: 'profile' as const, label: 'Profil', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-4 py-2 flex items-center justify-around pb-[max(0.7rem,env(safe-area-inset-bottom))] shadow-[0_-10px_35px_rgba(0,0,0,0.85)] max-w-md mx-auto sm:max-w-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isActive
                ? 'text-amber-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200 font-semibold'
            }`}
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className={`text-[10px] tracking-tight ${isActive ? 'text-amber-400' : 'text-slate-400'}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shadow-[0_0_8px_#f59e0b]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
