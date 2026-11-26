import React, { useState, useEffect } from 'react';
import NurLogo from '../components/NurLogo';
import { useGame } from '../store/gameStore';
import {
  GlobeIcon,
  SettingsIcon,
  PlayIcon,
  GoogleIcon,
  ClockIcon,
  MonitorIcon,
  SmartphoneIcon,
  SunIcon,
  MoonIcon,
  TrophyIcon,
  BookOpenIcon,
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

const DIFFICULTIES = [
  { depth: 1, label: 'Oson' },
  { depth: 2, label: 'Oʻrta' },
  { depth: 3, label: 'Kuchli' },
  { depth: 4, label: 'Usta' },
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

  const pillTrack = isLight
    ? 'bg-black/[0.05] border border-black/[0.06]'
    : 'bg-black/30 border border-white/[0.08]';

  const pillActive = isLight
    ? 'bg-white text-stone-900 shadow-sm font-semibold'
    : 'bg-white/[0.18] text-white shadow-sm font-semibold';

  const pillIdle = isLight
    ? 'text-stone-600 hover:text-stone-950 font-medium'
    : 'text-stone-300 hover:text-white font-medium';

  const textMain = isLight ? 'text-stone-900' : 'text-white';
  const textMuted = isLight ? 'text-stone-600' : 'text-stone-300';

  return (
    <div
      className={`min-h-screen landscape:max-h-[520px]:min-h-0 landscape:max-h-[520px]:h-[100dvh] landscape:max-h-[520px]:max-h-[100dvh] landscape:max-h-[520px]:overflow-hidden md:min-h-screen md:h-auto md:max-h-none md:overflow-visible w-full flex flex-col font-sans select-none relative overflow-x-hidden ${textMain}`}
    >
      <div
        className={`relative z-10 w-full flex flex-col min-h-screen landscape:max-h-[520px]:min-h-0 landscape:max-h-[520px]:h-full landscape:max-h-[520px]:overflow-hidden md:min-h-screen md:h-auto md:overflow-visible ${
          isMobileSimulation ? 'max-w-[430px] mx-auto pb-20 pt-2' : ''
        }`}
      >
        {/* ── 1. YUQORI SHAFFOF PANEL ── */}
        <header className="w-full max-w-6xl xl:max-w-[1220px] mx-auto px-3 sm:px-6 md:px-8 pt-3 sm:pt-5 max-md:landscape:pt-1.5 shrink-0">
          <div className="w-full rounded-2xl nur-glass-nav px-4 sm:px-5 py-2.5 max-md:landscape:py-1.5 flex items-center justify-between gap-3">
            {/* Brend */}
            <div className="flex items-center gap-2.5 min-w-0">
              <NurLogo size={34} showGlow={false} />
              <span className={`font-display text-[17px] font-bold tracking-tight truncate ${textMain}`}>
                Nur Shaxmat
              </span>
            </div>

            {/* Desktop Havolalar */}
            <nav
              className={`${
                isMobileSimulation ? 'hidden' : 'hidden landscape:flex md:flex'
              } items-center gap-1`}
            >
              <button
                onClick={() => {}}
                className={`px-3.5 py-1.5 rounded-xl text-[13.5px] font-semibold cursor-pointer ${
                  isLight ? 'bg-black/[0.06] text-stone-950' : 'bg-white/[0.14] text-white'
                }`}
              >
                {t('nav_game')}
              </button>
              <button
                onClick={onOpenRules}
                className={`px-3.5 py-1.5 rounded-xl text-[13.5px] font-medium transition-colors cursor-pointer ${
                  isLight ? 'text-stone-700 hover:bg-black/[0.04]' : 'text-stone-200 hover:bg-white/[0.08]'
                }`}
              >
                {t('nav_rules')}
              </button>
              <button
                onClick={onOpenLeaderboard || onOpenStats}
                className={`px-3.5 py-1.5 rounded-xl text-[13.5px] font-medium transition-colors cursor-pointer ${
                  isLight ? 'text-stone-700 hover:bg-black/[0.04]' : 'text-stone-200 hover:bg-white/[0.08]'
                }`}
              >
                Reyting
              </button>
              <button
                onClick={onOpenSettings}
                className={`px-3.5 py-1.5 rounded-xl text-[13.5px] font-medium transition-colors cursor-pointer ${
                  isLight ? 'text-stone-700 hover:bg-black/[0.04]' : 'text-stone-200 hover:bg-white/[0.08]'
                }`}
              >
                {t('nav_settings')}
              </button>
            </nav>

            {/* O'ng Boshqaruvlar */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isAndroidApk && onSetWebDeviceView && (
                <div className={`hidden sm:flex items-center p-0.5 rounded-xl ${pillTrack}`}>
                  <button
                    onClick={() => onSetWebDeviceView('notebook')}
                    className={`p-1.5 rounded-[9px] transition-all cursor-pointer ${
                      webDeviceView === 'notebook' ? pillActive : pillIdle
                    }`}
                    title="Kompyuter"
                  >
                    <MonitorIcon size={15} />
                  </button>
                  <button
                    onClick={() => onSetWebDeviceView('phone')}
                    className={`p-1.5 rounded-[9px] transition-all cursor-pointer ${
                      webDeviceView === 'phone' ? pillActive : pillIdle
                    }`}
                    title="Telefon"
                  >
                    <SmartphoneIcon size={15} />
                  </button>
                </div>
              )}

              {!isAndroidApk && (
                <button
                  onClick={toggleQuickTheme}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white/60 hover:bg-white border-black/10 text-stone-800'
                      : 'bg-white/[0.08] hover:bg-white/[0.16] border-white/15 text-amber-300'
                  }`}
                  title={isLight ? 'Tungi rejim' : 'Kunduzgi rejim'}
                >
                  {isLight ? <MoonIcon size={16} /> : <SunIcon size={16} />}
                </button>
              )}

              <button
                onClick={onOpenStats}
                className={`h-9 px-3 rounded-xl border text-[13px] font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white/75 hover:bg-white border-black/10 text-stone-900'
                    : 'bg-white/[0.10] hover:bg-white/[0.18] border-white/15 text-white'
                }`}
              >
                {profile.isGoogleLinked && profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <GoogleIcon size={15} />
                )}
                <span className="max-w-[90px] truncate">
                  {profile.isGoogleLinked ? profile.name : 'Kirish'}
                </span>
              </button>

              {(isMobileSimulation || typeof window !== 'undefined') && (
                <button
                  onClick={onOpenSettings}
                  className={`md:hidden landscape:hidden w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer ${
                    isLight
                      ? 'bg-white/65 border-black/10 text-stone-800'
                      : 'bg-white/[0.08] border-white/15 text-white'
                  }`}
                >
                  <SettingsIcon size={17} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── 2. MARKAZIY VIZUAL SHAXMAT STUDIYASI (Ortiqcha yozuvlarsiz!) ── */}
        <main
          className={`w-full ${
            isMobileSimulation
              ? 'grid grid-cols-1 gap-4 px-3 py-3'
              : 'max-w-6xl xl:max-w-[1220px] mx-auto my-auto grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-5 md:gap-7 px-3 sm:px-6 md:px-8 pt-4 pb-24 md:py-8 max-md:landscape:py-2 max-md:landscape:gap-3'
          } items-stretch`}
        >
          {/* ── CHAP USTUN: VIZUAL DOSKA VA O'YNASH (md:col-span-5) ── */}
          <div
            className={`w-full ${
              isMobileSimulation ? '' : 'landscape:col-span-5 md:col-span-5'
            } p-5 sm:p-6 max-md:landscape:p-3 rounded-[1.75rem] nur-glass-surface flex flex-col justify-between gap-5 max-md:landscape:gap-2.5`}
          >
            {/* Saqlangan o'yin bo'lsa — bitta toza davom etish tugmasi */}
            {hasActiveMatch && (
              <button
                onClick={onContinueGame}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5b992e] hover:bg-[#4f8726] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <PlayIcon size={15} className="fill-white" />
                <span>Davom etish ({Math.ceil((state.game.moveHistory?.length || 0) / 2)})</span>
              </button>
            )}

            {/* 1. 3D va 2D Vizual Kartalar — Yozuvsiz ham ko'rinishi bilan bilinadi! */}
            <div className="grid grid-cols-2 gap-3">
              {/* 3D Fazoviy Vizual Karta */}
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_3D', enabled: true })}
                className={`relative rounded-2xl p-3 max-md:landscape:p-2 flex flex-col items-center justify-between gap-2 transition-all cursor-pointer border ${
                  state.is3D
                    ? isLight
                      ? 'bg-white/85 border-[#5b992e] shadow-[0_6px_20px_rgba(91,153,46,0.18)] ring-2 ring-[#5b992e]/25'
                      : 'bg-white/[0.16] border-[#73b83f] shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-2 ring-[#73b83f]/30'
                    : isLight
                    ? 'bg-white/35 border-white/60 hover:bg-white/60'
                    : 'bg-white/[0.05] border-white/10 hover:bg-white/[0.10]'
                }`}
              >
                {/* Perspektivli 3D sahna ko'rinishi */}
                <div className="relative w-full h-24 max-md:landscape:h-14 flex items-center justify-center overflow-hidden rounded-xl">
                  <div
                    className="absolute bottom-1 w-28 h-8 rounded-lg opacity-85 shadow-inner"
                    style={{
                      transform: 'perspective(140px) rotateX(55deg)',
                      backgroundImage:
                        'repeating-conic-gradient(#d8c39e 0% 25%, #8c5332 0% 50%)',
                      backgroundSize: '28px 28px',
                    }}
                  />
                  <div className="relative z-10 flex items-end justify-center gap-1 pb-2">
                    <img
                      src="/pieces/3d_nur_white.png"
                      alt="3D Nur"
                      className="h-14 max-md:landscape:h-9 object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.4)]"
                    />
                    <img
                      src="/pieces/3d_king_white.png"
                      alt="3D Shoh"
                      className="h-16 max-md:landscape:h-10 object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                </div>
                <span className={`font-display text-sm font-bold ${textMain}`}>3D</span>
              </button>

              {/* 2D Tekis Vizual Karta */}
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_3D', enabled: false })}
                className={`relative rounded-2xl p-3 max-md:landscape:p-2 flex flex-col items-center justify-between gap-2 transition-all cursor-pointer border ${
                  !state.is3D
                    ? isLight
                      ? 'bg-white/85 border-[#5b992e] shadow-[0_6px_20px_rgba(91,153,46,0.18)] ring-2 ring-[#5b992e]/25'
                      : 'bg-white/[0.16] border-[#73b83f] shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-2 ring-[#73b83f]/30'
                    : isLight
                    ? 'bg-white/35 border-white/60 hover:bg-white/60'
                    : 'bg-white/[0.05] border-white/10 hover:bg-white/[0.10]'
                }`}
              >
                {/* Tekis 2D katakli sahna */}
                <div className="relative w-full h-24 max-md:landscape:h-14 flex items-center justify-center rounded-xl overflow-hidden">
                  <div
                    className="grid grid-cols-2 grid-rows-2 w-20 h-20 max-md:landscape:w-12 max-md:landscape:h-12 rounded-xl overflow-hidden shadow-md border border-black/15"
                  >
                    <div className="bg-[#f3e3b8] flex items-center justify-center p-1">
                      <img src="/pieces/wNur.svg" alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="bg-[#96502c] flex items-center justify-center p-1">
                      <img src="/pieces/bQ.svg" alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="bg-[#96502c] flex items-center justify-center p-1">
                      <img src="/pieces/wK.svg" alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="bg-[#f3e3b8] flex items-center justify-center p-1">
                      <img src="/pieces/bN.svg" alt="" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
                <span className={`font-display text-sm font-bold ${textMain}`}>2D</span>
              </button>
            </div>

            {/* 2. Donalar Tomoni — Shoh Figuralari Orqali Aniq Ko'rinish */}
            <div className={`grid grid-cols-3 p-1.5 rounded-2xl gap-1.5 ${pillTrack}`}>
              <button
                type="button"
                onClick={() => setHomeColorChoice('white')}
                className={`py-2.5 max-md:landscape:py-1.5 px-2 rounded-xl text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  homeColorChoice === 'white' ? pillActive : pillIdle
                }`}
              >
                <img
                  src="/pieces/wK.svg"
                  alt=""
                  className="w-6 h-6 shrink-0 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
                />
                <span>Oq</span>
              </button>

              <button
                type="button"
                onClick={() => setHomeColorChoice('random')}
                className={`py-2.5 max-md:landscape:py-1.5 px-2 rounded-xl text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  homeColorChoice === 'random' ? pillActive : pillIdle
                }`}
              >
                <div className="flex items-center -space-x-2 shrink-0">
                  <img src="/pieces/wP.svg" alt="" className="w-5 h-5 object-contain" />
                  <img src="/pieces/bP.svg" alt="" className="w-5 h-5 object-contain" />
                </div>
                <span>Tasodifiy</span>
              </button>

              <button
                type="button"
                onClick={() => setHomeColorChoice('black')}
                className={`py-2.5 max-md:landscape:py-1.5 px-2 rounded-xl text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  homeColorChoice === 'black' ? pillActive : pillIdle
                }`}
              >
                <img
                  src="/pieces/bK.svg"
                  alt=""
                  className="w-6 h-6 shrink-0 object-contain"
                />
                <span>Qora</span>
              </button>
            </div>

            {/* 3. Qiyinchilik Darajasi — 4 ta Toza Tugma */}
            {!isAndroidApk && (
              <div className={`grid grid-cols-4 p-1.5 rounded-2xl gap-1 max-md:landscape:hidden ${pillTrack}`}>
                {DIFFICULTIES.map((opt) => (
                  <button
                    key={opt.depth}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_AI_DEPTH', depth: opt.depth })}
                    className={`py-2 px-1 rounded-xl text-[13px] transition-all cursor-pointer text-center ${
                      state.aiDepth === opt.depth ? pillActive : pillIdle
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* 4. Katta Aniq O'ynash Tugmasi */}
            <button
              onClick={() => onStartVsAI(homeColorChoice)}
              className="w-full py-4 max-md:landscape:py-2.5 px-6 rounded-2xl bg-[#5b992e] hover:bg-[#508727] active:scale-[0.99] text-white font-display font-bold text-[16px] flex items-center justify-center gap-2.5 shadow-[0_8px_22px_rgba(91,153,46,0.32)] transition-all cursor-pointer"
            >
              <PlayIcon size={18} className="fill-white" />
              <span>Oʻynash</span>
            </button>
          </div>

          {/* ── O'NG USTUN: VIZUAL PLITKALAR (Yozuvsiz ham nimani anglatishi ko'rinadi!) ── */}
          <div
            className={`w-full ${
              isMobileSimulation ? '' : 'landscape:col-span-7 md:col-span-7'
            } flex flex-col justify-between gap-3`}
          >
            {/* 6 ta Vizual Kvadrat Plitka (2 ustun x 3 qator) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 landscape:grid-cols-3 gap-3 flex-1">
              {/* 1. Kompyuter */}
              <button
                onClick={onOpenBotModal || (() => onStartVsAI(homeColorChoice))}
                className="p-4 max-md:landscape:p-2 rounded-[1.4rem] nur-glass-card flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
              >
                <div className="h-14 max-md:landscape:h-9 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img
                    src="/pieces/3d_nur_black.png"
                    alt="Kompyuter"
                    className="h-14 max-md:landscape:h-9 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]"
                  />
                </div>
                <span className={`font-display font-bold text-[15px] ${textMain}`}>Kompyuter</span>
              </button>

              {/* 2. Onlayn */}
              <button
                onClick={onOpenOnline}
                className="p-4 max-md:landscape:p-2 rounded-[1.4rem] nur-glass-card flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 max-md:landscape:w-9 max-md:landscape:h-9 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isLight ? 'bg-sky-500/12 text-sky-700' : 'bg-sky-400/15 text-sky-300'
                  }`}
                >
                  <GlobeIcon size={30} />
                </div>
                <span className={`font-display font-bold text-[15px] ${textMain}`}>Onlayn</span>
              </button>

              {/* 3. 2 O'yinchi (Ikki Shoh yonma-yon — yozuvsiz ham tushunarli!) */}
              <button
                onClick={onStartLocal}
                className="p-4 max-md:landscape:p-2 rounded-[1.4rem] nur-glass-card flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
              >
                <div className="h-14 max-md:landscape:h-9 flex items-center justify-center -space-x-2 transition-transform group-hover:scale-105">
                  <img src="/pieces/wK.svg" alt="" className="w-11 h-11 max-md:landscape:w-8 max-md:landscape:h-8 object-contain" />
                  <img src="/pieces/bK.svg" alt="" className="w-11 h-11 max-md:landscape:w-8 max-md:landscape:h-8 object-contain" />
                </div>
                <span className={`font-display font-bold text-[15px] ${textMain}`}>2 Oʻyinchi</span>
              </button>

              {/* 4. Bot vs Bot (Ikki Ot yuzma-yuz) */}
              <button
                onClick={onOpenBotVsBot}
                className="p-4 max-md:landscape:p-2 rounded-[1.4rem] nur-glass-card flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
              >
                <div className="h-14 max-md:landscape:h-9 flex items-center justify-center gap-1 transition-transform group-hover:scale-105">
                  <img src="/pieces/wN.svg" alt="" className="w-10 h-10 max-md:landscape:w-7 max-md:landscape:h-7 object-contain" />
                  <img src="/pieces/bN.svg" alt="" className="w-10 h-10 max-md:landscape:w-7 max-md:landscape:h-7 object-contain" />
                </div>
                <span className={`font-display font-bold text-[15px] ${textMain}`}>Bot vs Bot</span>
              </button>

              {/* 5. Shaxmat Soati */}
              <button
                onClick={onOpenStandaloneClock || (() => {})}
                className="p-4 max-md:landscape:p-2 rounded-[1.4rem] nur-glass-card flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 max-md:landscape:w-9 max-md:landscape:h-9 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isLight ? 'bg-amber-500/15 text-amber-700' : 'bg-amber-400/15 text-amber-300'
                  }`}
                >
                  <ClockIcon size={30} />
                </div>
                <span className={`font-display font-bold text-[15px] ${textMain}`}>Soat</span>
              </button>

              {/* 6. Qoidalar */}
              <button
                onClick={onOpenRules}
                className="p-4 max-md:landscape:p-2 rounded-[1.4rem] nur-glass-card flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 max-md:landscape:w-9 max-md:landscape:h-9 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isLight ? 'bg-emerald-600/12 text-emerald-700' : 'bg-emerald-400/15 text-emerald-300'
                  }`}
                >
                  <BookOpenIcon size={28} />
                </div>
                <span className={`font-display font-bold text-[15px] ${textMain}`}>Qoidalar</span>
              </button>
            </div>

            {/* Pastki Keng Statistika Chizig'i */}
            <button
              onClick={onOpenStats}
              className="w-full px-5 py-3.5 max-md:landscape:py-2 rounded-[1.3rem] nur-glass-card flex items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-amber-500/15 text-amber-700' : 'bg-amber-400/15 text-amber-300'
                  }`}
                >
                  <TrophyIcon size={19} />
                </div>
                <span className={`font-display font-bold text-[15px] truncate ${textMain}`}>
                  Statistika
                </span>
              </div>

              <div className="flex items-center gap-5 max-md:landscape:hidden shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs ${textMuted}`}>Reyting</span>
                  <span className={`font-display font-bold text-[15px] tabular-nums ${textMain}`}>
                    {profile.rating}
                  </span>
                </div>
                <div className={`h-4 w-[1px] ${isLight ? 'bg-black/10' : 'bg-white/15'}`} />
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs ${textMuted}`}>Gʻalaba</span>
                  <span className="font-display font-bold text-[15px] tabular-nums text-[#5b992e]">
                    {profile.wins}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
