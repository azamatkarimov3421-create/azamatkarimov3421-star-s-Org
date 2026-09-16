// =====================================================
// NUR CHESS 100 — 4. Sozlamalar Ekrani (Settings Screen)
// =====================================================

import React, { useState } from 'react';
import { BoardTheme, useGame } from '../store/gameStore';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { state, dispatch } = useGame();
  const { boardTheme, soundEnabled, aiDepth } = state;

  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const THEME_NAMES: Record<BoardTheme, string> = {
    wood: 'Klassik Yogʻoch',
    emerald: 'Zumrad Turniri',
    azure: 'Zangori Osmon',
    marble: 'Marmar & Obsidiyan',
  };

  const AI_LABELS = ['', 'Oson', "Oʻrta", 'Kuchli'];

  return (
    <div className="min-h-screen w-full bg-[#070b12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,20,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans select-none pb-12 max-w-md mx-auto sm:max-w-xl">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-4 py-3.5 flex items-center gap-3 pt-[max(0.8rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center text-lg font-bold transition-all active:scale-95"
          title="Orqaga"
        >
          ←
        </button>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-100">
            Sozlamalar
          </h2>
          <p className="text-xs text-slate-400">Ilova va oʻyin parametrlarini sozlang</p>
        </div>
      </header>

      {/* Sozlamalar Ro'yxati */}
      <main className="flex-1 px-4 py-5 flex flex-col gap-2.5">
        {/* 1. Mavzu (Dark) */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌙</span>
            <span className="font-bold text-sm text-slate-200">Mavzu</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>Qorongʻi (Dark)</span>
            <span className="text-slate-600">›</span>
          </div>
        </div>

        {/* 2. Til */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌐</span>
            <span className="font-bold text-sm text-slate-200">Til</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
            <span>Oʻzbekcha</span>
            <span className="text-slate-600">›</span>
          </div>
        </div>

        {/* 3. Ovoz (Toggle) */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔊</span>
            <span className="font-bold text-sm text-slate-200">Ovoz effektlari</span>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
              soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>

        {/* 4. Vibratsiya (Toggle) */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">📳</span>
            <span className="font-bold text-sm text-slate-200">Vibratsiya</span>
          </div>
          <button
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
              vibrationEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>

        {/* 5. Shaxmat doskasi uslubi */}
        <button
          onClick={() => setShowThemeModal(true)}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-md text-left active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">▦</span>
            <span className="font-bold text-sm text-slate-200">Shaxmat doskasi uslubi</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
            <span>{THEME_NAMES[boardTheme]}</span>
            <span className="text-slate-600">›</span>
          </div>
        </button>

        {/* 6. Figuralar uslubi */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">♟</span>
            <span className="font-bold text-sm text-slate-200">Figuralar uslubi</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>Standart 3D</span>
            <span className="text-slate-600">›</span>
          </div>
        </div>

        {/* 7. Qiyinchilik darajasi (AI) */}
        <button
          onClick={() => setShowAiModal(true)}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-md text-left active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <span className="font-bold text-sm text-slate-200">Qiyinchilik darajasi (AI)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
            <span>{AI_LABELS[aiDepth]}</span>
            <span className="text-slate-600">›</span>
          </div>
        </button>

        {/* 8. Yordam */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-md text-left active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">❓</span>
            <span className="font-bold text-sm text-slate-200">Yordam & Koʻrsatmalar</span>
          </div>
          <span className="text-slate-600 font-mono text-sm">›</span>
        </button>

        {/* 9. Biz haqimizda */}
        <button
          onClick={() => setShowAboutModal(true)}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-md text-left active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">ℹ️</span>
            <span className="font-bold text-sm text-slate-200">Biz haqimizda</span>
          </div>
          <span className="text-slate-600 font-mono text-sm">›</span>
        </button>
      </main>

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

      {/* AI Darajasi Modali */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xs w-full space-y-4">
            <h3 className="text-base font-black text-slate-100">AI Qiyinchilik Darajasi</h3>
            <div className="space-y-2">
              {[1, 2, 3].map((depth) => (
                <button
                  key={depth}
                  onClick={() => {
                    dispatch({ type: 'SET_AI_DEPTH', depth });
                    setShowAiModal(false);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all ${
                    aiDepth === depth
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{AI_LABELS[depth]}</span>
                  {aiDepth === depth && <span>✓</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAiModal(false)}
              className="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* Biz Haqimizda Modali */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <span className="text-4xl">👑</span>
            <h3 className="text-lg font-black text-amber-300">Nur Chess 100</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Oʻzbekiston milliy shaxmati — 100 kvadratlik interaktiv shaxmat platformasi. Nur donasi va 3 xil rokirovka qoidalari bilan boyitilgan.
            </p>
            <div className="text-[11px] text-slate-500">Versiya 1.0.0 (APK Release)</div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-md"
            >
              Tushunarli
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
