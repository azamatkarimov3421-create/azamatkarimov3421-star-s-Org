// =====================================================
// NUR CHESS 100 — 6. Foydalanuvchi Profili va Statistika Ekrani
// Chess.com uslubidagi vektorli va minimalist profil
// =====================================================

import React, { useState } from 'react';
import { getUserProfile, saveUserProfile, UserProfile } from '../store/userProfileStore';
import {
  ArrowLeftIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
  UserIcon,
  ChevronRightIcon,
  SwordsIcon,
} from '../components/Icons';

interface ProfileScreenProps {
  onBack: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
  onOpenFriends: () => void;
  onOpenSettings: () => void;
}

export default function ProfileScreen({
  onBack,
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenFriends,
  onOpenSettings,
}: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  const winRate = profile.gamesPlayed > 0
    ? Math.round((profile.wins / profile.gamesPlayed) * 100)
    : 0;

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = { ...profile, name: nameInput.trim() };
    saveUserProfile(updated);
    setProfile(updated);
    setIsEditingName(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#262421] text-[#f1f1f1] flex flex-col font-sans select-none pb-24 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#21201d]/95 backdrop-blur-md border-b border-[#383531] px-4 py-3 flex items-center justify-between pt-[max(0.7rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
          title="Orqaga"
        >
          <ArrowLeftIcon size={18} />
        </button>

        <h2 className="text-base font-extrabold text-white">
          Foydalanuvchi Profili
        </h2>

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
          title="Sozlamalar"
        >
          <SettingsIcon size={18} />
        </button>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Profil Asosiy Kartochkasi */}
        <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#21201d] border border-[#383531] shadow-md relative">
          {/* Avatar */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-2xl bg-[#2c2a26] border-2 border-[#81b64c] flex items-center justify-center text-[#81b64c] shadow-md">
              <UserIcon size={38} />
            </div>
            <button
              onClick={() => setIsEditingName(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[#81b64c] text-white text-[11px] font-bold flex items-center justify-center shadow-md border border-[#21201d] active:scale-95"
              title="Ismni tahrirlash"
            >
              ✎
            </button>
          </div>

          {/* Ism */}
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="bg-[#181715] border border-[#81b64c] rounded-xl px-3 py-1.5 text-sm font-bold text-white text-center focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 bg-[#81b64c] hover:bg-[#92c35a] text-white font-bold text-xs rounded-xl shadow"
              >
                Saqlash
              </button>
            </div>
          ) : (
            <h3 className="text-lg font-black text-white">
              {profile.name}
            </h3>
          )}

          {/* Reyting va Liga */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#2c2a26] border border-[#383531] text-xs font-mono font-bold text-[#81b64c]">
              <span>⭐ {profile.rating} reyting</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-[#2c2a26] border border-[#383531] text-xs font-bold text-[#f5b041]">
              {profile.league} ligasi
            </div>
          </div>
        </div>

        {/* 4 Talik Statistika Qatori */}
        <div className="grid grid-cols-4 gap-2">
          {/* O'yinlar */}
          <div className="p-3 rounded-2xl bg-[#21201d] border border-[#383531] text-center shadow-sm">
            <div className="text-[10px] text-[#9b9893] font-bold uppercase tracking-wider mb-0.5">
              Oʻyinlar
            </div>
            <div className="text-base font-black text-white font-mono">
              {profile.gamesPlayed}
            </div>
          </div>

          {/* G'alaba */}
          <div className="p-3 rounded-2xl bg-[#21201d] border border-[#383531] text-center shadow-sm">
            <div className="text-[10px] text-[#81b64c] font-bold uppercase tracking-wider mb-0.5">
              Gʻalaba
            </div>
            <div className="text-base font-black text-[#81b64c] font-mono">
              {profile.wins}
            </div>
          </div>

          {/* Durang */}
          <div className="p-3 rounded-2xl bg-[#21201d] border border-[#383531] text-center shadow-sm">
            <div className="text-[10px] text-[#5dade2] font-bold uppercase tracking-wider mb-0.5">
              Durang
            </div>
            <div className="text-base font-black text-[#5dade2] font-mono">
              {profile.draws}
            </div>
          </div>

          {/* Mag'lubiyat */}
          <div className="p-3 rounded-2xl bg-[#21201d] border border-[#383531] text-center shadow-sm">
            <div className="text-[10px] text-[#e74c3c] font-bold uppercase tracking-wider mb-0.5">
              Magʻlub
            </div>
            <div className="text-base font-black text-[#e74c3c] font-mono">
              {profile.losses}
            </div>
          </div>
        </div>

        {/* G'alaba foizi indikatori */}
        <div className="p-3.5 rounded-2xl bg-[#21201d] border border-[#383531] shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2 font-bold">
            <span className="text-[#c3c2be]">Gʻalaba koʻrsatkichi:</span>
            <span className="text-[#81b64c] font-mono text-sm">{winRate}%</span>
          </div>
          <div className="w-full h-2 bg-[#181715] rounded-full overflow-hidden border border-[#383531]">
            <div
              className="h-full bg-[#81b64c] rounded-full transition-all duration-500"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* Amallar Ro'yxati */}
        <div className="space-y-2 pt-1">
          {/* Yutuqlar */}
          <button
            onClick={onOpenAchievements}
            className="w-full p-3.5 rounded-2xl bg-[#21201d] hover:bg-[#282622] border border-[#383531] flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2a2824] border border-[#3d3a34] flex items-center justify-center text-[#f1c40f]">
                <TrophyIcon size={18} />
              </div>
              <span className="font-bold text-sm text-white group-hover:text-[#81b64c] transition-colors">
                Yutuqlar va Medallar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRightIcon size={16} className="text-[#686560]" />
            </div>
          </button>

          {/* Reyting */}
          <button
            onClick={onOpenLeaderboard}
            className="w-full p-3.5 rounded-2xl bg-[#21201d] hover:bg-[#282622] border border-[#383531] flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2a2824] border border-[#3d3a34] flex items-center justify-center text-[#5dade2]">
                <SwordsIcon size={18} />
              </div>
              <span className="font-bold text-sm text-white group-hover:text-[#81b64c] transition-colors">
                Peshqadamlar Jadvali
              </span>
            </div>
            <ChevronRightIcon size={16} className="text-[#686560]" />
          </button>

          {/* Do'stlar */}
          <button
            onClick={onOpenFriends}
            className="w-full p-3.5 rounded-2xl bg-[#21201d] hover:bg-[#282622] border border-[#383531] flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2a2824] border border-[#3d3a34] flex items-center justify-center text-[#e0dfdc]">
                <UsersIcon size={18} />
              </div>
              <span className="font-bold text-sm text-white group-hover:text-[#81b64c] transition-colors">
                Doʻstlar & Onlayn Xonalar
              </span>
            </div>
            <ChevronRightIcon size={16} className="text-[#686560]" />
          </button>
        </div>
      </main>
    </div>
  );
}
