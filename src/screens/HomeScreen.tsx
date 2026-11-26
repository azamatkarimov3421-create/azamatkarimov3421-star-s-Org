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
  onStartVsAI: (preferredColor?: 'white' | 'black' | 'random') => void;
  onStartLocal: () => void;
  onOpenOnline: () => void;
  onOpenBotVsBot: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenLeaderboard?: () => void;
  onOpenSettings: () => void;
  onContinueGame?: () => void;
  onOpenStandaloneClock?: () => void;
  onOpenBotModal?: () => void;
  webDeviceView?: 'notebook' | 'phone';
  onSetWebDeviceView?: (view: 'notebook' | 'phone') => void;
  isAndroidApk?: boolean;
}

const QUICK_BOT_LEVELS = [
  { depth: 1, label: 'Oson', icon: '🤖', elo: '1000' },
  { depth: 2, label: 'Oʻrta', icon: '⚡', elo: '1400' },
  { depth: 3, label: 'Usta', icon: '👑', elo: '1800' },
  { depth: 4, label: 'Pro', icon: '💎', elo: '2200' },
];

export default function HomeScreen({
  onStartVsAI,
  onStartLocal,
  onOpenOnline,
  onOpenBotVsBot,
  onOpenRules,
  onOpenStats,
  onOpenLeaderboard,
  onOpenSettings,
  onContinueGame,
  onOpenStandaloneClock,
  onOpenBotModal,
  webDeviceView = 'notebook',
  onSetWebDeviceView,
  isAndroidApk = false,
}: HomeScreenProps) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [homeColorChoice, setHomeColorChoice] = useState<'white' | 'random' | 'black'>('white');

  const isLight =
    state.appTheme === 'light' ||
    (state.appTheme === 'system' &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isMobileSimulation = !isAndroidApk && webDeviceView === 'phone';

  const hasActiveMatch =
    state.gameMode !== 'aiVsAi' &&
    (state.game.status === 'playing' || state.game.status === 'check') &&
    (state.game.moveHistory?.length || 0) > 0;

  useEffect(() => {
    setProfile(getUserProfile());
    const unsub = subscribeUserProfile((p) => setProfile(p));
    return unsub;
  }, []);

  const toggleQuickTheme = () => {
    dispatch({ type: 'SET_APP_THEME', theme: isLight ? 'dark' : 'light' });
  };

  const gameModes = [
    {
      id: 'vsAI',
      title: t('mode_vs_ai_title'),
      subtitle: t('mode_vs_ai_desc'),
      icon: <BotIcon size={22} className={isLight ? 'text-emerald-700' : 'text-emerald-300'} />,
      iconBg: isLight
        ? 'bg-emerald-500/15 border-emerald-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
        : 'bg-emerald-500/20 border-emerald-400/35 shadow-[0_0_16px_rgba(16,185,129,0.2)]',
      action: onOpenBotModal || (() => onStartVsAI(homeColorChoice)),
    },
    {
      id: 'aiVsAi',
      title: t('mode_ai_vs_ai_title'),
      subtitle: t('mode_ai_vs_ai_desc'),
      icon: <SwordsIcon size={22} className={isLight ? 'text-amber-700' : 'text-amber-300'} />,
      iconBg: isLight
        ? 'bg-amber-500/15 border-amber-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
        : 'bg-amber-500/20 border-amber-400/35 shadow-[0_0_16px_rgba(245,158,11,0.2)]',
      action: onOpenBotVsBot,
    },
    {
      id: 'pvp',
      title: t('mode_pvp_title'),
      subtitle: t('mode_pvp_desc'),
      icon: <UsersIcon size={22} className={isLight ? 'text-sky-700' : 'text-sky-300'} />,
      iconBg: isLight
        ? 'bg-sky-500/15 border-sky-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
        : 'bg-sky-500/20 border-sky-400/35 shadow-[0_0_16px_rgba(56,189,248,0.2)]',
      action: onStartLocal,
    },
    {
      id: 'online',
      title: t('mode_online_title'),
      subtitle: t('mode_online_desc'),
      icon: <GlobeIcon size={22} className={isLight ? 'text-purple-700' : 'text-purple-300'} />,
      iconBg: isLight
        ? 'bg-purple-500/15 border-purple-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
        : 'bg-purple-500/20 border-purple-400/35 shadow-[0_0_16px_rgba(192,132,252,0.2)]',
      action: onOpenOnline,
    },
    {
      id: 'chessClock',
      title: 'Shaxmat Soati (Taymer)',
      subtitle: 'Jonli doskada 2 kishi oʻynashi uchun soat',
      icon: <span className="text-xl">⏱️</span>,
      iconBg: isLight
        ? 'bg-orange-500/15 border-orange-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
        : 'bg-orange-500/20 border-orange-400/35 shadow-[0_0_16px_rgba(251,146,60,0.2)]',
      badge: 'FIDE/DGT',
      action: onOpenStandaloneClock || (() => {}),
    },
    {
      id: 'rules',
      title: t('mode_rules_title'),
      subtitle: t('mode_rules_desc'),
      icon: <BookOpenIcon size={22} className={isLight ? 'text-amber-700' : 'text-yellow-300'} />,
      iconBg: isLight
        ? 'bg-yellow-500/15 border-yellow-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
        : 'bg-yellow-500/20 border-yellow-400/35 shadow-[0_0_16px_rgba(250,204,21,0.2)]',
      action: onOpenRules,
    },
  ];

  return (
    <div
      className={`min-h-screen landscape:max-h-[520px]:min-h-0 landscape:max-h-[520px]:h-[100dvh] landscape:max-h-[520px]:max-h-[100dvh] landscape:max-h-[520px]:overflow-hidden md:min-h-screen md:h-auto md:max-h-none md:overflow-visible w-full ${
        isLight ? 'bg-transparent text-[#1a1917]' : 'bg-transparent text-[#f5f5f4]'
      } flex flex-col font-sans select-none relative overflow-x-hidden transition-colors duration-200`}
    >
      {/* APK uchun yengil fon; Saytda esa App.tsx dagi shaffof atmosferik shisha foni ko'rinib turadi! */}
      {isAndroidApk && (
        <div
          className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-200 ${
            isLight
              ? 'bg-gradient-to-b from-[#faf8f4]/80 via-[#f5f1e8]/70 to-[#eae4d5]/85'
              : 'hidden md:block bg-gradient-to-b from-[#0b100d]/85 via-[#0d1310]/75 to-[#0b100d]/90'
          }`}
        />
      )}

      <div
        className={`relative z-10 w-full flex flex-col justify-between md:justify-center min-h-screen landscape:max-h-[520px]:min-h-0 landscape:max-h-[520px]:h-full landscape:max-h-[520px]:overflow-hidden md:min-h-screen md:h-auto md:overflow-visible ${
          isMobileSimulation ? 'max-w-[440px] mx-auto pb-20 pt-2' : 'md:py-5'
        }`}
      >
        {/* ── 1. YUQORI HEADER (FLOATING CRYSTAL GLASS NAVBAR) ── */}
        <header className="w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8 pt-2 sm:pt-4 md:pt-5 landscape:pt-1 landscape:pb-0 landscape:px-3 shrink-0">
          <div className="w-full rounded-2xl sm:rounded-3xl md:rounded-[1.9rem] nur-glass-nav px-3.5 sm:px-6 md:px-7 py-2.5 sm:py-3 md:py-3.5 landscape:py-1.5 landscape:px-3 flex items-center justify-between transition-all">
            {/* Logo va Brend */}
            <div className="flex items-center gap-3 min-w-0">
              <NurLogo size={42} showGlow={!isLight} />
              <div className="min-w-0">
                <h1
                  className={`text-base sm:text-lg md:text-xl lg:text-[22px] font-black tracking-wide leading-tight truncate ${
                    isLight ? 'text-[#18181b]' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  NUR SHAXMAT <span className="text-[#f59e0b]">100</span>
                </h1>
                <p
                  className={`text-[10px] md:text-[11px] font-bold tracking-wider uppercase truncate ${
                    isLight ? 'text-amber-800/90' : 'text-amber-300/90'
                  }`}
                >
                  V1.2.22 • OʻZBEK SHAXMATI (10×10)
                </p>
              </div>
            </div>

            {/* Desktop Navigatsiya Tugmalari */}
            <nav
              className={`${
                isMobileSimulation ? 'hidden' : 'hidden landscape:flex md:flex'
              } items-center gap-1.5 lg:gap-2`}
            >
              {/* Sayt uchun Noutbuk / Telefon ko'rinish tanlagichi */}
              {!isAndroidApk && onSetWebDeviceView && (
                <div
                  className={`flex items-center p-1 rounded-2xl border mr-1 ${
                    isLight
                      ? 'bg-black/[0.04] border-black/10'
                      : 'bg-black/30 border-white/15'
                  }`}
                >
                  <button
                    onClick={() => onSetWebDeviceView('notebook')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      webDeviceView === 'notebook'
                        ? 'bg-emerald-500 text-white shadow-[0_2px_10px_rgba(16,185,129,0.4)]'
                        : isLight
                        ? 'text-zinc-700 hover:text-zinc-950'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                    title="Noutbuk / Kompyuter ko'rinishi"
                  >
                    <span>💻</span>
                    <span className="hidden xl:inline">Noutbuk</span>
                  </button>
                  <button
                    onClick={() => onSetWebDeviceView('phone')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      webDeviceView === 'phone'
                        ? 'bg-emerald-500 text-white shadow-[0_2px_10px_rgba(16,185,129,0.4)]'
                        : isLight
                        ? 'text-zinc-700 hover:text-zinc-950'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                    title="Telefon / Mobil ko'rinishi"
                  >
                    <span>📱</span>
                    <span className="hidden xl:inline">Telefon</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {}}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-emerald-600 text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)]'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/45 shadow-[0_0_16px_rgba(34,197,94,0.22)]'
                }`}
              >
                <SwordsIcon size={16} className={isLight ? 'text-white' : 'text-emerald-300'} />
                <span>{t('nav_game')}</span>
              </button>

              <button
                onClick={onOpenRules}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isLight
                    ? 'text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.05]'
                    : 'text-zinc-200 hover:text-white hover:bg-white/[0.10]'
                }`}
              >
                <BookOpenIcon size={16} />
                <span>{t('nav_rules')}</span>
              </button>

              <button
                onClick={onOpenLeaderboard || onOpenStats}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isLight
                    ? 'text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.05]'
                    : 'text-zinc-200 hover:text-white hover:bg-white/[0.10]'
                }`}
              >
                <TrophyIcon size={16} />
                <span>{t('nav_leaderboard')}</span>
              </button>

              <button
                onClick={onOpenSettings}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isLight
                    ? 'text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.05]'
                    : 'text-zinc-200 hover:text-white hover:bg-white/[0.10]'
                }`}
              >
                <SettingsIcon size={16} />
                <span>{t('nav_settings')}</span>
              </button>

              {/* Saytda 1-bosishda Tungi / Kunduzgi Shisha rejimini almashtirish */}
              {!isAndroidApk && (
                <button
                  onClick={toggleQuickTheme}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm transition-all cursor-pointer active:scale-95 ${
                    isLight
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/50 text-amber-700'
                      : 'bg-white/[0.08] hover:bg-white/[0.16] border-white/20 text-amber-300'
                  }`}
                  title={isLight ? 'Qora Shisha (Tungi) rejimiga oʻtish' : 'Oq Shisha (Kunduzgi) rejimiga oʻtish'}
                >
                  {isLight ? '🌙' : '☀️'}
                </button>
              )}

              {/* Desktop Google Profil Tugmasi */}
              {profile.isGoogleLinked ? (
                <button
                  onClick={onOpenStats}
                  className={`ml-0.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border whitespace-nowrap ${
                    isLight
                      ? 'bg-white/80 hover:bg-white border-zinc-300/80 text-zinc-900 shadow-sm'
                      : 'bg-white/[0.10] hover:bg-white/[0.16] border-white/20 text-white'
                  }`}
                  title={t('nav_profile')}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="w-6 h-6 rounded-lg object-cover border border-emerald-400"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <GoogleIcon size={16} />
                  )}
                  <span className="font-bold max-w-[115px] truncate">{profile.name}</span>
                  <span className={`text-[10px] font-mono font-black ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                    ⭐ {profile.rating}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onOpenStats}
                  className="ml-0.5 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:brightness-105 text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-[0_4px_16px_rgba(245,158,11,0.38)] active:scale-95"
                  title={t('google_profile_btn')}
                >
                  <GoogleIcon size={15} />
                  <span>{t('google_profile_btn')}</span>
                </button>
              )}
            </nav>

            {/* Mobil / Telefon Simulyatsiyasi O'ng Blok */}
            <div
              className={`flex items-center gap-1.5 ${
                isMobileSimulation ? 'flex' : 'landscape:hidden md:hidden'
              }`}
            >
              {!isAndroidApk && onSetWebDeviceView && (
                <button
                  onClick={() => onSetWebDeviceView(webDeviceView === 'notebook' ? 'phone' : 'notebook')}
                  className={`h-9 px-2.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    isLight
                      ? 'bg-white/80 border-zinc-300 text-zinc-900'
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                  title={webDeviceView === 'notebook' ? 'Telefon koʻrinishi' : 'Noutbuk koʻrinishi'}
                >
                  <span>{webDeviceView === 'notebook' ? '📱' : '💻'}</span>
                  {isMobileSimulation && <span className="text-[11px]">Noutbuk</span>}
                </button>
              )}

              {!isAndroidApk && (
                <button
                  onClick={toggleQuickTheme}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs transition-all active:scale-95 cursor-pointer ${
                    isLight
                      ? 'bg-amber-500/15 border-amber-400/50 text-amber-700'
                      : 'bg-white/10 border-white/20 text-amber-300'
                  }`}
                  title="Mavzuni almashtirish"
                >
                  {isLight ? '🌙' : '☀️'}
                </button>
              )}

              <button
                onClick={onOpenStats}
                className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  profile.isGoogleLinked
                    ? isLight
                      ? 'bg-white/80 border-zinc-300 text-zinc-900'
                      : 'bg-white/10 border-white/20 text-white'
                    : isLight
                    ? 'bg-amber-100/90 border-amber-300 text-amber-900'
                    : 'bg-amber-500/20 border-amber-400/40 text-amber-200'
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
                    <span className="w-5 h-5 rounded-md bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">
                      {(profile.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  )
                ) : (
                  <GoogleIcon size={15} />
                )}
                <span className="text-[11px] max-w-[68px] truncate">
                  {profile.isGoogleLinked ? profile.name : t('nav_profile')}
                </span>
              </button>

              <button
                onClick={onOpenSettings}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-white/80 border-zinc-300 text-zinc-700 hover:text-zinc-950'
                    : 'bg-white/10 border-white/20 text-zinc-200 hover:text-white'
                }`}
                title={t('nav_settings')}
              >
                <SettingsIcon size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* ── 2. ASOSIY QISM (SHAFFOF BILLUR GRID) ── */}
        <main
          className={`w-full ${
            isMobileSimulation
              ? 'grid grid-cols-1 gap-4 px-3 py-3 !my-0'
              : 'max-w-6xl xl:max-w-7xl 2xl:max-w-[1460px] mx-auto md:my-auto grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4 md:gap-7 lg:gap-9 px-3 sm:px-6 md:px-8 lg:px-10 py-3 md:py-6 landscape:max-h-[520px]:py-1.5 landscape:max-h-[520px]:gap-3 landscape:max-h-[520px]:px-3 landscape:max-h-[520px]:overflow-hidden md:overflow-visible'
          } items-stretch flex-1 md:flex-initial`}
        >
          {/* ── CHAP USTUN: TEZKOR O'YIN BOSHLASH PANELI (md:col-span-5) ── */}
          <div
            className={`w-full ${
              isMobileSimulation ? '' : 'landscape:col-span-5 md:col-span-5'
            } p-4 sm:p-6 md:p-7 lg:p-8 max-md:landscape:p-2.5 rounded-3xl md:rounded-[2.1rem] nur-glass-surface flex flex-col justify-between gap-3.5 max-md:landscape:gap-1.5 md:gap-4 transition-all`}
          >
            {/* Faol O'yinni Davom Ettirish Kartasi */}
            {hasActiveMatch && (
              <div
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isLight
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-950 shadow-sm'
                    : 'bg-emerald-500/20 border-emerald-400/50 shadow-[0_0_24px_rgba(16,185,129,0.25)] text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${
                      isLight
                        ? 'bg-white/70 border-emerald-400/60 text-emerald-800'
                        : 'bg-emerald-400/20 border-emerald-300/40 text-emerald-300'
                    }`}
                  >
                    ⚔️
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          isLight ? 'text-emerald-800' : 'text-emerald-300'
                        }`}
                      >
                        Saqlangan Oʻyin
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full animate-ping ${
                          isLight ? 'bg-emerald-600' : 'bg-emerald-400'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isLight ? 'text-emerald-950' : 'text-white'
                      }`}
                    >
                      {state.gameMode === 'vsAI'
                        ? 'Bot bilan oʻyin'
                        : state.gameMode === 'online'
                        ? 'Onlayn oʻyin'
                        : '2 kishilik oʻyin'}
                      {' • '}
                      <span className={isLight ? 'text-amber-700' : 'text-amber-300'}>
                        {Math.ceil((state.game.moveHistory?.length || 0) / 2)}-yurish
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={onContinueGame}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer shrink-0 transition-all"
                >
                  <span>Davom etish</span>
                  <ChevronRightIcon size={15} />
                </button>
              </div>
            )}

            {/* Sarlavha */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 md:w-14 md:h-14 landscape:w-8 landscape:h-8 landscape:rounded-xl rounded-2xl border flex items-center justify-center shrink-0 ${
                  isLight
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
                    : 'bg-emerald-500/20 border-emerald-400/35 text-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.22)]'
                }`}
              >
                <SwordsIcon size={26} className="landscape:w-4 landscape:h-4 md:w-7 md:h-7" />
              </div>
              <div>
                <h2
                  className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${
                    isLight ? 'text-[#18181b]' : 'text-white'
                  }`}
                >
                  {t('start_new_game')}
                </h2>
                <p
                  className={`text-xs md:text-[13px] landscape:text-[10px] mt-0.5 font-medium ${
                    isLight ? 'text-zinc-600' : 'text-zinc-300/90'
                  }`}
                >
                  {t('game_motto_1')}
                </p>
              </div>
            </div>

            {/* 3D va 2D Tanlagich (Teng bo'yli shaffof shisha kartalar) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 landscape:gap-1.5">
              {/* 3D Fazoviy Doska */}
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_3D', enabled: true })}
                className={`cursor-pointer p-3 md:p-4 landscape:p-1.5 landscape:rounded-xl rounded-2xl transition-all border text-left flex items-center justify-between gap-2 select-none ${
                  state.is3D
                    ? isLight
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-[0_4px_16px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/60'
                      : 'border-emerald-400/80 bg-emerald-500/20 shadow-[0_0_22px_rgba(34,197,94,0.22)] ring-1 ring-emerald-400/40'
                    : isLight
                    ? 'border-black/10 bg-white/55 hover:bg-white/80'
                    : 'border-white/15 bg-white/[0.05] hover:bg-white/[0.10] hover:border-white/25'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl sm:text-2xl landscape:text-sm shrink-0">🎲</span>
                  <div className="min-w-0">
                    <div
                      className={`text-xs sm:text-sm font-black flex items-center gap-1.5 flex-wrap ${
                        isLight ? 'text-zinc-900' : 'text-white'
                      }`}
                    >
                      <span>3D</span>
                      <span
                        className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border ${
                          isLight
                            ? 'bg-amber-500/20 text-amber-900 border-amber-400/60'
                            : 'bg-amber-400/20 text-amber-200 border-amber-400/35'
                        }`}
                      >
                        {t('as_in_book')}
                      </span>
                    </div>
                    <div
                      className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${
                        isLight ? 'text-zinc-600' : 'text-zinc-300/85'
                      }`}
                    >
                      {t('perspective_3d_desc')}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 landscape:w-3 landscape:h-3 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    state.is3D
                      ? isLight
                        ? 'border-emerald-600'
                        : 'border-emerald-400'
                      : isLight
                      ? 'border-zinc-400'
                      : 'border-white/35'
                  }`}
                >
                  {state.is3D && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isLight ? 'bg-emerald-600' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </div>
              </button>

              {/* 2D Tekis Doska */}
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_3D', enabled: false })}
                className={`cursor-pointer p-3 md:p-4 landscape:p-1.5 landscape:rounded-xl rounded-2xl transition-all border text-left flex items-center justify-between gap-2 select-none ${
                  !state.is3D
                    ? isLight
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-[0_4px_16px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/60'
                      : 'border-emerald-400/80 bg-emerald-500/20 shadow-[0_0_22px_rgba(34,197,94,0.22)] ring-1 ring-emerald-400/40'
                    : isLight
                    ? 'border-black/10 bg-white/55 hover:bg-white/80'
                    : 'border-white/15 bg-white/[0.05] hover:bg-white/[0.10] hover:border-white/25'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl sm:text-2xl landscape:text-sm shrink-0">📐</span>
                  <div className="min-w-0">
                    <div
                      className={`text-xs sm:text-sm font-black ${
                        isLight ? 'text-zinc-900' : 'text-white'
                      }`}
                    >
                      2D Klassik
                    </div>
                    <div
                      className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${
                        isLight ? 'text-zinc-600' : 'text-zinc-300/85'
                      }`}
                    >
                      {t('flat_2d_desc')}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 landscape:w-3 landscape:h-3 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    !state.is3D
                      ? isLight
                        ? 'border-emerald-600'
                        : 'border-emerald-400'
                      : isLight
                      ? 'border-zinc-400'
                      : 'border-white/35'
                  }`}
                >
                  {!state.is3D && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isLight ? 'bg-emerald-600' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </div>
              </button>
            </div>

            {/* Sayt uchun Qulay Tezkor Bot Darajasi Tanlagichi */}
            {!isAndroidApk && (
              <div className="space-y-1.5 max-md:landscape:hidden">
                <div className="flex items-center justify-between px-0.5">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      isLight ? 'text-zinc-600' : 'text-zinc-300/90'
                    }`}
                  >
                    Raqib darajasi:
                  </span>
                  <span
                    className={`text-[11px] font-bold font-mono ${
                      isLight ? 'text-amber-700' : 'text-amber-300'
                    }`}
                  >
                    ELO {QUICK_BOT_LEVELS.find((l) => l.depth === state.aiDepth)?.elo || '1400'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {QUICK_BOT_LEVELS.map((lvl) => {
                    const active = state.aiDepth === lvl.depth;
                    return (
                      <button
                        key={lvl.depth}
                        type="button"
                        onClick={() => dispatch({ type: 'SET_AI_DEPTH', depth: lvl.depth })}
                        className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          active
                            ? isLight
                              ? 'bg-amber-500/20 border-amber-500 text-amber-950 font-black shadow-sm'
                              : 'bg-amber-400/20 border-amber-400/80 text-white font-black shadow-[0_0_14px_rgba(245,158,11,0.22)]'
                            : isLight
                            ? 'bg-white/55 border-black/10 text-zinc-700 hover:bg-white/80'
                            : 'bg-white/[0.05] border-white/12 text-zinc-300 hover:bg-white/[0.10]'
                        }`}
                      >
                        <span className="text-sm leading-none">{lvl.icon}</span>
                        <span className="text-[11px] font-bold leading-tight">{lvl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Donalar Rangini Tanlash */}
            <div className="space-y-1.5 landscape:space-y-0.5">
              <div className="flex items-center justify-between px-0.5">
                <span
                  className={`text-[11px] font-black uppercase tracking-wider ${
                    isLight ? 'text-zinc-600' : 'text-zinc-300/90'
                  }`}
                >
                  Donalar rangi:
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    isLight ? 'text-emerald-700' : 'text-emerald-300'
                  }`}
                >
                  {homeColorChoice === 'white'
                    ? 'Oqlar (1-yuradi)'
                    : homeColorChoice === 'black'
                    ? 'Qoralar (Bot 1-yuradi)'
                    : 'Tasodifiy (50/50)'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      id: 'white',
                      label: 'Oqlar',
                      dot: 'bg-white border-zinc-300',
                    },
                    {
                      id: 'random',
                      label: 'Tasodifiy',
                      dot: 'bg-gradient-to-r from-white to-zinc-900 border-zinc-400',
                    },
                    {
                      id: 'black',
                      label: 'Qoralar',
                      dot: 'bg-zinc-950 border-zinc-500',
                    },
                  ] as const
                ).map((item) => {
                  const active = homeColorChoice === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setHomeColorChoice(item.id)}
                      className={`py-2.5 md:py-3 px-2 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        active
                          ? isLight
                            ? 'bg-emerald-500/15 border-emerald-600 text-emerald-950 font-black shadow-sm ring-1 ring-emerald-500/50'
                            : 'bg-emerald-500/20 border-emerald-400 text-white font-black shadow-[0_0_16px_rgba(34,197,94,0.22)] ring-1 ring-emerald-400/50'
                          : isLight
                          ? 'bg-white/55 border-black/10 text-zinc-700 hover:bg-white/85'
                          : 'bg-white/[0.05] border-white/12 text-zinc-200 hover:bg-white/[0.10] hover:border-white/25'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border shadow-sm shrink-0 ${item.dot}`} />
                      <span className="text-xs md:text-sm font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Katta Yorqin Boshlash Tugmasi */}
            <button
              onClick={() => onStartVsAI(homeColorChoice)}
              className="w-full py-3.5 sm:py-4 md:py-4.5 landscape:py-1.5 landscape:text-xs landscape:rounded-xl px-5 rounded-2xl bg-gradient-to-r from-[#5ec234] via-[#4eb027] to-[#3f981d] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0.5 text-white font-black text-base md:text-lg lg:text-xl flex items-center justify-center gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_10px_28px_rgba(34,197,94,0.38)] transition-all cursor-pointer"
            >
              <PlayIcon size={20} className="fill-white" />
              <span>
                {homeColorChoice === 'black'
                  ? 'Qoralar bilan oʻynash'
                  : homeColorChoice === 'white'
                  ? 'Oqlar bilan oʻynash'
                  : 'Oʻyinni boshlash'}
              </span>
            </button>

            {/* Pastki muallif satri */}
            <div
              className={`pt-2.5 max-md:landscape:hidden border-t flex items-center justify-between text-xs ${
                isLight ? 'border-black/10 text-zinc-600' : 'border-white/12 text-zinc-300/80'
              }`}
            >
              <span>{t('author_label')}</span>
              <span className={`font-bold font-mono ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                10×10 Rasmiy Standart
              </span>
            </div>
          </div>

          {/* ── O'NG USTUN: O'YIN TURLARI VA BO'LIMLAR (md:col-span-7) ── */}
          <div
            className={`w-full ${
              isMobileSimulation ? '' : 'landscape:col-span-7 md:col-span-7'
            } flex flex-col justify-between gap-2.5 md:gap-3.5 landscape:gap-1`}
          >
            <div className="px-1 text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-between">
              <span className={isLight ? 'text-zinc-700' : 'text-zinc-200/90'}>
                {t('game_modes_header')}
              </span>
              {!isAndroidApk && (
                <span
                  className={`text-[11px] font-semibold normal-case px-2.5 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-white/60 border-black/10 text-zinc-600'
                      : 'bg-white/[0.07] border-white/15 text-zinc-300'
                  }`}
                >
                  ✨ Billur shaffof interfeys
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 gap-2.5 md:gap-3.5 lg:gap-4 landscape:gap-1.5 flex-1">
              {gameModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => mode.action()}
                  className="w-full p-3.5 sm:p-4 md:p-5 max-md:landscape:p-1.5 max-md:landscape:rounded-xl rounded-2xl nur-glass-card text-left flex items-center justify-between group active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 md:w-13 md:h-13 max-md:landscape:w-7 max-md:landscape:h-7 max-md:landscape:rounded-lg rounded-2xl border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${mode.iconBg}`}
                    >
                      {mode.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-black text-sm md:text-base max-md:landscape:text-xs transition-colors truncate ${
                            isLight
                              ? 'text-[#18181b] group-hover:text-emerald-700'
                              : 'text-white group-hover:text-emerald-300'
                          }`}
                        >
                          {mode.title}
                        </span>
                        {(mode as any).badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${
                              isLight
                                ? 'bg-amber-500/20 text-amber-900 border-amber-400/60'
                                : 'bg-amber-400/20 text-amber-200 border-amber-400/35'
                            }`}
                          >
                            {(mode as any).badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs landscape:text-[9.5px] mt-0.5 font-medium truncate ${
                          isLight ? 'text-zinc-600' : 'text-zinc-300/85'
                        }`}
                      >
                        {mode.subtitle}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`transition-all pl-2 max-md:landscape:hidden ${
                      isLight
                        ? 'text-zinc-400 group-hover:text-emerald-700 group-hover:translate-x-1'
                        : 'text-white/45 group-hover:text-white group-hover:translate-x-1'
                    }`}
                  >
                    <ChevronRightIcon size={18} />
                  </div>
                </button>
              ))}

              {/* 7-Karta: Statistika, Shaxsiy Profil va Jonli Reyting (2 ustunga kengaygan chiroyli simmetrik shisha panel!) */}
              <button
                onClick={onOpenStats}
                className="w-full sm:col-span-2 landscape:col-span-2 p-3.5 sm:p-4 md:p-5 max-md:landscape:p-1.5 max-md:landscape:rounded-xl rounded-2xl nur-glass-card text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 group active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 md:w-13 md:h-13 max-md:landscape:w-7 max-md:landscape:h-7 rounded-2xl border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                      isLight
                        ? 'bg-pink-500/15 border-pink-400/50 text-pink-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
                        : 'bg-pink-500/20 border-pink-400/35 text-pink-300 shadow-[0_0_16px_rgba(244,114,182,0.22)]'
                    }`}
                  >
                    <TrophyIcon size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-black text-sm md:text-base max-md:landscape:text-xs transition-colors ${
                          isLight
                            ? 'text-[#18181b] group-hover:text-emerald-700'
                            : 'text-white group-hover:text-emerald-300'
                        }`}
                      >
                        {t('mode_stats_title')}
                      </span>
                      <span
                        className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
                          isLight
                            ? 'bg-emerald-500/15 text-emerald-800 border-emerald-400/50'
                            : 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
                        }`}
                      >
                        Profil & Reyting
                      </span>
                    </div>
                    <p
                      className={`text-xs max-md:landscape:text-[9.5px] mt-0.5 font-medium truncate ${
                        isLight ? 'text-zinc-600' : 'text-zinc-300/85'
                      }`}
                    >
                      {t('mode_stats_desc')}
                    </p>
                  </div>
                </div>

                {/* Jonli ko'rsatkichlar kapsulalari */}
                <div className="flex items-center gap-2 sm:gap-2.5 max-md:landscape:hidden self-end sm:self-center">
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-center ${
                      isLight
                        ? 'bg-amber-500/12 border-amber-400/40 text-amber-900'
                        : 'bg-amber-400/12 border-amber-400/30 text-amber-200'
                    }`}
                  >
                    <div className="text-[9px] uppercase font-bold opacity-80">Reyting</div>
                    <div className="text-xs md:text-sm font-black font-mono">⭐ {profile.rating}</div>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-center ${
                      isLight
                        ? 'bg-emerald-500/12 border-emerald-400/40 text-emerald-900'
                        : 'bg-emerald-400/12 border-emerald-400/30 text-emerald-200'
                    }`}
                  >
                    <div className="text-[9px] uppercase font-bold opacity-80">Gʻalaba</div>
                    <div className="text-xs md:text-sm font-black font-mono">🏆 {profile.wins}</div>
                  </div>
                  <div
                    className={`pl-1 transition-all ${
                      isLight
                        ? 'text-zinc-400 group-hover:text-emerald-700 group-hover:translate-x-1'
                        : 'text-white/45 group-hover:text-white group-hover:translate-x-1'
                    }`}
                  >
                    <ChevronRightIcon size={18} />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </main>

        {/* ── 3. PASTDAGI SHIOR VA BREND ── */}
        <footer className="w-full max-w-2xl mx-auto my-3 md:my-4 max-md:landscape:hidden text-center flex flex-col items-center px-4 pb-2">
          <div className="flex items-center justify-center gap-4 w-full">
            <div
              className={`h-[1px] flex-1 bg-gradient-to-r from-transparent to-transparent ${
                isLight ? 'via-zinc-400/60' : 'via-white/25'
              }`}
            />
            <p
              className={`font-serif italic text-xs sm:text-sm tracking-wide ${
                isLight ? 'text-zinc-700' : 'text-zinc-200/90'
              }`}
            >
              {t('quote_motto')}
            </p>
            <div
              className={`h-[1px] flex-1 bg-gradient-to-r from-transparent to-transparent ${
                isLight ? 'via-zinc-400/60' : 'via-white/25'
              }`}
            />
          </div>
          <p
            className={`text-[10px] tracking-[0.35em] font-bold uppercase mt-1 ${
              isLight ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            NUR SHAXMAT 100
          </p>
        </footer>
      </div>
    </div>
  );
}
