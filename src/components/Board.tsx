// =====================================================
// NUR SHAXMAT 100 — Yuqori Sifatli Dosqa Komponenti (10x10)
// =====================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BoardTheme, useGame } from '../store/gameStore';
import { FILES, Move, Piece, Square, squaresEqual } from '../engine/types';
import PieceIcon from './PieceIcon';
import NurLogo from './NurLogo';

// Mavzular rang palitrasi
const THEME_STYLES: Record<BoardTheme, {
  lightSquare: string;
  darkSquare: string;
  frameBorder: string;
  frameBg: string;
  coordText: string;
  lastMove: string;
  selectedSquare: string;
}> = {
  wood: {
    lightSquare: 'bg-[#ffff85] text-slate-900',
    darkSquare: 'bg-[#ff9d7a] text-slate-900',
    frameBorder: 'border-slate-300 shadow-[0_15px_40px_rgba(0,0,0,0.6)]',
    frameBg: 'bg-gradient-to-b from-[#fbfcfd] via-[#f1f5f9] to-[#e2e8f0]',
    coordText: 'text-slate-800 font-extrabold drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]',
    lastMove: 'bg-amber-400/45 ring-2 ring-amber-500/60 inset-0',
    selectedSquare: 'bg-yellow-400/60 ring-2 sm:ring-4 ring-amber-600/80 shadow-[inset_0_0_12px_rgba(217,119,6,0.4)]',
  },
  emerald: {
    lightSquare: 'bg-gradient-to-br from-[#f1f3dc] to-[#dee1be] text-[#365029]',
    darkSquare: 'bg-gradient-to-br from-[#779954] to-[#587a38] text-[#f0f4dd]',
    frameBorder: 'border-[#1b2f19] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_2px_8px_rgba(255,255,255,0.15)]',
    frameBg: 'bg-gradient-to-br from-[#1c2e1b] via-[#122012] to-[#0b140b]',
    coordText: 'text-[#9ae6b4]/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]',
    lastMove: 'bg-emerald-400/45 ring-2 ring-emerald-300/60',
    selectedSquare: 'bg-lime-300/60 ring-4 ring-lime-400/90 shadow-[inset_0_0_12px_rgba(163,230,53,0.7)]',
  },
  azure: {
    lightSquare: 'bg-gradient-to-br from-[#dce8f8] to-[#bed3ec] text-[#243d5f]',
    darkSquare: 'bg-gradient-to-br from-[#4d739e] to-[#2d5079] text-[#e3efff]',
    frameBorder: 'border-[#152538] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_2px_8px_rgba(255,255,255,0.15)]',
    frameBg: 'bg-gradient-to-br from-[#18283d] via-[#0f1b2b] to-[#070e17]',
    coordText: 'text-[#90cdf4]/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]',
    lastMove: 'bg-sky-400/45 ring-2 ring-sky-300/60',
    selectedSquare: 'bg-cyan-300/60 ring-4 ring-cyan-400/90 shadow-[inset_0_0_12px_rgba(34,211,238,0.7)]',
  },
  marble: {
    lightSquare: 'bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] text-[#334155]',
    darkSquare: 'bg-gradient-to-br from-[#64748b] to-[#475569] text-[#f1f5f9]',
    frameBorder: 'border-[#1e293b] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_2px_8px_rgba(255,255,255,0.15)]',
    frameBg: 'bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617]',
    coordText: 'text-[#cbd5e1]/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]',
    lastMove: 'bg-indigo-400/40 ring-2 ring-indigo-300/60',
    selectedSquare: 'bg-slate-300/70 ring-4 ring-white/90 shadow-[inset_0_0_12px_rgba(255,255,255,0.7)]',
  },
};

export default function Board() {
  const { state, dispatch } = useGame();
  const {
    game,
    selectedSquare,
    legalMoves,
    useNumericNotation,
    boardTheme,
    isFlipped,
    is3D,
    hintMove,
    gameMode,
    onlinePlayerColor,
    aiColor,
    aiThinking,
  } = state;
  const boardRef = useRef<HTMLDivElement>(null);

  // ── UNIFIED ZERO-RERENDER DRAG & DROP SYSTEM (2D & 3D, MOUSE & TOUCH) ──
  const pointerStartRef = useRef<{
    piece: Piece;
    from: Square;
    startX: number;
    startY: number;
    pointerId: number;
    isDragging: boolean;
    squareSize: number;
  } | null>(null);

  // Active floating ghost state: FAQAT drag boshlanganda 1 marta va tugaganda 1 marta yangilanadi.
  // Harakat davomida React qayta render qilinmaydi (Zero-Rerender GPU Hardware Acceleration)
  const [activeDrag, setActiveDrag] = useState<{
    piece: Piece;
    from: Square;
    squareSize: number;
  } | null>(null);

  const dragGhostRef = useRef<HTMLDivElement>(null);
  const is3DRef = useRef(is3D);
  is3DRef.current = is3D;

  // Timestamp to ignore synthetic clicks immediately after a completed drag
  const ignoreClickUntilRef = useRef<number>(0);

  // Dona harakati animatsiyasini qat'iy nazorat qilish (280ms davomida)
  const [animatingMoveIndex, setAnimatingMoveIndex] = useState<number | null>(null);
  useEffect(() => {
    if (game.moveHistory.length > 0) {
      setAnimatingMoveIndex(game.moveHistory.length - 1);
      const timer = setTimeout(() => {
        setAnimatingMoveIndex(null);
      }, 290);
      return () => clearTimeout(timer);
    }
  }, [game.moveHistory.length]);

  const themeStyle = THEME_STYLES[boardTheme] || THEME_STYLES.wood;

  // Qonuniy harakatlar xaritasi (useMemo orqali qayta hisoblashni keshlaymiz)
  const legalTargetMap = useMemo(() => {
    const map = new Map<string, Move>();
    for (let i = 0; i < legalMoves.length; i++) {
      const m = legalMoves[i];
      map.set(`${m.to.file},${m.to.rank}`, m);
    }
    return map;
  }, [legalMoves]);

  // Kvadratni bosish (Click-to-move va Tanlash)
  const handleSquareClick = useCallback((sq: Square) => {
    // Bot vs Bot rejimida qo'lda harakatlanish taqiqlanadi
    if (gameMode === 'aiVsAi') return;

    // Bot bilan o'ynaganda bot navbati yoki bot o'ylayotgan bo'lsa
    if (gameMode === 'vsAI' && (game.currentTurn === aiColor || aiThinking)) return;

    // Onlayn rejimda raqib navbatida kvadrat tanlash taqiqlanadi
    if (gameMode === 'online' && onlinePlayerColor && game.currentTurn !== onlinePlayerColor) return;

    // Agar onlayn rejimda bo'lsak va hali kvadrat tanlanmagan bo'lsa:
    // faqat o'z rangimizdagi donani tanlashga ruxsat beramiz
    if (gameMode === 'online' && onlinePlayerColor && !selectedSquare) {
      const p = game.board[sq.rank]?.[sq.file];
      if (p && p.color !== onlinePlayerColor) return;
    }
    dispatch({ type: 'SELECT_SQUARE', square: sq });
  }, [dispatch, gameMode, onlinePlayerColor, selectedSquare, game.board, game.currentTurn, aiColor, aiThinking]);

  // Drag boshlanishi (PointerDown: sichqoncha yoki barmoq tekkanda)
  const handlePointerDown = useCallback((e: React.PointerEvent, sq: Square) => {
    // Faqat chap sichqoncha tugmasi yoki teginish (barmoq/stylus)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Bot vs Bot rejimida qo'lda harakatlanish taqiqlanadi
    if (gameMode === 'aiVsAi') return;
    if (gameMode === 'vsAI' && (game.currentTurn === aiColor || aiThinking)) return;
    if (game.status !== 'playing' && game.status !== 'check') return;

    const piece = game.board[sq.rank]?.[sq.file];
    if (!piece) return;

    // Onlayn rejimda faqat o'z rangimizdagi donani ushlash mumkin
    if (gameMode === 'online' && onlinePlayerColor && piece.color !== onlinePlayerColor) return;

    // Faqat o'z navbatidagi donani ushlab surish mumkin
    if (piece.color !== game.currentTurn) return;

    const rect = boardRef.current?.getBoundingClientRect();
    const sqSize = rect ? rect.width / 10 : 44;

    pointerStartRef.current = {
      piece,
      from: sq,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      isDragging: false,
      squareSize: sqSize,
    };
  }, [gameMode, game.currentTurn, game.status, game.board, aiColor, aiThinking, onlinePlayerColor]);

  // Window darajasidagi yagona, barqaror pointer tinglovchilari
  const handleSquareClickRef = useRef(handleSquareClick);
  handleSquareClickRef.current = handleSquareClick;

  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      const tracker = pointerStartRef.current;
      if (!tracker) return;
      if (tracker.pointerId !== e.pointerId) return;

      const dx = e.clientX - tracker.startX;
      const dy = e.clientY - tracker.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Faqat qasddan 14px dan ko'proq surilgandagina drag boshlanadi
      if (!tracker.isDragging && dist >= 14) {
        tracker.isDragging = true;
        // Yurish mumkin bo'lgan nuqtalar darhol ko'rinishi uchun donani tanlaymiz
        dispatchRef.current({ type: 'SELECT_SQUARE', square: tracker.from });
        // React holatini FAQAT 1 marta yangilaymiz (origin donani xiralashtirish va ghost DOM ni ochish uchun)
        setActiveDrag({
          piece: tracker.piece,
          from: tracker.from,
          squareSize: tracker.squareSize,
        });
      }

      // Harakat davomida to'g'ridan-to'g'ri GPU transformatsiyasi (0ms kechikish, 0 React re-render!)
      if (tracker.isDragging && dragGhostRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        dragGhostRef.current.style.transform = is3DRef.current
          ? `translate3d(${x}px, ${y}px, 0) translate(-50%, -62%) scale(1.18) rotateX(-20deg)`
          : `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(1.12)`;
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      const tracker = pointerStartRef.current;
      if (!tracker) return;
      if (tracker.pointerId !== e.pointerId) return;

      const wasDragging = tracker.isDragging;
      const fromSq = tracker.from;

      pointerStartRef.current = null;
      setActiveDrag(null);

      if (wasDragging) {
        // Drag yakunlandi — orqasidan keladigan sintetik onClick ni 250ms ga bloklaymiz
        ignoreClickUntilRef.current = Date.now() + 250;

        // Qaysi kvadrat ustida qo'yib yuborilganini aniqlaymiz
        const elem = document.elementFromPoint(e.clientX, e.clientY);
        const sqBtn = elem?.closest('[data-square]');
        if (sqBtn) {
          const file = Number(sqBtn.getAttribute('data-file'));
          const rank = Number(sqBtn.getAttribute('data-rank'));
          if (!isNaN(file) && !isNaN(rank)) {
            const toSq: Square = { file, rank };
            if (!squaresEqual(fromSq, toSq)) {
              // Boshqa kvadratga tashlandi: Harakatni darhol bajaramiz
              handleSquareClickRef.current(toSq);
            }
          }
        }
      }
    };

    const handleGlobalPointerCancel = () => {
      pointerStartRef.current = null;
      setActiveDrag(null);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerCancel);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerCancel);
    };
  }, []);

  // Shoh shahda bo'lsa (useMemo orqali qayta hisoblashni keshlaymiz)
  const checkSquare = useMemo(() => {
    if (!game.isInCheck) return null;
    for (let r = 0; r < 10; r++) {
      for (let f = 0; f < 10; f++) {
        const p = game.board[r][f];
        if (p?.type === 'King' && p.color === game.currentTurn) {
          return { file: f, rank: r };
        }
      }
    }
    return null;
  }, [game.isInCheck, game.board, game.currentTurn]);

  // Fayllar va Ranklar ro'yxati (useMemo orqali ortiqcha massiv ajratishlarni yo'qotamiz)
  const displayedFiles = useMemo(() => (isFlipped ? [...FILES].reverse() : FILES), [isFlipped]);
  const displayedRanks = useMemo(
    () => (isFlipped ? Array.from({ length: 10 }, (_, i) => i) : Array.from({ length: 10 }, (_, i) => 9 - i)),
    [isFlipped]
  );

  return (
    <div
      className={`relative select-none flex flex-col items-center w-full mx-auto touch-manipulation transition-all duration-300 ${
        is3D ? 'chess-board-box-3d pt-0 pb-1' : 'chess-board-box'
      }`}
      style={
        is3D
          ? {
              perspective: '1200px',
              perspectiveOrigin: '50% 50%',
            }
          : undefined
      }
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Tashqi Zargarona Ramka (3D rejimida kitobdagidek qalin yog'och taxta) */}
      <div
        className={`w-full transition-all duration-300 select-none touch-manipulation ${
          is3D
            ? 'p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-4 sm:border-[5px] border-[#381f14] bg-gradient-to-b from-[#2e1810] via-[#1c0f0a] to-[#120906]'
            : `p-1 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-[3px] ${themeStyle.frameBorder} ${themeStyle.frameBg} shadow-xl`
        }`}
        style={
          is3D
            ? {
                transform: 'rotateX(26deg) translateY(-8px)',
                transformOrigin: '50% 48% 0',
                transformStyle: 'preserve-3d',
                boxShadow:
                  '0 18px 26px -4px rgba(0,0,0,0.85), 0 5px 0 0 #3d1e10, 0 9px 0 0 #2a1309, 0 13px 0 0 #190a04, inset 0 2px 4px rgba(255,255,255,0.22)',
              }
            : undefined
        }
      >
        {/* Yuqori Ustun Harflari */}
        <div className="grid grid-cols-[16px_1fr_16px] sm:grid-cols-[22px_1fr_22px] md:grid-cols-[26px_1fr_26px] items-center w-full mb-0.5 sm:mb-1">
          <div />
          <div className="grid grid-cols-10 w-full">
            {displayedFiles.map((file) => (
              <div
                key={file}
                className={`flex items-center justify-center text-[9px] sm:text-xs md:text-sm font-black tracking-wider ${
                  is3D ? 'text-[#f6dc88] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]' : themeStyle.coordText
                }`}
              >
                {file}
              </div>
            ))}
          </div>
          <div />
        </div>

        {/* O'rta qism: Chap raqamlar + 10x10 Dosqa + O'ng raqamlar */}
        <div
          className="grid grid-cols-[16px_1fr_16px] sm:grid-cols-[22px_1fr_22px] md:grid-cols-[26px_1fr_26px] items-stretch w-full"
          style={is3D ? { transformStyle: 'preserve-3d' } : undefined}
        >
          {/* Chap Qator Raqamlari (doska qatorlari bilan 100% bir xil balandlikda tekislangan) */}
          <div className="grid grid-rows-10 h-full w-full py-0">
            {displayedRanks.map((rankIdx) => (
              <div
                key={rankIdx}
                className={`h-full flex items-center justify-center text-[9px] sm:text-xs md:text-sm font-black ${
                  is3D ? 'text-[#f6dc88] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]' : themeStyle.coordText
                }`}
              >
                {rankIdx + 1}
              </div>
            ))}
          </div>

          {/* 10x10 Dosqa Grid (To'liq Fluid va Aspect-Square) */}
          <div
            ref={boardRef}
            className={`grid grid-cols-10 grid-rows-10 aspect-square w-full rounded sm:rounded-md touch-manipulation select-none ${
              is3D
                ? 'border-2 sm:border-[3px] border-[#5a331c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]'
                : 'overflow-hidden border sm:border-2 border-slate-400/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]'
            }`}
            style={is3D ? { transformStyle: 'preserve-3d' } : undefined}
          >
            {displayedRanks.map((rankIdx) =>
              displayedFiles.map((fileLetter) => {
                const fileIdx = FILES.indexOf(fileLetter);
                const sq: Square = { file: fileIdx, rank: rankIdx };
                const piece = game.board[rankIdx][fileIdx];
                const key = `${fileIdx},${rankIdx}`;

                const isLight = (rankIdx + fileIdx) % 2 !== 0;
                const isSelected = selectedSquare !== null && squaresEqual(sq, selectedSquare);
                const legalMove = legalTargetMap.get(key);
                const isLegalTarget = Boolean(legalMove);
                const isLastMoveFrom = game.lastMove !== null && squaresEqual(sq, game.lastMove.from);
                const isLastMoveTo = game.lastMove !== null && squaresEqual(sq, game.lastMove.to);
                const isCastlingRook =
                  game.lastMove !== null &&
                  Boolean(game.lastMove.isCastling && game.lastMove.rookTo && squaresEqual(sq, game.lastMove.rookTo));
                const isCheck = checkSquare !== null && squaresEqual(sq, checkSquare);
                const isHintFrom = hintMove !== null && squaresEqual(sq, hintMove.from);
                const isHintTo = hintMove !== null && squaresEqual(sq, hintMove.to);

                const isCurrentlyAnimating =
                  animatingMoveIndex !== null &&
                  animatingMoveIndex === game.moveHistory.length - 1 &&
                  (isLastMoveTo || isCastlingRook);

                // Donaning silliq siljish animatsiyasi (oxirgi harakat nuqtasiga qarab)
                let slideStyle: React.CSSProperties | undefined = undefined;

                if (isCurrentlyAnimating && isLastMoveTo && game.lastMove) {
                  const fromCol = isFlipped ? 9 - game.lastMove.from.file : game.lastMove.from.file;
                  const toCol = isFlipped ? 9 - game.lastMove.to.file : game.lastMove.to.file;
                  const fromRow = isFlipped ? game.lastMove.from.rank : 9 - game.lastMove.from.rank;
                  const toRow = isFlipped ? game.lastMove.to.rank : 9 - game.lastMove.to.rank;
                  const dx = (fromCol - toCol) * 100;
                  const dy = (fromRow - toRow) * 100;
                  slideStyle = { '--slide-x': `${dx}%`, '--slide-y': `${dy}%` } as React.CSSProperties;
                } else if (isCurrentlyAnimating && isCastlingRook && game.lastMove && game.lastMove.rookFrom && game.lastMove.rookTo) {
                  const fromCol = isFlipped ? 9 - game.lastMove.rookFrom.file : game.lastMove.rookFrom.file;
                  const toCol = isFlipped ? 9 - game.lastMove.rookTo.file : game.lastMove.rookTo.file;
                  const fromRow = isFlipped ? game.lastMove.rookFrom.rank : 9 - game.lastMove.rookFrom.rank;
                  const toRow = isFlipped ? game.lastMove.rookTo.rank : 9 - game.lastMove.rookTo.rank;
                  const dx = (fromCol - toCol) * 100;
                  const dy = (fromRow - toRow) * 100;
                  slideStyle = { '--slide-x': `${dx}%`, '--slide-y': `${dy}%` } as React.CSSProperties;
                }

                // Kvadrat foni (3D rejimida kitobdagidek tabiiy yog'och tuslari)
                let squareBgClass = is3D
                  ? isLight
                    ? 'bg-gradient-to-br from-[#f8ebc2] via-[#eedca4] to-[#dec17b] text-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]'
                    : 'bg-gradient-to-br from-[#c46937] via-[#b35728] to-[#97431b] text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]'
                  : isLight
                  ? themeStyle.lightSquare
                  : themeStyle.darkSquare;

                // 1-100 Raqamli notatsiya belgisi (A1=1, B1=2 ... H1=10, A2=11 ... H10=100)
                const numericLabel = rankIdx * 10 + fileIdx + 1;

                // 3D dona stilizatsiyasi (kitobdagidek tik turgan, asosi bilan; donani bosganda tepaga sakramaydi)
                const pieceStyle: React.CSSProperties = is3D
                  ? {
                      ...slideStyle,
                      transform: 'translateZ(6px) rotateX(-26deg) translateY(0px)',
                      transformOrigin: 'bottom center',
                      filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.85))' : undefined,
                      transition: isCurrentlyAnimating ? undefined : 'transform 0.15s ease-out',
                    }
                  : slideStyle || {};

                return (
                  <div
                    key={key}
                    className={`relative w-full h-full aspect-square flex items-center justify-center touch-manipulation select-none ${squareBgClass}`}
                    style={is3D && (piece || isLegalTarget) ? { transformStyle: 'preserve-3d' } : undefined}
                  >
                    {/* 100% to'liq qamrovli interaktiv tugma: Chertish va Sudrab tashlash (Drag & Drop) */}
                    <button
                      type="button"
                      aria-label={`${FILES[fileIdx]}${rankIdx + 1}`}
                      data-square={`${fileIdx},${rankIdx}`}
                      data-file={fileIdx}
                      data-rank={rankIdx}
                      onPointerDown={(e) => handlePointerDown(e, sq)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (Date.now() < ignoreClickUntilRef.current) return;
                        handleSquareClick(sq);
                      }}
                      className="absolute inset-0 w-full h-full z-30 cursor-pointer bg-transparent border-0 p-0 m-0 outline-none focus:outline-none select-none touch-manipulation active:bg-black/5"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    />

                    {/* So'nggi Harakat Izlari */}
                    {(isLastMoveFrom || isLastMoveTo) && (
                      <div className={`absolute inset-0 pointer-events-none ${themeStyle.lastMove} z-[1]`} />
                    )}

                    {/* Maslahat harakati yoritgichi */}
                    {(isHintFrom || isHintTo) && (
                      <div className="absolute inset-0 pointer-events-none z-[4] bg-cyan-400/40 ring-2 sm:ring-4 ring-cyan-300 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                    )}

                    {/* Tanlangan kvadrat: O'sha dona turgan joy butunlay o'zgacha yorqin oltin rangga kiradi */}
                    {isSelected && (
                      <div
                        className={`absolute inset-0 pointer-events-none z-[5] ${
                          is3D
                            ? 'bg-[#eab308]/85 ring-4 ring-amber-300 shadow-[inset_0_0_14px_rgba(234,179,8,0.95),0_0_10px_rgba(250,204,21,0.8)]'
                            : themeStyle.selectedSquare
                        }`}
                      />
                    )}

                    {/* Shoh shahda bo'lgandagi xavf aulasi */}
                    {isCheck && (
                      <div className="absolute inset-0 pointer-events-none z-[6] bg-red-600/60 ring-2 sm:ring-4 ring-red-500 shadow-[inset_0_0_16px_rgba(239,68,68,0.85)]" />
                    )}

                    {/* 1-100 Raqamli Notatsiya belgisi */}
                    {useNumericNotation && (
                      <span
                        className={`absolute top-0.5 left-0.5 text-[8px] sm:text-[9.5px] font-black pointer-events-none z-[2] leading-none ${
                          isLight ? 'text-slate-900/65' : 'text-white/65'
                        }`}
                      >
                        {numericLabel}
                      </span>
                    )}

                    {/* Qo'llanma 13-bet: H1 kvadrat katagida NUR CHESS 100 rasmiy logotipi belgisi */}
                    {sq.file === 9 && sq.rank === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2] opacity-75">
                        <NurLogo size="78%" showGlow={false} />
                      </div>
                    )}

                    {/* Bo'sh qonuniy kvadratning zamin yoritgichi (Landing Floor Glow) */}
                    {isLegalTarget && !piece && (
                      <div className="absolute inset-0 bg-emerald-500/20 shadow-[inset_0_0_14px_rgba(16,185,129,0.45)] pointer-events-none z-[3]" />
                    )}

                    {/* Qonuniy harakat nuqtasi / yeyish nishoni (Bosilish joylari juda aniq va 0ms kechikish) */}
                    {isLegalTarget && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                        style={is3D ? { transform: 'translateZ(6px)' } : undefined}
                      >
                        {piece ? (
                          // Yeyish nishoni: Qizil yoqut rangli xavf foni va o'tkir nishon doirasi
                          <div className="relative w-[92%] h-[92%] flex items-center justify-center">
                            <div className="absolute inset-0 rounded-xl bg-red-600/35 border-2 sm:border-[3px] border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.85),inset_0_0_10px_rgba(239,68,68,0.6)]" />
                            <div className="w-[78%] h-[78%] rounded-full border-2 border-white/95 ring-2 ring-red-500 shadow-md" />
                          </div>
                        ) : (
                          // Bo'sh kvadratga harakat nuqtasi: Yaqqol ko'zga tashlanadigan zümrad 3D nishon tugmasi (Ultra yengil va 0ms kechikish)
                          <div className="relative flex items-center justify-center">
                            {/* Tashqi mayin yashil halqa */}
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-emerald-400/50 bg-emerald-400/20 absolute" />
                            {/* Zümrad 3D nishon diski */}
                            <div className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-full bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 border-2 border-white shadow-[0_2px_6px_rgba(16,185,129,0.8),0_2px_4px_rgba(0,0,0,0.5)] ring-2 ring-emerald-600/70 flex items-center justify-center">
                              {/* Markaziy oq nuqta */}
                              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Shaxmat Donasi */}
                    {piece && (
                      <div
                        key={piece.id}
                        style={pieceStyle}
                        className={`relative z-10 w-full h-full flex items-center justify-center select-none pointer-events-none transition-opacity duration-150 ${
                          activeDrag && squaresEqual(sq, activeDrag.from)
                            ? 'opacity-30 scale-95'
                            : ''
                        } ${
                          isCurrentlyAnimating
                            ? is3D
                              ? 'animate-glide-3d z-20'
                              : 'animate-glide-2d z-20'
                            : ''
                        } ${
                          !is3D && isSelected && !(activeDrag && squaresEqual(sq, activeDrag.from))
                            ? 'scale-110 -translate-y-0.5'
                            : ''
                        }`}
                      >
                        <PieceIcon
                          type={piece.type}
                          color={piece.color}
                          is3D={is3D}
                          isSelected={isSelected}
                          className={`${is3D ? 'w-[84%] h-[84%]' : 'w-[92%] h-[92%]'} pointer-events-none select-none`}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* O'ng Qator Raqamlari */}
          <div className="grid grid-rows-10 h-full w-full py-0">
            {displayedRanks.map((rankIdx) => (
              <div
                key={rankIdx}
                className={`h-full flex items-center justify-center text-[9px] sm:text-xs md:text-sm font-black ${
                  is3D ? 'text-[#f6dc88] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]' : themeStyle.coordText
                }`}
              >
                {rankIdx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Quyi Ustun Harflari */}
        <div className="grid grid-cols-[16px_1fr_16px] sm:grid-cols-[22px_1fr_22px] md:grid-cols-[26px_1fr_26px] items-center w-full mt-0.5 sm:mt-1">
          <div />
          <div className="grid grid-cols-10 w-full">
            {displayedFiles.map((file) => (
              <div
                key={file}
                className={`flex items-center justify-center text-[9px] sm:text-xs md:text-sm font-black tracking-wider ${
                  is3D ? 'text-[#f6dc88] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]' : themeStyle.coordText
                }`}
              >
                {file}
              </div>
            ))}
          </div>
          <div />
        </div>
      </div>

      {/* ── DRAGGED PIECE FLOATING GHOST (2D va 3D apparat tezlashuvli GPU ghost) ── */}
      {activeDrag && activeDrag.piece && (
        <div
          ref={dragGhostRef}
          className="fixed top-0 left-0 pointer-events-none z-[9999] select-none touch-none will-change-transform"
          style={{
            width: activeDrag.squareSize * 0.94,
            height: activeDrag.squareSize * 0.94,
            transform: is3D
              ? `translate3d(${pointerStartRef.current?.startX ?? 0}px, ${pointerStartRef.current?.startY ?? 0}px, 0) translate(-50%, -62%) scale(1.18) rotateX(-20deg)`
              : `translate3d(${pointerStartRef.current?.startX ?? 0}px, ${pointerStartRef.current?.startY ?? 0}px, 0) translate(-50%, -50%) scale(1.12)`,
            filter: is3D
              ? 'drop-shadow(0 20px 18px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(234,179,8,0.85))'
              : 'drop-shadow(0 12px 10px rgba(0,0,0,0.55))',
          }}
        >
          <PieceIcon
            type={activeDrag.piece.type}
            color={activeDrag.piece.color}
            is3D={is3D}
            isSelected={true}
            className="w-full h-full pointer-events-none select-none"
          />
        </div>
      )}
    </div>
  );
}
