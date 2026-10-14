// =====================================================
// NUR CHESS 100 — 6. Foydalanuvchi Profili va Statistika Ekrani
// Faqat Google hisobi bilan kirish va ro'yxatdan o'tish
// =====================================================

import React, { useState, useEffect } from 'react';
import {
  getUserProfile,
  subscribeUserProfile,
  UserProfile,
  getRecentGames,
  RecentGame,
} from '../store/userProfileStore';
import {
  ArrowLeftIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
  ChevronRightIcon,
  SwordsIcon,
  GoogleIcon,
  LogOutIcon,
} from '../components/Icons';
import GoogleAuthModal from '../components/GoogleAuthModal';
import { signOutGoogle, triggerAutoGooglePick, signInWithGoogle } from '../services/authService';
import { useTranslation } from '../i18n/translations';
import { useGame } from '../store/gameStore';

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
  const { state } = useGame();
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isLight =
    state.appTheme === 'light' ||
    (state.appTheme === 'system' &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const cardBg = isLight
    ? 'bg-white border-[#e2ddd3] shadow-sm text-[#1a1917]'
    : 'bg-[#21201d] border-[#383531] shadow-md text-white';

  const innerCardBg = isLight
    ? 'bg-[#f8f6f0] border-[#e2ddd3] text-[#1a1917]'
    : 'bg-[#181715] border-[#383531] text-white';

  useEffect(() => {
    const handleProfileSync = (p: UserProfile) => {
      setProfile(p);
      setRecentGames(getRecentGames());
    };

    handleProfileSync(getUserProfile());
    const unsub = subscribeUserProfile(handleProfileSync);
    return unsub;
  }, []);

  const winRate = profile.gamesPlayed > 0
    ? Math.round((profile.wins / profile.gamesPlayed) * 100)
    : 0;

  const handleSignOut = async () => {
    if (window.confirm("Rostdan ham Google hisobingizdan chiqmoqchimisiz?")) {
      await signOutGoogle();
      const updated = getUserProfile();
      setProfile(updated);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    const isAndroid = typeof window !== 'undefined' && Boolean((window as any).AndroidBridge);

    // 1. Android APK ichida: nativ tizim akkaunt tanlash
    if (isAndroid) {
      const ok = triggerAutoGooglePick((updated) => {
        setProfile(updated);
        setSuccessMsg("Google hisobingiz muvaffaqiyatli ulandi!");
        setTimeout(() => setSuccessMsg(null), 3500);
      });
      if (ok) return;
    }

    // 2. Rasmiy Google OAuth API (Google Client ID orqali)
    try {
      setSuccessMsg("Google tizimiga ulanmoqda...");
      const res = await signInWithGoogle();
      if (!res.success) {
        setGoogleError(res.error || 'Google orqali kirishda xatolik yuz berdi.');
        setSuccessMsg(null);
      }
    } catch (err: any) {
      setGoogleError(err?.message || 'Google tizimiga ulanib boʻlmadi.');
      setSuccessMsg(null);
    }
  };

  return (
    <div className={`min-h-screen w-full ${isLight ? 'bg-[#f5f2eb] text-[#1a1917]' : 'bg-[#262421] text-[#f1f1f1]'} flex flex-col font-sans select-none pb-24 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl transition-colors duration-200`}>
      {/* Muvaffaqiyat xabari (Toast) */}
      {successMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-fadeIn border border-emerald-400">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-30 ${isLight ? 'bg-white/95 border-b border-[#e2ddd3]' : 'bg-[#21201d]/95 border-b border-[#383531]'} backdrop-blur-md px-4 py-3 flex items-center justify-between pt-[max(0.7rem,env(safe-area-inset-top))] transition-colors`}>
        <button
          onClick={onBack}
          className={`w-9 h-9 rounded-xl ${isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-200' : 'bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white shadow-[0_2px_0_#21201d]'} flex items-center justify-center transition-all active:scale-95`}
          title="Orqaga"
        >
          <ArrowLeftIcon size={18} />
        </button>

        <h2 className={`text-base font-extrabold ${isLight ? 'text-[#1a1917]' : 'text-white'}`}>
          {t('profile_title')}
        </h2>

        <button
          onClick={onOpenSettings}
          className={`w-9 h-9 rounded-xl ${isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-200' : 'bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white shadow-[0_2px_0_#21201d]'} flex items-center justify-center transition-all active:scale-95`}
          title={t('nav_settings')}
        >
          <SettingsIcon size={18} />
        </button>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* AGAR GOOGLE ULANGAN BO'LMASA — FAQAT GOOGLE AKAUTDAN KIRISH VA RO'YXATDAN O'TISH */}
        {!profile.isGoogleLinked ? (
          <div className={`p-6 sm:p-8 rounded-3xl ${isLight ? 'bg-white border border-[#e2ddd3] shadow-md' : 'bg-gradient-to-b from-[#2a2723] to-[#21201d] border border-[#81b64c]/40 shadow-2xl'} flex flex-col items-center text-center gap-4 animate-fadeIn`}>
            <div className={`w-16 h-16 rounded-2xl ${isLight ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700' : 'bg-[#233027] border-2 border-[#81b64c] text-white'} flex items-center justify-center font-black text-3xl shadow-inner`}>
              <GoogleIcon size={34} />
            </div>

            <div>
              <h3 className={`text-xl font-black ${isLight ? 'text-[#1a1917]' : 'text-white'}`}>
                Google Bilan Kirish va Roʻyxatdan Oʻtish
              </h3>
              <p className={`text-xs ${isLight ? 'text-[#68645e]' : 'text-[#c3c2be]'} mt-1.5 max-w-sm leading-relaxed`}>
                Reyting, yutuqlar va onlayn gʻalabalaringizni oʻz nomingiz bilan saqlash uchun Google hisobingiz orqali ulaning.
              </p>
            </div>

            {googleError && (
              <div className="w-full max-w-sm p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-500 text-xs font-semibold flex items-center gap-2 text-left animate-fadeIn">
                <span>⚠️</span>
                <span>{googleError}</span>
              </div>
            )}

            {/* Faqat Yagona Google Kirish / Ro'yxatdan o'tish tugmasi */}
            <div className="w-full max-w-sm pt-1">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-zinc-100 active:scale-95 text-slate-900 font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer border border-zinc-200"
              >
                <GoogleIcon size={24} />
                <span>Google (Gmail) Bilan Kirish</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#81b64c] font-semibold pt-1">
              <span>🔒</span>
              <span>100% xavfsiz va tezkor Google hisob tizimi</span>
            </div>
          </div>
        ) : (
          /* PROFIL ASOSIY KARTOCHKASI (GOOGLE BILAN ULANGAN HOLDA) */
          <div className={`flex flex-col items-center text-center p-5 rounded-3xl ${cardBg} relative animate-fadeIn`}>
            {/* Avatar */}
            <div className="relative mb-3">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className={`w-20 h-20 rounded-2xl object-cover border-2 border-[#81b64c] shadow-md ${isLight ? 'bg-zinc-100' : 'bg-[#2c2a26]'}`}
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
            </div>

            {/* Google Tasdiq Belgisi */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 mb-1.5">
              <GoogleIcon size={12} />
              <span>{t('google_linked')}</span>
            </div>

            {/* Ism */}
            <h3 className={`text-lg font-black ${isLight ? 'text-[#1a1917]' : 'text-white'}`}>
              {profile.name}
            </h3>

            {/* Google Email */}
            {profile.email && (
              <p className={`text-xs ${isLight ? 'text-[#68645e]' : 'text-[#9b9893]'} font-mono mt-0.5`}>
                {profile.email}
              </p>
            )}

            {/* Reyting va Liga */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl ${innerCardBg} text-xs font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-[#81b64c]'}`}>
                <span>⭐ {profile.rating} {t('rating_label')}</span>
              </div>
              <div className={`px-3 py-1 rounded-xl ${innerCardBg} text-xs font-bold text-[#f5b041]`}>
                {profile.league}
              </div>
            </div>

            {/* Hisobni Almashtirish va Chiqish Tugmalari */}
            <div className="flex items-center gap-2 mt-3.5 w-full max-w-xs">
              <button
                onClick={() => setShowAuthModal(true)}
                className={`flex-1 py-2 px-3 rounded-xl ${isLight ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800' : 'bg-[#2c2a26] hover:bg-[#383531] border-[#44413c] text-white'} border hover:border-[#81b64c] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm`}
              >
                <span>🔄</span>
                <span>Boshqa Hisobga Oʻtish</span>
              </button>
              <button
                onClick={handleSignOut}
                className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Google hisobidan chiqish"
              >
                <LogOutIcon size={13} />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        )}

        {/* FAQAT YUTGAN VA YUTQAZGAN STATISTIKASI */}
        <div className="grid grid-cols-3 gap-2">
          {/* Yutgan (G'alabalar) */}
          <div className={`p-3.5 rounded-2xl ${cardBg} text-center`}>
            <div className="text-[10px] text-[#81b64c] font-bold uppercase tracking-wider mb-0.5">
              🟢 Yutgan
            </div>
            <div className="text-xl font-black text-[#81b64c] font-mono">
              {profile.wins}
            </div>
          </div>

          {/* Yutqazgan (Mag'lubiyatlar) */}
          <div className={`p-3.5 rounded-2xl ${cardBg} text-center`}>
            <div className="text-[10px] text-[#e74c3c] font-bold uppercase tracking-wider mb-0.5">
              🔴 Yutqazgan
            </div>
            <div className="text-xl font-black text-[#e74c3c] font-mono">
              {profile.losses}
            </div>
          </div>

          {/* Jami Bahslar */}
          <div className={`p-3.5 rounded-2xl ${cardBg} text-center`}>
            <div className={`text-[10px] ${isLight ? 'text-[#68645e]' : 'text-[#9b9893]'} font-bold uppercase tracking-wider mb-0.5`}>
              ♟️ Jami Bahslar
            </div>
            <div className={`text-xl font-black ${isLight ? 'text-[#1a1917]' : 'text-white'} font-mono`}>
              {profile.gamesPlayed}
            </div>
          </div>
        </div>

        {/* G'alaba foizi indikatori */}
        <div className={`p-3.5 rounded-2xl ${cardBg}`}>
          <div className="flex items-center justify-between text-xs mb-2 font-bold">
            <span className={isLight ? 'text-[#68645e]' : 'text-[#c3c2be]'}>{t('winrate_label')}:</span>
            <span className="text-[#81b64c] font-mono text-sm">{winRate}%</span>
          </div>
          <div className={`w-full h-2 ${isLight ? 'bg-zinc-200 border-zinc-300' : 'bg-[#181715] border-[#383531]'} rounded-full overflow-hidden border`}>
            <div
              className="h-full bg-[#81b64c] rounded-full transition-all duration-500"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* ── OXIRGI 5 TA O'YIN TARIXI ── */}
        <div className={`p-4 rounded-3xl ${cardBg} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📜</span>
              <h4 className={`text-sm font-black ${isLight ? 'text-[#1a1917]' : 'text-white'}`}>{t('recent_games_title')}</h4>
            </div>
            <span className={`text-[10px] font-mono font-bold ${isLight ? 'bg-zinc-100 border-zinc-300 text-amber-700' : 'bg-[#181715] border-[#383531] text-amber-400'} px-2.5 py-1 rounded-full border`}>
              {recentGames.slice(0, 5).length} / 5 {t('games_count_suffix')}
            </span>
          </div>

          {recentGames.length === 0 ? (
            <div className={`p-4 rounded-2xl ${innerCardBg} text-center space-y-1.5 py-5`}>
              <div className="text-2xl">♟️</div>
              <div className={`text-xs font-bold ${isLight ? 'text-[#1a1917]' : 'text-slate-200'}`}>
                {t('no_recent_games')}
              </div>
              <p className={`text-[11px] ${isLight ? 'text-[#68645e]' : 'text-[#9b9893]'} max-w-xs mx-auto`}>
                {t('no_recent_games_desc')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentGames.slice(0, 5).map((game) => {
                const isWin = game.result === 'win';
                const isDraw = game.result === 'draw';

                const badgeBg = isWin
                  ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40'
                  : isDraw
                  ? 'bg-sky-500/15 text-sky-600 border-sky-500/40'
                  : 'bg-red-500/15 text-red-600 border-red-500/40';

                const badgeText = isWin ? 'Gʻalaba (Yutgan)' : isDraw ? t('result_draw') : 'Magʻlubiyat (Yutqazgan)';

                return (
                  <div
                    key={game.id}
                    className={`p-3 rounded-2xl ${innerCardBg} flex items-center justify-between gap-2.5 hover:border-emerald-500/40 transition-colors`}
                  >
                    {/* Chap: Natija nishoni va Raqib nomi */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider border shrink-0 ${badgeBg}`}>
                        {badgeText}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold ${isLight ? 'text-[#1a1917]' : 'text-white'} truncate flex items-center gap-1.5`}>
                          <span>{game.opponent}</span>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-[#68645e]' : 'text-[#9b9893]'}`}>
                            {game.myColor === 'white' ? '⬜' : '⬛'}
                          </span>
                        </div>
                        <div className={`text-[10px] ${isLight ? 'text-[#68645e]' : 'text-[#9b9893]'} flex items-center gap-2 mt-0.5`}>
                          <span>{game.totalMoves} ta yurish</span>
                          {game.reason && (
                            <>
                              <span>•</span>
                              <span className={`font-medium ${isLight ? 'text-zinc-700' : 'text-slate-300'}`}>{game.reason}</span>
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
                      <div className={`text-[9px] ${isLight ? 'text-[#68645e]' : 'text-[#9b9893]'} font-medium capitalize mt-0.5`}>
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
            className={`w-full p-3.5 rounded-2xl ${isLight ? 'bg-white hover:bg-zinc-50 border-[#e2ddd3]' : 'bg-[#21201d] hover:bg-[#282622] border-[#383531]'} border flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-sm group cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-[#2a2824] border-[#3d3a34]'} border flex items-center justify-center text-[#f1c40f]`}>
                <TrophyIcon size={18} />
              </div>
              <span className={`font-bold text-sm ${isLight ? 'text-[#1a1917]' : 'text-white'} group-hover:text-[#81b64c] transition-colors`}>
                {t('action_achievements')}
              </span>
            </div>
            <ChevronRightIcon size={16} className={isLight ? 'text-[#9ca3af]' : 'text-[#686560]'} />
          </button>

          {/* Reyting / Peshqadamlar */}
          <button
            onClick={onOpenLeaderboard}
            className={`w-full p-3.5 rounded-2xl ${isLight ? 'bg-white hover:bg-zinc-50 border-[#e2ddd3]' : 'bg-[#21201d] hover:bg-[#282622] border-[#383531]'} border flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-sm group cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${isLight ? 'bg-sky-50 border-sky-200' : 'bg-[#2a2824] border-[#3d3a34]'} border flex items-center justify-center text-[#5dade2]`}>
                <SwordsIcon size={18} />
              </div>
              <span className={`font-bold text-sm ${isLight ? 'text-[#1a1917]' : 'text-white'} group-hover:text-[#81b64c] transition-colors`}>
                {t('action_leaderboard')}
              </span>
            </div>
            <ChevronRightIcon size={16} className={isLight ? 'text-[#9ca3af]' : 'text-[#686560]'} />
          </button>

          {/* Do'stlar */}
          <button
            onClick={onOpenFriends}
            className={`w-full p-3.5 rounded-2xl ${isLight ? 'bg-white hover:bg-zinc-50 border-[#e2ddd3]' : 'bg-[#21201d] hover:bg-[#282622] border-[#383531]'} border flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-sm group cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#2a2824] border-[#3d3a34]'} border flex items-center justify-center ${isLight ? 'text-zinc-700' : 'text-[#e0dfdc]'}`}>
                <UsersIcon size={18} />
              </div>
              <span className={`font-bold text-sm ${isLight ? 'text-[#1a1917]' : 'text-white'} group-hover:text-[#81b64c] transition-colors`}>
                {t('action_friends')}
              </span>
            </div>
            <ChevronRightIcon size={16} className={isLight ? 'text-[#9ca3af]' : 'text-[#686560]'} />
          </button>

          {/* Faqat Google ulangan bo'lsa: pastda toza Chiqish tugmasi */}
          {profile.isGoogleLinked && (
            <button
              onClick={handleSignOut}
              className="w-full mt-4 p-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-2.5 text-red-500 hover:text-red-600 text-xs font-bold transition-all active:scale-[0.99] shadow-sm cursor-pointer"
            >
              <LogOutIcon size={16} />
              <span>Google Hisobidan Chiqish</span>
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
        }}
      />
    </div>
  );
}
