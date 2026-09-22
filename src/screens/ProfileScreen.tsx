// =====================================================
// NUR CHESS 100 — 6. Foydalanuvchi Profili va Statistika Ekrani
// Chess.com uslubidagi vektorli va minimalist profil
// =====================================================

import React, { useState, useEffect } from 'react';
import {
  getUserProfile,
  saveUserProfile,
  UserProfile,
  isGoogleUser,
  getRecentGames,
  RecentGame,
} from '../store/userProfileStore';
import {
  ArrowLeftIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
  UserIcon,
  ChevronRightIcon,
  SwordsIcon,
  GoogleIcon,
  LogOutIcon,
} from '../components/Icons';
import GoogleAuthModal from '../components/GoogleAuthModal';
import { signOutGoogle, triggerAutoGooglePick, signInWithGoogleDirect } from '../services/authService';
import { useTranslation } from '../i18n/translations';

interface ProfileScreenProps {
  onBack: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
  onOpenFriends: () => void;
  onOpenSettings: () => void;
}

function formatUzbekDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Bugun, ${timeStr}`;
    if (isYesterday) return `Kecha, ${timeStr}`;
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    return `${d.getDate()}-${months[d.getMonth()]}, ${timeStr}`;
  } catch {
    return 'Yaqinda';
  }
}

export default function ProfileScreen({
  onBack,
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenFriends,
  onOpenSettings,
}: ProfileScreenProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);

  // Qo'lda kiritish maydonlari
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const p = getUserProfile();
    setProfile(p);
    setNameInput(p.name);
    setManualName(p.name && p.name !== 'Mehmon Oʻyinchi' ? p.name : '');
    setManualEmail(p.email || '');
    setRecentGames(getRecentGames());
  }, []);

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

  const handleSignOut = async () => {
    if (window.confirm("Rostdan ham Google hisobingizdan chiqmoqchimisiz?")) {
      await signOutGoogle();
      const updated = getUserProfile();
      setProfile(updated);
      setNameInput(updated.name);
      setManualName('');
      setManualEmail('');
    }
  };

  const handleGoogleAutoPick = () => {
    setManualError(null);
    const ok = triggerAutoGooglePick((updated) => {
      setProfile(updated);
      setNameInput(updated.name);
      setManualName(updated.name);
      setManualEmail(updated.email || '');
      setSaveSuccessMsg("Google hisobingiz muvaffaqiyatli ulandi!");
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    });
    if (!ok) {
      setManualError('Quyidagi maydonlarga ism va Gmail pochtangizni yozib saqlang.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = manualName.trim();
    const cleanEmail = manualEmail.trim();

    if (!cleanName) {
      setManualError('Iltimos, ismingiz yoki taxallusingizni kiriting.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setManualError('Iltimos, toʻgʻri Google Gmail pochtangizni kiriting (masalan: nom@gmail.com)');
      return;
    }

    setManualError(null);
    const updated = signInWithGoogleDirect(cleanName, cleanEmail);
    setProfile(updated);
    setNameInput(updated.name);
    setSaveSuccessMsg("Google profilingiz muvaffaqiyatli saqlandi va faollashtirildi!");
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div className="min-h-screen w-full bg-[#262421] text-[#f1f1f1] flex flex-col font-sans select-none pb-24 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl">
      {/* Muvaffaqiyat xabari (Toast) */}
      {saveSuccessMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-fadeIn border border-emerald-400">
          <span>✓</span>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

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
          {t('profile_title')}
        </h2>

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
          title={t('nav_settings')}
        >
          <SettingsIcon size={18} />
        </button>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* AGAR GOOGLE ULANGAN BO'LMASA — PROFIL OCHISH VA QO'LDA KIRITISH BANNERI */}
        {!profile.isGoogleLinked ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#2a2723] to-[#21201d] border border-[#81b64c]/40 shadow-2xl flex flex-col items-center text-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#233027] border-2 border-[#81b64c] flex items-center justify-center text-white font-black text-2xl shadow-inner">
              <GoogleIcon size={30} />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Google Hisobini Ulash
              </h3>
              <p className="text-xs text-[#c3c2be] mt-1 max-w-sm leading-relaxed">
                Reyting, yutuqlar va onlayn gʻalabalaringizni oʻz nomingiz bilan saqlash uchun profilingizni faollashtiring.
              </p>
            </div>

            {/* Tezkor avtomatik Google hisob tanlash */}
            <div className="w-full max-w-sm space-y-3 pt-1">
              <button
                type="button"
                onClick={handleGoogleAutoPick}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 active:scale-95 text-slate-900 font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer border border-zinc-200"
              >
                <GoogleIcon size={22} />
                <span>Google (Gmail) Bilan Tezkor Kirish</span>
              </button>

              {/* Ajratuvchi */}
              <div className="flex items-center gap-2 text-[10px] text-[#716e68] font-bold uppercase tracking-wider my-1">
                <div className="flex-1 h-px bg-[#383531]" />
                <span>yoki qoʻlda kiritish</span>
                <div className="flex-1 h-px bg-[#383531]" />
              </div>

              {/* Qo'lda kiritish formasi */}
              <form onSubmit={handleManualSubmit} className="space-y-2.5 text-left bg-[#181715] p-4 rounded-2xl border border-[#383531]">
                {manualError && (
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{manualError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-[#9b9893] mb-1 font-semibold uppercase tracking-wider">
                    Ismingiz yoki Taxallusingiz:
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => {
                      setManualName(e.target.value);
                      if (manualError) setManualError(null);
                    }}
                    placeholder="Masalan: Azamat Karimov"
                    className="w-full bg-[#21201d] border border-[#383531] focus:border-[#81b64c] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#9b9893] mb-1 font-semibold uppercase tracking-wider">
                    Google Gmail pochtangiz:
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => {
                      setManualEmail(e.target.value);
                      if (manualError) setManualError(null);
                    }}
                    placeholder="karimovazamat3421@gmail.com"
                    className="w-full bg-[#21201d] border border-[#383531] focus:border-[#81b64c] rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none font-mono transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-[#81b64c] hover:bg-[#92c35a] active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#537a2e] active:translate-y-1 active:shadow-none transition-all cursor-pointer mt-2"
                >
                  <span>✓</span>
                  <span>Hisobni Saqlash va Faollashtirish</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* PROFIL ASOSIY KARTOCHKASI (GOOGLE BILAN ULANGAN HOLDA) */
          <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-[#21201d] border border-[#383531] shadow-md relative">
            {/* Avatar */}
            <div className="relative mb-3">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#81b64c] shadow-md bg-[#2c2a26]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              {!profile.avatarUrl && (
                <div className="w-20 h-20 rounded-2xl bg-[#7a6652] border-2 border-[#81b64c] flex items-center justify-center text-white font-black text-3xl shadow-md">
                  {profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <button
                onClick={() => setIsEditingName(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[#81b64c] text-white text-[11px] font-bold flex items-center justify-center shadow-md border border-[#21201d] active:scale-95"
                title="Ismni tahrirlash"
              >
                ✎
              </button>
            </div>

            {/* Google Tasdiq Belgisi */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 mb-1.5">
              <GoogleIcon size={12} />
              <span>{t('google_linked')}</span>
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
                  className="px-3 py-1.5 bg-[#81b64c] hover:bg-[#92c35a] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  {t('save_name_btn')}
                </button>
              </div>
            ) : (
              <h3 className="text-lg font-black text-white">
                {profile.name}
              </h3>
            )}

            {/* Google Email */}
            {profile.email && (
              <p className="text-xs text-[#9b9893] font-mono mt-0.5">
                {profile.email}
              </p>
            )}

            {/* Reyting va Liga */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#2c2a26] border border-[#383531] text-xs font-mono font-bold text-[#81b64c]">
                <span>⭐ {profile.rating} {t('rating_label')}</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-[#2c2a26] border border-[#383531] text-xs font-bold text-[#f5b041]">
                {profile.league}
              </div>
            </div>

            {/* Hisobni Almashtirish va Chiqish Tugmalari */}
            <div className="flex items-center gap-2 mt-3.5 w-full max-w-xs">
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#2c2a26] hover:bg-[#383531] border border-[#44413c] hover:border-[#81b64c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <span>🔄</span>
                <span>{t('google_switch_account')}</span>
              </button>
              <button
                onClick={handleSignOut}
                className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                title={t('guest_mode_switch')}
              >
                <LogOutIcon size={13} />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        )}

        {/* 4 Talik Statistika Qatori */}
        <div className="grid grid-cols-4 gap-2">
          {/* O'yinlar */}
          <div className="p-3 rounded-2xl bg-[#21201d] border border-[#383531] text-center shadow-sm">
            <div className="text-[10px] text-[#9b9893] font-bold uppercase tracking-wider mb-0.5">
              {t('stats_games')}
            </div>
            <div className="text-base font-black text-white font-mono">
              {profile.gamesPlayed}
            </div>
          </div>

          {/* G'alaba */}
          <div className="p-3 rounded-2xl bg-[#21201d] border border-[#383531] text-center shadow-sm">
            <div className="text-[10px] text-[#81b64c] font-bold uppercase tracking-wider mb-0.5">
              {t('stats_wins')}
            </div>
            <div className="text-base font-black text-[#81b64c] font-mono">
              {profile.wins}
            </div>
          </div>

          {/* Durang */}
          <div className="p-3 rounded-2xl bg-[#21201d] border border-[#383531] text-center shadow-sm">
            <div className="text-[10px] text-[#5dade2] font-bold uppercase tracking-wider mb-0.5">
              {t('stats_draws')}
            </div>
            <div className="text-base font-black text-[#5dade2] font-mono">
              {profile.draws}
            </div>
          </div>

          {/* Mag'lubiyat */}
          <div className="p-3 rounded-2xl bg-[#21201d] border border-[#383531] text-center shadow-sm">
            <div className="text-[10px] text-[#e74c3c] font-bold uppercase tracking-wider mb-0.5">
              {t('stats_losses')}
            </div>
            <div className="text-base font-black text-[#e74c3c] font-mono">
              {profile.losses}
            </div>
          </div>
        </div>

        {/* G'alaba foizi indikatori */}
        <div className="p-3.5 rounded-2xl bg-[#21201d] border border-[#383531] shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2 font-bold">
            <span className="text-[#c3c2be]">{t('winrate_label')}:</span>
            <span className="text-[#81b64c] font-mono text-sm">{winRate}%</span>
          </div>
          <div className="w-full h-2 bg-[#181715] rounded-full overflow-hidden border border-[#383531]">
            <div
              className="h-full bg-[#81b64c] rounded-full transition-all duration-500"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* ── OXIRGI 5 TA O'YIN TARIXI (G'ALABA, DURANG, MAG'LUBIYAT) ── */}
        <div className="p-4 rounded-3xl bg-[#21201d] border border-[#383531] shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📜</span>
              <h4 className="text-sm font-black text-white">{t('recent_games_title')}</h4>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#181715] px-2.5 py-1 rounded-full border border-[#383531] text-amber-400">
              {recentGames.slice(0, 5).length} / 5 {t('games_count_suffix')}
            </span>
          </div>

          {recentGames.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#181715] border border-[#383531] text-center space-y-1.5 py-5">
              <div className="text-2xl">♟️</div>
              <div className="text-xs font-bold text-slate-200">
                {t('no_recent_games')}
              </div>
              <p className="text-[11px] text-[#9b9893] max-w-xs mx-auto">
                {t('no_recent_games_desc')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentGames.slice(0, 5).map((game) => {
                const isWin = game.result === 'win';
                const isDraw = game.result === 'draw';

                const badgeBg = isWin
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                  : isDraw
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/40'
                  : 'bg-red-500/15 text-red-400 border-red-500/40';

                const badgeText = isWin ? t('result_win') : isDraw ? t('result_draw') : t('result_loss');

                return (
                  <div
                    key={game.id}
                    className="p-3 rounded-2xl bg-[#181715] border border-[#383531] flex items-center justify-between gap-2.5 hover:border-[#45423c] transition-colors"
                  >
                    {/* Chap: Natija nishoni va Raqib nomi */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider border shrink-0 ${badgeBg}`}>
                        {badgeText}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{game.opponent}</span>
                          <span className="text-[10px] font-mono text-[#9b9893]">
                            {game.myColor === 'white' ? '⬜' : '⬛'}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#9b9893] flex items-center gap-2 mt-0.5">
                          <span>{game.totalMoves} ta yurish</span>
                          {game.reason && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-300">{game.reason}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* O'ng: Sana va Vaqt */}
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-mono font-semibold text-[#81b64c]">
                        {formatUzbekDate(game.date)}
                      </div>
                      <div className="text-[9px] text-[#9b9893] font-medium capitalize mt-0.5">
                        {game.gameMode === 'vsAI' ? 'Kompyuter' : game.gameMode === 'online' ? 'Onlayn' : 'PVP'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                {t('action_achievements')}
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
                {t('action_leaderboard')}
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
                {t('action_friends')}
              </span>
            </div>
            <ChevronRightIcon size={16} className="text-[#686560]" />
          </button>

          {/* Faqat Google ulangan bo'lsa: pastda toza Chiqish tugmasi */}
          {profile.isGoogleLinked && (
            <button
              onClick={handleSignOut}
              className="w-full mt-4 p-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-2.5 text-red-300 hover:text-red-200 text-xs font-bold transition-all active:scale-[0.99] shadow-sm cursor-pointer"
            >
              <LogOutIcon size={16} />
              <span>{t('guest_mode_switch')}</span>
            </button>
          )}
        </div>
      </main>

      {/* Google Auth Modali */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(updated) => {
          setProfile(updated);
          setNameInput(updated.name);
        }}
      />
    </div>
  );
}
