// =====================================================
// NUR SHAXMAT 100 — Asosiy Ilova (Mobile & Desktop Responsive)
// =====================================================

import React, { useState } from 'react';
import { BoardTheme, GameProvider, useGame } from './store/gameStore';
import Board from './components/Board';
import MoveHistory from './components/MoveHistory';
import { PlayerCard } from './components/CapturedPieces';
import GameControls from './components/GameControls';
import GameStatusBar from './components/GameStatusBar';
import PromotionModal from './components/PromotionModal';
import GameOverModal from './components/GameOverModal';
import LeaderboardModal from './components/LeaderboardModal';
import OnlineRoomModal from './components/OnlineRoomModal';
import EvalBar from './components/EvalBar';
import { onlineManager } from './services/onlineService';
import { getBestMove } from './ai/minimax';

const THEMES: Array<{ id: BoardTheme; name: string; dot: string }> = [
  { id: 'wood', name: 'Klassik Yogʻoch', dot: 'bg-[#b37a4c]' },
  { id: 'emerald', name: 'Zumrad Turniri', dot: 'bg-[#779954]' },
  { id: 'azure', name: 'Zangori Osmon', dot: 'bg-[#4d739e]' },
  { id: 'marble', name: 'Marmar & Obsidiyan', dot: 'bg-[#64748b]' },
];

function AppContent() {
  const { state, dispatch } = useGame();
  const { game, isFlipped, boardTheme, soundEnabled, gameMode, roomCode, onlinePlayerColor, history } = state;

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showMobileHistoryModal, setShowMobileHistoryModal] = useState(false);
  const [showMobileSettingsModal, setShowMobileSettingsModal] = useState(false);
  const [initialRoom, setInitialRoom] = useState<string>('');
  const [hintLoading, setHintLoading] = useState(false);

  const isGameOver = game.status !== 'playing' && game.status !== 'check';

  // 1. URL dan ?room=... parametrini tekshirish
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room) {
        const clean = room.trim().toUpperCase().replace(/^NUR-?/i, '');
        setInitialRoom(clean);
        setShowOnlineModal(true);
      }
    } catch {}
  }, []);

  // 2. Onlayn xabarlarni tinglash (Raqib harakatlari, taslim bo'lish, durang)
  React.useEffect(() => {
    const unsub = onlineManager.addMessageListener((msg) => {
      if (msg.type === 'MOVE') {
        dispatch({ type: 'APPLY_REMOTE_MOVE', move: msg.move });
      } else if (msg.type === 'RESIGN') {
        dispatch({ type: 'REMOTE_RESIGN' });
      } else if (msg.type === 'ACCEPT_DRAW') {
        dispatch({ type: 'REMOTE_DRAW_ACCEPT' });
      }
    });
    return unsub;
  }, [dispatch]);

  // Maslahat olish
  const handleGetHint = () => {
    if (isGameOver || hintLoading) return;
    setHintLoading(true);
    setTimeout(() => {
      try {
        const best = getBestMove(game, 2);
        if (best) dispatch({ type: 'SET_HINT', move: best });
      } catch (e) {
        console.error('Maslahat xatosi:', e);
      } finally {
        setHintLoading(false);
      }
    }, 40);
  };

  return (
    <div className="min-h-screen bg-[#070b12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,20,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans select-none pb-16 lg:pb-0">
      {/* ── YUQORI PANEL (HEADER) ────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-xl pt-[max(0.6rem,env(safe-area-inset-top))]">
        {/* Brend va Logotip */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
              <span className="text-xl sm:text-2xl animate-pulse">☀️</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-400">
                Nur Shaxmat 100
              </h1>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden xs:inline-block">
                Oʻzbek
              </span>
            </div>
            <p className="text-slate-400 text-[10px] sm:text-xs hidden md:block">
              10×10 dosqa · Nur donasi · 3 xil rokirovka
            </p>
          </div>
        </div>

        {/* O'ng tomon: Onlayn indikator, ovoz, aylantirish, baza */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Onlayn Rejim Indikatori */}
          {gameMode === 'online' && roomCode && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-[11px] sm:text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono font-black text-emerald-300">#{roomCode}</span>
              <span className="text-slate-400 hidden sm:inline">
                ({onlinePlayerColor === 'white' ? 'Oq' : 'Qora'})
              </span>
              <button
                onClick={() => {
                  onlineManager.disconnect();
                  dispatch({ type: 'SET_ONLINE_ROOM', roomCode: null, myColor: null });
                }}
                className="ml-1 text-[10px] text-red-400 hover:text-red-300 font-bold underline"
              >
                Chiqish
              </button>
            </div>
          )}

          {/* Peshqadamlar va Baza Tugmasi (Katta ekranda) */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <span>🏆</span>
            <span>Natijalar</span>
          </button>

          {/* Mavzu tanlagich (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
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
                <span className="hidden xl:inline">{th.name}</span>
              </button>
            ))}
          </div>

          {/* Ovoz tugmasi */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
            className={`p-1.5 sm:p-2 rounded-xl border text-xs sm:text-sm transition-all active:scale-95 ${
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
            className={`p-1.5 sm:p-2 rounded-xl border text-xs sm:text-sm transition-all active:scale-95 ${
              isFlipped
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Doskani aylantirish (Oq / Qora)"
          >
            🔄
          </button>

          {/* Mobil Sozlamalar menyusi tugmasi */}
          <button
            onClick={() => setShowMobileSettingsModal(true)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl border bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs sm:text-sm active:scale-95"
            title="Sozlamalar"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* ── ASOSIY MAYDON (ARENA) ────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-1.5 sm:px-4 py-2 sm:py-6 flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-6">
        {/* Chap ustun: Desktop Boshqaruv (lg: ekranda) */}
        <aside className="hidden lg:flex w-[260px] flex-col gap-3 flex-shrink-0">
          <GameStatusBar />
          <GameControls onOpenOnlineModal={() => setShowOnlineModal(true)} />
        </aside>

        {/* Markaziy ustun: Doska + O'yinchilar + Mobil Tugmalar */}
        <section className="w-full flex-1 flex flex-col items-center gap-1.5 sm:gap-3 max-w-[min(100vw-12px,580px)] mx-auto">
          {/* Mobil rejimda Shoh va status ogohlantirishlari */}
          <div className="w-full lg:hidden">
            <GameStatusBar />
          </div>

          {/* Yuqoridagi O'yinchi kartasi */}
          <PlayerCard
            playerColor={isFlipped ? 'white' : 'black'}
            position="top"
          />

          {/* EvalBar + 10x10 Dosqa */}
          <div className="w-full flex md:flex-row flex-col items-center justify-center gap-1.5 md:gap-3">
            {/* Desktopda vertikal, mobileda gorizontal EvalBar */}
            <div className="w-full md:w-auto flex md:flex-col items-center justify-center">
              <EvalBar />
            </div>
            <Board />
          </div>

          {/* Pastdagi O'yinchi kartasi */}
          <PlayerCard
            playerColor={isFlipped ? 'black' : 'white'}
            position="bottom"
          />

          {/* ── MOBIL TEZKOR HARAKAT TUGMALARI (QUICK ACTION BAR) ── */}
          <div className="w-full grid grid-cols-6 gap-1 sm:gap-1.5 p-1 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800/80 shadow-lg">
            {/* Bekor qilish */}
            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={history.length === 0 || isGameOver || gameMode === 'online'}
              className="py-2 px-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 disabled:opacity-30 text-slate-200 text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
              title="Yurishni bekor qilish"
            >
              <span className="text-sm sm:text-base">↩️</span>
              <span className="text-[9px] font-bold text-slate-400">Bekor</span>
            </button>

            {/* AI Maslahati */}
            <button
              onClick={handleGetHint}
              disabled={isGameOver || hintLoading}
              className="py-2 px-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 disabled:opacity-30 text-cyan-300 border border-cyan-800/40 text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
              title="AI maslahati"
            >
              <span className="text-sm sm:text-base">{hintLoading ? '⏳' : '💡'}</span>
              <span className="text-[9px] font-bold text-cyan-300">Maslahat</span>
            </button>

            {/* Doskani aylantirish */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
              className="py-2 px-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-200 text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
              title="Doskani aylantirish"
            >
              <span className="text-sm sm:text-base">🔄</span>
              <span className="text-[9px] font-bold text-slate-400">Aylantir</span>
            </button>

            {/* Durang */}
            <button
              onClick={() => {
                if (window.confirm('Raqibga durang taklif qilasizmi?')) {
                  dispatch({ type: 'OFFER_DRAW' });
                }
              }}
              disabled={isGameOver}
              className="py-2 px-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 disabled:opacity-30 text-sky-300 text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
              title="Durang taklifi"
            >
              <span className="text-sm sm:text-base">🤝</span>
              <span className="text-[9px] font-bold text-sky-300">Durang</span>
            </button>

            {/* Taslim bo'lish */}
            <button
              onClick={() => {
                if (window.confirm("Haqiqatan ham taslim bo'lmoqchimisiz?")) {
                  dispatch({ type: 'RESIGN' });
                }
              }}
              disabled={isGameOver}
              className="py-2 px-1 rounded-lg bg-red-950/30 hover:bg-red-900/50 disabled:opacity-30 text-red-400 border border-red-900/40 text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
              title="Taslim bo'lish"
            >
              <span className="text-sm sm:text-base">🏳️</span>
              <span className="text-[9px] font-bold text-red-400">Taslim</span>
            </button>

            {/* Yangi o'yin */}
            <button
              onClick={() => dispatch({ type: 'NEW_GAME' })}
              className="py-2 px-1 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5 shadow-md"
              title="Yangi o'yin boshlash"
            >
              <span className="text-sm sm:text-base">✨</span>
              <span className="text-[9px] font-extrabold text-white">Yangi</span>
            </button>
          </div>
        </section>

        {/* O'ng ustun: Harakatlar tarixi va qoidalar paneli (Desktop) */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <MoveHistory />
        </aside>
      </main>

      {/* ── MOBIL PASTKI MENYU (BOTTOM NAVIGATION BAR — APK / SMARTFON) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.85)]">
        {/* Doska (Bosh oyna) */}
        <button
          onClick={() => {
            setShowMobileHistoryModal(false);
            setShowMobileSettingsModal(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 text-amber-400 transition-all active:scale-95"
        >
          <span className="text-lg">♟️</span>
          <span className="text-[10px] font-black tracking-tight">Doska</span>
        </button>

        {/* Harakatlar Tarixi */}
        <button
          onClick={() => setShowMobileHistoryModal(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition-all active:scale-95 relative"
        >
          <span className="text-lg">📜</span>
          <span className="text-[10px] font-bold tracking-tight">Tarix</span>
          {game.moveHistory.length > 0 && (
            <span className="absolute top-0.5 right-4 bg-amber-500 text-slate-950 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {game.moveHistory.length}
            </span>
          )}
        </button>

        {/* Onlayn O'yin */}
        <button
          onClick={() => setShowOnlineModal(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 text-purple-400 hover:text-purple-300 transition-all active:scale-95"
        >
          <div className="relative">
            <span className="text-lg">🌐</span>
            {gameMode === 'online' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Onlayn</span>
        </button>

        {/* Sozlamalar & AI */}
        <button
          onClick={() => setShowMobileSettingsModal(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
        >
          <span className="text-lg">⚙️</span>
          <span className="text-[10px] font-bold tracking-tight">Rejim & AI</span>
        </button>

        {/* Reyting & Baza */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 text-amber-300 hover:text-amber-200 transition-all active:scale-95"
        >
          <span className="text-lg">🏆</span>
          <span className="text-[10px] font-bold tracking-tight">Reyting</span>
        </button>
      </nav>

      {/* ── MODALLAR & MOBIL DRAWERLAR ──────────────────────── */}
      <PromotionModal />
      <GameOverModal />
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
      <OnlineRoomModal
        isOpen={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        initialRoomCode={initialRoom}
      />

      {/* 1. Mobil Tarix va Qoidalar Modali */}
      {showMobileHistoryModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl flex flex-col max-h-[88vh] pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-2 font-black text-sm text-slate-100">
                <span className="text-lg">📜</span>
                <span>Harakatlar Tarixi & Qoidalar</span>
              </div>
              <button
                onClick={() => setShowMobileHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MoveHistory className="h-[65vh] w-full border-none shadow-none bg-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* 2. Mobil Sozlamalar va AI Modali */}
      {showMobileSettingsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[88vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 font-black text-sm text-slate-100">
                <span className="text-lg">⚙️</span>
                <span>Oʻyin Sozlamalari & Rejim</span>
              </div>
              <button
                onClick={() => setShowMobileSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Dosqa Mavzusi Tanlash */}
            <div className="mb-4">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 block">
                Dosqa Mavzusi
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => dispatch({ type: 'SET_THEME', theme: th.id })}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                      boardTheme === th.id
                        ? 'bg-slate-800 text-amber-300 border-amber-500/60 shadow-md'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${th.dot}`} />
                    <span>{th.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Asosiy Boshqaruv Komponenti */}
            <GameControls
              onOpenOnlineModal={() => {
                setShowMobileSettingsModal(false);
                setShowOnlineModal(true);
              }}
              className="border-none shadow-none p-0 bg-transparent"
            />
          </div>
        </div>
      )}
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
