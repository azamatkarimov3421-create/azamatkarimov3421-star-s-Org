// =====================================================
// NUR CHESS 100 — 3. O'yin Maydoni Ekrani (10x10 Game Screen)
// =====================================================

import React, { useState } from 'react';
import { useGame } from '../store/gameStore';
import Board from '../components/Board';
import EvalBar from '../components/EvalBar';
import GameStatusBar from '../components/GameStatusBar';
import { ChessClock } from '../components/ChessClock';
import MoveHistory from '../components/MoveHistory';
import { getUserProfile } from '../store/userProfileStore';
import { getBestMove } from '../ai/minimax';

interface GameScreenProps {
  onBack: () => void;
  onOpenSettings?: () => void;
}

export default function GameScreen({ onBack, onOpenSettings }: GameScreenProps) {
  const { state, dispatch } = useGame();
  const { game, gameMode, roomCode, onlinePlayerColor, isFlipped, history } = state;
  const { status, currentTurn, moveHistory } = game;

  const [hintLoading, setHintLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const userProfile = getUserProfile();

  const isGameOver = status !== 'playing' && status !== 'check';
  const isMyTurn = (gameMode === 'online' && onlinePlayerColor)
    ? currentTurn === onlinePlayerColor
    : (gameMode === 'vsAI')
    ? currentTurn === 'white'
    : true;

  // Sarlavha matni
  const modeTitle =
    gameMode === 'online'
      ? `Onlayn oʻyin #${roomCode || ''}`
      : gameMode === 'vsAI'
      ? 'Kompyuter bilan'
      : "Doʻst bilan";

  // Maslahat
  const handleGetHint = () => {
    if (isGameOver || hintLoading) return;
    setHintLoading(true);
    setTimeout(() => {
      try {
        const best = getBestMove(game, 2);
        if (best) dispatch({ type: 'SET_HINT', move: best });
      } catch (e) {
        console.error(e);
      } finally {
        setHintLoading(false);
      }
    }, 40);
  };

  // Raqib ma'lumotlari
  const opponentName =
    gameMode === 'online'
      ? 'Akmal_2005'
      : gameMode === 'vsAI'
      ? 'Kompyuter (AI)'
      : '2-Oʻyinchi';
  const opponentRating = gameMode === 'online' ? 1520 : 1500;

  // Yuqori va pastki o'yinchilar ranglari
  const topColor = isFlipped ? 'white' : 'black';
  const bottomColor = isFlipped ? 'black' : 'white';

  const isTopTurn = currentTurn === topColor && !isGameOver;
  const isBottomTurn = currentTurn === bottomColor && !isGameOver;

  return (
    <div className="min-h-screen w-full bg-[#070b12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,20,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col justify-between font-sans select-none pb-6 max-w-md mx-auto sm:max-w-xl">
      {/* ── 1. YUQORI HEADER ────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between pt-[max(0.7rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 flex items-center justify-center text-base font-bold transition-all active:scale-95"
          title="Bosh menyuga qaytish"
        >
          ←
        </button>

        <div className="text-center">
          <h2 className="text-sm sm:text-base font-black text-slate-100 tracking-tight">
            {modeTitle}
          </h2>
          <div className="text-[11px] font-bold flex items-center justify-center gap-1.5 mt-0.5">
            {isMyTurn && !isGameOver ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Sizning navbatingiz
              </span>
            ) : !isGameOver ? (
              <span className="text-amber-400/90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Raqib navbati
              </span>
            ) : (
              <span className="text-slate-400">Oʻyin tugadi</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="relative w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 flex items-center justify-center text-sm transition-all active:scale-95"
            title="Harakatlar tarixi"
          >
            📜
            {moveHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {moveHistory.length}
              </span>
            )}
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 flex items-center justify-center text-sm transition-all active:scale-95"
            title="Doskani aylantirish"
          >
            🔄
          </button>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 flex items-center justify-center text-sm transition-all active:scale-95"
              title="Sozlamalar"
            >
              ⚙️
            </button>
          )}
        </div>
      </header>

      {/* ── 2. ASOSIY MAYDON (O'YINCHI 1 + DOSQA + O'YINCHI 2) ──────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center gap-2 px-2 sm:px-4 py-2">
        {/* Status ogohlantirish (Shoh va b.) */}
        <GameStatusBar />

        {/* Yuqoridagi O'yinchi Kartasi (Mockup #3 uslubida) */}
        <div
          className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl border transition-all duration-200 ${
            isTopTurn
              ? 'bg-slate-900/90 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40'
              : 'bg-slate-900/50 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-lg font-bold shadow-inner">
              {topColor === 'black' ? '👤' : '🤖'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm text-slate-100">
                  {opponentName}
                </span>
                <span className="text-xs" title="Oʻzbekiston">🇺🇿</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono font-semibold">
                {opponentRating} reyting
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold text-amber-300">
              <span>⏱️</span>
              <ChessClock color={topColor} />
            </div>
          </div>
        </div>

        {/* 10x10 Dosqa va Baholash Indikatori */}
        <div className="w-full flex flex-col items-center justify-center gap-1.5 my-1">
          <EvalBar />
          <Board />
        </div>

        {/* Pastdagi O'yinchi Kartasi (Mockup #3 uslubida — Siz) */}
        <div
          className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl border transition-all duration-200 ${
            isBottomTurn
              ? 'bg-slate-900/90 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40'
              : 'bg-slate-900/50 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-lg font-bold shadow-inner text-amber-300">
              👤
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm text-slate-100">
                  {userProfile.name || 'Siz'}
                </span>
                <span className="text-xs" title="Oʻzbekiston">🇺🇿</span>
              </div>
              <div className="text-[10px] text-amber-400/90 font-mono font-semibold">
                {userProfile.rating} reyting
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold text-amber-300">
              <span>⏱️</span>
              <ChessClock color={bottomColor} />
            </div>
          </div>
        </div>
      </main>

      {/* ── 3. PASTKI 3 TA HARAKAT TUGMASI (MOCKUP #3 KABI) ──────────────── */}
      <footer className="px-4 pt-2">
        <div className="grid grid-cols-3 gap-2.5">
          {/* Orqaga */}
          <button
            onClick={() => {
              if (window.confirm("Oʻyindan chiqib bosh menyuga qaytasizmi?")) {
                onBack();
              }
            }}
            className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-extrabold text-xs transition-all active:scale-95 text-center shadow-md flex items-center justify-center gap-1.5"
          >
            <span>←</span>
            <span>Orqaga</span>
          </button>

          {/* Taklif (Durang) */}
          <button
            onClick={() => {
              if (window.confirm("Raqibga durang natijani taklif qilasizmi?")) {
                dispatch({ type: 'OFFER_DRAW' });
              }
            }}
            disabled={isGameOver}
            className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-sky-300 font-extrabold text-xs transition-all active:scale-95 text-center shadow-md flex items-center justify-center gap-1.5"
          >
            <span>🤝</span>
            <span>Taklif</span>
          </button>

          {/* Taslim */}
          <button
            onClick={() => {
              if (window.confirm("Haqiqatan ham taslim boʻlmoqchimisiz?")) {
                dispatch({ type: 'RESIGN' });
              }
            }}
            disabled={isGameOver}
            className="py-3 px-3 rounded-2xl bg-red-950/40 hover:bg-red-900/50 border border-red-900/50 disabled:opacity-40 text-red-400 font-extrabold text-xs transition-all active:scale-95 text-center shadow-md flex items-center justify-center gap-1.5"
          >
            <span>🏳️</span>
            <span>Taslim</span>
          </button>
        </div>

        {/* Qo'shimcha Tezkor tugmalar (Bekor & Maslahat) */}
        <div className="flex items-center justify-between gap-2 mt-2 px-1 text-xs">
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={history.length === 0 || isGameOver || gameMode === 'online'}
            className="text-slate-400 hover:text-slate-200 disabled:opacity-30 flex items-center gap-1 text-[11px] font-semibold"
          >
            <span>↩️</span>
            <span>Yurishni bekor qilish</span>
          </button>

          <button
            onClick={handleGetHint}
            disabled={isGameOver || hintLoading}
            className="text-cyan-400 hover:text-cyan-300 disabled:opacity-30 flex items-center gap-1 text-[11px] font-semibold"
          >
            <span>💡</span>
            <span>{hintLoading ? 'Hisoblanmoqda...' : 'AI Maslahati'}</span>
          </button>
        </div>
      </footer>

      {/* Harakatlar tarixi modali */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl flex flex-col max-h-[85vh] pb-[max(1.2rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-2 font-black text-sm text-slate-100">
                <span className="text-lg">📜</span>
                <span>Harakatlar Tarixi</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MoveHistory className="h-[60vh] w-full border-none shadow-none bg-transparent" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
