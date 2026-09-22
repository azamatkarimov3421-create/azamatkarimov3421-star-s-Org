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
  MenuIcon,
  ChessPawnIcon,
} from '../components/Icons';
import { PlayerCard } from '../components/CapturedPieces';
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
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showPiecesModal, setShowPiecesModal] = useState(false);
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

  // Rasmiy Turnir Shaxmat Soati (10 daqiqa + 5s qadam qo'shish bilan)
  React.useEffect(() => {
    if (gameMode === 'online' && state.timeControl === 0) {
      dispatch({ type: 'SET_TIME_CONTROL', seconds: 600, increment: 5 });
    }
  }, [gameMode, state.timeControl, dispatch]);

  React.useEffect(() => {
    if (state.timeControl <= 0 || isGameOver) return;
    const timer = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.timeControl, isGameOver, dispatch]);

  const aiThinkingRef = React.useRef(false);

  // Favqulodda muzlashdan chiqarish (Emergency Unfreeze Handler)
  const handleEmergencyReset = React.useCallback(() => {
    aiThinkingRef.current = false;
    setHintLoading(false);
    dispatch({ type: 'SET_AI_THINKING', thinking: false });
    dispatch({ type: 'SELECT_SQUARE', square: { rank: -1, file: -1 } });
    logger.logInfo('SYSTEM', "Foydalanuvchi tomonidan doska holati muvaffaqiyatli tiklandi va qotishdan chiqarildi.");
  }, [dispatch]);

  // Ekranni 90° burish / Yonboshcha qilish (Landscape Toggle)
  const handleToggleOrientation = React.useCallback(() => {
    try {
      if ((window as any).Android?.toggleOrientation) {
        (window as any).Android.toggleOrientation();
        return;
      }
    } catch {}

    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) {
          (screen.orientation as any).lock('landscape').catch(() => {});
        } else {
          (screen.orientation as any).lock('portrait').catch(() => {});
        }
      }
    } catch {}
  }, []);

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

    // 310ms kutish: foydalanuvchi donasining 280ms sirg'alib o'tish animatsiyasi to'liq va silliq tugashi uchun
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
    }, 310);

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

  const AI_LEVEL_NAMES = [
    '',
    'Bot Sardor (1000)',
    'Bot Temur (1400)',
    'Bot Alp Er Toʻnga (1800)',
    'Bot Al-Xorazmiy (2200)',
  ];
  const AI_LEVEL_RATINGS = [0, 1000, 1400, 1800, 2200];

  // Sarlavha matni (qisqa va aniq, matn sinib ketmasligi uchun)
  const modeTitle =
    gameMode === 'online'
      ? `${t('mode_online_title')} #${roomCode || ''}`
      : gameMode === 'vsAI'
      ? t('mode_vs_ai_title')
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

  // Raqib va pastki o'yinchi ma'lumotlari (qisqa, chiroyli va ustma-ust tushmaydigan)
  const opponentName =
    gameMode === 'online'
      ? (onlineManager.opponentName || t('player_label'))
      : gameMode === 'vsAI'
      ? 'Nur Bot'
      : gameMode === 'aiVsAi'
      ? (topColor === 'black' ? `${t('black_color')} Bot` : `${t('white_color')} Bot`)
      : `2-${t('player_label')}`;

  const opponentRating =
    gameMode === 'online'
      ? (onlineManager.opponentRating || 1200)
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
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#120d09] bg-[url('/wood_table_bg.jpg')] bg-cover bg-center text-[#f1f1f1] flex flex-col justify-center items-center font-sans select-none fixed inset-0 overflow-hidden touch-none overscroll-none">
      {/* Tabiiy yog'och stol ustidagi mayin yorug'lik vinetkasi (Soft ambient vignette) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/30 pointer-events-none z-0" />

      {/* ── 1. PLANSHT VA DESKTOP UCHUN SUZUVCHI TUGMALAR (Faqat md+ va landscape da) ── */}
      <div className="hidden md:flex landscape:flex absolute top-3 sm:top-5 left-3 sm:left-5 z-40 flex-col gap-3">
        {/* Menyuni ochish (☰ Hamburger) */}
        <button
          onClick={() => setShowMenuModal(true)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/45 hover:bg-black/70 active:scale-95 backdrop-blur-md border border-white/15 text-white shadow-[0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all cursor-pointer"
          title="Menyu"
        >
          <MenuIcon size={22} />
        </button>

        {/* Doskani aylantirish (↻ Rotate / Flip) */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/45 hover:bg-black/70 active:scale-95 backdrop-blur-md border border-white/15 text-white shadow-[0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all cursor-pointer"
          title={t('btn_flip')}
        >
          <RotateCwIcon size={20} />
        </button>

        {/* Ekranni 90° burish / Yonboshcha qilish (Landscape Toggle) */}
        <button
          onClick={handleToggleOrientation}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/45 hover:bg-black/70 active:scale-95 backdrop-blur-md border border-white/15 text-amber-300 shadow-[0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all cursor-pointer"
          title="90° Burish / Yonboshcha rejim"
        >
          <span className="text-xs font-black tracking-tighter">90°</span>
        </button>

        {/* 3D / 2D Ko'rinishni yoqish/o'chirish */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_3D' })}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl backdrop-blur-md border border-white/15 shadow-[0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all cursor-pointer font-black text-xs active:scale-95 ${
            is3D
              ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.7)]'
              : 'bg-black/45 text-white hover:bg-black/70'
          }`}
          title="3D / 2D ko'rinish"
        >
          3D
        </button>
      </div>

      {/* ── 2. MOBIL TIKKA REJIM: YUQORI BOSHQARUV PANELI (Ustma-ust tushmaydigan gorizontal panel) ── */}
      <header className="relative z-30 w-full max-w-[min(calc(100vw-12px),500px)] flex md:hidden landscape:hidden items-center justify-between px-2 pt-1.5 pb-1 shrink-0">
        {/* Chap amallar: Menyu, 90° Burish, Doskani aylantirish, 3D */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowMenuModal(true)}
            className="w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 active:scale-95 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
            title="Menyu"
          >
            <MenuIcon size={16} />
          </button>

          <button
            onClick={handleToggleOrientation}
            className="w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 active:scale-95 border border-white/15 text-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-md font-black text-xs"
            title="90° Burish / Yonboshcha"
          >
            90°
          </button>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
            className="w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 active:scale-95 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
            title={t('btn_flip')}
          >
            <RotateCwIcon size={15} />
          </button>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_3D' })}
            className={`w-8 h-8 rounded-xl border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md font-black text-xs active:scale-95 ${
              is3D
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                : 'bg-black/60 text-[#c3c2be] hover:text-white'
            }`}
            title="3D / 2D ko'rinish"
          >
            3D
          </button>
        </div>

        {/* Markaz: Rejim sarlavhasi */}
        <div className="px-2 py-0.5 rounded-full bg-black/50 border border-white/10 text-white font-extrabold text-[10px] truncate max-w-[110px]">
          {modeTitle}
        </div>

        {/* O'ng amallar: Bekor qilish, Maslahat */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={history.length === 0 || isGameOver || gameMode === 'online'}
            className="w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none active:scale-95 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
            title={t('btn_undo')}
          >
            <RotateCcwIcon size={15} />
          </button>

          <button
            onClick={handleGetHint}
            disabled={isGameOver || hintLoading}
            className="w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none active:scale-95 border border-white/15 text-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-md"
            title={t('btn_hint')}
          >
            <LightbulbIcon size={16} />
          </button>
        </div>
      </header>

      {/* ── 3. YUQORI HOLAT XABARNOMALARI (Floating Status Indicators) ── */}
      {aiThinking && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-2xl animate-pulse pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{t('bot_thinking')}</span>
        </div>
      )}

      {game.isInCheck && !isGameOver && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-red-950/80 backdrop-blur-md border border-red-500/60 text-red-200 text-xs font-black flex items-center gap-2 shadow-2xl animate-bounce pointer-events-none">
          <span>🔥</span>
          <span>{t('check_alert')}</span>
        </div>
      )}

      {lastWarning && (
        <div
          onClick={() => setShowErrorModal(true)}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%] px-3.5 py-2 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center justify-between gap-2 cursor-pointer animate-fadeIn border border-amber-300"
        >
          <div className="flex items-center gap-2 truncate">
            <span>⚠️</span>
            <span className="truncate">{lastWarning}</span>
          </div>
          <span className="shrink-0 underline text-[11px] font-black">Log</span>
        </div>
      )}

      {/* ── 4. ASOSIY MAYDON: 10x10 SHAXMAT DOSQASI VA MOSLASHUVCHAN HUD ── */}
      <main className="relative z-10 w-full h-full flex flex-col md:flex-row landscape:flex-row items-center justify-center gap-1 sm:gap-2 lg:gap-5 p-1 sm:p-2 overflow-hidden">
        
        {/* MOBIL PORTRAIT: DOSKA USTIDAGI RAQIB KARTASI (Vaqt va profil doim ko'rinadi) */}
        <div className="w-full max-w-[min(calc(100vw-12px),500px)] px-1 md:hidden landscape:hidden z-20 shrink-0">
          <PlayerCard
            playerColor={topColor}
            position="top"
            customName={opponentName}
            customRating={opponentRating}
          />
        </div>

        {/* MOBIL PORTRAIT: POZITSIYA BAHOLANISHI (EvalBar - "manabu ham doskada kurisin") */}
        <div className="w-full max-w-[min(calc(100vw-12px),500px)] px-2.5 py-1 md:hidden landscape:hidden z-20 shrink-0 flex items-center justify-between text-[10px] text-zinc-300 font-bold bg-[#141210]/85 backdrop-blur-md rounded-xl border border-white/10 shadow-sm">
          <span className="text-zinc-400 font-medium">Holat baholanishi:</span>
          <div className="flex-1 mx-2.5">
            <EvalBar orientation="horizontal" />
          </div>
          <span className="text-amber-300 font-mono font-bold shrink-0">{moveHistory.length} ta yurish</span>
        </div>

        {/* 10x10 Shaxmat Dosqasi */}
        <Board />

        {/* MOBIL PORTRAIT: DOSKA OSTIDAGI O'YINCHI KARTASI (Vaqt va profil doim ko'rinadi) */}
        <div className="w-full max-w-[min(calc(100vw-12px),500px)] px-1 md:hidden landscape:hidden z-20 shrink-0">
          <PlayerCard
            playerColor={bottomColor}
            position="bottom"
            customName={bottomName}
            customRating={bottomRating}
          />
        </div>

        {/* ── DOIMIY O'NG YON PANEL (Landscape / Yonboshcha yoki Planshet/Desktop: Doska yonida turadi) ── */}
        <aside className="hidden md:flex landscape:flex flex-col w-[290px] sm:w-[320px] lg:w-[350px] max-h-[min(98dvh,760px)] bg-[#181512]/95 backdrop-blur-xl border border-[#3e342a] rounded-3xl p-3 sm:p-4 shadow-2xl justify-between gap-2.5 text-white shrink-0 z-20 overflow-y-auto">
          {/* Sarlavha & O'yin Rejimi */}
          <div className="flex items-center justify-between pb-1.5 border-b border-[#3e342a]/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#81b64c] animate-pulse" />
              <h3 className="font-black text-white text-xs sm:text-sm tracking-wide truncate max-w-[180px]">{modeTitle}</h3>
            </div>
            {state.timeControl > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                ⏱️ {Math.floor(state.timeControl / 60)}m {state.timeIncrement > 0 ? `+${state.timeIncrement}s` : ''}
              </span>
            )}
          </div>

          {/* Tepada joylashgan o'yinchi kartochkasi (Raqib / Bot) */}
          <PlayerCard
            playerColor={topColor}
            position="top"
            customName={opponentName}
            customRating={opponentRating}
          />

          {/* Baholash (EvalBar) va Navbat Holati */}
          <div className="bg-[#12100e]/90 p-2 rounded-2xl border border-[#2e261f]">
            <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 mb-1 flex items-center justify-between">
              <span>{t('eval_label') || 'Holat baholanishi'}:</span>
              <span className="text-white font-mono text-[10px]">{moveHistory.length} ta yurish</span>
            </div>
            <EvalBar orientation="horizontal" />
          </div>

          {/* Pastda joylashgan o'yinchi kartochkasi (Foydalanuvchi) */}
          <PlayerCard
            playerColor={bottomColor}
            position="bottom"
            customName={bottomName}
            customRating={bottomRating}
          />

          {/* Tezkor Boshqaruv Tugmalari (Yon paneldagi qulay vektor tugmalar) */}
          <div className="grid grid-cols-6 gap-1 pt-1 border-t border-[#3e342a]/80">
            {/* Harakatni bekor qilish */}
            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={history.length === 0 || isGameOver || gameMode === 'online'}
              className="py-2 rounded-xl bg-[#2a241e] hover:bg-[#383129] disabled:opacity-30 disabled:pointer-events-none active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
              title={t('btn_undo')}
            >
              <RotateCcwIcon size={16} />
            </button>

            {/* Maslahat */}
            <button
              onClick={handleGetHint}
              disabled={isGameOver || hintLoading}
              className="py-2 rounded-xl bg-[#2a241e] hover:bg-[#383129] disabled:opacity-30 disabled:pointer-events-none active:scale-95 text-amber-300 flex items-center justify-center transition-all cursor-pointer border border-white/5"
              title={t('btn_hint')}
            >
              <LightbulbIcon size={16} />
            </button>

            {/* Doskani aylantirish */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_FLIP' })}
              className="py-2 rounded-xl bg-[#2a241e] hover:bg-[#383129] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
              title={t('btn_flip')}
            >
              <RotateCwIcon size={16} />
            </button>

            {/* 90° Burish */}
            <button
              onClick={handleToggleOrientation}
              className="py-2 rounded-xl bg-[#2a241e] hover:bg-[#383129] active:scale-95 text-amber-400 flex items-center justify-center transition-all cursor-pointer border border-white/5 text-[11px] font-black"
              title="90° Burish / Tikka rejim"
            >
              90°
            </button>

            {/* Harakatlar tarixi */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="py-2 rounded-xl bg-[#2a241e] hover:bg-[#383129] active:scale-95 text-sky-400 flex items-center justify-center transition-all cursor-pointer border border-white/5"
              title={t('history_title')}
            >
              <ScrollTextIcon size={16} />
            </button>

            {/* Menyu */}
            <button
              onClick={() => setShowMenuModal(true)}
              className="py-2 rounded-xl bg-[#2a241e] hover:bg-[#383129] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
              title="Menyu"
            >
              <MenuIcon size={16} />
            </button>
          </div>
        </aside>
      </main>

      {/* Bot vs Bot Rejimidagi Suzuvchi Boshqaruv Paneli */}
      {gameMode === 'aiVsAi' && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/65 backdrop-blur-md border border-white/15 p-1.5 rounded-2xl shadow-2xl">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_AI_VS_AI_PAUSE' })}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              aiVsAiPaused ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}
          >
            {aiVsAiPaused ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
            <span>{aiVsAiPaused ? t('btn_play') : t('btn_pause')}</span>
          </button>
          <button
            onClick={handleStepAiVsAi}
            disabled={isGameOver || aiThinking}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-sky-400 font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <StepForwardIcon size={14} />
            <span>{t('btn_step')}</span>
          </button>
          <button
            onClick={handleCycleSpeed}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <span>⚡ {aiVsAiSpeed >= 1000 ? `${aiVsAiSpeed / 1000}s` : `${aiVsAiSpeed}ms`}</span>
          </button>
        </div>
      )}

      {/* ── 5. ASOSIY O'YIN MENYUSI MODALI (☰ Hamburger bosilganda ochiladi) ── */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#1e1b18]/95 border border-[#3e342a] rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#3e342a]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#81b64c] animate-pulse" />
                <h3 className="font-black text-white text-base tracking-wide">{modeTitle}</h3>
              </div>
              <button
                onClick={() => setShowMenuModal(false)}
                className="w-8 h-8 rounded-xl bg-[#2a241e] hover:bg-[#383129] text-[#c3c2be] hover:text-white font-bold flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* O'yin ma'lumotlari */}
            <div className="bg-[#141210] p-3 rounded-2xl border border-[#2e261f] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2a241e] border border-[#3e342a] flex items-center justify-center text-[#81b64c]">
                  {gameMode === 'vsAI' || gameMode === 'aiVsAi' ? <BotIcon size={20} /> : <UserIcon size={20} />}
                </div>
                <div>
                  <div className="text-xs font-black text-white">{opponentName}</div>
                  <div className="text-[10px] text-[#9b9893] font-mono">{opponentRating} {t('rating_label')}</div>
                </div>
              </div>
              {gameMode === 'vsAI' && (
                <button
                  onClick={() => {
                    setShowMenuModal(false);
                    setShowVsAiLevelModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-black cursor-pointer"
                >
                  🎯 {AI_LEVEL_NAMES[aiDepth]}
                </button>
              )}
            </div>

            {/* Asosiy amallar ro'yxati */}
            <div className="flex flex-col gap-2">
              {/* 2D / 3D almashish */}
              <button
                onClick={() => dispatch({ type: 'SET_3D', enabled: !is3D })}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#2a241e] hover:bg-[#383129] border border-[#3e342a] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition-all active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <span>🎲</span>
                  <span>{is3D ? '2D Rejimga oʻtish' : '3D Rejimga oʻtish'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#81b64c]/20 text-[#81b64c] font-black">
                  {is3D ? '3D' : '2D'}
                </span>
              </button>

              {/* Qayta yangi o'yin */}
              <button
                onClick={() => {
                  setShowMenuModal(false);
                  dispatch({ type: 'NEW_GAME' });
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#2a241e] hover:bg-[#383129] border border-[#3e342a] text-white font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
              >
                <RotateCwIcon size={16} className="text-amber-400" />
                <span>{t('btn_restart')}</span>
              </button>

              {/* Harakatlar tarixi */}
              <button
                onClick={() => {
                  setShowMenuModal(false);
                  setShowHistoryModal(true);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#2a241e] hover:bg-[#383129] border border-[#3e342a] text-white font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
              >
                <ScrollTextIcon size={16} className="text-sky-400" />
                <span>{t('history_title')}</span>
              </button>

              {/* Durang taklif qilish */}
              <button
                onClick={() => {
                  setShowMenuModal(false);
                  dispatch({ type: 'OFFER_DRAW' });
                }}
                disabled={isGameOver}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#2a241e] hover:bg-[#383129] disabled:opacity-30 border border-[#3e342a] text-white font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
              >
                <HandshakeIcon size={16} className="text-blue-400" />
                <span>{t('btn_draw')}</span>
              </button>

              {/* Taslim bo'lish */}
              <button
                onClick={() => {
                  setShowMenuModal(false);
                  dispatch({ type: 'RESIGN' });
                }}
                disabled={isGameOver}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#2a241e] hover:bg-[#383129] disabled:opacity-30 border border-[#3e342a] text-[#e74c3c] font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
              >
                <FlagIcon size={16} />
                <span>{t('btn_resign')}</span>
              </button>

              {/* Sozlamalar */}
              {onOpenSettings && (
                <button
                  onClick={() => {
                    setShowMenuModal(false);
                    onOpenSettings();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#2a241e] hover:bg-[#383129] border border-[#3e342a] text-white font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
                >
                  <SettingsIcon size={16} className="text-zinc-400" />
                  <span>{t('nav_settings')}</span>
                </button>
              )}

              {/* Xatoliklar / log */}
              {errorCount > 0 && (
                <button
                  onClick={() => {
                    setShowMenuModal(false);
                    setShowErrorModal(true);
                  }}
                  className="w-full py-2 px-3.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>⚠️</span>
                  <span>Tizim loglari ({errorCount})</span>
                </button>
              )}

              {/* Bosh sahifaga chiqish */}
              <button
                onClick={() => {
                  setShowMenuModal(false);
                  if (gameMode === 'online' || roomCode) {
                    onlineManager.disconnect();
                    dispatch({ type: 'SET_ONLINE_ROOM', roomCode: null, myColor: null });
                    dispatch({ type: 'SET_GAME_MODE', mode: 'vsAI' });
                  }
                  onBack();
                }}
                className="w-full mt-1 py-2.5 px-3.5 rounded-xl bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-300 font-bold text-xs flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
              >
                <ArrowLeftIcon size={16} />
                <span>Bosh sahifaga chiqish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. DONALAR VA O'YINCHI HOLATI MODALI (♟ bosilganda ochiladi) ── */}
      {showPiecesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#1e1b18]/95 border border-[#3e342a] rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#3e342a]">
              <div className="flex items-center gap-2">
                <ChessPawnIcon size={20} className="text-[#81b64c]" />
                <h3 className="font-black text-white text-base">Yutib Olingan Donalar</h3>
              </div>
              <button
                onClick={() => setShowPiecesModal(false)}
                className="w-8 h-8 rounded-xl bg-[#2a241e] hover:bg-[#383129] text-[#c3c2be] hover:text-white font-bold flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tepada joylashgan o'yinchi donalari */}
            <PlayerCard playerColor={topColor} position="top" />

            {/* Pastda joylashgan o'yinchi donalari */}
            <PlayerCard playerColor={bottomColor} position="bottom" />

            {/* Baholash (EvalBar) */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Holat baholanishi:</span>
                <span className="text-white font-mono">{moveHistory.length} ta yurish</span>
              </div>
              <EvalBar orientation="horizontal" />
            </div>
          </div>
        </div>
      )}

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
                { depth: 1, avatar: '🤖', name: 'Bot Sardor', title: t('ai_lvl_amateur'), rating: 1000, desc: t('ai_lvl_amateur_desc'), badge: 'D-1' },
                { depth: 2, avatar: '⚡', name: 'Bot Temur', title: t('ai_lvl_experienced'), rating: 1400, desc: t('ai_lvl_experienced_desc'), badge: 'D-2' },
                { depth: 3, avatar: '👑', name: 'Bot Alp Er Toʻnga', title: t('ai_lvl_master'), rating: 1800, desc: t('ai_lvl_master_desc'), badge: 'D-3' },
                { depth: 4, avatar: '💎', name: 'Bot Al-Xorazmiy', title: t('ai_lvl_grandmaster'), rating: 2200, desc: t('ai_lvl_grandmaster_desc'), badge: 'D-4' },
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
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#81b64c]/20 border-[#81b64c] shadow-[0_0_12px_rgba(129,182,76,0.2)]'
                        : 'bg-[#181715] border-[#383531] hover:border-[#45423c] hover:bg-[#262421]'
                    }`}
                  >
                    <span className="text-2xl w-10 h-10 rounded-xl bg-[#232f25] border border-[#384f3c] flex items-center justify-center shrink-0">
                      {lvl.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-bold text-sm truncate ${isSelected ? 'text-[#81b64c]' : 'text-white'}`}>
                          {lvl.name}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">
                          ⭐ {lvl.rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9b9893] mt-0.5 line-clamp-1">{lvl.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${isSelected ? 'border-[#81b64c] bg-[#81b64c]' : 'border-[#4b5563]'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
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
