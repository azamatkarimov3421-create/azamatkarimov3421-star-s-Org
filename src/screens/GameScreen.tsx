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
import { getBestMove, getBestMoveAsync } from '../ai/minimax';
import { onlineManager } from '../services/onlineService';
import { logger } from '../services/loggerService';
import ErrorModal from '../components/ErrorModal';
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
  const { game, gameMode, aiColor, aiDepth, aiThinking, roomCode, onlinePlayerColor, isFlipped, is3D, history } = state;
  const { status, currentTurn, moveHistory } = game;

  const [hintLoading, setHintLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastWarning, setLastWarning] = useState<string | null>(null);
  const userProfile = getUserProfile();

  // Loggerga obuna bo'lish (Xatolik yoki ogohlantirishlarni kuzatish)
  React.useEffect(() => {
    const updateLogs = () => {
      const allLogs = logger.getLogs();
      const errs = allLogs.filter(l => l.level === 'error').length;
      setErrorCount(errs);
    };
    updateLogs();

    const unsubscribe = logger.subscribe((entry, logs) => {
      const errs = logs.filter(l => l.level === 'error').length;
      setErrorCount(errs);
      if (entry.level === 'error' || entry.level === 'warn') {
        setLastWarning(entry.message);
        setTimeout(() => setLastWarning(null), 5000);
      }
    });
    return unsubscribe;
  }, []);

  const isGameOver = status !== 'playing' && status !== 'check';
  const isMyTurn = (gameMode === 'online' && onlinePlayerColor)
    ? currentTurn === onlinePlayerColor
    : (gameMode === 'vsAI')
    ? currentTurn !== aiColor
    : true;

  const aiThinkingRef = React.useRef(false);

  // Favqulodda muzlashdan chiqarish (Emergency Unfreeze Handler)
  const handleEmergencyReset = React.useCallback(() => {
    aiThinkingRef.current = false;
    setHintLoading(false);
    dispatch({ type: 'SET_AI_THINKING', thinking: false });
    dispatch({ type: 'SELECT_SQUARE', square: { rank: -1, file: -1 } });
    logger.logInfo('SYSTEM', "Foydalanuvchi tomonidan doska holati muvaffaqiyatli tiklandi va qotishdan chiqarildi.");
  }, [dispatch]);

  // AI Bot yurishini avtomatik hisoblash va amalga oshirish (vsAI rejimida)
  React.useEffect(() => {
    if (gameMode !== 'vsAI') return;
    if (currentTurn !== aiColor) return;
    if (isGameOver) return;
    if (aiThinkingRef.current) return;

    aiThinkingRef.current = true;
    dispatch({ type: 'SET_AI_THINKING', thinking: true });

    let isCancelled = false;

    // Watchdog: Agar bot 3.6 soniyadan ortiq javob bermasa, qotib qolmasligi uchun avtomatik tiklanadi
    const watchdog = setTimeout(() => {
      if (aiThinkingRef.current && !isCancelled) {
        logger.logWarn('AI_ENGINE', "Bot hisoblash vaqti belgilangan muddatdan oshdi. Tizim avtomatik tiklandi.");
        handleEmergencyReset();
      }
    }, 3600);

    // 250ms kutish: foydalanuvchi donasi silliq sirg'alib o'tishini tugatishi uchun
    const timer = setTimeout(async () => {
      try {
        const bestMove = await getBestMoveAsync(game, aiDepth);
        if (!isCancelled && bestMove) {
          dispatch({ type: 'APPLY_MOVE', move: bestMove });
        }
      } catch (e: any) {
        logger.logError('AI_ENGINE', 'AI bot hisoblash jarayonida kutilmagan xatolik yuz berdi', e);
      } finally {
        clearTimeout(watchdog);
        aiThinkingRef.current = false;
        dispatch({ type: 'SET_AI_THINKING', thinking: false });
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      clearTimeout(watchdog);
      aiThinkingRef.current = false;
      dispatch({ type: 'SET_AI_THINKING', thinking: false });
    };
  }, [currentTurn, gameMode, aiColor, isGameOver, game.moveHistory.length, aiDepth, dispatch, handleEmergencyReset]);

  // Sarlavha matni
  const modeTitle =
    gameMode === 'online'
      ? `Onlayn #${roomCode || ''}`
      : gameMode === 'vsAI'
      ? 'Kompyuter bilan'
      : "Doʻst bilan";

  // Maslahat olish
  const handleGetHint = async () => {
    if (isGameOver || hintLoading) return;
    setHintLoading(true);

    const hintTimeout = setTimeout(() => {
      setHintLoading(false);
      logger.logWarn('GAME_LOGIC', 'Maslahat hisoblash vaqti tugadi.');
    }, 2500);

    try {
      logger.logInfo('GAME_LOGIC', "Maslahat (Hint) tahlili boshlandi...");
      const best = await getBestMoveAsync(game, 2);
      if (best) {
        dispatch({ type: 'SET_HINT', move: best });
        logger.logInfo('GAME_LOGIC', `Maslahat berildi: (${best.from.file},${best.from.rank}) -> (${best.to.file},${best.to.rank})`);
      } else {
        logger.logWarn('GAME_LOGIC', "Ushbu holatda maslahat yurishi topilmadi.");
      }
    } catch (e: any) {
      logger.logError('AI_ENGINE', 'Maslahat izlashda xatolik yuz berdi', e);
    } finally {
      clearTimeout(hintTimeout);
      setHintLoading(false);
    }
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
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#121614] md:bg-[url('/desktop-bg.jpg')] bg-cover bg-center text-[#f1f1f1] flex flex-col justify-between font-sans select-none pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:pb-3 fixed inset-0 overflow-hidden touch-none overscroll-none">
      {/* Desktop fondagi qorong'i atmosfera qatlami */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-[#0b100d]/88 via-[#0d1310]/78 to-[#0b100d]/92 pointer-events-none z-0" />

      {/* ── 1. YUQORI HEADER (RESPONSIVE CHESS HEADER) ─────────────────── */}
      <header className="relative z-30 shrink-0 bg-[#141b17]/95 backdrop-blur-md border-b border-[#27372d] px-3 sm:px-6 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (gameMode === 'online' || roomCode) {
                onlineManager.disconnect();
                dispatch({ type: 'SET_ONLINE_ROOM', roomCode: null, myColor: null });
                dispatch({ type: 'SET_GAME_MODE', mode: 'vsAI' });
              }
              onBack();
            }}
            className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
            title="Chiqish"
          >
            <ArrowLeftIcon size={18} />
          </button>

          <div className="text-center">
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              <span>{modeTitle}</span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                10×10 NUR CHESS
              </span>
            </h2>
            <div className="text-[11px] font-semibold flex items-center justify-center gap-1.5 mt-0.5 h-4">
              {game.isInCheck && !isGameOver ? (
                <span className="text-red-400 flex items-center gap-1 font-black animate-pulse">
                  <span>🔥</span>
                  <span>SHOH! Shoh xavf ostida!</span>
                </span>
              ) : gameMode === 'online' && !isGameOver ? (
                isMyTurn ? (
                  <span className="text-[#81b64c] flex items-center gap-1 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#81b64c] animate-ping" />
                    Sizning navbatingiz ({onlinePlayerColor === 'white' ? 'Oq' : 'Qora'})
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Raqib yurishini kuting ({onlinePlayerColor === 'white' ? 'Qora' : 'Oq'})
                  </span>
                )
              ) : isMyTurn && !isGameOver ? (
                <span className="text-[#81b64c] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#81b64c] animate-ping" />
                  Sizning navbatingiz
                </span>
              ) : !isGameOver ? (
                <span className="text-[#9b9893] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
                  {gameMode === 'vsAI' && aiThinking ? "Bot oʻylamoqda..." : "Raqib yurishi"}
                </span>
              ) : (
                <span className="text-[#9b9893]">Oʻyin yakunlandi</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="lg:hidden relative w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
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
            <div className="flex items-center bg-[#181715] p-0.5 rounded-xl border border-[#383531] shadow-inner">
              <button
                onClick={() => dispatch({ type: 'SET_3D', enabled: false })}
                className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${
                  !is3D
                    ? 'bg-white text-[#21201d] shadow-sm'
                    : 'text-[#8e8b84] hover:text-[#c3c2be]'
                }`}
                title="2D Tekis ko'rinish"
              >
                2D
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_3D', enabled: true })}
                className={`px-2 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                  is3D
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.6)] ring-1 ring-amber-300'
                    : 'text-[#8e8b84] hover:text-[#c3c2be]'
                }`}
                title="Kitobdagidek 3D Fazoviy ko'rinish"
              >
                <span>🎲</span>
                <span>3D</span>
              </button>
            </div>

            {/* Tizim Loglari va Xatoliklar jurnali tugmasi */}
            <button
              onClick={() => setShowErrorModal(true)}
              className={`h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_2px_0_#21201d] ${
                errorCount > 0
                  ? 'bg-red-500/25 hover:bg-red-500/35 text-red-300 border-red-500/60 animate-pulse'
                  : 'bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white border-[#45423c]'
              }`}
              title="Tizim loglari va nosozliklar jurnali"
            >
              <span>{errorCount > 0 ? '⚠️' : '🛡️'}</span>
              <span className="hidden sm:inline">{errorCount > 0 ? `${errorCount} xato` : 'Log'}</span>
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
        </div>
      </header>

      {/* Agar ogohlantirish yoki xato yuz bersa — yuqorida paydo bo'luvchi xabarnoma */}
      {lastWarning && (
        <div
          onClick={() => setShowErrorModal(true)}
          className="absolute top-14 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%] px-3.5 py-2 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center justify-between gap-2 cursor-pointer animate-fadeIn border border-amber-300"
        >
          <div className="flex items-center gap-2 truncate">
            <span>⚠️</span>
            <span className="truncate">{lastWarning}</span>
          </div>
          <span className="shrink-0 underline text-[11px] font-black">Loglarni koʻrish</span>
        </div>
      )}

      {/* ── 2. ASOSIY MAYDON (RESPONSIVE: MOBILDA TIK, KOMPYUTERDA YONMA-YON) ────── */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 lg:gap-8 px-2 sm:px-4 lg:px-6 py-0.5 lg:py-2 overflow-hidden min-h-0 touch-none">
        {/* CHAP / MARKAZIY QISM: Doska va O'yinchilar HUD */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full overflow-hidden my-auto">
          {/* Yuqoridagi O'yinchi Kartasi (Opponent HUD) */}
          <div
            className={`h-10 sm:h-11 flex items-center justify-between px-3 rounded-xl border transition-all duration-200 shrink-0 ${
              is3D ? 'chess-board-box-3d' : 'chess-board-box'
            } ${
              isTopTurn
                ? 'bg-[#21201d] border-[#81b64c]/70 shadow-[0_0_12px_rgba(129,182,76,0.15)] ring-1 ring-[#81b64c]/50'
                : 'bg-[#21201d]/80 border-[#383531]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#c3c2be]">
                {topColor === 'black' ? (
                  <BotIcon size={18} className="text-[#81b64c]" />
                ) : (
                  <UserIcon size={18} className="text-[#c3c2be]" />
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
                  {gameMode === 'vsAI' && aiThinking && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 px-1.5 py-0.2 rounded flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Oʻylamoqda...
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#9b9893] font-mono leading-none">
                  {opponentRating} reyting
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
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
          <div className={`w-full flex flex-col items-center justify-center gap-0.5 my-0.5 max-h-full touch-none shrink-0 ${
            is3D ? 'chess-board-box-3d' : 'chess-board-box'
          }`}>
            {/* 3D / 2D Ko'rinish bildirishnomasi (faqat mobil ekranda) */}
            <div className="w-full md:hidden flex items-center justify-between px-1.5 py-0.5 text-[11px] text-[#9b9893] shrink-0">
              <div className="flex items-center gap-1.5 font-semibold">
                <span>Doska:</span>
                <span className={is3D ? "text-amber-400 font-black flex items-center gap-1" : "text-white font-bold"}>
                  {is3D ? "🎲 3D Fazoviy (Kitob)" : "📐 2D Tekis"}
                </span>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_3D' })}
                className="text-[11px] font-extrabold text-amber-400 hover:text-amber-300 active:scale-95 transition-all underline underline-offset-2 flex items-center gap-1"
              >
                {is3D ? "📐 2D ga oʻtish" : "🎲 3D ga oʻtish"}
              </button>
            </div>

            {/* Mobil ekranda doska ustidagi gorizontal EvalBar */}
            <div className="w-full md:hidden">
              <EvalBar orientation="horizontal" />
            </div>

            {/* Dosqa va (kompyuterda) chapdagi vertikal EvalBar */}
            <div className="w-full flex items-center justify-center gap-2">
              {/* Kompyuterda: doskaning chap yonida vertikal EvalBar */}
              <div className="hidden md:flex self-stretch items-stretch py-0.5">
                <EvalBar orientation="vertical" />
              </div>

              {/* Asosiy 10x10 Dosqa */}
              <div className="flex-1 min-w-0 flex items-center justify-center">
                <Board />
              </div>
            </div>
          </div>

          {/* Pastdagi O'yinchi Kartasi (Sizning HUD) */}
          <div
            className={`h-10 sm:h-11 flex items-center justify-between px-3 rounded-xl border transition-all duration-200 shrink-0 ${
              is3D ? 'chess-board-box-3d' : 'chess-board-box'
            } ${
              isBottomTurn
                ? 'bg-[#21201d] border-white/60 shadow-[0_0_12px_rgba(255,255,255,0.1)] ring-1 ring-white/40'
                : 'bg-[#21201d]/80 border-[#383531]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#81b64c]">
                <UserIcon size={18} />
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
                <div className="text-[10px] text-[#81b64c] font-mono font-semibold leading-none">
                  {userProfile.rating} reyting
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
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
        </div>

        {/* O'NG QISM: Desktop Sidebar (Planshet va Kompyuter ekranlarida ko'rinadi) */}
        <aside className="hidden md:flex flex-col w-[280px] lg:w-[320px] xl:w-[360px] h-full max-h-[calc(100dvh-75px)] bg-[#21201d] rounded-2xl lg:rounded-3xl border border-[#383531] p-3.5 shadow-2xl shrink-0 justify-between overflow-hidden my-auto">
          {/* Sidebar Yuqori: Rejim va Navbat */}
          <div className="shrink-0 space-y-2.5 pb-2.5 border-b border-[#383531]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#81b64c] animate-pulse" />
                <span className="font-extrabold text-sm text-white tracking-wide">{modeTitle}</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-full font-bold">
                10×10 DOSQA
              </span>
            </div>

            {/* Navbat & Shoh bildirishnomasi */}
            <div className="p-2.5 rounded-2xl bg-[#1a1917] border border-[#383531] text-xs flex items-center justify-between">
              <span className="text-[#9b9893] font-medium">Navbat:</span>
              {game.isInCheck && !isGameOver ? (
                <span className="text-red-400 font-black animate-pulse flex items-center gap-1">
                  🔥 SHOH XAVFDA!
                </span>
              ) : (
                <span className="font-bold flex items-center gap-2 text-white">
                  <span className={`w-2.5 h-2.5 rounded-full ${currentTurn === 'white' ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'bg-[#383531] border border-white/60'}`} />
                  {currentTurn === 'white' ? 'Oqlar yurishi' : 'Qoralar yurishi'}
                </span>
              )}
            </div>
          </div>

          {/* Sidebar O'rta: Harakatlar Tarixi (MoveHistory) */}
          <div className="flex-1 min-h-0 py-2 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 bg-[#1a1917] rounded-2xl border border-[#383531]/80 overflow-hidden">
              <MoveHistory className="h-full w-full border-none shadow-none bg-transparent" />
            </div>
          </div>

          {/* Sidebar Pastki: Boshqaruv Tugmalari */}
          <div className="shrink-0 pt-2.5 border-t border-[#383531] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => dispatch({ type: 'UNDO' })}
                disabled={history.length === 0 || isGameOver || gameMode === 'online'}
                className="py-2.5 px-3 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#c3c2be] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
              >
                <RotateCcwIcon size={16} />
                <span>Bekor qilish</span>
              </button>

              <button
                onClick={handleGetHint}
                disabled={isGameOver || hintLoading}
                className="py-2.5 px-3 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#81b64c] hover:text-[#99cc59] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
              >
                <LightbulbIcon size={16} />
                <span>{hintLoading ? '...' : 'Maslahat'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
                className="py-2 px-1.5 rounded-xl bg-[#2b2926] hover:bg-[#383531] border border-[#3d3a34] text-[#c3c2be] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
                title="Doskani aylantirish"
              >
                <RotateCwIcon size={14} />
                <span className="text-[11px]">Aylantir</span>
              </button>

              <button
                onClick={() => dispatch({ type: 'OFFER_DRAW' })}
                disabled={isGameOver}
                className="py-2 px-1.5 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#5dade2] hover:text-[#7fb3d5] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
                title="Durang taklif qilish"
              >
                <HandshakeIcon size={14} />
                <span className="text-[11px]">Durang</span>
              </button>

              <button
                onClick={() => dispatch({ type: 'RESIGN' })}
                disabled={isGameOver}
                className="py-2 px-1.5 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#e74c3c] hover:text-[#ec7063] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
                title="Taslim bo'lish"
              >
                <FlagIcon size={14} />
                <span className="text-[11px]">Taslim</span>
              </button>
            </div>

            {/* Agar Bot o'ylanib qolsa — to'g'ridan-to'g'ri to'xtatish va tiklash tugmasi */}
            {aiThinking && (
              <button
                onClick={handleEmergencyReset}
                className="w-full py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all animate-pulse"
                title="Bot hisoblashini to'xtatish va doskani tiklash"
              >
                <span>⚡ Majburiy tiklash (Unfreeze)</span>
              </button>
            )}
          </div>
        </aside>
      </main>

      {/* ── 3. CHESS.COM USLUBIDAGI TAKTIL PASTKI TUGMALAR (FAQAT MOBILDA) ─────────── */}
      <footer className="px-3 pt-0.5 shrink-0 md:hidden max-w-md mx-auto w-full">
        <div className="grid grid-cols-4 gap-2">
          {/* Bekor qilish */}
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={history.length === 0 || isGameOver || gameMode === 'online'}
            className="py-2 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#c3c2be] hover:text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 active:shadow-[0_0_0_#1a1917]"
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
              dispatch({ type: 'OFFER_DRAW' });
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
              dispatch({ type: 'RESIGN' });
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

      {/* Tizim Loglari va Nosozliklarni ko'rish va Tiklash Modali */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onResetGame={handleEmergencyReset}
      />
    </div>
  );
}
