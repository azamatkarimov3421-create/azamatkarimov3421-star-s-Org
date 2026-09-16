// =====================================================
// NUR CHESS 100 — 3. O'yin Maydoni Ekrani (10x10 Game Screen)
// Chess.com uslubidagi HUD, toza o'yinchi kartochkalari va vektorli boshqaruv
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
import {
  ArrowLeftIcon,
  RotateCwIcon,
  RotateCcwIcon,
  ScrollTextIcon,
  SettingsIcon,
  LightbulbIcon,
  FlagIcon,
  HandshakeIcon,
  BotIcon,
  UserIcon,
  ClockIcon,
} from '../components/Icons';

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
      ? `Onlayn #${roomCode || ''}`
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
      ? 'Raqib'
      : gameMode === 'vsAI'
      ? 'Nur Bot (AI)'
      : '2-Oʻyinchi';
  const opponentRating = gameMode === 'online' ? 1520 : 1500;

  // Yuqori va pastki o'yinchilar ranglari
  const topColor = isFlipped ? 'white' : 'black';
  const bottomColor = isFlipped ? 'black' : 'white';

  const isTopTurn = currentTurn === topColor && !isGameOver;
  const isBottomTurn = currentTurn === bottomColor && !isGameOver;

  return (
    <div className="min-h-screen w-full bg-[#262421] text-[#f1f1f1] flex flex-col justify-between font-sans select-none pb-4 max-w-md mx-auto sm:max-w-xl">
      {/* ── 1. YUQORI HEADER (CHESS.COM MINIMAL) ─────────────────── */}
      <header className="sticky top-0 z-30 bg-[#21201d]/95 backdrop-blur-md border-b border-[#383531] px-4 py-2.5 flex items-center justify-between pt-[max(0.6rem,env(safe-area-inset-top))]">
        <button
          onClick={() => {
            if (moveHistory.length > 0 && !isGameOver) {
              if (window.confirm("Oʻyindan chiqib bosh menyuga qaytasizmi?")) onBack();
            } else {
              onBack();
            }
          }}
          className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
          title="Chiqish"
        >
          <ArrowLeftIcon size={18} />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-extrabold text-white tracking-tight">
            {modeTitle}
          </h2>
          <div className="text-[11px] font-semibold flex items-center justify-center gap-1.5 mt-0.5">
            {isMyTurn && !isGameOver ? (
              <span className="text-[#81b64c] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#81b64c] animate-ping" />
                Sizning navbatingiz
              </span>
            ) : !isGameOver ? (
              <span className="text-[#9b9893] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
                Raqib yurishi
              </span>
            ) : (
              <span className="text-[#9b9893]">Oʻyin yakunlandi</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="relative w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
            title="Harakatlar tarixi"
          >
            <ScrollTextIcon size={18} />
            {moveHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#81b64c] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {moveHistory.length}
              </span>
            )}
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
            className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
            title="Doskani aylantirish"
          >
            <RotateCwIcon size={18} />
          </button>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
              title="Sozlamalar"
            >
              <SettingsIcon size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ── 2. ASOSIY MAYDON (O'YINCHI 1 + DOSQA + O'YINCHI 2) ────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2 sm:px-4 py-1">
        {/* Status ogohlantirish (Shoh va b.) */}
        <GameStatusBar />

        {/* Yuqoridagi O'yinchi Kartasi (Opponent HUD) */}
        <div
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200 ${
            isTopTurn
              ? 'bg-[#21201d] border-[#81b64c]/70 shadow-[0_0_12px_rgba(129,182,76,0.15)] ring-1 ring-[#81b64c]/50'
              : 'bg-[#21201d]/80 border-[#383531]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#c3c2be]">
              {topColor === 'black' ? (
                <BotIcon size={20} className="text-[#81b64c]" />
              ) : (
                <UserIcon size={20} className="text-[#c3c2be]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {opponentName}
                </span>
                <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1.5 py-0.2 rounded">
                  {topColor === 'white' ? 'Oq' : 'Qora'}
                </span>
              </div>
              <div className="text-[10px] text-[#9b9893] font-mono">
                {opponentRating} reyting
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                isTopTurn
                  ? 'bg-[#81b64c] text-white shadow-sm'
                  : 'bg-[#1a1917] text-[#9b9893] border border-[#383531]'
              }`}
            >
              <ClockIcon size={13} />
              <ChessClock color={topColor} />
            </div>
          </div>
        </div>

        {/* 10x10 Dosqa va Baholash Indikatori */}
        <div className="w-full flex flex-col items-center justify-center gap-1 my-0.5">
          <EvalBar />
          <Board />
        </div>

        {/* Pastdagi O'yinchi Kartasi (Sizning HUD) */}
        <div
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200 ${
            isBottomTurn
              ? 'bg-[#21201d] border-white/60 shadow-[0_0_12px_rgba(255,255,255,0.1)] ring-1 ring-white/40'
              : 'bg-[#21201d]/80 border-[#383531]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#81b64c]">
              <UserIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {userProfile.name || 'Siz'}
                </span>
                <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1.5 py-0.2 rounded">
                  {bottomColor === 'white' ? 'Oq' : 'Qora'}
                </span>
              </div>
              <div className="text-[10px] text-[#81b64c] font-mono font-semibold">
                {userProfile.rating} reyting
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                isBottomTurn
                  ? 'bg-white text-[#21201d] font-black shadow-md'
                  : 'bg-[#1a1917] text-[#9b9893] border border-[#383531]'
              }`}
            >
              <ClockIcon size={13} />
              <ChessClock color={bottomColor} />
            </div>
          </div>
        </div>
      </main>

      {/* ── 3. CHESS.COM USLUBIDAGI TAKTIL PASTKI TUGMALAR ─────────── */}
      <footer className="px-3 pt-1">
        <div className="grid grid-cols-4 gap-2">
          {/* Bekor qilish */}
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={history.length === 0 || isGameOver || gameMode === 'online'}
            className="py-2.5 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#c3c2be] hover:text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 active:shadow-[0_0_0_#1a1917]"
            title="Yurishni bekor qilish"
          >
            <RotateCcwIcon size={18} />
            <span className="text-[10px]">Bekor</span>
          </button>

          {/* Maslahat */}
          <button
            onClick={handleGetHint}
            disabled={isGameOver || hintLoading}
            className="py-2.5 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#81b64c] hover:text-[#99cc59] font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 active:shadow-[0_0_0_#1a1917]"
            title="Maslahat"
          >
            <LightbulbIcon size={18} />
            <span className="text-[10px]">{hintLoading ? '...' : 'Maslahat'}</span>
          </button>

          {/* Durang taklif */}
          <button
            onClick={() => {
              if (window.confirm("Raqibga durang natijani taklif qilasizmi?")) {
                dispatch({ type: 'OFFER_DRAW' });
              }
            }}
            disabled={isGameOver}
            className="py-2.5 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#5dade2] hover:text-[#7fb3d5] font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 active:shadow-[0_0_0_#1a1917]"
            title="Durang taklifi"
          >
            <HandshakeIcon size={18} />
            <span className="text-[10px]">Durang</span>
          </button>

          {/* Taslim */}
          <button
            onClick={() => {
              if (window.confirm("Haqiqatan ham taslim boʻlmoqchimisiz?")) {
                dispatch({ type: 'RESIGN' });
              }
            }}
            disabled={isGameOver}
            className="py-2.5 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#e74c3c] hover:text-[#ec7063] font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 active:shadow-[0_0_0_#1a1917]"
            title="Taslim bo'lish"
          >
            <FlagIcon size={18} />
            <span className="text-[10px]">Taslim</span>
          </button>
        </div>
      </footer>

      {/* Harakatlar tarixi modali */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#21201d] border-t sm:border border-[#383531] rounded-t-3xl sm:rounded-2xl p-4 shadow-2xl flex flex-col max-h-[85vh] pb-[max(1.2rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between pb-3 border-b border-[#383531] mb-2">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <ScrollTextIcon size={18} className="text-[#81b64c]" />
                <span>Harakatlar Tarixi</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-lg bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white font-bold flex items-center justify-center text-sm"
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
