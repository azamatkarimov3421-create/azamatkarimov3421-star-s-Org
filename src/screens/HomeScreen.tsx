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

  // Barcha kartalarda yagona sokin, jiddiy neytral ikonka uslubi (rang-barang sun'iy kamalak yo'q)
  const neutralIconBox = isLight
    ? 'bg-zinc-900/[0.04] border-zinc-900/[0.08] text-zinc-700 group-hover:bg-zinc-900/[0.07] group-hover:text-zinc-950'
    : 'bg-white/[0.06] border-white/[0.08] text-zinc-200 group-hover:bg-white/[0.10] group-hover:text-white';

  const gameModes = [
    {
      id: 'vsAI',
      title: 'Kompyuter bilan',
      subtitle: 'Darajani tanlab yakka oʻynash',
      icon: <BotIcon size={20} />,
      action: onOpenBotModal || (() => onStartVsAI(homeColorChoice)),
    },
    {
      id: 'aiVsAi',
      title: 'Avtomat tahlil',
      subtitle: 'Kompyuterlar oʻzaro partiyasi',
      icon: <CpuIcon size={20} />,
      action: onOpenBotVsBot,
    },
    {
      id: 'pvp',
      title: 'Ikki oʻyinchi',
      subtitle: 'Bitta qurilmada navbatma-navbat',
      icon: <UsersIcon size={20} />,
      action: onStartLocal,
    },
    {
      id: 'online',
      title: 'Onlayn oʻyin',
      subtitle: 'Doʻstlar yoki xona kodi orqali',
      icon: <GlobeIcon size={20} />,
      action: onOpenOnline,
    },
    {
      id: 'chessClock',
      title: 'Shaxmat soati',
      subtitle: 'Jonli doska uchun taymer',
      icon: <ClockIcon size={20} />,
      action: onOpenStandaloneClock || (() => {}),
    },
    {
      id: 'rules',
      title: 'Qoidalar va qoʻllanma',
      subtitle: '10×10 doska va yurish tartibi',
      icon: <BookOpenIcon size={20} />,
      action: onOpenRules,
    },
  ];

  // Segmented control helper classes (Apple / Lichess style)
  const segTrack = isLight
    ? 'bg-zinc-900/[0.05] border border-zinc-900/[0.06]'
    : 'bg-black/35 border border-white/[0.06]';

  const segActive = isLight
    ? 'bg-white text-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.10)] font-semibold'
    : 'bg-white/[0.14] text-white shadow-[0_1px_3px_rgba(0,0,0,0.35)] font-semibold';

  const segIdle = isLight
    ? 'text-zinc-600 hover:text-zinc-900 font-medium'
    : 'text-zinc-400 hover:text-zinc-200 font-medium';

  return (
    <div
      className={`min-h-screen landscape:max-h-[520px]:min-h-0 landscape:max-h-[520px]:h-[100dvh] landscape:max-h-[520px]:max-h-[100dvh] landscape:max-h-[520px]:overflow-hidden md:min-h-screen md:h-auto md:max-h-none md:overflow-visible w-full ${
        isLight ? 'bg-transparent text-zinc-900' : 'bg-transparent text-zinc-100'
      } flex flex-col font-sans select-none relative overflow-x-hidden transition-colors duration-200`}
    >
      <div
        className={`relative z-10 w-full flex flex-col min-h-screen landscape:max-h-[520px]:min-h-0 landscape:max-h-[520px]:h-full landscape:max-h-[520px]:overflow-hidden md:min-h-screen md:h-auto md:overflow-visible ${
          isMobileSimulation ? 'max-w-[430px] mx-auto pb-20 pt-2' : ''
        }`}
      >
        {/* ── 1. YUQORI NAVIGATSIYA PANELI ── */}
        <header className="w-full max-w-6xl xl:max-w-[1240px] mx-auto px-3 sm:px-6 md:px-8 pt-2.5 sm:pt-4 md:pt-5 max-md:landscape:pt-1.5 shrink-0">
          <div className="w-full rounded-2xl nur-glass-nav px-4 sm:px-5 py-2.5 max-md:landscape:py-1.5 flex items-center justify-between">
            {/* Brend */}
            <div className="flex items-center gap-3 min-w-0">
              <NurLogo size={34} showGlow={false} />
              <div className="flex items-baseline gap-2 min-w-0">
                <span
                  className={`text-[16px] sm:text-[17px] font-semibold tracking-tight truncate ${
                    isLight ? 'text-zinc-950' : 'text-zinc-100'
                  }`}
                >
                  Nur Shaxmat
                </span>
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                    isLight
                      ? 'bg-zinc-900/[0.06] text-zinc-600'
                      : 'bg-white/[0.08] text-zinc-400'
                  }`}
                >
                  10×10
                </span>
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
                    ? 'bg-zinc-900/[0.07] text-zinc-950'
                    : 'bg-white/[0.10] text-white'
                }`}
              >
                {t('nav_game')}
              </button>

              <button
                onClick={onOpenRules}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-900/[0.05]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {t('nav_rules')}
              </button>

              <button
                onClick={onOpenLeaderboard || onOpenStats}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-900/[0.05]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                Jadval
              </button>

              <button
                onClick={onOpenSettings}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-900/[0.05]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {t('nav_settings')}
              </button>

              <div className={`h-4 w-[1px] mx-1 ${isLight ? 'bg-zinc-900/10' : 'bg-white/10'}`} />

              {!isAndroidApk && (
                <button
                  onClick={toggleQuickTheme}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isLight
                      ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-900/[0.06]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
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
                      ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900'
                      : 'bg-white/[0.07] hover:bg-white/[0.12] border-white/10 text-zinc-100'
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
                  <span className={`text-xs tabular-nums ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {profile.rating}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onOpenStats}
                  className={`ml-1 px-3.5 py-1.5 rounded-xl text-[13px] font-medium whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer border ${
                    isLight
                      ? 'bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-900 shadow-xs'
                      : 'bg-white/[0.10] hover:bg-white/[0.16] border-white/15 text-white'
                  }`}
                >
                  <GoogleIcon size={14} />
                  <span>Kirish</span>
                </button>
              )}
            </nav>

            {/* Mobil O'ng Tugmalar */}
            <div
              className={`flex items-center gap-1.5 ${
                isMobileSimulation ? 'flex' : 'landscape:hidden md:hidden'
              }`}
            >
              {!isAndroidApk && onSetWebDeviceView && (
                <button
                  onClick={() => onSetWebDeviceView(webDeviceView === 'notebook' ? 'phone' : 'notebook')}
                  className={`h-8 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white border-zinc-200 text-zinc-800'
                      : 'bg-white/[0.08] border-white/10 text-zinc-200'
                  }`}
                >
                  {webDeviceView === 'notebook' ? <SmartphoneIcon size={14} /> : <MonitorIcon size={14} />}
                  {isMobileSimulation && <span>Keng</span>}
                </button>
              )}

              {!isAndroidApk && (
                <button
                  onClick={toggleQuickTheme}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white border-zinc-200 text-zinc-700'
                      : 'bg-white/[0.08] border-white/10 text-zinc-200'
                  }`}
                >
                  {isLight ? <MoonIcon size={15} /> : <SunIcon size={15} />}
                </button>
              )}

              <button
                onClick={onOpenStats}
                className={`h-8 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white border-zinc-200 text-zinc-800'
                    : 'bg-white/[0.08] border-white/10 text-zinc-200'
                }`}
              >
                <GoogleIcon size={13} />
                <span className="max-w-[68px] truncate">
                  {profile.isGoogleLinked ? profile.name : 'Kirish'}
                </span>
              </button>

              <button
                onClick={onOpenSettings}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white border-zinc-200 text-zinc-700'
                    : 'bg-white/[0.08] border-white/10 text-zinc-200'
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
            } p-5 sm:p-6 max-md:landscape:p-3 rounded-2xl nur-glass-surface flex flex-col justify-between gap-4 max-md:landscape:gap-2`}
          >
            {/* Tugallanmagan o'yin banneri */}
            {hasActiveMatch && (
              <div
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isLight
                    ? 'bg-[#629924]/10 border-[#629924]/30 text-zinc-900'
                    : 'bg-[#629924]/15 border-[#73ad30]/35 text-zinc-100'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium opacity-75">Faol partiya</div>
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
                  className="px-3 py-1.5 rounded-lg bg-[#629924] hover:bg-[#56881f] text-white font-medium text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                >
                  <span>Davom etish</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            )}

            {/* Sarlavha */}
            <div>
              <h2
                className={`text-lg sm:text-[19px] font-semibold tracking-tight ${
                  isLight ? 'text-zinc-950' : 'text-zinc-100'
                }`}
              >
                Yangi oʻyin
              </h2>
              <p className={`text-[13px] mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                 Doska koʻrinishi va raqib darajasini tanlang
              </p>
            </div>

            {/* 1. Doska Ko'rinishi (3D / 2D Segmented Control) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Doska koʻrinishi
                </span>
                <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
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

            {/* 2. Qiyinchilik Darajasi (4-bosqichli toza segment) */}
            {!isAndroidApk && (
              <div className="space-y-1.5 max-md:landscape:hidden">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Qiyinchilik darajasi
                  </span>
                  <span className={`text-xs tabular-nums ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Reyting {DIFFICULTY_OPTIONS.find((d) => d.depth === state.aiDepth)?.elo || '1400'}
                  </span>
                </div>
                <div className={`grid grid-cols-4 p-1 rounded-xl gap-1 ${segTrack}`}>
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.depth}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_AI_DEPTH', depth: opt.depth })}
                      className={`py-2 px-2 rounded-[9px] text-xs transition-all cursor-pointer text-center ${
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
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Sizning tomoningiz
                </span>
                <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {homeColorChoice === 'white'
                    ? 'Birinchi yurasiz'
                    : homeColorChoice === 'black'
                    ? 'Ikkinchi yurasiz'
                    : 'Avtomatik tanlov'}
                </span>
              </div>
              <div className={`grid grid-cols-3 p-1 rounded-xl gap-1 ${segTrack}`}>
                {(
                  [
                    { id: 'white', label: 'Oq', dot: 'bg-white border-zinc-300' },
                    {
                      id: 'random',
                      label: 'Tasodifiy',
                      dot: 'bg-gradient-to-r from-white to-zinc-900 border-zinc-400',
                    },
                    { id: 'black', label: 'Qora', dot: 'bg-zinc-900 border-zinc-500' },
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

            {/* Asosiy Boshlash Tugmasi (Lichess / Chess.com vazmin tabiiy yashil) */}
            <button
              onClick={() => onStartVsAI(homeColorChoice)}
              className="w-full py-3.5 max-md:landscape:py-2 px-5 rounded-xl bg-[#629924] hover:bg-[#56881f] active:scale-[0.99] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.22)] transition-all cursor-pointer mt-1"
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
                      className={`w-10 h-10 md:w-11 md:h-11 max-md:landscape:w-8 max-md:landscape:h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${neutralIconBox}`}
                    >
                      {mode.icon}
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`font-semibold text-[14.5px] md:text-[15px] leading-snug truncate ${
                          isLight ? 'text-zinc-900' : 'text-zinc-100'
                        }`}
                      >
                        {mode.title}
                      </div>
                      <p
                        className={`text-[12.5px] mt-0.5 truncate ${
                          isLight ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        {mode.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRightIcon
                    size={16}
                    className={`shrink-0 ml-2 transition-transform group-hover:translate-x-0.5 max-md:landscape:hidden ${
                      isLight ? 'text-zinc-400 group-hover:text-zinc-700' : 'text-zinc-500 group-hover:text-zinc-200'
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
                    className={`w-10 h-10 md:w-11 md:h-11 max-md:landscape:w-8 max-md:landscape:h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${neutralIconBox}`}
                  >
                    <TrophyIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`font-semibold text-[14.5px] md:text-[15px] leading-snug ${
                        isLight ? 'text-zinc-900' : 'text-zinc-100'
                      }`}
                    >
                      Profil va statistika
                    </div>
                    <p
                      className={`text-[12.5px] mt-0.5 truncate ${
                        isLight ? 'text-zinc-500' : 'text-zinc-400'
                      }`}
                    >
                      Shaxsiy reyting, yutuqlar va oʻyinlar tarixi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 max-md:landscape:hidden shrink-0">
                  <div className="text-right">
                    <div className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Reyting
                    </div>
                    <div
                      className={`text-sm font-semibold tabular-nums ${
                        isLight ? 'text-zinc-900' : 'text-zinc-100'
                      }`}
                    >
                      {profile.rating}
                    </div>
                  </div>
                  <div className={`h-6 w-[1px] ${isLight ? 'bg-zinc-900/10' : 'bg-white/10'}`} />
                  <div className="text-right">
                    <div className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Gʻalabalar
                    </div>
                    <div
                      className={`text-sm font-semibold tabular-nums ${
                        isLight ? 'text-zinc-900' : 'text-zinc-100'
                      }`}
                    >
                      {profile.wins}
                    </div>
                  </div>
                  <ChevronRightIcon
                    size={16}
                    className={`transition-transform group-hover:translate-x-0.5 ${
                      isLight ? 'text-zinc-400 group-hover:text-zinc-700' : 'text-zinc-500 group-hover:text-zinc-200'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </main>

        {/* Pastki minimal ma'lumot satri */}
        <footer className="w-full max-w-6xl xl:max-w-[1240px] mx-auto px-4 sm:px-8 py-3 max-md:landscape:hidden flex items-center justify-between text-xs">
          <span className={isLight ? 'text-zinc-500' : 'text-zinc-500'}>
            Nur Shaxmat · Muallif: Nurfullo Nurmatov
          </span>
          <span className={`tabular-nums ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
            v1.2.22
          </span>
        </footer>
      </div>
    </div>
  );
}
