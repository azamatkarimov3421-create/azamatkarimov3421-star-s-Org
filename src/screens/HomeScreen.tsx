import React, { useState, useEffect } from 'react';
import NurLogo from '../components/NurLogo';
import { useGame } from '../store/gameStore';
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
  GoogleIcon,
} from '../components/Icons';
import { useTranslation } from '../i18n/translations';
import { getUserProfile, subscribeUserProfile, UserProfile } from '../store/userProfileStore';

interface HomeScreenProps {
  onStartVsAI: () => void;
  onStartLocal: () => void;
  onOpenOnline: () => void;
  onOpenBotVsBot: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onContinueGame?: () => void;
}

export default function HomeScreen({
  onStartVsAI,
  onStartLocal,
  onOpenOnline,
  onOpenBotVsBot,
  onOpenRules,
  onOpenStats,
  onOpenSettings,
  onContinueGame,
}: HomeScreenProps) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());

  const isLight =
    state.appTheme === 'light' ||
    (state.appTheme === 'system' &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const hasActiveMatch =
    (state.game.status === 'playing' || state.game.status === 'check') &&
    (state.game.moveHistory?.length || 0) > 0;

  useEffect(() => {
    setProfile(getUserProfile());
    const unsub = subscribeUserProfile((p) => setProfile(p));
    return unsub;
  }, []);

  const gameModes = [
    {
      id: 'vsAI',
      title: t('mode_vs_ai_title'),
      subtitle: t('mode_vs_ai_desc'),
      icon: <BotIcon size={22} className={isLight ? 'text-emerald-700' : 'text-[#4ade80]'} />,
      iconBg: isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-[#183622] border-[#275535]',
      action: onStartVsAI,
    },
    {
      id: 'aiVsAi',
      title: t('mode_ai_vs_ai_title'),
      subtitle: t('mode_ai_vs_ai_desc'),
      icon: <SwordsIcon size={22} className={isLight ? 'text-amber-700' : 'text-amber-400'} />,
      iconBg: isLight ? 'bg-amber-50 border-amber-200' : 'bg-[#332616] border-[#553c20]',
      badge: t('badge_new'),
      action: onOpenBotVsBot,
    },
    {
      id: 'pvp',
      title: t('mode_pvp_title'),
      subtitle: t('mode_pvp_desc'),
      icon: <UsersIcon size={22} className={isLight ? 'text-blue-700' : 'text-[#60a5fa]'} />,
      iconBg: isLight ? 'bg-blue-50 border-blue-200' : 'bg-[#182a3c] border-[#23425e]',
      action: onStartLocal,
    },
    {
      id: 'online',
      title: t('mode_online_title'),
      subtitle: t('mode_online_desc'),
      icon: <GlobeIcon size={22} className={isLight ? 'text-purple-700' : 'text-[#c084fc]'} />,
      iconBg: isLight ? 'bg-purple-50 border-purple-200' : 'bg-[#2a1d3d] border-[#442c62]',
      action: onOpenOnline,
    },
    {
      id: 'rules',
      title: t('mode_rules_title'),
      subtitle: t('mode_rules_desc'),
      icon: <BookOpenIcon size={22} className={isLight ? 'text-amber-700' : 'text-[#fbbf24]'} />,
      iconBg: isLight ? 'bg-amber-50 border-amber-200' : 'bg-[#332616] border-[#553c20]',
      action: onOpenRules,
    },
    {
      id: 'stats',
      title: t('mode_stats_title'),
      subtitle: t('mode_stats_desc'),
      icon: <TrophyIcon size={22} className={isLight ? 'text-pink-700' : 'text-[#f472b6]'} />,
      iconBg: isLight ? 'bg-pink-50 border-pink-200' : 'bg-[#351a24] border-[#592539]',
      action: onOpenStats,
    },
  ];

  return (
    <div className={`min-h-screen w-full ${isLight ? 'bg-[#f6f3ed] md:bg-[url("/desktop-bg-light.jpg")] text-[#1a1917]' : 'bg-[#121614] md:bg-[url("/desktop-bg.jpg")] text-[#f1f1f1]'} bg-cover bg-center bg-fixed flex flex-col font-sans select-none relative overflow-x-hidden transition-colors duration-200`}>
      {/* Fon qatlami (Desktopda va mobilida kontrast va silliq ko'rinish uchun) */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-200 ${isLight ? 'bg-gradient-to-b from-[#faf8f4]/80 via-[#f5f1e8]/70 to-[#eae4d5]/85' : 'hidden md:block bg-gradient-to-b from-[#0b100d]/85 via-[#0d1310]/75 to-[#0b100d]/90'}`} />

      <div className="relative z-10 w-full flex flex-col justify-between min-h-screen">
        {/* ── 1. YUQORI HEADER (FLOATING GLASS NAVBAR) ── */}
        <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <div className={`w-full rounded-2xl sm:rounded-3xl backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between border transition-all ${
            isLight
              ? 'bg-white/95 border-[#e2ddd3] shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
              : 'bg-[#141b17]/90 border-[#27372d] shadow-2xl'
          }`}>
            {/* Logo va Brend */}
            <div className="flex items-center gap-3">
              <NurLogo size={40} showGlow={!isLight} />
              <div>
                <h1 className={`text-base sm:text-lg font-black tracking-wide leading-tight ${isLight ? 'text-[#1a1917]' : 'text-white'}`}>
                  NUR SHAXMAT <span className="text-[#d97706]">100</span>
                </h1>
                <p className={`text-[10px] font-bold tracking-wider uppercase ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                  V1.1.3 • OʻZBEK SHAXMATI (10X10)
                </p>
              </div>
            </div>

            {/* Desktop Navigatsiya Tugmalari */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => {}}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#1f3f27] text-[#4ade80] border border-[#22c55e]/50 shadow-[0_0_12px_rgba(34,197,94,0.25)]'
                }`}
              >
                <SwordsIcon size={16} className={isLight ? 'text-white' : 'text-[#4ade80]'} />
                <span>{t('nav_game')}</span>
              </button>
              <button
                onClick={onOpenRules}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isLight
                    ? 'text-[#635f58] hover:text-[#1a1917] hover:bg-zinc-100'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#1f2a22]'
                }`}
              >
                <BookOpenIcon size={16} />
                <span>{t('nav_rules')}</span>
              </button>
              <button
                onClick={onOpenStats}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isLight
                    ? 'text-[#635f58] hover:text-[#1a1917] hover:bg-zinc-100'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#1f2a22]'
                }`}
              >
                <TrophyIcon size={16} />
                <span>{t('nav_leaderboard')}</span>
              </button>
              <button
                onClick={onOpenSettings}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isLight
                    ? 'text-[#635f58] hover:text-[#1a1917] hover:bg-zinc-100'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#1f2a22]'
                }`}
              >
                <SettingsIcon size={16} />
                <span>{t('nav_settings')}</span>
              </button>

              {/* Desktop Google Profil Tugmasi */}
              {profile.isGoogleLinked ? (
                <button
                  onClick={onOpenStats}
                  className={`ml-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm border ${
                    isLight
                      ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-900'
                      : 'bg-[#1d2b21] hover:bg-[#25372a] border-[#304736] text-white'
                  }`}
                  title={t('nav_profile')}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="w-6 h-6 rounded-lg object-cover border border-[#4ade80]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <GoogleIcon size={16} />
                  )}
                  <span className="font-bold max-w-[120px] truncate">{profile.name}</span>
                  <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>⭐ {profile.rating}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenStats}
                  className="ml-1 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                  title={t('google_profile_btn')}
                >
                  <GoogleIcon size={15} />
                  <span>{t('google_profile_btn')}</span>
                </button>
              )}
            </nav>

            {/* Mobil O'ng Blok: Profil va Sozlamalar */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onOpenStats}
                className={`h-10 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  profile.isGoogleLinked
                    ? isLight
                      ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                      : 'bg-[#233027] border-[#2e4235] text-white'
                    : isLight
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}
                title={t('nav_profile')}
              >
                {profile.isGoogleLinked ? (
                  profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="w-5 h-5 rounded-md object-cover border border-emerald-500/60"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-md bg-[#7a6652] text-white flex items-center justify-center text-[10px] font-black border border-emerald-500/60">
                      {(profile.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  )
                ) : (
                  <GoogleIcon size={16} />
                )}
                <span className="text-[11px] max-w-[70px] truncate">
                  {profile.isGoogleLinked ? profile.name : t('nav_profile')}
                </span>
              </button>

              <button
                onClick={onOpenSettings}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-zinc-950'
                    : 'bg-[#233027] border-[#2e4235] text-[#c3c2be] hover:text-white'
                }`}
                title={t('nav_settings')}
              >
                <SettingsIcon size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* ── 2. ASOSIY QISM (1-GA-1 DESKTOP GRID) ── */}
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start flex-1">
          {/* Chap ustun: Boshlash va 3D/2D tanlov (md:col-span-5) */}
          <div className={`w-full md:col-span-5 p-5 sm:p-6 rounded-3xl backdrop-blur-md border flex flex-col gap-4 transition-all ${
            isLight
              ? 'bg-white/95 border-[#e2ddd3] shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
              : 'bg-[#141b17]/95 border-[#27372d] shadow-2xl'
          }`}>
            {/* Faol O'yinni Davom Ettirish Kartasi (Resume Game Banner) */}
            {hasActiveMatch && (
              <div className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between gap-3 animate-pulse ${
                isLight
                  ? 'bg-gradient-to-r from-emerald-100/90 via-emerald-50 to-emerald-100/90 border-emerald-500 text-emerald-950 shadow-md'
                  : 'bg-gradient-to-r from-emerald-950/90 via-[#163320] to-emerald-950/90 border-emerald-500/70 shadow-[0_0_25px_rgba(16,185,129,0.35)] text-white'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-2xl shrink-0 ${
                    isLight ? 'bg-emerald-200/60 border-emerald-300 text-emerald-800' : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
                  }`}>
                    ⚔️
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                        Jarayondagi Oʻyin
                      </span>
                      <span className={`w-2 h-2 rounded-full animate-ping ${isLight ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
                    </div>
                    <p className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-emerald-950' : 'text-white'}`}>
                      {state.gameMode === 'vsAI'
                        ? "Bot bilan oʻyin"
                        : state.gameMode === 'aiVsAi'
                        ? "Bot vs Bot"
                        : state.gameMode === 'online'
                        ? "Onlayn oʻyin"
                        : "2 kishilik oʻyin"}
                      {' • '}
                      <span className={isLight ? 'text-amber-700' : 'text-amber-300'}>{Math.ceil((state.game.moveHistory?.length || 0) / 2)}-yurish</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={onContinueGame}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg cursor-pointer shrink-0 transition-all"
                >
                  <span>Davom ettirish</span>
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3.5">
              <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center shadow-inner shrink-0 ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-[#1e3827] border-[#285535] text-[#4ade80]'
              }`}>
                <SwordsIcon size={26} />
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl font-black ${isLight ? 'text-[#1a1917]' : 'text-white'}`}>{t('start_new_game')}</h2>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-[#6b6760]' : 'text-[#9ca3af]'}`}>{t('game_motto_1')}</p>
              </div>
            </div>

            {/* 3D va 2D Tanlagich (Yonma-yon 2 ta karta) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              {/* 3D Fazoviy Doska */}
              <div
                onClick={() => dispatch({ type: 'SET_3D', enabled: true })}
                className={`cursor-pointer p-3 rounded-2xl transition-all border-2 flex items-center justify-between gap-2 select-none ${
                  state.is3D
                    ? isLight
                      ? 'border-emerald-600 bg-emerald-50 shadow-[0_2px_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500'
                      : 'border-[#22c55e] bg-[#152a1b] shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-[#22c55e]/50'
                    : isLight
                    ? 'border-[#e2ddd3] bg-zinc-50 hover:border-zinc-300'
                    : 'border-[#27372d] bg-[#18221c] hover:border-[#384f3f]'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="text-xl sm:text-2xl shrink-0">🎲</span>
                  <div className="min-w-0">
                    <div className={`text-[11px] sm:text-xs font-black flex items-center gap-1 flex-wrap ${isLight ? 'text-[#1a1917]' : 'text-white'}`}>
                      <span>3D</span>
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border ${
                        isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                      }`}>
                        {t('as_in_book')}
                      </span>
                    </div>
                    <div className={`text-[10px] sm:text-[11px] truncate ${isLight ? 'text-[#6b6760]' : 'text-[#9ca3af]'}`}>
                      {state.is3D ? t('perspective_3d_desc') : t('flat_2d_desc')}
                    </div>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  state.is3D
                    ? isLight ? 'border-emerald-600' : 'border-[#22c55e]'
                    : isLight ? 'border-zinc-300' : 'border-[#4b5563]'
                }`}>
                  {state.is3D && <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-[#22c55e]'}`} />}
                </div>
              </div>

              {/* 2D Tekis Doska */}
              <div
                onClick={() => dispatch({ type: 'SET_3D', enabled: false })}
                className={`cursor-pointer p-3 rounded-2xl transition-all border-2 flex items-center justify-between gap-2 select-none ${
                  !state.is3D
                    ? isLight
                      ? 'border-emerald-600 bg-emerald-50 shadow-[0_2px_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500'
                      : 'border-[#22c55e] bg-[#152a1b] shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-[#22c55e]/50'
                    : isLight
                    ? 'border-[#e2ddd3] bg-zinc-50 hover:border-zinc-300'
                    : 'border-[#27372d] bg-[#18221c] hover:border-[#384f3f]'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="text-xl sm:text-2xl shrink-0">📐</span>
                  <div className="min-w-0">
                    <div className={`text-[11px] sm:text-xs font-black ${isLight ? 'text-[#1a1917]' : 'text-white'}`}>
                      2D
                    </div>
                    <div className={`text-[10px] sm:text-[11px] truncate ${isLight ? 'text-[#6b6760]' : 'text-[#9ca3af]'}`}>
                      {t('flat_2d_desc')}
                    </div>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  !state.is3D
                    ? isLight ? 'border-emerald-600' : 'border-[#22c55e]'
                    : isLight ? 'border-zinc-300' : 'border-[#4b5563]'
                }`}>
                  {!state.is3D && <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-[#22c55e]'}`} />}
                </div>
              </div>
            </div>

            {/* Katta Yashil O'yin Tugmasi */}
            <button
              onClick={onStartVsAI}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-b from-[#6cb83e] to-[#559b2d] hover:from-[#76c444] hover:to-[#5ea833] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-[0_5px_0_#386b1c] active:translate-y-1 active:shadow-[0_1px_0_#386b1c] transition-all cursor-pointer mt-1"
            >
              <PlayIcon size={20} className="fill-white" />
              <span>{t('play_vs_ai_big')}</span>
            </button>

            {/* Mualliflik ma'lumoti */}
            <div className={`pt-3 border-t flex items-center justify-between text-xs ${
              isLight ? 'border-[#e2ddd3] text-[#6b6760]' : 'border-[#27372d] text-[#9ca3af]'
            }`}>
              <span>{t('author_label')}</span>
              <span className={`text-xs font-bold font-mono ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>10×10 Standart</span>
            </div>
          </div>

          {/* O'ng ustun: O'yin Turlari Ro'yxati (md:col-span-7) */}
          <div className="w-full md:col-span-7 flex flex-col gap-3">
            <div className="px-1 text-xs font-black uppercase tracking-wider flex items-center justify-between">
              <span className={isLight ? 'text-[#6b6760]' : 'text-[#9ca3af]'}>{t('game_modes_header')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gameModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={mode.action}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border transition-all text-left flex items-center justify-between group active:scale-[0.99] cursor-pointer ${
                    isLight
                      ? 'bg-white/95 hover:bg-zinc-50 border-[#e2ddd3] hover:border-emerald-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
                      : 'bg-[#141b17]/95 hover:bg-[#18221c] border-[#27372d] hover:border-[#22c55e]/50 shadow-xl'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${mode.iconBg}`}>
                      {mode.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-sm transition-colors truncate ${
                          isLight
                            ? 'text-[#1a1917] group-hover:text-emerald-700'
                            : 'text-white group-hover:text-[#4ade80]'
                        }`}>
                          {mode.title}
                        </span>
                        {(mode as any).badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                            isLight
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                          }`}>
                            {(mode as any).badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 font-medium truncate ${
                        isLight ? 'text-[#6b6760]' : 'text-[#9ca3af]'
                      }`}>
                        {mode.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className={`transition-all pl-2 ${
                    isLight
                      ? 'text-[#9ca3af] group-hover:text-[#1a1917] group-hover:translate-x-1'
                      : 'text-[#686560] group-hover:text-white group-hover:translate-x-1'
                  }`}>
                    <ChevronRightIcon size={18} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* ── 3. PASTDAGI SHIOR VA BREND (1-GA-1 BOTTOM QUOTE) ── */}
        <footer className="w-full max-w-2xl mx-auto my-6 text-center flex flex-col items-center px-4 pb-2">
          <div className="flex items-center justify-center gap-4 w-full">
            <div className={`h-[1px] flex-1 bg-gradient-to-r from-transparent to-transparent ${
              isLight ? 'via-zinc-300' : 'via-[#4b5563]/40'
            }`} />
            <p className={`font-serif italic text-xs sm:text-sm tracking-wide ${
              isLight ? 'text-[#6b6760]' : 'text-[#9ca3af]/90'
            }`}>
              {t('quote_motto')}
            </p>
            <div className={`h-[1px] flex-1 bg-gradient-to-r from-transparent to-transparent ${
              isLight ? 'via-zinc-300' : 'via-[#4b5563]/40'
            }`} />
          </div>
          <p className={`text-[10px] tracking-[0.35em] font-bold uppercase mt-1 ${
            isLight ? 'text-[#9c978f]' : 'text-[#6b7280]'
          }`}>
            NUR SHAXMAT 100
          </p>
        </footer>
      </div>
    </div>
  );
}
