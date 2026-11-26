import React, { useState, useEffect } from 'react';
import NurLogo from '../components/NurLogo';
import { useGame } from '../store/gameStore';
import {
  BotIcon,
  CpuIcon,
  UsersIcon,
  GlobeIcon,
  BookOpenIcon,
  TrophyIcon,
  SettingsIcon,
  ChevronRightIcon,
  PlayIcon,
  GoogleIcon,
  ClockIcon,
  MonitorIcon,
  SmartphoneIcon,
  SunIcon,
  MoonIcon,
  CubeIcon,
  GridIcon,
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

const DIFFICULTY_OPTIONS = [
  { depth: 1, label: 'Oson', elo: '1000' },
  { depth: 2, label: 'Oʻrta', elo: '1400' },
  { depth: 3, label: 'Kuchli', elo: '1800' },
  { depth: 4, label: 'Usta', elo: '2200' },
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
      title: 'Kompyuter bilan',
      subtitle: 'Darajani tanlab yakka oʻynash',
      icon: <BotIcon size={20} />,
      iconTone: isLight
        ? 'bg-emerald-600/12 border-emerald-600/25 text-emerald-700'
        : 'bg-emerald-500/15 border-emerald-400/25 text-emerald-300',
      action: onOpenBotModal || (() => onStartVsAI(homeColorChoice)),
    },
    {
      id: 'aiVsAi',
      title: 'Avtomat tahlil',
      subtitle: 'Kompyuterlar oʻzaro partiyasi',
      icon: <CpuIcon size={20} />,
      iconTone: isLight
        ? 'bg-amber-600/12 border-amber-600/25 text-amber-700'
        : 'bg-amber-500/15 border-amber-400/25 text-amber-300',
      action: onOpenBotVsBot,
    },
    {
      id: 'pvp',
      title: 'Ikki oʻyinchi',
      subtitle: 'Bitta qurilmada navbatma-navbat',
      icon: <UsersIcon size={20} />,
      iconTone: isLight
        ? 'bg-sky-600/12 border-sky-600/25 text-sky-700'
        : 'bg-sky-500/15 border-sky-400/25 text-sky-300',
      action: onStartLocal,
    },
    {
      id: 'online',
      title: 'Onlayn oʻyin',
      subtitle: 'Doʻstlar yoki xona kodi orqali',
      icon: <GlobeIcon size={20} />,
      iconTone: isLight
        ? 'bg-indigo-600/12 border-indigo-600/25 text-indigo-700'
        : 'bg-indigo-500/15 border-indigo-400/25 text-indigo-300',
      action: onOpenOnline,
    },
    {
      id: 'chessClock',
      title: 'Shaxmat soati',
      subtitle: 'Jonli doska uchun taymer',
      icon: <ClockIcon size={20} />,
      iconTone: isLight
        ? 'bg-orange-600/12 border-orange-600/25 text-orange-700'
        : 'bg-orange-500/15 border-orange-400/25 text-orange-300',
      action: onOpenStandaloneClock || (() => {}),
    },
    {
      id: 'rules',
      title: 'Qoidalar va qoʻllanma',
      subtitle: '10×10 doska va yurish tartibi',
      icon: <BookOpenIcon size={20} />,
      iconTone: isLight
        ? 'bg-amber-700/12 border-amber-700/25 text-amber-800'
        : 'bg-yellow-500/15 border-yellow-400/25 text-yellow-300',
      action: onOpenRules,
    },
  ];

  const segTrack = isLight
    ? 'bg-amber-950/[0.06] border border-amber-950/[0.08]'
    : 'bg-black/35 border border-white/[0.08]';

  const segActive = isLight
    ? 'bg-white text-stone-900 shadow-sm font-semibold border border-amber-700/20'
    : 'bg-[#362c22] text-amber-100 shadow-sm font-semibold border border-amber-400/35';

  const segIdle = isLight
    ? 'text-stone-600 hover:text-stone-900 font-medium'
    : 'text-stone-400 hover:text-amber-100 font-medium';

  return (
    <div
      className={`min-h-screen landscape:max-h-[520px]:min-h-0 landscape:max-h-[520px]:h-[100dvh] landscape:max-h-[520px]:max-h-[100dvh] landscape:max-h-[520px]:overflow-hidden md:min-h-screen md:h-auto md:max-h-none md:overflow-visible w-full ${
        isLight ? 'bg-transparent text-stone-900' : 'bg-transparent text-[#faf6ef]'
      } flex flex-col font-sans select-none relative overflow-x-hidden transition-colors duration-200`}
    >
      <div
        className={`relative z-10 w-full flex flex-col min-h-screen landscape:max-h-[520px]:min-h-0 landscape:max-h-[520px]:h-full landscape:max-h-[520px]:overflow-hidden md:min-h-screen md:h-auto md:overflow-visible ${
          isMobileSimulation ? 'max-w-[430px] mx-auto pb-20 pt-2' : ''
        }`}
      >
        {/* ── 1. YUQORI NAVIGATSIYA PANELI ── */}
        <header className="w-full max-w-6xl xl:max-w-[1240px] mx-auto px-3 sm:px-6 md:px-8 pt-2.5 sm:pt-4 md:pt-5 max-md:landscape:pt-1.5 shrink-0">
          <div className="w-full rounded-2xl nur-glass-nav px-3.5 sm:px-5 py-2.5 max-md:landscape:py-1.5 flex items-center justify-between gap-2">
            {/* Brend */}
            <div className="flex items-center gap-2.5 min-w-0">
              <NurLogo size={36} showGlow={!isLight} />
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-[15px] sm:text-[17px] font-bold tracking-tight truncate ${
                      isLight ? 'text-stone-950' : 'text-[#faf6ef]'
                    }`}
                  >
                    Nur Shaxmat
                  </span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                      isLight
                        ? 'bg-amber-600/15 text-amber-800'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    100
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigatsiya */}
            <nav
              className={`${
                isMobileSimulation ? 'hidden' : 'hidden landscape:flex md:flex'
              } items-center gap-1.5`}
            >
              {!isAndroidApk && onSetWebDeviceView && (
                <div className={`flex items-center p-0.5 rounded-xl mr-2 ${segTrack}`}>
                  <button
                    onClick={() => onSetWebDeviceView('notebook')}
                    className={`px-2.5 py-1.5 rounded-[9px] text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      webDeviceView === 'notebook' ? segActive : segIdle
                    }`}
                    title="Kompyuter koʻrinishi"
                  >
                    <MonitorIcon size={14} />
                    <span className="hidden xl:inline">Keng</span>
                  </button>
                  <button
                    onClick={() => onSetWebDeviceView('phone')}
                    className={`px-2.5 py-1.5 rounded-[9px] text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      webDeviceView === 'phone' ? segActive : segIdle
                    }`}
                    title="Mobil koʻrinishi"
                  >
                    <SmartphoneIcon size={14} />
                    <span className="hidden xl:inline">Mobil</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {}}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-emerald-600/12 text-emerald-800'
                    : 'bg-emerald-500/18 text-emerald-300 border border-emerald-400/25'
                }`}
              >
                {t('nav_game')}
              </button>

              <button
                onClick={onOpenRules}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'text-stone-700 hover:text-stone-950 hover:bg-amber-950/[0.06]'
                    : 'text-stone-300 hover:text-amber-100 hover:bg-white/[0.07]'
                }`}
              >
                {t('nav_rules')}
              </button>

              <button
                onClick={onOpenLeaderboard || onOpenStats}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'text-stone-700 hover:text-stone-950 hover:bg-amber-950/[0.06]'
                    : 'text-stone-300 hover:text-amber-100 hover:bg-white/[0.07]'
                }`}
              >
                Jadval
              </button>

              <button
                onClick={onOpenSettings}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'text-stone-700 hover:text-stone-950 hover:bg-amber-950/[0.06]'
                    : 'text-stone-300 hover:text-amber-100 hover:bg-white/[0.07]'
                }`}
              >
                {t('nav_settings')}
              </button>

              <div className={`h-4 w-[1px] mx-1 ${isLight ? 'bg-stone-900/15' : 'bg-white/15'}`} />

              {!isAndroidApk && (
                <button
                  onClick={toggleQuickTheme}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isLight
                      ? 'text-amber-700 hover:bg-amber-500/15'
                      : 'text-amber-300 hover:bg-white/[0.08]'
                  }`}
                  title={isLight ? 'Tungi rejim' : 'Kunduzgi rejim'}
                >
                  {isLight ? <MoonIcon size={16} /> : <SunIcon size={16} />}
                </button>
              )}

              {profile.isGoogleLinked ? (
                <button
                  onClick={onOpenStats}
                  className={`ml-1 pl-2 pr-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors flex items-center gap-2 cursor-pointer border ${
                    isLight
                      ? 'bg-white hover:bg-amber-50/70 border-amber-700/20 text-stone-900'
                      : 'bg-white/[0.07] hover:bg-white/[0.12] border-amber-400/25 text-[#faf6ef]'
                  }`}
                  title={t('nav_profile')}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <GoogleIcon size={15} />
                  )}
                  <span className="max-w-[110px] truncate">{profile.name}</span>
                  <span className={`text-xs font-semibold tabular-nums ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                    {profile.rating}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onOpenStats}
                  className={`ml-1 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                    isLight
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-105 text-stone-950 shadow-sm'
                  }`}
                >
                  <GoogleIcon size={14} />
                  <span>Kirish</span>
                </button>
              )}
            </nav>

            {/* Mobil O'ng Tugmalar */}
            <div
              className={`flex items-center gap-1.5 shrink-0 ${
                isMobileSimulation ? 'flex' : 'landscape:hidden md:hidden'
              }`}
            >
              {!isAndroidApk && onSetWebDeviceView && (
                <button
                  onClick={() => onSetWebDeviceView(webDeviceView === 'notebook' ? 'phone' : 'notebook')}
                  className={`h-8 px-2 rounded-lg border flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white/90 border-amber-800/20 text-stone-800'
                      : 'bg-white/[0.08] border-white/15 text-stone-200'
                  }`}
                >
                  {webDeviceView === 'notebook' ? <SmartphoneIcon size={14} /> : <MonitorIcon size={14} />}
                </button>
              )}

              {!isAndroidApk && (
                <button
                  onClick={toggleQuickTheme}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white/90 border-amber-800/20 text-amber-700'
                      : 'bg-white/[0.08] border-white/15 text-amber-300'
                  }`}
                >
                  {isLight ? <MoonIcon size={15} /> : <SunIcon size={15} />}
                </button>
              )}

              <button
                onClick={onOpenStats}
                className={`h-8 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white/90 border-amber-800/20 text-stone-800'
                    : 'bg-white/[0.08] border-white/15 text-stone-200'
                }`}
              >
                <GoogleIcon size={13} />
                <span className="max-w-[58px] truncate">
                  {profile.isGoogleLinked ? profile.name : 'Kirish'}
                </span>
              </button>

              <button
                onClick={onOpenSettings}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white/90 border-amber-800/20 text-stone-700'
                    : 'bg-white/[0.08] border-white/15 text-stone-200'
                }`}
              >
                <SettingsIcon size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* ── 2. ASOSIY ISHCHI MAYDON ── */}
        <main
          className={`w-full ${
            isMobileSimulation
              ? 'grid grid-cols-1 gap-3.5 px-3 py-3'
              : 'max-w-6xl xl:max-w-[1240px] mx-auto my-auto grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-5 md:gap-6 px-3 sm:px-6 md:px-8 py-4 md:py-8 max-md:landscape:py-1.5 max-md:landscape:gap-3'
          } items-stretch`}
        >
          {/* ── CHAP PANEL: YANGI O'YIN SOZLAMASI (md:col-span-5) ── */}
          <div
            className={`w-full ${
              isMobileSimulation ? '' : 'landscape:col-span-5 md:col-span-5'
            } p-4 sm:p-6 max-md:landscape:p-3 rounded-2xl nur-glass-surface flex flex-col justify-between gap-4 max-md:landscape:gap-2`}
          >
            {hasActiveMatch && (
              <div
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isLight
                    ? 'bg-emerald-600/10 border-emerald-600/30 text-stone-900'
                    : 'bg-emerald-500/15 border-emerald-400/35 text-[#faf6ef]'
                }`}
              >
                <div className="min-w-0">
                  <div className={`text-[11px] font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                    Faol partiya
                  </div>
                  <div className="text-sm font-semibold truncate">
                    {state.gameMode === 'vsAI'
                      ? 'Kompyuter bilan'
                      : state.gameMode === 'online'
                      ? 'Onlayn partiya'
                      : 'Ikki oʻyinchi'}
                    {' · '}
                    {Math.ceil((state.game.moveHistory?.length || 0) / 2)}-yurish
                  </div>
                </div>
                <button
                  onClick={onContinueGame}
                  className="px-3 py-1.5 rounded-lg bg-[#5ca429] hover:bg-[#4e8f21] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                >
                  <span>Davom etish</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            )}

            <div>
              <h2
                className={`text-lg sm:text-[19px] font-bold tracking-tight ${
                  isLight ? 'text-stone-950' : 'text-[#faf6ef]'
                }`}
              >
                Yangi oʻyin
              </h2>
              <p className={`text-[13px] mt-0.5 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                Doska koʻrinishi va raqib darajasini tanlang
              </p>
            </div>

            {/* 1. Doska Ko'rinishi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-medium ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                  Doska koʻrinishi
                </span>
                <span className={`text-xs truncate ${isLight ? 'text-amber-700' : 'text-amber-300/90'}`}>
                  {state.is3D ? 'Fazoviy hajmli' : 'Klassik tekis'}
                </span>
              </div>
              <div className={`grid grid-cols-2 p-1 rounded-xl gap-1 ${segTrack}`}>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_3D', enabled: true })}
                  className={`py-2.5 max-md:landscape:py-1.5 px-3 rounded-[9px] text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    state.is3D ? segActive : segIdle
                  }`}
                >
                  <CubeIcon size={16} />
                  <span>3D doska</span>
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_3D', enabled: false })}
                  className={`py-2.5 max-md:landscape:py-1.5 px-3 rounded-[9px] text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !state.is3D ? segActive : segIdle
                  }`}
                >
                  <GridIcon size={16} />
                  <span>2D doska</span>
                </button>
              </div>
            </div>

            {/* 2. Qiyinchilik Darajasi */}
            {!isAndroidApk && (
              <div className="space-y-1.5 max-md:landscape:hidden">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-medium ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    Qiyinchilik darajasi
                  </span>
                  <span className={`text-xs font-medium tabular-nums ${isLight ? 'text-amber-700' : 'text-amber-300/90'}`}>
                    Reyting {DIFFICULTY_OPTIONS.find((d) => d.depth === state.aiDepth)?.elo || '1400'}
                  </span>
                </div>
                <div className={`grid grid-cols-4 p-1 rounded-xl gap-1 ${segTrack}`}>
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.depth}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_AI_DEPTH', depth: opt.depth })}
                      className={`py-2 px-1.5 rounded-[9px] text-xs transition-all cursor-pointer text-center ${
                        state.aiDepth === opt.depth ? segActive : segIdle
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Donalar Rangi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-medium ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                  Sizning tomoningiz
                </span>
                <span className={`text-xs truncate ${isLight ? 'text-emerald-700' : 'text-emerald-300/90'}`}>
                  {homeColorChoice === 'white'
                    ? 'Birinchi yurasiz'
                    : homeColorChoice === 'black'
                    ? 'Ikkinchi yurasiz'
                    : 'Avtomatik'}
                </span>
              </div>
              <div className={`grid grid-cols-3 p-1 rounded-xl gap-1 ${segTrack}`}>
                {(
                  [
                    { id: 'white', label: 'Oq', dot: 'bg-white border-stone-300' },
                    {
                      id: 'random',
                      label: 'Tasodifiy',
                      dot: 'bg-gradient-to-r from-white to-stone-900 border-stone-400',
                    },
                    { id: 'black', label: 'Qora', dot: 'bg-stone-900 border-stone-500' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHomeColorChoice(item.id)}
                    className={`py-2.5 max-md:landscape:py-1.5 px-2 rounded-[9px] text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      homeColorChoice === item.id ? segActive : segIdle
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full border shrink-0 ${item.dot}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Asosiy Boshlash Tugmasi */}
            <button
              onClick={() => onStartVsAI(homeColorChoice)}
              className="w-full py-3.5 max-md:landscape:py-2 px-5 rounded-xl bg-gradient-to-b from-[#66b130] to-[#4e8e21] hover:brightness-105 active:scale-[0.99] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(78,142,33,0.32)] transition-all cursor-pointer mt-1"
            >
              <PlayIcon size={16} className="fill-white" />
              <span>Oʻyinni boshlash</span>
            </button>
          </div>

          {/* ── O'NG PANEL: REJIMLAR VA BO'LIMLAR (md:col-span-7) ── */}
          <div
            className={`w-full ${
              isMobileSimulation ? '' : 'landscape:col-span-7 md:col-span-7'
            } flex flex-col justify-between gap-3`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 gap-3 flex-1">
              {gameModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => mode.action()}
                  className="w-full p-4 max-md:landscape:p-2 rounded-2xl nur-glass-card text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 md:w-11 md:h-11 max-md:landscape:w-8 max-md:landscape:h-8 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${mode.iconTone}`}
                    >
                      {mode.icon}
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`font-semibold text-[14.5px] md:text-[15px] leading-snug truncate ${
                          isLight ? 'text-stone-900' : 'text-[#faf6ef]'
                        }`}
                      >
                        {mode.title}
                      </div>
                      <p
                        className={`text-[12.5px] mt-0.5 truncate ${
                          isLight ? 'text-stone-500' : 'text-stone-400'
                        }`}
                      >
                        {mode.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRightIcon
                    size={16}
                    className={`shrink-0 ml-2 transition-transform group-hover:translate-x-0.5 max-md:landscape:hidden ${
                      isLight ? 'text-stone-400 group-hover:text-amber-700' : 'text-stone-500 group-hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}

              {/* 7-Karta: Profil va Statistika */}
              <button
                onClick={onOpenStats}
                className="w-full sm:col-span-2 landscape:col-span-2 p-4 max-md:landscape:p-2 rounded-2xl nur-glass-card text-left flex items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 md:w-11 md:h-11 max-md:landscape:w-8 max-md:landscape:h-8 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isLight
                        ? 'bg-rose-600/12 border-rose-600/25 text-rose-700'
                        : 'bg-rose-500/15 border-rose-400/25 text-rose-300'
                    }`}
                  >
                    <TrophyIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`font-semibold text-[14.5px] md:text-[15px] leading-snug ${
                        isLight ? 'text-stone-900' : 'text-[#faf6ef]'
                      }`}
                    >
                      Profil va statistika
                    </div>
                    <p
                      className={`text-[12.5px] mt-0.5 truncate ${
                        isLight ? 'text-stone-500' : 'text-stone-400'
                      }`}
                    >
                      Shaxsiy reyting, yutuqlar va oʻyinlar tarixi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 max-md:landscape:hidden shrink-0">
                  <div
                    className={`px-3 py-1 rounded-lg border text-right ${
                      isLight
                        ? 'bg-amber-500/10 border-amber-600/20'
                        : 'bg-amber-500/10 border-amber-400/20'
                    }`}
                  >
                    <div className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                      Reyting
                    </div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        isLight ? 'text-amber-800' : 'text-amber-300'
                      }`}
                    >
                      {profile.rating}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg border text-right ${
                      isLight
                        ? 'bg-emerald-500/10 border-emerald-600/20'
                        : 'bg-emerald-500/10 border-emerald-400/20'
                    }`}
                  >
                    <div className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                      Gʻalabalar
                    </div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        isLight ? 'text-emerald-800' : 'text-emerald-300'
                      }`}
                    >
                      {profile.wins}
                    </div>
                  </div>
                  <ChevronRightIcon
                    size={16}
                    className={`transition-transform group-hover:translate-x-0.5 ${
                      isLight ? 'text-stone-400 group-hover:text-amber-700' : 'text-stone-500 group-hover:text-amber-300'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </main>

        {/* Pastki minimal ma'lumot satri */}
        <footer className="w-full max-w-6xl xl:max-w-[1240px] mx-auto px-4 sm:px-8 py-3 max-md:landscape:hidden flex items-center justify-between text-xs">
          <span className={isLight ? 'text-stone-500' : 'text-stone-400'}>
            Nur Shaxmat 100 · Muallif: Nurfullo Nurmatov
          </span>
          <span className={`tabular-nums ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
            v1.2.22
          </span>
        </footer>
      </div>
    </div>
  );
}
