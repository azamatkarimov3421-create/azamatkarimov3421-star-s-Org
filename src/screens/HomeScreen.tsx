import React, { useState, useEffect, useMemo } from 'react';
import NurLogo from '../components/NurLogo';
import { useGame } from '../store/gameStore';
import { createInitialBoard } from '../engine/board';
import { FILES, PieceType } from '../engine/types';
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
  UsersIcon,
  CpuIcon,
  BotIcon,
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

const DIFFICULTIES = [
  { depth: 1, label: 'Oson', elo: '1000' },
  { depth: 2, label: 'Oʻrta', elo: '1400' },
  { depth: 3, label: 'Kuchli', elo: '1800' },
  { depth: 4, label: 'Usta', elo: '2200' },
];

const PIECE_3D_IMG: Record<PieceType, { white: string; black: string }> = {
  King: { white: '/pieces/3d_king_white.png', black: '/pieces/3d_king_black.png' },
  Queen: { white: '/pieces/3d_queen_white.png', black: '/pieces/3d_queen_black.png' },
  Nur: { white: '/pieces/3d_nur_white.png', black: '/pieces/3d_nur_black.png' },
  Rook: { white: '/pieces/3d_rook_white.png', black: '/pieces/3d_rook_black.png' },
  Bishop: { white: '/pieces/3d_bishop_white.png', black: '/pieces/3d_bishop_black.png' },
  Knight: { white: '/pieces/3d_knight_white.png', black: '/pieces/3d_knight_black.png' },
  Pawn: { white: '/pieces/3d_pawn_white.png', black: '/pieces/3d_pawn_black.png' },
};

const PIECE_2D_IMG: Record<PieceType, { white: string; black: string }> = {
  King: { white: '/pieces/wK.svg', black: '/pieces/bK.svg' },
  Queen: { white: '/pieces/wQ.svg', black: '/pieces/bQ.svg' },
  Nur: { white: '/pieces/wNur.svg', black: '/pieces/bNur.svg' },
  Rook: { white: '/pieces/wR.svg', black: '/pieces/bR.svg' },
  Bishop: { white: '/pieces/wB.svg', black: '/pieces/bB.svg' },
  Knight: { white: '/pieces/wN.svg', black: '/pieces/bN.svg' },
  Pawn: { white: '/pieces/wP.svg', black: '/pieces/bP.svg' },
};

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
  const showBlackBottom = homeColorChoice === 'black';

  const initialBoard = useMemo(() => createInitialBoard(), []);

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
    : 'bg-black/35 border border-white/[0.08]';

  const pillActive = isLight
    ? 'bg-white text-stone-950 shadow-sm font-semibold'
    : 'bg-white/[0.16] text-white shadow-sm font-semibold';

  const pillIdle = isLight
    ? 'text-stone-600 hover:text-stone-950 font-medium'
    : 'text-stone-300 hover:text-white font-medium';

  const textMain = isLight ? 'text-stone-900' : 'text-white';
  const textMuted = isLight ? 'text-stone-600' : 'text-stone-300';

  const rankOrder = showBlackBottom ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  const fileOrder = showBlackBottom ? [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans select-none relative overflow-x-hidden ${textMain}`}
    >
      <div
        className={`relative z-10 w-full flex flex-col min-h-screen ${
          isMobileSimulation ? 'max-w-[430px] mx-auto pb-20 pt-2' : ''
        }`}
      >
        {/* ── 1. YUQORI NAVIGATSIYA PANELI ── */}
        <header className="w-full max-w-[1160px] mx-auto px-3 sm:px-6 pt-3 sm:pt-5 shrink-0">
          <div className="w-full rounded-2xl nur-glass-nav px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-3">
            {/* Brend */}
            <div className="flex items-center gap-2.5 min-w-0">
              <NurLogo size={34} showGlow={false} />
              <span className={`font-display text-[17px] font-bold tracking-tight truncate ${textMain}`}>
                Nur Shaxmat <span className={isLight ? 'text-[#5b992e]' : 'text-[#81b64c]'}>100</span>
              </span>
            </div>

            {/* Desktop Havolalar */}
            <nav
              className={`${
                isMobileSimulation ? 'hidden' : 'hidden md:flex'
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
                Peshqadamlar
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
                      ? 'bg-white/75 hover:bg-white border-black/10 text-stone-800'
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
                    ? 'bg-white/80 hover:bg-white border-black/10 text-stone-900'
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

              <button
                onClick={onOpenSettings}
                className={`md:hidden w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer ${
                  isLight
                    ? 'bg-white/75 border-black/10 text-stone-800'
                    : 'bg-white/[0.08] border-white/15 text-white'
                }`}
                title={t('nav_settings')}
              >
                <SettingsIcon size={17} />
              </button>
            </div>
          </div>
        </header>

        {/* ── 2. MARKAZIY SAHNA: CHAPDA 10x10 SHAXMAT DOSKASI, O'NGDA BOSHQARUV ── */}
        <main
          className={`w-full ${
            isMobileSimulation
              ? 'grid grid-cols-1 gap-4 px-3 py-3'
              : 'max-w-[1140px] mx-auto my-auto grid grid-cols-1 md:grid-cols-12 items-center gap-5 md:gap-8 lg:gap-10 px-3 sm:px-6 pt-3 pb-24 md:py-6'
          }`}
        >
          {/* ── CHAP TOMON: JONLI 10x10 NUR SHAXMAT DOSKASI VITRINASI ── */}
          <div
            className={`w-full ${
              isMobileSimulation ? '' : 'md:col-span-7'
            } flex justify-center`}
          >
            <div className="w-full max-w-[490px] rounded-[1.75rem] nur-glass-surface p-3 sm:p-4 flex flex-col gap-3">
              {/* Doska ustidagi boshqaruv chizig'i: 3D/2D va Oq/Tasodifiy/Qora */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* 3D / 2D Almashtirgich */}
                <div className={`inline-flex items-center p-1 rounded-xl gap-0.5 ${pillTrack}`}>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_3D', enabled: true })}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      state.is3D ? pillActive : pillIdle
                    }`}
                  >
                    <CubeIcon size={14} />
                    <span>3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_3D', enabled: false })}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      !state.is3D ? pillActive : pillIdle
                    }`}
                  >
                    <GridIcon size={14} />
                    <span>2D</span>
                  </button>
                </div>

                {/* Donalar Rangi: Oq / Tasodifiy / Qora */}
                <div className={`inline-flex items-center p-1 rounded-xl gap-0.5 ${pillTrack}`}>
                  <button
                    type="button"
                    onClick={() => setHomeColorChoice('white')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      homeColorChoice === 'white' ? pillActive : pillIdle
                    }`}
                  >
                    <img src="/pieces/wK.svg" alt="" className="w-4 h-4 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
                    <span>Oq</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeColorChoice('random')}
                    className={`px-2 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
                      homeColorChoice === 'random' ? pillActive : pillIdle
                    }`}
                    title="Tasodifiy"
                  >
                    <div className="flex items-center -space-x-1.5">
                      <img src="/pieces/wP.svg" alt="" className="w-3.5 h-3.5 object-contain" />
                      <img src="/pieces/bP.svg" alt="" className="w-3.5 h-3.5 object-contain" />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeColorChoice('black')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      homeColorChoice === 'black' ? pillActive : pillIdle
                    }`}
                  >
                    <img src="/pieces/bK.svg" alt="" className="w-4 h-4 object-contain" />
                    <span>Qora</span>
                  </button>
                </div>
              </div>

              {/* Haqiqiy 10x10 Nur Doskasi (3D perspektiv yoki 2D tekis) */}
              <div
                className="w-full flex items-center justify-center py-0.5"
                style={{ perspective: '950px' }}
              >
                <div
                  className="w-full max-w-[330px] sm:max-w-[420px] rounded-2xl p-2 sm:p-2.5 shadow-[0_14px_32px_rgba(0,0,0,0.22)] border border-[#7c5333]/60 transition-transform duration-300 ease-out"
                  style={{
                    backgroundImage: "url('/textures/wood_frame.jpg')",
                    backgroundSize: 'cover',
                    backgroundColor: '#cfa774',
                    transformStyle: 'preserve-3d',
                    transform: state.is3D ? 'rotateX(16deg) scale(0.97)' : 'rotateX(0deg) scale(1)',
                  }}
                >
                  {/* 10x10 kataklar panjarasi */}
                  <div
                    className="grid grid-cols-10 grid-rows-10 w-full aspect-square rounded-lg overflow-hidden border border-black/35 shadow-inner"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {rankOrder.map((rankIdx) =>
                      fileOrder.map((fileIdx) => {
                        const isLightSq = (rankIdx + fileIdx) % 2 !== 0;
                        const piece = initialBoard[rankIdx][fileIdx];
                        const isNurHome =
                          (fileIdx === 3 || fileIdx === 6) && (rankIdx === 0 || rankIdx === 9);
                        const imgSrc = piece
                          ? state.is3D
                            ? PIECE_3D_IMG[piece.type][piece.color]
                            : PIECE_2D_IMG[piece.type][piece.color]
                          : null;

                        return (
                          <div
                            key={`${rankIdx}-${fileIdx}`}
                            className="relative flex items-center justify-center select-none"
                            style={{
                              transformStyle: 'preserve-3d',
                              backgroundColor: isLightSq ? '#f1dfb8' : '#a8673e',
                              backgroundImage: state.is3D
                                ? `url('${isLightSq ? '/textures/wood_light_square.jpg' : '/textures/wood_dark_square.jpg'}')`
                                : undefined,
                              backgroundSize: 'cover',
                              boxShadow: isNurHome
                                ? 'inset 0 0 0 1.5px rgba(245, 158, 11, 0.72)'
                                : undefined,
                            }}
                          >
                            {imgSrc && (
                              <img
                                src={imgSrc}
                                alt=""
                                loading="eager"
                                decoding="sync"
                                draggable={false}
                                className={`pointer-events-none object-contain transition-transform duration-300 ${
                                  state.is3D ? 'w-[92%] h-[92%]' : 'w-[82%] h-[82%]'
                                }`}
                                style={{
                                  transform: state.is3D
                                    ? 'rotateX(-16deg) translateY(-10%)'
                                    : undefined,
                                  transformOrigin: 'bottom center',
                                  filter: state.is3D
                                    ? 'drop-shadow(0 3px 3px rgba(0,0,0,0.45))'
                                    : 'drop-shadow(0 1px 1px rgba(0,0,0,0.22))',
                                }}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pastki ustun harflari (10 ta ustun: A..N E D M..H) */}
                  <div className="grid grid-cols-10 mt-1 px-0.5">
                    {fileOrder.map((fileIdx) => (
                      <span
                        key={fileIdx}
                        style={{ textShadow: '0 1px 0 rgba(255,245,220,0.45)' }}
                        className={`text-center font-mono text-[9px] sm:text-[10px] font-extrabold leading-none ${
                          fileIdx === 3 || fileIdx === 6 ? 'text-[#5c2808]' : 'text-[#2b180c]/85'
                        }`}
                      >
                        {FILES[fileIdx]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── O'NG TOMON: IXCHAM VA ANIQ O'YIN PULTI ── */}
          <div
            className={`w-full ${
              isMobileSimulation ? '' : 'md:col-span-5'
            } flex flex-col gap-3 max-w-[460px] mx-auto`}
          >
            {/* Saqlangan o'yin davomi */}
            {hasActiveMatch && (
              <button
                onClick={onContinueGame}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <PlayIcon size={15} className="fill-white" />
                <span>Davom etish ({Math.ceil((state.game.moveHistory?.length || 0) / 2)})</span>
              </button>
            )}

            {/* 1. Asosiy O'yin Karti (Kompyuter bilan) */}
            <div className="p-4 sm:p-5 rounded-[1.5rem] nur-glass-surface flex flex-col gap-3.5">
              {/* Daraja tanlash — 4 ta qulay tugma */}
              {!isAndroidApk && (
                <div className={`grid grid-cols-4 p-1 rounded-2xl gap-1 ${pillTrack}`}>
                  {DIFFICULTIES.map((opt) => {
                    const active = state.aiDepth === opt.depth;
                    return (
                      <button
                        key={opt.depth}
                        type="button"
                        onClick={() => dispatch({ type: 'SET_AI_DEPTH', depth: opt.depth })}
                        className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center leading-tight transition-all cursor-pointer ${
                          active ? pillActive : pillIdle
                        }`}
                      >
                        <span className="text-[12.5px] font-semibold">{opt.label}</span>
                        <span className="text-[10px] opacity-65 font-mono tabular-nums mt-0.5">
                          {opt.elo}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Katta O'ynash Tugmasi + Bot sozlamalari */}
              <div className="flex items-stretch gap-2.5">
                <button
                  onClick={() => onStartVsAI(homeColorChoice)}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-[#5b992e] hover:bg-[#508727] active:scale-[0.99] text-white font-display font-bold text-[15.5px] flex items-center justify-center gap-2.5 shadow-[0_8px_22px_rgba(91,153,46,0.32)] transition-all cursor-pointer"
                >
                  <PlayIcon size={17} className="fill-white" />
                  <span>Kompyuter bilan</span>
                </button>

                {onOpenBotModal && (
                  <button
                    onClick={onOpenBotModal}
                    className={`w-12 rounded-2xl border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isLight
                        ? 'bg-white/75 hover:bg-white border-black/10 text-stone-700'
                        : 'bg-white/[0.08] hover:bg-white/[0.15] border-white/15 text-stone-200'
                    }`}
                    title="Raqib tanlash"
                  >
                    <BotIcon size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* 2. 4 ta Tizimli O'yin Rejimlari (2x2 Ixcham Gorizontal Kartalar) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Onlayn */}
              <button
                onClick={onOpenOnline}
                className="p-3.5 rounded-2xl nur-glass-card flex items-center gap-3 text-left group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isLight ? 'bg-sky-500/15 text-sky-700' : 'bg-sky-400/15 text-sky-300'
                  }`}
                >
                  <GlobeIcon size={20} />
                </div>
                <span className={`font-display font-bold text-[14px] leading-tight ${textMain}`}>
                  Onlayn
                </span>
              </button>

              {/* 2 O'yinchi */}
              <button
                onClick={onStartLocal}
                className="p-3.5 rounded-2xl nur-glass-card flex items-center gap-3 text-left group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isLight ? 'bg-emerald-600/15 text-emerald-700' : 'bg-emerald-400/15 text-emerald-300'
                  }`}
                >
                  <UsersIcon size={20} />
                </div>
                <span className={`font-display font-bold text-[14px] leading-tight ${textMain}`}>
                  2 Oʻyinchi
                </span>
              </button>

              {/* Bot vs Bot */}
              <button
                onClick={onOpenBotVsBot}
                className="p-3.5 rounded-2xl nur-glass-card flex items-center gap-3 text-left group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isLight ? 'bg-indigo-500/15 text-indigo-700' : 'bg-indigo-400/15 text-indigo-300'
                  }`}
                >
                  <CpuIcon size={20} />
                </div>
                <span className={`font-display font-bold text-[14px] leading-tight ${textMain}`}>
                  Bot vs Bot
                </span>
              </button>

              {/* Shaxmat Soati */}
              <button
                onClick={onOpenStandaloneClock || (() => {})}
                className="p-3.5 rounded-2xl nur-glass-card flex items-center gap-3 text-left group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isLight ? 'bg-amber-500/15 text-amber-700' : 'bg-amber-400/15 text-amber-300'
                  }`}
                >
                  <ClockIcon size={20} />
                </div>
                <span className={`font-display font-bold text-[14px] leading-tight ${textMain}`}>
                  Soat
                </span>
              </button>
            </div>

            {/* 3. Pastki Qoidalar & Statistika Chizig'i */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenRules}
                className="p-3.5 rounded-2xl nur-glass-card flex items-center gap-3 text-left group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isLight ? 'bg-teal-600/15 text-teal-700' : 'bg-teal-400/15 text-teal-300'
                  }`}
                >
                  <BookOpenIcon size={20} />
                </div>
                <span className={`font-display font-bold text-[14px] leading-tight ${textMain}`}>
                  Qoidalar
                </span>
              </button>

              <button
                onClick={onOpenStats}
                className="p-3.5 rounded-2xl nur-glass-card flex items-center justify-between gap-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isLight ? 'bg-amber-500/15 text-amber-700' : 'bg-amber-400/15 text-amber-300'
                    }`}
                  >
                    <TrophyIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className={`font-display font-bold text-[13.5px] leading-tight truncate ${textMain}`}>
                      Reyting
                    </div>
                    <div className={`font-mono text-xs font-bold tabular-nums ${textMuted}`}>
                      {profile.rating}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
