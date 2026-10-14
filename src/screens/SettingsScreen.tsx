// =====================================================
// NUR CHESS 100 — Sozlamalar Ekrani (Settings Screen)
// Yangilangan zamonaviy dizayn: Tungi va Kunduzgi rejim (Dark/Light mode),
// guruhlangan estetik kartochkalar va silliq interaktiv boshqaruv
// =====================================================

import React, { useState } from 'react';
import { BoardTheme, useGame, AppThemeMode } from '../store/gameStore';
import NurLogo from '../components/NurLogo';
import {
  ArrowLeftIcon,
  Volume2Icon,
  VolumeXIcon,
  GlobeIcon,
  ChevronRightIcon,
  BookOpenIcon,
  ChessPawnIcon,
  UserIcon,
} from '../components/Icons';
import {
  SoundTheme,
  SOUND_THEME_NAMES,
  getSoundTheme,
  setSoundTheme,
  testAudioTone,
} from '../audio/sounds';
import {
  SUPPORTED_LANGUAGES,
  useTranslation,
  AppLanguage,
} from '../i18n/translations';

interface SettingsScreenProps {
  onBack: () => void;
  onOpenRules?: () => void;
}

// ── Qulay va Chiroyli SVG Ikonkalar ──
const SunIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const MonitorIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

// ── Zamonaviy iOS / Material Uslubidagi Silliq Switch ──
function ToggleSwitch({
  checked,
  onChange,
  activeColor = 'bg-[#81b64c]',
  isLight = false,
}: {
  checked: boolean;
  onChange: () => void;
  activeColor?: string;
  isLight?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none active:scale-95 shadow-inner ${
        checked ? activeColor : isLight ? 'bg-zinc-300' : 'bg-[#38332c]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsScreen({ onBack, onOpenRules }: SettingsScreenProps) {
  const { state, dispatch } = useGame();
  const { boardTheme, soundEnabled, useNumericNotation, is3D, appTheme } = state;
  const { t, lang: currentLang, setLanguage } = useTranslation();

  const [soundTheme, setSoundThemeState] = useState<SoundTheme>(getSoundTheme());
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showSoundThemeModal, setShowSoundThemeModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const isLight =
    appTheme === 'light' ||
    (appTheme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const THEME_NAMES: Record<BoardTheme, { title: string; lightSq: string; darkSq: string }> = {
    wood: { title: 'Rasmiy Nur 100 (Sariq & Qizgʻish Yogʻoch)', lightSq: '#e8c97e', darkSq: '#8c3826' },
    emerald: { title: 'Zumrad Turniri', lightSq: '#d7e2ca', darkSq: '#447b59' },
    azure: { title: 'Zangori Osmon', lightSq: '#d4e2ee', darkSq: '#4a779d' },
    marble: { title: 'Marmar & Obsidiyan', lightSq: '#e3e4e6', darkSq: '#434750' },
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  // Ranglar sinfi (Light / Dark dinamik dizayn)
  const cardBg = isLight
    ? 'bg-white/95 border-[#e2ddd3] shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
    : 'bg-[#201d19]/95 border-[#352f28] shadow-[0_4px_16px_rgba(0,0,0,0.45)]';
  const cardHover = isLight ? 'hover:bg-zinc-50' : 'hover:bg-[#282420]';
  const textTitle = isLight ? 'text-[#1c1a17]' : 'text-white';
  const textSub = isLight ? 'text-[#756f64]' : 'text-[#9b9893]';
  const sectionTitle = isLight ? 'text-[#8c8577]' : 'text-[#a39b8d]';
  const iconBox = isLight
    ? 'bg-[#f4efe6] border-[#e2ddd3] text-amber-700'
    : 'bg-[#2a2520] border-[#3e372f] text-amber-400';

  return (
    <div className={`min-h-screen w-full ${isLight ? 'bg-[#f6f4ee]' : 'bg-[#181614]'} flex flex-col font-sans select-none pb-16 transition-colors duration-200`}>
      {/* ── HEADER ── */}
      <header className={`sticky top-0 z-30 ${isLight ? 'bg-[#f6f4ee]/95 border-[#e2ddd3]' : 'bg-[#181614]/95 border-[#352f28]'} backdrop-blur-md border-b px-4 sm:px-6 py-3.5 flex items-center justify-between pt-[max(0.7rem,env(safe-area-inset-top))] transition-colors`}>
        <div className="flex items-center gap-3.5 max-w-xl mx-auto w-full">
          <button
            onClick={onBack}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${
              isLight
                ? 'bg-white hover:bg-zinc-100 text-zinc-700 border border-[#e2ddd3]'
                : 'bg-[#282420] hover:bg-[#342f2a] text-[#c3c2be] hover:text-white border border-[#3e372f]'
            }`}
            title="Orqaga"
          >
            <ArrowLeftIcon size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className={`text-base sm:text-lg font-black tracking-tight ${textTitle}`}>
              {t('settings_title')}
            </h2>
            <p className={`text-[11px] sm:text-xs truncate ${textSub}`}>
              {t('settings_subtitle')}
            </p>
          </div>
        </div>
      </header>

      {/* ── ASOSIY GURUHLANGAN SOZLAMALAR MAZMUNI ── */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-6">

        {/* ══════════════════════════════════════════════
            1-BO'LIM: KO'RINISH VA MAVZU (APPEARANCE & THEME)
            ══════════════════════════════════════════════ */}
        <section className="flex flex-col gap-2">
          <div className={`text-[11px] font-black uppercase tracking-wider px-1 ${sectionTitle}`}>
            {t('section_appearance') || "Koʻrinish va Doska"}
          </div>

          <div className={`rounded-2xl border ${cardBg} overflow-hidden divide-y ${isLight ? 'divide-[#f0ede6]' : 'divide-[#2b2621]'}`}>
            {/* 1.1 Tungi va Kunduzgi Rejim (Theme Mode Selector) */}
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border ${iconBox}`}>
                    {appTheme === 'light' ? (
                      <SunIcon size={18} className="text-amber-500" />
                    ) : appTheme === 'system' ? (
                      <MonitorIcon size={18} className="text-emerald-500" />
                    ) : (
                      <MoonIcon size={18} className="text-sky-400" />
                    )}
                  </div>
                  <div>
                    <span className={`font-bold text-sm ${textTitle}`}>
                      {t('theme_mode_setting') || "Ilova Rejimi"}
                    </span>
                    <p className={`text-[10px] sm:text-[11px] ${textSub}`}>
                      {t('theme_mode_desc') || "Kunduzgi (och) yoki tungi (toʻq) ranglar mavzusi"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 ta Rejim Tugmalari (Segmented Control) */}
              <div className={`grid grid-cols-3 p-1 rounded-xl border gap-1 ${
                isLight ? 'bg-[#ede8df] border-[#ded7cb]' : 'bg-[#151311] border-[#2c2620]'
              }`}>
                {/* Kunduzgi (Light) */}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_APP_THEME', theme: 'light' })}
                  className={`py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    appTheme === 'light'
                      ? 'bg-white text-amber-800 shadow-md ring-1 ring-black/5 scale-[1.02]'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <SunIcon size={14} className={appTheme === 'light' ? 'text-amber-500' : ''} />
                  <span>{t('theme_mode_light') || "Kunduzgi"}</span>
                </button>

                {/* Tungi (Dark) */}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_APP_THEME', theme: 'dark' })}
                  className={`py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    appTheme === 'dark'
                      ? 'bg-[#2f2a24] text-amber-300 shadow-md border border-[#483f34] scale-[1.02]'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MoonIcon size={14} className={appTheme === 'dark' ? 'text-amber-400' : ''} />
                  <span>{t('theme_mode_dark') || "Tungi"}</span>
                </button>

                {/* Tizim / Avto (System) */}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_APP_THEME', theme: 'system' })}
                  className={`py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    appTheme === 'system'
                      ? isLight
                        ? 'bg-white text-emerald-800 shadow-md ring-1 ring-black/5 scale-[1.02]'
                        : 'bg-[#2f2a24] text-emerald-300 shadow-md border border-[#483f34] scale-[1.02]'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MonitorIcon size={14} className={appTheme === 'system' ? 'text-emerald-500' : ''} />
                  <span>{t('theme_mode_system') || "Tizim"}</span>
                </button>
              </div>
            </div>

            {/* 1.2 Shaxmat Doskasi Uslubi */}
            <button
              onClick={() => setShowThemeModal(true)}
              className={`w-full p-4 flex items-center justify-between text-left transition-all cursor-pointer ${cardHover}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border shrink-0 ${iconBox}`}>
                  <ChessPawnIcon size={18} />
                </div>
                <div className="min-w-0">
                  <span className={`font-bold text-sm block truncate ${textTitle}`}>
                    {t('board_theme_setting')}
                  </span>
                  <p className={`text-[10px] sm:text-[11px] truncate ${textSub}`}>
                    {THEME_NAMES[boardTheme]?.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Kataklar rangi miniatyurasi */}
                <div className="flex items-center border border-black/20 rounded-md overflow-hidden shadow-xs">
                  <span className="w-3.5 h-3.5" style={{ backgroundColor: THEME_NAMES[boardTheme]?.lightSq }} />
                  <span className="w-3.5 h-3.5" style={{ backgroundColor: THEME_NAMES[boardTheme]?.darkSq }} />
                </div>
                <ChevronRightIcon size={16} className={isLight ? 'text-zinc-400' : 'text-[#686560]'} />
              </div>
            </button>

            {/* 1.3 3D Fazoviy Doska (Kitobdagidek) */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border shrink-0 ${iconBox}`}>
                  🎲
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-sm truncate ${textTitle}`}>
                      3D Fazoviy Doska
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      3D
                    </span>
                  </div>
                  <p className={`text-[10px] sm:text-[11px] truncate ${textSub}`}>
                    {is3D ? 'Haqiqiy yogʻoch taxta va tik turgan donalar' : 'Klassik 2D tekis doska'}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={is3D}
                onChange={() => dispatch({ type: 'TOGGLE_3D' })}
                activeColor="bg-amber-500"
                isLight={isLight}
              />
            </div>

            {/* 1.4 1–100 Raqamli Notatsiya */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-black border shrink-0 ${iconBox}`}>
                  100
                </div>
                <div className="min-w-0">
                  <span className={`font-bold text-sm truncate ${textTitle}`}>
                    {t('notation_setting')}
                  </span>
                  <p className={`text-[10px] sm:text-[11px] truncate ${textSub}`}>
                    {t('notation_desc')}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={useNumericNotation}
                onChange={() => dispatch({ type: 'TOGGLE_NOTATION' })}
                isLight={isLight}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            2-BO'LIM: OVOZ VA HISSIYOT (SOUND & HAPTICS)
            ══════════════════════════════════════════════ */}
        <section className="flex flex-col gap-2">
          <div className={`text-[11px] font-black uppercase tracking-wider px-1 ${sectionTitle}`}>
            {t('section_sound') || "Ovoz va Hissiyot"}
          </div>

          <div className={`rounded-2xl border ${cardBg} overflow-hidden divide-y ${isLight ? 'divide-[#f0ede6]' : 'divide-[#2b2621]'}`}>
            {/* 2.1 Ovoz Effektlari (Master Toggle) */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${iconBox}`}>
                  {soundEnabled ? <Volume2Icon size={18} className="text-[#81b64c]" /> : <VolumeXIcon size={18} className="text-zinc-400" />}
                </div>
                <div>
                  <span className={`font-bold text-sm ${textTitle}`}>{t('sound_setting')}</span>
                  <p className={`text-[10px] sm:text-[11px] ${textSub}`}>
                    {soundEnabled ? "Yurish, urish va rokirovka tovushlari" : "Ovoz oʻchirilgan"}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={soundEnabled}
                onChange={() => dispatch({ type: 'TOGGLE_SOUND' })}
                isLight={isLight}
              />
            </div>

            {/* 2.2 Tovush To'plami & Tovushlarni Sinash */}
            {soundEnabled && (
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${textSub}`}>
                    {t('sound_theme_setting')}:
                  </span>
                  <button
                    onClick={() => setShowSoundThemeModal(true)}
                    className={`px-3 py-1 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      isLight
                        ? 'bg-amber-500/15 text-amber-800 border-amber-500/30 hover:bg-amber-500/25'
                        : 'bg-[#2a241e] text-amber-300 border-[#453c31] hover:bg-[#383027]'
                    }`}
                  >
                    <span>{SOUND_THEME_NAMES[soundTheme]}</span>
                    <ChevronRightIcon size={13} className={isLight ? 'text-amber-700' : 'text-amber-400'} />
                  </button>
                </div>

                {/* Tovushlarni Sinab Ko'rish Tugmalari */}
                <div className="pt-1">
                  <div className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {t('sound_test_title')}:
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => testAudioTone('move')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-black border transition-all active:scale-95 text-center cursor-pointer ${
                        isLight
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
                          : 'bg-[#27231e] hover:bg-[#342f28] text-slate-200 border-[#3d362e]'
                      }`}
                    >
                      {t('test_move')}
                    </button>
                    <button
                      onClick={() => testAudioTone('capture')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-black border transition-all active:scale-95 text-center cursor-pointer ${
                        isLight
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border-rose-800/40'
                      }`}
                    >
                      {t('test_capture')}
                    </button>
                    <button
                      onClick={() => testAudioTone('nur')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-black border transition-all active:scale-95 text-center cursor-pointer ${
                        isLight
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border-amber-800/40'
                      }`}
                    >
                      {t('test_nur')}
                    </button>
                    <button
                      onClick={() => testAudioTone('check')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-black border transition-all active:scale-95 text-center cursor-pointer ${
                        isLight
                          ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                          : 'bg-red-950/30 hover:bg-red-900/40 text-red-300 border-red-800/40'
                      }`}
                    >
                      {t('test_check')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2.3 Tebranish (Vibratsiya) */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border shrink-0 ${iconBox}`}>
                  📳
                </div>
                <div>
                  <span className={`font-bold text-sm ${textTitle}`}>{t('vibration_setting')}</span>
                  <p className={`text-[10px] sm:text-[11px] ${textSub}`}>
                    {vibrationEnabled ? "Yurish va urishlarda tebranish signali" : "Tebranish oʻchirilgan"}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={vibrationEnabled}
                onChange={() => setVibrationEnabled(!vibrationEnabled)}
                isLight={isLight}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3-BO'LIM: TIL VA HUDUD (LANGUAGE & REGION)
            ══════════════════════════════════════════════ */}
        <section className="flex flex-col gap-2">
          <div className={`text-[11px] font-black uppercase tracking-wider px-1 ${sectionTitle}`}>
            {t('section_general') || "Til va Hudud"}
          </div>

          <div className={`rounded-2xl border ${cardBg} overflow-hidden`}>
            <button
              onClick={() => setShowLangModal(true)}
              className={`w-full p-4 flex items-center justify-between text-left transition-all cursor-pointer ${cardHover}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border shrink-0 ${iconBox}`}>
                  <GlobeIcon size={18} className="text-[#81b64c]" />
                </div>
                <div className="min-w-0">
                  <span className={`font-bold text-sm block truncate ${textTitle}`}>
                    {t('lang_setting')}
                  </span>
                  <p className={`text-[10px] sm:text-[11px] truncate ${textSub}`}>
                    5 xil til mavjud (Oʻzbekcha, Kirillcha, Ruscha, Inglizcha, Qoraqalpoqcha)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                  isLight
                    ? 'bg-[#81b64c]/15 text-[#54802c] border-[#81b64c]/30'
                    : 'bg-[#81b64c]/20 text-[#9cd267] border-[#81b64c]/40'
                }`}>
                  {currentLangObj.flag} {currentLangObj.name}
                </span>
                <ChevronRightIcon size={16} className={isLight ? 'text-zinc-400' : 'text-[#686560]'} />
              </div>
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4-BO'LIM: QOIDALAR VA ILОVA HAQIDA (ABOUT & RULES)
            ══════════════════════════════════════════════ */}
        <section className="flex flex-col gap-2">
          <div className={`text-[11px] font-black uppercase tracking-wider px-1 ${sectionTitle}`}>
            {t('section_about') || "Maʻlumot va Qoidalar"}
          </div>

          <div className={`rounded-2xl border ${cardBg} overflow-hidden divide-y ${isLight ? 'divide-[#f0ede6]' : 'divide-[#2b2621]'}`}>
            {/* 4.1 Yordam va Qoidalar */}
            <button
              onClick={() => {
                if (onOpenRules) {
                  onOpenRules();
                } else {
                  setShowHelpModal(true);
                }
              }}
              className={`w-full p-4 flex items-center justify-between text-left transition-all cursor-pointer ${cardHover}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border shrink-0 ${iconBox}`}>
                  <BookOpenIcon size={18} />
                </div>
                <div>
                  <span className={`font-bold text-sm ${textTitle}`}>{t('help_setting')}</span>
                  <p className={`text-[10px] sm:text-[11px] ${textSub}`}>
                    10x10 shaxmat, Nur donasi va 3 xil rokirovka qoʻllanmasi
                  </p>
                </div>
              </div>
              <ChevronRightIcon size={16} className={isLight ? 'text-zinc-400' : 'text-[#686560]'} />
            </button>

            {/* 4.2 Biz Haqimizda & Patent */}
            <button
              onClick={() => setShowAboutModal(true)}
              className={`w-full p-4 flex items-center justify-between text-left transition-all cursor-pointer ${cardHover}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border shrink-0 ${iconBox}`}>
                  <UserIcon size={18} />
                </div>
                <div>
                  <span className={`font-bold text-sm ${textTitle}`}>{t('about_setting')}</span>
                  <p className={`text-[10px] sm:text-[11px] ${textSub}`}>
                    Muallif: Nurfullo Nurmatov · UzAvtor № 000-002-853
                  </p>
                </div>
              </div>
              <ChevronRightIcon size={16} className={isLight ? 'text-zinc-400' : 'text-[#686560]'} />
            </button>
          </div>
        </section>

        {/* Versiya & Mualliflik Matni */}
        <div className="text-center pt-2 pb-6 select-none">
          <div className={`text-xs font-mono font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Nur Shaxmat 100 • v1.1.4
          </div>
          <div className={`text-[10px] mt-0.5 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Oʻzbekiston Milliy Shaxmati © 2026
          </div>
        </div>
      </main>

      {/* ── MODALLAR ── */}

      {/* 1. Til Tanlash Modali */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-3xl p-6 max-w-xs w-full space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}>
            <h3 className="text-base font-black">{t('select_lang_title')}</h3>
            <div className="space-y-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    dispatch({ type: 'SET_LANGUAGE', language: lang.code });
                    setShowLangModal(false);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all cursor-pointer ${
                    currentLang === lang.code
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/60 font-black'
                      : isLight
                      ? 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {currentLang === lang.code && <span>✓</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLangModal(false)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                isLight ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {t('close_btn')}
            </button>
          </div>
        </div>
      )}

      {/* 2. Tovush Mavzusi Modali */}
      {showSoundThemeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-3xl p-6 max-w-xs w-full space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}>
            <h3 className="text-base font-black">{t('select_sound_theme_title')}</h3>
            <div className="space-y-2">
              {(['wood', 'marble', 'digital', 'crystal'] as SoundTheme[]).map((th) => (
                <button
                  key={th}
                  onClick={() => {
                    setSoundTheme(th);
                    setSoundThemeState(th);
                    testAudioTone('move');
                    setShowSoundThemeModal(false);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all cursor-pointer ${
                    soundTheme === th
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/60 font-black'
                      : isLight
                      ? 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{SOUND_THEME_NAMES[th]}</span>
                  {soundTheme === th && <span>✓</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSoundThemeModal(false)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                isLight ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {t('close_btn')}
            </button>
          </div>
        </div>
      )}

      {/* 3. Dosqa Mavzusi Modali */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-3xl p-6 max-w-xs w-full space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}>
            <h3 className="text-base font-black">Dosqa Uslubini Tanlang</h3>
            <div className="space-y-2">
              {(['wood', 'emerald', 'azure', 'marble'] as BoardTheme[]).map((th) => (
                <button
                  key={th}
                  onClick={() => {
                    dispatch({ type: 'SET_THEME', theme: th });
                    setShowThemeModal(false);
                  }}
                  className={`w-full py-3 px-3.5 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all cursor-pointer ${
                    boardTheme === th
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/60 font-black'
                      : isLight
                      ? 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center border border-black/30 rounded overflow-hidden shadow-xs">
                      <span className="w-3.5 h-3.5" style={{ backgroundColor: THEME_NAMES[th]?.lightSq }} />
                      <span className="w-3.5 h-3.5" style={{ backgroundColor: THEME_NAMES[th]?.darkSq }} />
                    </div>
                    <span>{THEME_NAMES[th]?.title}</span>
                  </div>
                  {boardTheme === th && <span>✓</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowThemeModal(false)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                isLight ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* 4. Biz Haqimizda Modali — Rasmiy Muallif, Patent va Kitob ma'lumotlari */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
            {/* Yuqori Logotip va Sarlavha */}
            <div className="flex flex-col items-center text-center pt-1">
              <NurLogo size={84} showGlow={true} />
              <h3 className="text-lg sm:text-xl font-black text-amber-300 mt-2">
                NUR CHESS 100
              </h3>
              <p className="text-[11px] font-bold text-amber-200/80 uppercase tracking-widest">
                Oʻzbek Shaxmati · Aql, Sabr va Gʻalaba
              </p>
            </div>

            {/* Mualliflik va Patent Guvohnomasi */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-base">📜</span>
                <span className="text-xs font-black text-amber-300">
                  Rasmiy Intellektual Mulk Guvohnomasi
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Ўзбекистон Республикаси Муаллифлик ва турдош ҳуқуқларни ҳимоя қилиш жамияти (UzAvtor) томонидан депонентлаштирилган:
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono">
                <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Guvohnoma:</span>
                  <span className="text-amber-400 font-black">№ 000-002-853</span>
                </div>
                <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Sana / Muddat:</span>
                  <span className="text-slate-200 font-bold">09.12.2025–2030</span>
                </div>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold pt-1">
                ✓ Xalqaro shaxmat federatsiyasi (FIDE) standartlariga toʻliq mos keladi.
              </p>
            </div>

            {/* Muallif Haqida */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-base">👤</span>
                <span className="text-xs font-black text-slate-100">
                  Ixtirochi va Muallif Haqida
                </span>
              </div>
              <p className="text-xs font-black text-amber-400">
                Nurfullo NURMATOV
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Muallif 1970-yillardagi talabalik davridan boshlab 50 yillik izlanishlar va hayotiy tajribalar asosida 64 katakli shaxmatni 100 katakli formatga kengaytirib, yangi <strong className="text-amber-300">«Nur»</strong> donasi va 3 xil rokirovkaga ega mukammal oʻyin tizimini yaratdi.
              </p>
              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 space-y-0.5">
                <div>• Oʻzbekiston Qishloq va Suv xoʻjaligi vazirliklari aʼlochisi medali</div>
                <div>• Oʻzbekiston Respublikasi «Mehnat faxriysi»</div>
                <div>• 28 yil «Navoiy Suvloyiha» davlat unitar korxonasi direktori</div>
              </div>
            </div>

            {/* Ilmiy va Mutaxassislar Xulosalari */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-base">🎓</span>
                <span className="text-xs font-black text-slate-100">
                  Rasmiy Ekspertiza va Ilmiy Xulosalar
                </span>
              </div>
              <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside">
                <li><strong className="text-slate-200">Prof. O. Ochilov</strong> — OʻzMU huzuridagi Nanotexnologiyalar markazi laboratoriya mudiri, f.-m.f.d.</li>
                <li><strong className="text-slate-200">Prof. M. J. Abdullayev</strong> — BuxDU Sport nazariyasi va metodikasi mudiri, p.f.d. (DSc).</li>
                <li><strong className="text-slate-200">I. I. Haydarov</strong> — Oʻzbekiston Shaxmat federatsiyasi Navoiy viloyati boʻlimi rahbari.</li>
                <li><strong className="text-slate-200">Shaxmat ustalari:</strong> M. Xushmurodova, O. Karimova, N. Umurzoqova.</li>
              </ul>
            </div>

            {/* Nashriyot va Aloqa */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 text-left space-y-1">
              <div><strong>Kitob:</strong> «NUR CHESS 100» oʻquv-metodik qoʻllanmasi (56 bet), 2026 y.</div>
              <div><strong>ISBN:</strong> 978-9910-622-75-5 · «Texno Print Navoiy» nashriyoti.</div>
              <div><strong>Muallif bilan aloqa:</strong> (90) 665-58-44, (93) 665-58-44, (90) 717-44-54</div>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* 5. Yordam Modali */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-amber-300">Yordam & Boshqaruv</h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Donani tanlash uchun uning ustiga bosing, soʻng yashil katakka bosing.</li>
              <li>Donani sudrab olib borib ham tashlashingiz mumkin.</li>
              <li>P2P Onlayn oʻyinda xona kodini doʻstingizga ulashasiz.</li>
              <li>Piyoda 10-qatorga yetganda Vazir, Nur, Tura, Fil yoki Otga aylanadi.</li>
            </ul>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
