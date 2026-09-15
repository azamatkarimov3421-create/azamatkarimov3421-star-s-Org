// =====================================================
// NUR SHAXMAT 100 — Asosiy Ilova (Master Layout)
// =====================================================

import React from 'react';
import { BoardTheme, GameProvider, useGame } from './store/gameStore';
import Board from './components/Board';
import MoveHistory from './components/MoveHistory';
import { PlayerCard } from './components/CapturedPieces';
import GameControls from './components/GameControls';
import GameStatusBar from './components/GameStatusBar';
import PromotionModal from './components/PromotionModal';
import GameOverModal from './components/GameOverModal';

const THEMES: Array<{ id: BoardTheme; name: string; dot: string }> = [
  { id: 'wood', name: 'Klassik Yogʻoch', dot: 'bg-[#b37a4c]' },
  { id: 'emerald', name: 'Zumrad Turniri', dot: 'bg-[#779954]' },
  { id: 'azure', name: 'Zangori Osmon', dot: 'bg-[#4d739e]' },
  { id: 'marble', name: 'Marmar & Obsidiyan', dot: 'bg-[#64748b]' },
];

function AppContent() {
  const { state, dispatch } = useGame();
  const { isFlipped, boardTheme, soundEnabled } = state;

  return (
    <div className="min-h-screen bg-[#070b12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,20,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans">
      {/* ── YUQORI PANEL (HEADER) ────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xl">
        {/* Brend va Logotip */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-2xl animate-pulse">☀️</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-400">
                Nur Shaxmat 100
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Oʻzbek Shaxmati
              </span>
            </div>
            <p className="text-slate-400 text-xs hidden sm:block">
              10×10 dosqa · Nur donasi · 3 xil rokirovka · Yangi qoidalar
            </p>
          </div>
        </div>

        {/* Dosqa Mavzulari va Sozlamalar */}
        <div className="flex items-center gap-3">
          {/* Mavzu tanlagich */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
            {THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => dispatch({ type: 'SET_THEME', theme: th.id })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  boardTheme === th.id
                    ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={th.name}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${th.dot}`} />
                <span className="hidden lg:inline">{th.name}</span>
              </button>
            ))}
          </div>

          {/* Ovoz tugmasi */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
            className={`p-2 rounded-xl border text-sm transition-all ${
              soundEnabled
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'bg-red-500/20 border-red-500/40 text-red-300'
            }`}
            title={soundEnabled ? 'Ovozni oʻchirish' : 'Ovozni yoqish'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Doskani aylantirish */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
            className={`p-2 rounded-xl border text-sm transition-all ${
              isFlipped
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Doskani aylantirish (Oq / Qora)"
          >
            🔄
          </button>
        </div>
      </header>

      {/* ── ASOSIY MAYDON (ARENA) ────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col lg:flex-row items-start justify-center gap-5">
        {/* Chap ustun: Boshqaruv va ogohlantirishlar */}
        <aside className="w-full lg:w-[260px] flex flex-col gap-3 order-2 lg:order-1 flex-shrink-0">
          <GameStatusBar />
          <GameControls />
        </aside>

        {/* Markaziy ustun: Yuqori o'yinchi + Dosqa + Quyi o'yinchi */}
        <section className="flex flex-col items-center gap-3 order-1 lg:order-2 flex-shrink-0">
          {/* Yuqoridagi O'yinchi kartasi */}
          <PlayerCard
            playerColor={isFlipped ? 'white' : 'black'}
            position="top"
          />

          {/* 10x10 Dosqa */}
          <Board />

          {/* Pastdagi O'yinchi kartasi */}
          <PlayerCard
            playerColor={isFlipped ? 'black' : 'white'}
            position="bottom"
          />
        </section>

        {/* O'ng ustun: Harakatlar tarixi va qoidalar paneli */}
        <aside className="w-full lg:w-[280px] order-3 flex-shrink-0">
          <MoveHistory />
        </aside>
      </main>

      {/* ── PASTKI QISM (FOOTER) ────────────────────────────── */}
      <footer className="mt-auto bg-slate-950/90 border-t border-slate-900 py-3 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">Nur Shaxmat 100</span>
          <span>·</span>
          <span>Oʻzbekiston Respublikasi</span>
        </div>
        <div className="text-slate-600 text-[11px]">
          100 kvadratlik interaktiv shaxmat platformasi
        </div>
      </footer>

      {/* ── MODALLAR ────────────────────────────────────────── */}
      <PromotionModal />
      <GameOverModal />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
