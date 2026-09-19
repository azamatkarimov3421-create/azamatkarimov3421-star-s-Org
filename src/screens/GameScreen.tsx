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
  PlayIcon,
  PauseIcon,
  StepForwardIcon,
} from '../components/Icons';
import { useTranslation } from '../i18n/translations';

interface GameScreenProps {
  onBack: () => void;
  onOpenSettings?: () => void;
}

export default function GameScreen({ onBack, onOpenSettings }: GameScreenProps) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const {
    game,
    gameMode,
    aiColor,
    aiDepth,
    aiWhiteDepth,
    aiBlackDepth,
    aiVsAiPaused,
    aiVsAiSpeed,
    aiThinking,
    roomCode,
    onlinePlayerColor,
    isFlipped,
    is3D,
    history,
  } = state;
  const { status, currentTurn, moveHistory } = game;

  const [hintLoading, setHintLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showVsAiLevelModal, setShowVsAiLevelModal] = useState(false);
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
    : (gameMode === 'aiVsAi')
    ? false
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

    // Watchdog: Agar bot 10 soniyadan ortiq javob bermasa, qotib qolmasligi uchun avtomatik tiklanadi
    const watchdog = setTimeout(() => {
      if (aiThinkingRef.current && !isCancelled) {
        logger.logWarn('AI_ENGINE', "Bot hisoblash vaqti belgilangan muddatdan oshdi. Tizim avtomatik tiklandi.");
        handleEmergencyReset();
      }
    }, 10000);

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

  // Bot vs Bot (AI vs AI) avtomatik o'yin sikli
  React.useEffect(() => {
    if (gameMode !== 'aiVsAi') return;
    if (isGameOver) return;
    if (aiVsAiPaused) return;
    if (aiThinkingRef.current) return;

    aiThinkingRef.current = true;
    dispatch({ type: 'SET_AI_THINKING', thinking: true });

    let isCancelled = false;
    const currentDepth = currentTurn === 'white' ? aiWhiteDepth : aiBlackDepth;
    const botName = currentTurn === 'white' ? `Oq Bot (D-${aiWhiteDepth})` : `Qora Bot (D-${aiBlackDepth})`;

    const watchdog = setTimeout(() => {
      if (aiThinkingRef.current && !isCancelled) {
        logger.logWarn('AI_ENGINE', `${botName} hisoblash vaqti tugadi. Avtomatik tiklanmoqda...`);
        handleEmergencyReset();
      }
    }, Math.max(12000, aiVsAiSpeed + 8000));

    const timer = setTimeout(async () => {
      try {
        const t0 = Date.now();
        const bestMove = await getBestMoveAsync(game, currentDepth);
        const dt = Date.now() - t0;
        if (!isCancelled && bestMove) {
          logger.logInfo('AI_ENGINE', `${botName} yurdi: (${bestMove.from.file},${bestMove.from.rank}) -> (${bestMove.to.file},${bestMove.to.rank}) [${dt}ms]`);
          dispatch({ type: 'APPLY_MOVE', move: bestMove });
        }
      } catch (e: any) {
        logger.logError('AI_ENGINE', `${botName} hisoblashida xatolik yuz berdi`, e);
      } finally {
        clearTimeout(watchdog);
        aiThinkingRef.current = false;
        dispatch({ type: 'SET_AI_THINKING', thinking: false });
      }
    }, Math.max(80, aiVsAiSpeed));

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      clearTimeout(watchdog);
      aiThinkingRef.current = false;
      dispatch({ type: 'SET_AI_THINKING', thinking: false });
    };
  }, [
    gameMode,
    currentTurn,
    isGameOver,
    aiVsAiPaused,
    aiWhiteDepth,
    aiBlackDepth,
    aiVsAiSpeed,
    game.moveHistory.length,
    dispatch,
    handleEmergencyReset,
  ]);

  // Bot vs Bot rejimida qo'lda 1 qadam oldinga yurish (Step)
  const handleStepAiVsAi = async () => {
    if (gameMode !== 'aiVsAi' || isGameOver || aiThinkingRef.current) return;
    aiThinkingRef.current = true;
    dispatch({ type: 'SET_AI_THINKING', thinking: true });
    const currentDepth = currentTurn === 'white' ? aiWhiteDepth : aiBlackDepth;
    const botName = currentTurn === 'white' ? `Oq Bot (D-${aiWhiteDepth})` : `Qora Bot (D-${aiBlackDepth})`;
    try {
      const t0 = Date.now();
      const bestMove = await getBestMoveAsync(game, currentDepth);
      const dt = Date.now() - t0;
      if (bestMove) {
        logger.logInfo('AI_ENGINE', `${botName} [Qadam]: (${bestMove.from.file},${bestMove.from.rank}) -> (${bestMove.to.file},${bestMove.to.rank}) [${dt}ms]`);
        dispatch({ type: 'APPLY_MOVE', move: bestMove });
      }
    } catch (e: any) {
      logger.logError('AI_ENGINE', `${botName} qadamida xatolik yuz berdi`, e);
    } finally {
      aiThinkingRef.current = false;
      dispatch({ type: 'SET_AI_THINKING', thinking: false });
    }
  };

  // Bot vs Bot tezligini navbat bilan almashtirish (600ms -> 2000ms -> 5000ms)
  const handleCycleSpeed = () => {
    const speeds = [600, 2000, 5000];
    const idx = speeds.indexOf(aiVsAiSpeed);
    const nextSpeed = speeds[(idx + 1) % speeds.length] || 2000;
    dispatch({ type: 'SET_AI_VS_AI_SPEED', speed: nextSpeed });
  };

  const AI_LEVEL_NAMES = ['', t('ai_level_1'), t('ai_level_2'), t('ai_level_3'), t('ai_level_4')];
  const AI_LEVEL_RATINGS = [0, 1000, 1400, 1800, 2200];

  // Sarlavha matni
  const modeTitle =
    gameMode === 'online'
      ? `${t('mode_online_title')} #${roomCode || ''}`
      : gameMode === 'vsAI'
      ? `${t('mode_vs_ai_title')} • ${AI_LEVEL_NAMES[aiDepth] || 'AI'}`
      : gameMode === 'aiVsAi'
      ? t('mode_ai_vs_ai_title')
      : t('mode_pvp_title');

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

  // Yuqori va pastki o'yinchilar ranglari
  const topColor = isFlipped ? 'white' : 'black';
  const bottomColor = isFlipped ? 'black' : 'white';

  // Raqib va pastki o'yinchi ma'lumotlari
  const opponentName =
    gameMode === 'online'
      ? t('player_label')
      : gameMode === 'vsAI'
      ? `Nur Bot (${AI_LEVEL_NAMES[aiDepth] || 'AI'})`
      : gameMode === 'aiVsAi'
      ? (topColor === 'black' ? `${t('black_color')} Bot (D-${aiBlackDepth})` : `${t('white_color')} Bot (D-${aiWhiteDepth})`)
      : `2-${t('player_label')}`;

  const opponentRating =
    gameMode === 'online'
      ? 1520
      : gameMode === 'vsAI'
      ? (AI_LEVEL_RATINGS[aiDepth] || 1400)
      : gameMode === 'aiVsAi'
      ? (topColor === 'black' ? aiBlackDepth * 400 + 800 : aiWhiteDepth * 400 + 800)
      : 1500;

  const bottomName =
    gameMode === 'aiVsAi'
      ? (bottomColor === 'white' ? `${t('white_color')} Bot (D-${aiWhiteDepth})` : `${t('black_color')} Bot (D-${aiBlackDepth})`)
      : (userProfile.name || t('player_label'));

  const bottomRating =
    gameMode === 'aiVsAi'
      ? (bottomColor === 'white' ? aiWhiteDepth * 400 + 800 : aiBlackDepth * 400 + 800)
      : userProfile.rating;

  const isTopTurn = currentTurn === topColor && !isGameOver;
  const isBottomTurn = currentTurn === bottomColor && !isGameOver;

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#121614] md:bg-[url('/desktop-bg.jpg')] bg-cover bg-center text-[#f1f1f1] flex flex-col justify-between font-sans select-none pb-1 sm:pb-1.5 fixed inset-0 overflow-hidden touch-none overscroll-none">
      {/* Desktop fondagi qorong'i atmosfera qatlami */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-[#0b100d]/88 via-[#0d1310]/78 to-[#0b100d]/92 pointer-events-none z-0" />

      {/* ── 1. YUQORI HEADER (RESPONSIVE CHESS HEADER) ─────────────────── */}
      <header className="relative z-30 shrink-0 bg-[#141b17]/95 backdrop-blur-md border-b border-[#27372d] px-3 sm:px-5 py-1.5 pt-[max(0.4rem,env(safe-area-inset-top))]">
        <div className="w-full max-w-[1550px] mx-auto flex items-center justify-between">
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
                  <span>{t('check_alert')}</span>
                </span>
              ) : gameMode === 'online' && !isGameOver ? (
                isMyTurn ? (
                  <span className="text-[#81b64c] flex items-center gap-1 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#81b64c] animate-ping" />
                    {t('your_turn')} ({onlinePlayerColor === 'white' ? t('white_color') : t('black_color')})
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    {t('wait_opponent')} ({onlinePlayerColor === 'white' ? t('black_color') : t('white_color')})
                  </span>
                )
              ) : isMyTurn && !isGameOver ? (
                <span className="text-[#81b64c] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#81b64c] animate-ping" />
                  {t('your_turn')}
                </span>
              ) : !isGameOver ? (
                <span className="text-[#9b9893] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
                  {gameMode === 'vsAI' && aiThinking ? t('bot_thinking') : t('opponent_turn')}
                </span>
              ) : (
                <span className="text-[#9b9893]">{t('game_finished')}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="lg:hidden relative w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
              title={t('history_title')}
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
              title={t('btn_flip')}
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
                title="2D"
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
                title="3D"
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
              title="Log"
            >
              <span>{errorCount > 0 ? '⚠️' : '🛡️'}</span>
              <span className="hidden sm:inline">{errorCount > 0 ? `${errorCount} xato` : 'Log'}</span>
            </button>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
                title={t('nav_settings')}
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
          <span className="shrink-0 underline text-[11px] font-black">Log</span>
        </div>
      )}

      {/* ── 2. ASOSIY MAYDON (RESPONSIVE: MOBILDA TIK, KOMPYUTERDA YONMA-YON) ────── */}
      <main className="relative z-10 flex-1 w-full max-w-[1550px] mx-auto flex flex-col md:flex-row items-center justify-center gap-2.5 md:gap-4 lg:gap-6 px-2 sm:px-4 lg:px-6 py-0.5 md:py-1 overflow-hidden min-h-0 touch-manipulation">
        {/* CHAP / MARKAZIY QISM: Doska va (faqat mobilda) O'yinchilar HUD */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full overflow-hidden my-auto">
          {/* Yuqoridagi O'yinchi Kartasi (Opponent HUD — FAQAT MOBILDA ko'rinadi) */}
          <div
            className={`md:hidden h-9 sm:h-10 flex items-center justify-between px-2.5 sm:px-3 rounded-xl border transition-all duration-200 shrink-0 mb-1 ${
              is3D ? 'chess-board-box-3d' : 'chess-board-box'
            } ${
              isTopTurn
                ? 'bg-[#21201d] border-[#81b64c]/70 shadow-[0_0_12px_rgba(129,182,76,0.15)] ring-1 ring-[#81b64c]/50'
                : 'bg-[#21201d]/80 border-[#383531]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#c3c2be]">
                {topColor === 'black' || gameMode === 'aiVsAi' ? (
                  <BotIcon size={17} className="text-[#81b64c]" />
                ) : (
                  <UserIcon size={17} className="text-[#c3c2be]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-white">
                    {opponentName}
                  </span>
                  <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1.5 py-0.2 rounded">
                    {topColor === 'white' ? t('white_color') : t('black_color')}
                  </span>
                  {gameMode === 'vsAI' && (
                    <button
                      onClick={() => setShowVsAiLevelModal(true)}
                      className="text-[10px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-1.5 py-0.2 rounded-md flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      title={t('ai_level_change_title')}
                    >
                      <span>🎯 {AI_LEVEL_NAMES[aiDepth]}</span>
                      <span className="text-[8px] text-amber-400">✎</span>
                    </button>
                  )}
                  {(gameMode === 'vsAI' || gameMode === 'aiVsAi') && isTopTurn && aiThinking && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 px-1.5 py-0.2 rounded flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      {t('bot_thinking')}
                    </span>
                  )}
                  {gameMode === 'aiVsAi' && isTopTurn && aiVsAiPaused && !isGameOver && (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                      {t('paused_status')}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#9b9893] font-mono leading-none">
                  {opponentRating} {gameMode === 'aiVsAi' ? '' : t('rating_label')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  isTopTurn
                    ? 'bg-[#81b64c] text-white shadow-sm'
                    : 'bg-[#1a1917] text-[#9b9893] border border-[#383531]'
                }`}
              >
                <ClockIcon size={12} />
                <ChessClock color={topColor} />
              </div>
            </div>
          </div>

          {/* 10x10 Dosqa va Baholash Indikatori */}
          <div className={`w-full flex flex-col items-center justify-center max-h-full touch-manipulation shrink-0 ${
            is3D ? 'chess-board-box-3d' : 'chess-board-box'
          }`}>
            {/* 3D / 2D Ko'rinish bildirishnomasi (faqat mobil ekranda) */}
            <div className="w-full md:hidden flex items-center justify-between px-1.5 py-0.5 text-[11px] text-[#9b9893] shrink-0">
              <div className="flex items-center gap-1.5 font-semibold">
                <span>Doska:</span>
                <span className={is3D ? "text-amber-400 font-black flex items-center gap-1" : "text-white font-bold"}>
                  {is3D ? t('view_3d') : t('view_2d')}
                </span>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_3D' })}
                className="text-[11px] font-extrabold text-amber-400 hover:text-amber-300 active:scale-95 transition-all underline underline-offset-2 flex items-center gap-1"
              >
                {is3D ? t('switch_to_2d') : t('switch_to_3d')}
              </button>
            </div>

            {/* Mobil ekranda doska ustidagi gorizontal EvalBar */}
            <div className="w-full md:hidden">
              <EvalBar orientation="horizontal" />
            </div>

            {/* Dosqa va (kompyuterda) chapdagi vertikal EvalBar */}
            <div className="w-full flex items-center justify-center gap-2">
              {/* Kompyuterda: doskaning chap yonida vertikal EvalBar */}
              <div className={`hidden md:flex ${is3D ? 'self-center h-[90%] my-auto py-1' : 'self-stretch items-stretch py-0.5'}`}>
                <EvalBar orientation="vertical" />
              </div>

              {/* Asosiy 10x10 Dosqa */}
              <div className="flex-1 min-w-0 flex items-center justify-center">
                <Board />
              </div>
            </div>
          </div>

          {/* Pastdagi O'yinchi Kartasi (Sizning HUD — FAQAT MOBILDA ko'rinadi) */}
          <div
            className={`md:hidden h-9 sm:h-10 flex items-center justify-between px-2.5 sm:px-3 rounded-xl border transition-all duration-200 shrink-0 mt-1 ${
              is3D ? 'chess-board-box-3d' : 'chess-board-box'
            } ${
              isBottomTurn
                ? 'bg-[#21201d] border-white/60 shadow-[0_0_12px_rgba(255,255,255,0.1)] ring-1 ring-white/40'
                : 'bg-[#21201d]/80 border-[#383531]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#81b64c] overflow-hidden">
                {gameMode === 'aiVsAi' ? (
                  <BotIcon size={17} className="text-[#81b64c]" />
                ) : userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon size={17} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-white">
                    {bottomName}
                  </span>
                  <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1.5 py-0.2 rounded">
                    {bottomColor === 'white' ? t('white_color') : t('black_color')}
                  </span>
                  {gameMode === 'aiVsAi' && isBottomTurn && aiThinking && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 px-1.5 py-0.2 rounded flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      {t('bot_thinking')}
                    </span>
                  )}
                  {gameMode === 'aiVsAi' && isBottomTurn && aiVsAiPaused && !isGameOver && (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                      {t('paused_status')}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#81b64c] font-mono font-semibold leading-none">
                  {bottomRating} {gameMode === 'aiVsAi' ? '' : t('rating_label')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  isBottomTurn
                    ? 'bg-white text-[#21201d] font-black shadow-md'
                    : 'bg-[#1a1917] text-[#9b9893] border border-[#383531]'
                }`}
              >
                <ClockIcon size={12} />
                <ChessClock color={bottomColor} />
              </div>
            </div>
          </div>
        </div>

        {/* O'NG QISM: Desktop Sidebar (Planshet va Kompyuter ekranlarida ko'rinadi) */}
        <aside className="hidden md:flex flex-col w-[300px] lg:w-[340px] xl:w-[370px] h-full max-h-[calc(100dvh-60px)] bg-[#21201d] rounded-2xl lg:rounded-3xl border border-[#383531] p-3 shadow-2xl shrink-0 justify-between overflow-hidden my-auto gap-2">
          {/* 1. Sidebar Yuqori: Rejim Sarlavhasi & Raqib O'yinchi Kartasi */}
          <div className="shrink-0 space-y-2 pb-2 border-b border-[#383531]/80">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#81b64c] animate-pulse shrink-0" />
                <span className="font-extrabold text-xs sm:text-sm text-white tracking-wide truncate max-w-[170px] lg:max-w-[210px]">
                  {modeTitle}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black shrink-0">
                10×10 NUR CHESS
              </span>
            </div>

            {/* Raqib O'yinchi Kartasi (Opponent HUD) */}
            <div
              className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                isTopTurn
                  ? 'bg-[#282723] border-[#81b64c]/70 shadow-[0_0_12px_rgba(129,182,76,0.15)] ring-1 ring-[#81b64c]/50'
                  : 'bg-[#181715] border-[#383531]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#c3c2be] shrink-0">
                  {topColor === 'black' || gameMode === 'aiVsAi' ? (
                    <BotIcon size={18} className="text-[#81b64c]" />
                  ) : (
                    <UserIcon size={18} className="text-[#c3c2be]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[110px] lg:max-w-[140px]">
                      {opponentName}
                    </span>
                    <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1.5 py-0.2 rounded">
                      {topColor === 'white' ? t('white_color') : t('black_color')}
                    </span>
                    {gameMode === 'vsAI' && (
                      <button
                        onClick={() => setShowVsAiLevelModal(true)}
                        className="text-[10px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-1.5 py-0.2 rounded-md flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        title={t('ai_level_change_title')}
                      >
                        <span>🎯 {AI_LEVEL_NAMES[aiDepth]}</span>
                      </button>
                    )}
                    {(gameMode === 'vsAI' || gameMode === 'aiVsAi') && isTopTurn && aiThinking && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 px-1.5 py-0.2 rounded flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        {t('bot_thinking')}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#9b9893] font-mono leading-none mt-0.5">
                    {opponentRating} {gameMode === 'aiVsAi' ? '' : t('rating_label')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    isTopTurn
                      ? 'bg-[#81b64c] text-white shadow-md ring-1 ring-[#9ad35f]'
                      : 'bg-[#11100f] text-[#9b9893] border border-[#383531]'
                  }`}
                >
                  <ClockIcon size={13} />
                  <ChessClock color={topColor} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Sidebar O'rta: Harakatlar Tarixi (MoveHistory) */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden py-1">
            <div className="flex-1 min-h-0 bg-[#181715] rounded-xl border border-[#383531]/80 overflow-hidden">
              <MoveHistory className="h-full w-full border-none shadow-none bg-transparent" />
            </div>
          </div>

          {/* 3. Sidebar Pastki: Foydalanuvchi Kartasi & Boshqaruv Tugmalari */}
          <div className="shrink-0 space-y-2 pt-1 border-t border-[#383531]/80">
            {/* Foydalanuvchi Kartasi (User HUD) */}
            <div
              className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                isBottomTurn
                  ? 'bg-[#282723] border-white/60 shadow-[0_0_12px_rgba(255,255,255,0.1)] ring-1 ring-white/40'
                  : 'bg-[#181715] border-[#383531]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#2c2a26] border border-[#3d3a34] flex items-center justify-center text-[#81b64c] shrink-0 overflow-hidden">
                  {gameMode === 'aiVsAi' ? (
                    <BotIcon size={18} className="text-[#81b64c]" />
                  ) : userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[110px] lg:max-w-[140px]">
                      {bottomName}
                    </span>
                    <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1.5 py-0.2 rounded">
                      {bottomColor === 'white' ? t('white_color') : t('black_color')}
                    </span>
                    {gameMode === 'aiVsAi' && isBottomTurn && aiThinking && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 px-1.5 py-0.2 rounded flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        {t('bot_thinking')}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#81b64c] font-mono font-semibold leading-none mt-0.5">
                    {bottomRating} {gameMode === 'aiVsAi' ? '' : t('rating_label')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    isBottomTurn
                      ? 'bg-white text-[#21201d] font-black shadow-md'
                      : 'bg-[#11100f] text-[#9b9893] border border-[#383531]'
                  }`}
                >
                  <ClockIcon size={13} />
                  <ChessClock color={bottomColor} />
                </div>
              </div>
            </div>

            {/* Boshqaruv Tugmalari */}
            {gameMode === 'aiVsAi' ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Play / Pause */}
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_AI_VS_AI_PAUSE' })}
                    disabled={isGameOver}
                    className={`py-2.5 px-3 rounded-xl border font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                      aiVsAiPaused
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-amber-600/80 hover:bg-amber-500 text-white border-amber-500'
                    }`}
                  >
                    {aiVsAiPaused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
                    <span>{aiVsAiPaused ? t('btn_play') : t('btn_pause')}</span>
                  </button>

                  {/* Bitta qadam (Step) */}
                  <button
                    onClick={handleStepAiVsAi}
                    disabled={isGameOver || aiThinking}
                    className="py-2.5 px-3 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-sky-400 hover:text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
                    title={t('btn_step')}
                  >
                    <StepForwardIcon size={16} />
                    <span>{t('btn_step')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Tezlik */}
                  <button
                    onClick={handleCycleSpeed}
                    className="py-2 px-1 rounded-xl bg-[#2b2926] hover:bg-[#383531] border border-[#3d3a34] text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Speed"
                  >
                    <span>⚡</span>
                    <span className="text-[11px]">{aiVsAiSpeed >= 1000 ? `${aiVsAiSpeed / 1000}s` : `${aiVsAiSpeed}ms`}</span>
                  </button>

                  {/* Qayta jang */}
                  <button
                    onClick={() => dispatch({ type: 'NEW_GAME' })}
                    className="py-2 px-1 rounded-xl bg-[#2b2926] hover:bg-[#383531] border border-[#3d3a34] text-[#c3c2be] hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title={t('btn_restart')}
                  >
                    <RotateCwIcon size={14} />
                    <span className="text-[11px]">{t('btn_restart')}</span>
                  </button>

                  {/* To'xtatish */}
                  <button
                    onClick={() => dispatch({ type: 'RESIGN' })}
                    disabled={isGameOver}
                    className="py-2 px-1 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#e74c3c] hover:text-[#ec7063] font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title={t('btn_resign')}
                  >
                    <FlagIcon size={14} />
                    <span className="text-[11px]">{t('btn_resign')}</span>
                  </button>
                </div>
              </div>
            ) : (
              // Standart tugmalar (PVP va vsAI uchun)
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => dispatch({ type: 'UNDO' })}
                    disabled={history.length === 0 || isGameOver || gameMode === 'online'}
                    className="py-2.5 px-3 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#c3c2be] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
                  >
                    <RotateCcwIcon size={16} />
                    <span>{t('btn_undo')}</span>
                  </button>

                  <button
                    onClick={handleGetHint}
                    disabled={isGameOver || hintLoading}
                    className="py-2.5 px-3 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#81b64c] hover:text-[#99cc59] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
                  >
                    <LightbulbIcon size={16} />
                    <span>{hintLoading ? '...' : t('btn_hint')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
                    className="py-2 px-1.5 rounded-xl bg-[#2b2926] hover:bg-[#383531] border border-[#3d3a34] text-[#c3c2be] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
                    title={t('btn_flip')}
                  >
                    <RotateCwIcon size={14} />
                    <span className="text-[11px]">{t('btn_flip')}</span>
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'OFFER_DRAW' })}
                    disabled={isGameOver}
                    className="py-2 px-1.5 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#5dade2] hover:text-[#7fb3d5] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
                    title={t('btn_draw')}
                  >
                    <HandshakeIcon size={14} />
                    <span className="text-[11px]">{t('btn_draw')}</span>
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'RESIGN' })}
                    disabled={isGameOver}
                    className="py-2 px-1.5 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#e74c3c] hover:text-[#ec7063] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 cursor-pointer"
                    title={t('btn_resign')}
                  >
                    <FlagIcon size={14} />
                    <span className="text-[11px]">{t('btn_resign')}</span>
                  </button>
                </div>
              </>
            )}

            {/* Agar Bot o'ylanib qolsa — to'g'ridan-to'g'ri to'xtatish va tiklash tugmasi */}
            {aiThinking && (
              <button
                onClick={handleEmergencyReset}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 animate-pulse cursor-pointer"
              >
                <span>⚡ {t('bot_unfreeze_btn')}</span>
              </button>
            )}
          </div>
        </aside>
      </main>

      {/* ── 3. CHESS.COM USLUBIDAGI TAKTIL PASTKI TUGMALAR (FAQAT MOBILDA) ─────────── */}
      <footer className="px-3 pt-0.5 shrink-0 md:hidden max-w-md mx-auto w-full">
        {gameMode === 'aiVsAi' ? (
          <div className="grid grid-cols-4 gap-2">
            {/* Play / Pause */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_AI_VS_AI_PAUSE' })}
              disabled={isGameOver}
              className={`py-2 px-2 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 ${
                aiVsAiPaused
                  ? 'bg-emerald-600 text-slate-950 border-emerald-400'
                  : 'bg-amber-600/80 text-white border-amber-500'
              }`}
            >
              {aiVsAiPaused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
              <span className="text-[10px]">{aiVsAiPaused ? t('btn_play') : t('btn_pause')}</span>
            </button>

            {/* Step */}
            <button
              onClick={handleStepAiVsAi}
              disabled={isGameOver || aiThinking}
              className="py-2 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-sky-400 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5"
            >
              <StepForwardIcon size={18} />
              <span className="text-[10px]">{t('btn_step')}</span>
            </button>

            {/* Tezlik */}
            <button
              onClick={handleCycleSpeed}
              className="py-2 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] border border-[#3d3a34] text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5"
            >
              <span className="text-base leading-none">⚡</span>
              <span className="text-[10px]">{aiVsAiSpeed >= 1000 ? `${aiVsAiSpeed / 1000}s` : `${aiVsAiSpeed}ms`}</span>
            </button>

            {/* Qayta jang */}
            <button
              onClick={() => dispatch({ type: 'NEW_GAME' })}
              className="py-2 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] border border-[#3d3a34] text-[#c3c2be] hover:text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5"
            >
              <RotateCwIcon size={18} />
              <span className="text-[10px]">{t('btn_restart')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {/* Bekor qilish */}
            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={history.length === 0 || isGameOver || gameMode === 'online'}
              className="py-2 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#c3c2be] hover:text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 active:shadow-[0_0_0_#1a1917]"
              title={t('btn_undo')}
            >
              <RotateCcwIcon size={18} />
              <span className="text-[10px]">{t('btn_undo')}</span>
            </button>

            {/* Maslahat */}
            <button
              onClick={handleGetHint}
              disabled={isGameOver || hintLoading}
              className="py-2.5 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#81b64c] hover:text-[#99cc59] font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 active:shadow-[0_0_0_#1a1917]"
              title={t('btn_hint')}
            >
              <LightbulbIcon size={18} />
              <span className="text-[10px]">{hintLoading ? '...' : t('btn_hint')}</span>
            </button>

            {/* Durang taklif */}
            <button
              onClick={() => {
                dispatch({ type: 'OFFER_DRAW' });
              }}
              disabled={isGameOver}
              className="py-2.5 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#5dade2] hover:text-[#7fb3d5] font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 active:shadow-[0_0_0_#1a1917]"
              title={t('btn_draw')}
            >
              <HandshakeIcon size={18} />
              <span className="text-[10px]">{t('btn_draw')}</span>
            </button>

            {/* Taslim */}
            <button
              onClick={() => {
                dispatch({ type: 'RESIGN' });
              }}
              disabled={isGameOver}
              className="py-2.5 px-2 rounded-xl bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 border border-[#3d3a34] text-[#e74c3c] hover:text-[#ec7063] font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-[0_2px_0_#1a1917] active:translate-y-0.5 active:shadow-[0_0_0_#1a1917]"
              title={t('btn_resign')}
            >
              <FlagIcon size={18} />
              <span className="text-[10px]">{t('btn_resign')}</span>
            </button>
          </div>
        )}
      </footer>

      {/* Harakatlar tarixi modali */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#21201d] border-t sm:border border-[#383531] rounded-t-3xl sm:rounded-2xl p-4 shadow-2xl flex flex-col max-h-[85vh] pb-[max(1.2rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between pb-3 border-b border-[#383531] mb-2">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <ScrollTextIcon size={18} className="text-[#81b64c]" />
                <span>{t('history_title')}</span>
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

      {/* Bot darajasini o'zgartirish modali (vsAI rejimida) */}
      {showVsAiLevelModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#21201d] border border-[#383531] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#383531]">
              <div className="flex items-center gap-2">
                <BotIcon size={20} className="text-[#81b64c]" />
                <h3 className="font-bold text-white text-base">{t('ai_level_change_title')}</h3>
              </div>
              <button
                onClick={() => setShowVsAiLevelModal(false)}
                className="w-8 h-8 rounded-lg bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white font-bold flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {[
                { depth: 1, name: AI_LEVEL_NAMES[1], rating: '1000 ' + t('rating_label'), desc: 'D-1', badge: 'D-1' },
                { depth: 2, name: AI_LEVEL_NAMES[2], rating: '1400 ' + t('rating_label'), desc: 'D-2', badge: 'D-2' },
                { depth: 3, name: AI_LEVEL_NAMES[3], rating: '1800 ' + t('rating_label'), desc: 'D-3', badge: 'D-3' },
                { depth: 4, name: AI_LEVEL_NAMES[4], rating: '2200 ' + t('rating_label'), desc: 'D-4', badge: 'D-4' },
              ].map((lvl) => {
                const isSelected = aiDepth === lvl.depth;
                return (
                  <button
                    key={lvl.depth}
                    onClick={() => {
                      dispatch({ type: 'SET_AI_DEPTH', depth: lvl.depth });
                      setShowVsAiLevelModal(false);
                      logger.logInfo('UI', `Bot darajasi: ${lvl.name} (D-${lvl.depth})`);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#81b64c]/20 border-[#81b64c] shadow-[0_0_12px_rgba(129,182,76,0.2)]'
                        : 'bg-[#181715] border-[#383531] hover:border-[#45423c] hover:bg-[#262421]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isSelected ? 'text-[#81b64c]' : 'text-white'}`}>
                          {lvl.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#383531] text-[#c3c2be] font-bold">
                          {lvl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9b9893] mt-0.5">{lvl.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400 block">{lvl.rating}</span>
                      {isSelected && (
                        <span className="text-[10px] text-[#81b64c] font-bold">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowVsAiLevelModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#383531] hover:bg-[#45423c] text-white font-bold text-sm transition-all cursor-pointer"
            >
              {t('close_btn')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
