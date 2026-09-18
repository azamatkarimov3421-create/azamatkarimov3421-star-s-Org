import React, { useState } from 'react';
import { BoardTheme, useGame } from '../store/gameStore';
import NurLogo from '../components/NurLogo';
import {
  ArrowLeftIcon,
  Volume2Icon,
  VolumeXIcon,
  GlobeIcon,
  ChevronRightIcon,
  BookOpenIcon,
  BotIcon,
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
  getAppLanguage,
  setAppLanguage,
  t,
  AppLanguage,
} from '../i18n/translations';

interface SettingsScreenProps {
  onBack: () => void;
  onOpenRules?: () => void;
}

export default function SettingsScreen({ onBack, onOpenRules }: SettingsScreenProps) {
  const { state, dispatch } = useGame();
  const { boardTheme, soundEnabled, useNumericNotation, is3D } = state;
  const [currentLang, setCurrentLangState] = useState<AppLanguage>(getAppLanguage());
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>(getSoundTheme());
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showSoundThemeModal, setShowSoundThemeModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const THEME_NAMES: Record<BoardTheme, string> = {
    wood: 'Rasmiy Nur 100 (Sariq & Shaftoli)',
    emerald: 'Zumrad Turniri',
    azure: 'Zangori Osmon',
    marble: 'Marmar & Obsidiyan',
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen w-full bg-[#262421] text-[#f1f1f1] flex flex-col font-sans select-none pb-12 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#21201d]/95 backdrop-blur-md border-b border-[#383531] px-4 py-3 flex items-center gap-3 pt-[max(0.7rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
          title="Orqaga"
        >
          <ArrowLeftIcon size={18} />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-white">
            {t('settings_title')}
          </h2>
          <p className="text-xs text-[#9b9893]">{t('settings_subtitle')}</p>
        </div>
      </header>

      {/* Sozlamalar Ro'yxati */}
      <main className="flex-1 px-4 py-4 flex flex-col md:grid md:grid-cols-2 gap-3">
        {/* 1. Til */}
        <button
          onClick={() => setShowLangModal(true)}
          className="p-3.5 rounded-2xl bg-[#21201d] hover:bg-[#282622] border border-[#383531] flex items-center justify-between shadow-sm text-left active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#81b64c]">
              <GlobeIcon size={18} />
            </div>
            <div>
              <span className="font-bold text-sm text-white">{t('lang_setting')}</span>
              <p className="text-[10px] text-[#9b9893]">5 xil til mavjud</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#81b64c] font-bold">
            <span>{currentLangObj.flag} {currentLangObj.name}</span>
            <ChevronRightIcon size={16} className="text-[#686560]" />
          </div>
        </button>

        {/* 2. Ovoz (Toggle + Tovush mavzulari + Sinov tugmalari) */}
        <div className="p-3.5 rounded-2xl bg-[#21201d] border border-[#383531] flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#81b64c]">
                {soundEnabled ? <Volume2Icon size={18} /> : <VolumeXIcon size={18} />}
              </div>
              <span className="font-bold text-sm text-white">{t('sound_setting')}</span>
            </div>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
                soundEnabled ? 'bg-[#81b64c] justify-end' : 'bg-[#383531] justify-start'
              }`}
            >
              <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform" />
            </button>
          </div>

          {/* Tovush Mavzusi */}
          {soundEnabled && (
            <div className="border-t border-[#312e2b] pt-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#c3c2be]">{t('sound_theme_setting')}:</span>
              <button
                onClick={() => setShowSoundThemeModal(true)}
                className="px-2.5 py-1 rounded-lg bg-[#2c2a26] hover:bg-[#383531] border border-[#3d3a34] text-xs font-bold text-amber-400 flex items-center gap-1.5 transition-all"
              >
                <span>{SOUND_THEME_NAMES[soundTheme]}</span>
                <ChevronRightIcon size={14} className="text-[#888]" />
              </button>
            </div>
          )}

          {/* Tovushlarni Sinash */}
          {soundEnabled && (
            <div className="border-t border-[#312e2b] pt-2.5">
              <div className="text-[11px] font-bold text-[#81b64c] mb-1.5">{t('sound_test_title')}:</div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => testAudioTone('move')}
                  className="py-1.5 px-1 bg-[#2c2a26] hover:bg-[#383531] active:scale-95 border border-[#3d3a34] rounded-xl text-[11px] font-bold text-slate-200 transition-all text-center shadow-sm"
                >
                  {t('test_move')}
                </button>
                <button
                  onClick={() => testAudioTone('capture')}
                  className="py-1.5 px-1 bg-[#2c2a26] hover:bg-[#383531] active:scale-95 border border-[#3d3a34] rounded-xl text-[11px] font-bold text-rose-300 transition-all text-center shadow-sm"
                >
                  {t('test_capture')}
                </button>
                <button
                  onClick={() => testAudioTone('nur')}
                  className="py-1.5 px-1 bg-[#2c2a26] hover:bg-[#383531] active:scale-95 border border-[#3d3a34] rounded-xl text-[11px] font-bold text-amber-300 transition-all text-center shadow-sm"
                >
                  {t('test_nur')}
                </button>
                <button
                  onClick={() => testAudioTone('check')}
                  className="py-1.5 px-1 bg-[#2c2a26] hover:bg-[#383531] active:scale-95 border border-[#3d3a34] rounded-xl text-[11px] font-bold text-yellow-300 transition-all text-center shadow-sm"
                >
                  {t('test_check')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. 1–100 Raqamli Notatsiya */}
        <div className="p-3.5 rounded-2xl bg-[#21201d] border border-[#383531] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#f5b041] font-mono font-black text-xs">
              100
            </div>
            <div>
              <span className="font-bold text-sm text-white">{t('notation_setting')}</span>
              <p className="text-[10px] text-[#9b9893]">{t('notation_desc')}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_NOTATION' })}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
              useNumericNotation ? 'bg-[#81b64c] justify-end' : 'bg-[#383531] justify-start'
            }`}
          >
            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>

        {/* 3.1. 3D Fazoviy Ko'rinish (Kitobdagidek) */}
        <div className="p-3.5 rounded-2xl bg-[#21201d] border border-[#383531] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-amber-400 font-black text-sm">
              🎲
            </div>
            <div>
              <span className="font-bold text-sm text-white">3D Fazoviy Doska</span>
              <p className="text-[10px] text-[#9b9893]">
                {is3D ? 'Kitobdagidek yogʻoch taxta va tik turgan donalar' : 'Standart 2D tekis doska'}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_3D' })}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
              is3D ? 'bg-amber-500 justify-end' : 'bg-[#383531] justify-start'
            }`}
          >
            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>

        {/* 4. Tebranish (Vibratsiya) */}
        <div className="p-3.5 rounded-2xl bg-[#21201d] border border-[#383531] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#5dade2] text-sm">
              📳
            </div>
            <span className="font-bold text-sm text-white">{t('vibration_setting')}</span>
          </div>
          <button
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
              vibrationEnabled ? 'bg-[#81b64c] justify-end' : 'bg-[#383531] justify-start'
            }`}
          >
            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>

        {/* 5. Shaxmat doskasi uslubi */}
        <button
          onClick={() => setShowThemeModal(true)}
          className="p-3.5 rounded-2xl bg-[#21201d] hover:bg-[#282622] border border-[#383531] flex items-center justify-between shadow-sm text-left active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#f5b041]">
              <ChessPawnIcon size={18} />
            </div>
            <span className="font-bold text-sm text-white">{t('board_theme_setting')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#81b64c] font-bold">
            <span>{THEME_NAMES[boardTheme]}</span>
            <ChevronRightIcon size={16} className="text-[#686560]" />
          </div>
        </button>

        {/* 6. Yordam va Qo'llanma */}
        <button
          onClick={() => {
            if (onOpenRules) {
              onOpenRules();
            } else {
              setShowHelpModal(true);
            }
          }}
          className="p-3.5 rounded-2xl bg-[#21201d] hover:bg-[#282622] border border-[#383531] flex items-center justify-between shadow-sm text-left active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#9b9893]">
              <BookOpenIcon size={18} />
            </div>
            <span className="font-bold text-sm text-white">{t('help_setting')}</span>
          </div>
          <ChevronRightIcon size={16} className="text-[#686560]" />
        </button>

        {/* 8. Biz haqimizda */}
        <button
          onClick={() => setShowAboutModal(true)}
          className="p-3.5 rounded-2xl bg-[#21201d] hover:bg-[#282622] border border-[#383531] flex items-center justify-between shadow-sm text-left active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#e0dfdc]">
              <UserIcon size={18} />
            </div>
            <span className="font-bold text-sm text-white">{t('about_setting')}</span>
          </div>
          <ChevronRightIcon size={16} className="text-[#686560]" />
        </button>

        {/* Ilova versiyasi (oddiy belgi) */}
        <div className="text-center text-xs text-[#686560] py-3 select-none">
          Nur Shaxmat 100 • v1.0.8
        </div>
      </main>

      {/* Til Tanlash Modali */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xs w-full space-y-4">
            <h3 className="text-base font-black text-slate-100">{t('select_lang_title')}</h3>
            <div className="space-y-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setAppLanguage(lang.code);
                    setCurrentLangState(lang.code);
                    setShowLangModal(false);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all ${
                    currentLang === lang.code
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
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
              className="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
            >
              {t('close_btn')}
            </button>
          </div>
        </div>
      )}

      {/* Tovush Mavzusi Modali */}
      {showSoundThemeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xs w-full space-y-4">
            <h3 className="text-base font-black text-slate-100">{t('select_sound_theme_title')}</h3>
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
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all ${
                    soundTheme === th
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
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
              className="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
            >
              {t('close_btn')}
            </button>
          </div>
        </div>
      )}

      {/* Dosqa Mavzusi Modali */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xs w-full space-y-4">
            <h3 className="text-base font-black text-slate-100">Dosqa Uslubini Tanlang</h3>
            <div className="space-y-2">
              {(['wood', 'emerald', 'azure', 'marble'] as BoardTheme[]).map((th) => (
                <button
                  key={th}
                  onClick={() => {
                    dispatch({ type: 'SET_THEME', theme: th });
                    setShowThemeModal(false);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all ${
                    boardTheme === th
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{THEME_NAMES[th]}</span>
                  {boardTheme === th && <span>✓</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowThemeModal(false)}
              className="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* Biz Haqimizda Modali — Rasmiy Muallif, Patent va Kitob ma'lumotlari */}
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
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* Yordam Modali */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-black text-amber-300">Yordam & Boshqaruv</h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Donani tanlash uchun uning ustiga bosing, soʻng yashil katakka bosing.</li>
              <li>Donani sudrab olib borib ham tashlashingiz mumkin.</li>
              <li>P2P Onlayn oʻyinda xona kodini doʻstingizga ulashasiz.</li>
              <li>Piyoda 10-qatorga yetganda Vazir, Nur, Tura, Fil yoki Otga aylanadi.</li>
            </ul>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
