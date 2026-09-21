import React from 'react';
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
import { getUserProfile } from '../store/userProfileStore';

interface HomeScreenProps {
  onStartVsAI: () => void;
  onStartLocal: () => void;
  onOpenOnline: () => void;
  onOpenBotVsBot: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export default function HomeScreen({
  onStartVsAI,
  onStartLocal,
  onOpenOnline,
  onOpenBotVsBot,
  onOpenRules,
  onOpenStats,
  onOpenSettings,
}: HomeScreenProps) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const profile = getUserProfile();

  const gameModes = [
    {
      id: 'vsAI',
      title: t('mode_vs_ai_title'),
      subtitle: t('mode_vs_ai_desc'),
      icon: <BotIcon size={22} className="text-[#4ade80]" />,
      iconBg: 'bg-[#183622] border-[#275535]',
      action: onStartVsAI,
    },
    {
      id: 'aiVsAi',
      title: t('mode_ai_vs_ai_title'),
      subtitle: t('mode_ai_vs_ai_desc'),
      icon: <SwordsIcon size={22} className="text-amber-400" />,
      iconBg: 'bg-[#332616] border-[#553c20]',
      badge: t('badge_new'),
      action: onOpenBotVsBot,
    },
    {
      id: 'pvp',
      title: t('mode_pvp_title'),
      subtitle: t('mode_pvp_desc'),
      icon: <UsersIcon size={22} className="text-[#60a5fa]" />,
      iconBg: 'bg-[#182a3c] border-[#23425e]',
      action: onStartLocal,
    },
    {
      id: 'online',
      title: t('mode_online_title'),
      subtitle: t('mode_online_desc'),
      icon: <GlobeIcon size={22} className="text-[#c084fc]" />,
      iconBg: 'bg-[#2a1d3d] border-[#442c62]',
      action: onOpenOnline,
    },
    {
      id: 'rules',
      title: t('mode_rules_title'),
      subtitle: t('mode_rules_desc'),
      icon: <BookOpenIcon size={22} className="text-[#fbbf24]" />,
      iconBg: 'bg-[#332616] border-[#553c20]',
      action: onOpenRules,
    },
    {
      id: 'stats',
      title: t('mode_stats_title'),
      subtitle: t('mode_stats_desc'),
      icon: <TrophyIcon size={22} className="text-[#f472b6]" />,
      iconBg: 'bg-[#351a24] border-[#592539]',
      action: onOpenStats,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#121614] md:bg-[url('/desktop-bg.jpg')] bg-cover bg-center bg-fixed text-[#f1f1f1] flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Qorong'i fon qatlami (Desktopda kontrast va silliq ko'rinish uchun) */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-[#0b100d]/85 via-[#0d1310]/75 to-[#0b100d]/90 pointer-events-none z-0" />

      <div className="relative z-10 w-full flex flex-col justify-between min-h-screen">
        {/* ── 1. YUQORI HEADER (FLOATING GLASS NAVBAR) ── */}
        <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="w-full rounded-2xl sm:rounded-3xl bg-[#141b17]/90 backdrop-blur-md border border-[#27372d] px-4 sm:px-6 py-3 shadow-2xl flex items-center justify-between">
            {/* Logo va Brend */}
            <div className="flex items-center gap-3">
              <NurLogo size={40} showGlow={true} />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-wide text-white leading-tight">
                  NUR SHAXMAT <span className="text-[#f59e0b]">100</span>
                </h1>
                <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                  V1.1.3 • OʻZBEK SHAXMATI (10X10)
                </p>
              </div>
            </div>

            {/* Desktop Navigatsiya Tugmalari */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => {}}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#1f3f27] text-[#4ade80] border border-[#22c55e]/50 shadow-[0_0_12px_rgba(34,197,94,0.25)] flex items-center gap-2 transition-all cursor-pointer"
              >
                <SwordsIcon size={16} className="text-[#4ade80]" />
                <span>{t('nav_game')}</span>
              </button>
              <button
                onClick={onOpenRules}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#9ca3af] hover:text-white hover:bg-[#1f2a22] transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpenIcon size={16} />
                <span>{t('nav_rules')}</span>
              </button>
              <button
                onClick={onOpenStats}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#9ca3af] hover:text-white hover:bg-[#1f2a22] transition-all flex items-center gap-2 cursor-pointer"
              >
                <TrophyIcon size={16} />
                <span>{t('nav_leaderboard')}</span>
              </button>
              <button
                onClick={onOpenSettings}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#9ca3af] hover:text-white hover:bg-[#1f2a22] transition-all flex items-center gap-2 cursor-pointer"
              >
                <SettingsIcon size={16} />
                <span>{t('nav_settings')}</span>
              </button>

              {/* Desktop Google Profil Tugmasi */}
              {profile.isGoogleLinked ? (
                <button
                  onClick={onOpenStats}
                  className="ml-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1d2b21] hover:bg-[#25372a] border border-[#304736] text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
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
                  <span className="text-[10px] text-amber-400 font-mono font-bold">⭐ {profile.rating}</span>
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
                    ? 'bg-[#233027] border-[#2e4235] text-white'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}
                title={t('nav_profile')}
              >
                {profile.isGoogleLinked ? (
                  profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="w-5 h-5 rounded-md object-cover border border-emerald-400/60"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-md bg-[#7a6652] text-white flex items-center justify-center text-[10px] font-black border border-emerald-400/60">
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
                className="w-10 h-10 rounded-xl bg-[#233027] border border-[#2e4235] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
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
          <div className="w-full md:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#141b17]/95 backdrop-blur-md border border-[#27372d] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-[#1e3827] border border-[#285535] flex items-center justify-center text-[#4ade80] shadow-inner shrink-0">
                <SwordsIcon size={26} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">{t('start_new_game')}</h2>
                <p className="text-xs text-[#9ca3af] mt-0.5">{t('game_motto_1')}</p>
              </div>
            </div>

            {/* 3D va 2D Tanlagich (Yonma-yon 2 ta karta) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              {/* 3D Fazoviy Doska */}
              <div
                onClick={() => dispatch({ type: 'SET_3D', enabled: true })}
                className={`cursor-pointer p-3 rounded-2xl transition-all border-2 flex items-center justify-between gap-2 select-none ${
                  state.is3D
                    ? 'border-[#22c55e] bg-[#152a1b] shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-[#22c55e]/50'
                    : 'border-[#27372d] bg-[#18221c] hover:border-[#384f3f]'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="text-xl sm:text-2xl shrink-0">🎲</span>
                  <div className="min-w-0">
                    <div className="text-[11px] sm:text-xs font-black text-white flex items-center gap-1 flex-wrap">
                      <span>3D</span>
                      <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {t('as_in_book')}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#9ca3af] truncate">
                      {state.is3D ? t('perspective_3d_desc') : t('flat_2d_desc')}
                    </div>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  state.is3D ? 'border-[#22c55e]' : 'border-[#4b5563]'
                }`}>
                  {state.is3D && <span className="w-2 h-2 rounded-full bg-[#22c55e]" />}
                </div>
              </div>

              {/* 2D Tekis Doska */}
              <div
                onClick={() => dispatch({ type: 'SET_3D', enabled: false })}
                className={`cursor-pointer p-3 rounded-2xl transition-all border-2 flex items-center justify-between gap-2 select-none ${
                  !state.is3D
                    ? 'border-[#22c55e] bg-[#152a1b] shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-[#22c55e]/50'
                    : 'border-[#27372d] bg-[#18221c] hover:border-[#384f3f]'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="text-xl sm:text-2xl shrink-0">📐</span>
                  <div className="min-w-0">
                    <div className="text-[11px] sm:text-xs font-black text-white">
                      2D
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#9ca3af] truncate">
                      {t('flat_2d_desc')}
                    </div>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  !state.is3D ? 'border-[#22c55e]' : 'border-[#4b5563]'
                }`}>
                  {!state.is3D && <span className="w-2 h-2 rounded-full bg-[#22c55e]" />}
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
            <div className="pt-3 border-t border-[#27372d] flex items-center justify-between text-xs text-[#9ca3af]">
              <span>{t('author_label')}</span>
              <span className="text-xs text-amber-400 font-bold font-mono">10×10 Standart</span>
            </div>
          </div>

          {/* O'ng ustun: O'yin Turlari Ro'yxati (md:col-span-7) */}
          <div className="w-full md:col-span-7 flex flex-col gap-3">
            <div className="px-1 text-xs font-black text-[#9ca3af] uppercase tracking-wider flex items-center justify-between">
              <span>{t('game_modes_header')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gameModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={mode.action}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-[#141b17]/95 hover:bg-[#18221c] border border-[#27372d] hover:border-[#22c55e]/50 transition-all text-left flex items-center justify-between group active:scale-[0.99] shadow-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${mode.iconBg}`}>
                      {mode.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white group-hover:text-[#4ade80] transition-colors truncate">
                          {mode.title}
                        </span>
                        {(mode as any).badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {(mode as any).badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9ca3af] mt-0.5 font-medium truncate">
                        {mode.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-[#686560] group-hover:text-white group-hover:translate-x-1 transition-all pl-2">
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
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#4b5563]/40 to-transparent" />
            <p className="font-serif italic text-xs sm:text-sm text-[#9ca3af]/90 tracking-wide">
              {t('quote_motto')}
            </p>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#4b5563]/40 to-transparent" />
          </div>
          <p className="text-[10px] tracking-[0.35em] text-[#6b7280] font-bold uppercase mt-1">
            NUR SHAXMAT 100
          </p>
        </footer>
      </div>
    </div>
  );
}
