// =====================================================
// NUR CHESS 100 — 6. Foydalanuvchi Profili va Statistika Ekrani
// =====================================================

import React, { useState } from 'react';
import { getUserProfile, saveUserProfile, UserProfile } from '../store/userProfileStore';

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
    <div className="min-h-screen w-full bg-[#070b12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,20,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans select-none pb-24 max-w-md mx-auto sm:max-w-xl">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between pt-[max(0.8rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center text-lg font-bold transition-all active:scale-95"
          title="Orqaga"
        >
          ←
        </button>

        <h2 className="text-lg font-black tracking-tight text-slate-100">
          Mening profilim
        </h2>

        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center text-lg transition-all active:scale-95"
          title="Sozlamalar"
        >
          ⚙️
        </button>
      </header>

      <main className="flex-1 px-4 py-5 space-y-5">
        {/* Profil Asosiy Kartochkasi (Mockup #6 kabi) */}
        <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

          {/* Katta Avatar */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-4xl shadow-inner">
                {profile.avatar || '👤'}
              </div>
            </div>
            <button
              onClick={() => setIsEditingName(true)}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center shadow-md border-2 border-slate-950 active:scale-95"
              title="Ismni tahrirlash"
            >
              ✏️
            </button>
          </div>

          {/* Ism */}
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="bg-slate-950 border border-amber-500/60 rounded-xl px-3 py-1.5 text-sm font-bold text-amber-300 text-center focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow"
              >
                Saqlash
              </button>
            </div>
          ) : (
            <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span>{profile.name}</span>
            </h3>
          )}

          {/* Bayroq, Reyting va Liga */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300 shadow-inner">
              <span>🇺🇿</span>
              <span>⭐ {profile.rating}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300">
              🛡️ {profile.league}
            </div>
          </div>
        </div>

        {/* 4 Talik Statistika Qatori (Mockup #6 kabi) */}
        <div className="grid grid-cols-4 gap-2">
          {/* O'yinlar */}
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-center shadow-md">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Oʻyinlar
            </div>
            <div className="text-lg font-black text-slate-100 font-mono">
              {profile.gamesPlayed}
            </div>
          </div>

          {/* G'alaba */}
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-center shadow-md">
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
              Gʻalaba
            </div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {profile.wins}
            </div>
          </div>

          {/* Durang */}
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-center shadow-md">
            <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mb-1">
              Durang
            </div>
            <div className="text-lg font-black text-sky-300 font-mono">
              {profile.draws}
            </div>
          </div>

          {/* Mag'lubiyat */}
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-center shadow-md">
            <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">
              Magʻlubiyat
            </div>
            <div className="text-lg font-black text-red-400 font-mono">
              {profile.losses}
            </div>
          </div>
        </div>

        {/* G'alaba foizi indikatori */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-xs mb-2 font-bold">
            <span className="text-slate-300">Gʻalaba koʻrsatkichi:</span>
            <span className="text-emerald-400 font-mono text-sm">{winRate}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* Amallar Ro'yxati (Mockup #6 kabi) */}
        <div className="space-y-2.5 pt-1">
          {/* Yutuqlar */}
          <button
            onClick={onOpenAchievements}
            className="w-full p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-md group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <span className="font-extrabold text-sm text-slate-200 group-hover:text-amber-300 transition-colors">
                Yutuqlar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                3 ta yechildi
              </span>
              <span className="text-slate-600 font-mono text-sm">›</span>
            </div>
          </button>

          {/* Reyting */}
          <button
            onClick={onOpenLeaderboard}
            className="w-full p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-md group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-extrabold text-sm text-slate-200 group-hover:text-amber-300 transition-colors">
                Reyting & Baza
              </span>
            </div>
            <span className="text-slate-600 font-mono text-sm">›</span>
          </button>

          {/* Do'stlar */}
          <button
            onClick={onOpenFriends}
            className="w-full p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-md group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👥</span>
              <span className="font-extrabold text-sm text-slate-200 group-hover:text-amber-300 transition-colors">
                Doʻstlar & Onlayn
              </span>
            </div>
            <span className="text-slate-600 font-mono text-sm">›</span>
          </button>
        </div>
      </main>
    </div>
  );
}
