// =====================================================
// NUR SHAXMAT 100 — Yuqori Sifatli Dosqa Komponenti (10x10)
// =====================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
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

  // Drag & Drop
  const [dragPiece, setDragPiece] = useState<{ piece: Piece; from: Square } | null>(null);

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

  // Qonuniy harakatlar xaritasi
  const legalTargetMap = new Map<string, Move>();
  legalMoves.forEach((m) => {
    legalTargetMap.set(`${m.to.file},${m.to.rank}`, m);
  });

  // Kvadratni bosish
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

  // Drag boshlanishi
  const handleDragStart = useCallback((e: React.DragEvent, piece: Piece, from: Square) => {
    // Bot vs Bot rejimida qo'lda harakatlanish taqiqlanadi
    if (gameMode === 'aiVsAi') return;

    if (gameMode === 'vsAI' && (game.currentTurn === aiColor || aiThinking)) return;
    if (piece.color !== game.currentTurn) return;
    if (game.status !== 'playing' && game.status !== 'check') return;
    // Onlaynda raqib donasini siljitish taqiqlanadi
    if (gameMode === 'online' && onlinePlayerColor && piece.color !== onlinePlayerColor) return;

    setDragPiece({ piece, from });
    dispatch({ type: 'SELECT_SQUARE', square: from });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${from.file},${from.rank}`);
  }, [game.currentTurn, game.status, gameMode, onlinePlayerColor, dispatch]);

  // Drag tugashi / tashlash
  const handleDrop = useCallback((e: React.DragEvent, to: Square) => {
    e.preventDefault();
    setDragPiece(null);
    if (!dragPiece) return;
    dispatch({ type: 'SELECT_SQUARE', square: to });
  }, [dragPiece, dispatch]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragPiece(null);
  }, []);

  // Shoh shahda bo'lsa
  const checkSquare = game.isInCheck
    ? (() => {
        for (let r = 0; r < 10; r++) {
          for (let f = 0; f < 10; f++) {
            const p = game.board[r][f];
            if (p?.type === 'King' && p.color === game.currentTurn) {
              return { file: f, rank: r };
            }
          }
        }
        return null;
      })()
    : null;

  // Fayllar va Ranklar ro'yxati (aylantirish hisobga olingan holda)
  const displayedFiles = isFlipped ? [...FILES].reverse() : FILES;
  const displayedRanks = isFlipped
    ? Array.from({ length: 10 }, (_, i) => i) // 0 dan 9 gacha (pastdan yuqoriga o'rniga teskari)
    : Array.from({ length: 10 }, (_, i) => 9 - i); // 9 dan 0 gacha

  return (
    <div
      className={`relative select-none flex flex-col items-center w-full mx-auto touch-none transition-all duration-300 ${
        is3D ? 'chess-board-box-3d pt-0.5 pb-2' : 'chess-board-box'
      }`}
      style={
        is3D
          ? {
              perspective: '1000px',
              perspectiveOrigin: '50% 65%',
            }
          : undefined
      }
      onTouchMove={(e) => {
        if (e.cancelable) e.preventDefault();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Tashqi Zargarona Ramka (3D rejimida kitobdagidek qalin yog'och taxta) */}
      <div
        className={`w-full transition-all duration-300 select-none touch-none ${
          is3D
            ? 'p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-4 sm:border-[5px] border-[#381f14] bg-gradient-to-b from-[#2e1810] via-[#1c0f0a] to-[#120906]'
            : `p-1 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-[3px] ${themeStyle.frameBorder} ${themeStyle.frameBg} shadow-xl`
        }`}
        style={
          is3D
            ? {
                transform: 'rotateX(28deg)',
                transformStyle: 'preserve-3d',
                boxShadow:
                  '0 20px 28px -4px rgba(0,0,0,0.85), 0 6px 0 0 #3d1e10, 0 10px 0 0 #2a1309, 0 14px 0 0 #190a04, inset 0 2px 4px rgba(255,255,255,0.18)',
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
            className={`grid grid-cols-10 grid-rows-10 aspect-square w-full rounded sm:rounded-md touch-none select-none ${
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

                // 3D dona stilizatsiyasi (kitobdagidek tik turgan, nur-soya va asosi bilan)
                const pieceStyle: React.CSSProperties = is3D
                  ? {
                      ...slideStyle,
                      transform: isSelected
                        ? 'translateZ(24px) rotateX(-28deg) translateY(-8px) scale(1.15)'
                        : 'translateZ(6px) rotateX(-28deg) translateY(-3px) scale(1.04)',
                      transformOrigin: 'bottom center',
                      filter: isSelected
                        ? 'drop-shadow(0 12px 10px rgba(0,0,0,0.85)) drop-shadow(0 0 12px rgba(245,158,11,0.85))'
                        : 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))',
                      transition: isCurrentlyAnimating ? undefined : 'transform 0.18s cubic-bezier(0.2, 0.9, 0.3, 1), filter 0.18s ease-out',
                    }
                  : slideStyle || {};

                return (
                  <div
                    key={key}
                    onClick={() => handleSquareClick(sq)}
                    onDrop={(e) => handleDrop(e, sq)}
                    onDragOver={handleDragOver}
                    className={`relative w-full h-full aspect-square flex items-center justify-center cursor-pointer transition-colors duration-150 touch-none select-none ${squareBgClass}`}
                    style={is3D ? { transformStyle: 'preserve-3d' } : undefined}
                  >
                    {/* So'nggi Harakat Izlari */}
                    {(isLastMoveFrom || isLastMoveTo) && (
                      <div className={`absolute inset-0 pointer-events-none ${themeStyle.lastMove} z-[1]`} />
                    )}

                    {/* Maslahat harakati yoritgichi */}
                    {(isHintFrom || isHintTo) && (
                      <div className="absolute inset-0 pointer-events-none z-[4] bg-cyan-400/40 ring-2 sm:ring-4 ring-cyan-300 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                    )}

                    {/* Tanlangan kvadrat auralari */}
                    {isSelected && (
                      <div
                        className={`absolute inset-0 pointer-events-none z-[5] ${
                          is3D
                            ? 'bg-amber-400/35 ring-2 sm:ring-4 ring-amber-400 shadow-[inset_0_0_15px_rgba(245,158,11,0.7)]'
                            : themeStyle.selectedSquare
                        }`}
                      />
                    )}

                    {/* Shoh shahda bo'lgandagi xavf aulasi */}
                    {isCheck && (
                      <div className="absolute inset-0 pointer-events-none z-[6] bg-red-600/60 ring-2 sm:ring-4 ring-red-500 animate-pulse shadow-[inset_0_0_20px_rgba(239,68,68,0.9)]" />
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

                    {/* Qonuniy harakat nuqtasi / yeyish nishoni (3D elevatsiyasi bilan) */}
                    {isLegalTarget && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                        style={is3D ? { transform: 'translateZ(4px)' } : undefined}
                      >
                        {piece ? (
                          // Yeyish nishoni: Xavf halqasi (3D rejimida ambar/qizil yorug'lik)
                          <div
                            className={`rounded-full border-2 sm:border-[3.5px] ${
                              is3D
                                ? 'w-[88%] h-[88%] border-amber-400 bg-red-500/30 shadow-[0_0_15px_rgba(245,158,11,0.95)] ring-2 ring-red-400/80 animate-pulse'
                                : 'w-[78%] h-[78%] border-emerald-400 bg-emerald-500/25 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse'
                            }`}
                          />
                        ) : (
                          // Bo'sh kvadratga harakat nuqtasi (3D rejimida nurlanuvchi zümrad disk)
                          <div
                            className={
                              is3D
                                ? 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.95)] ring-2 ring-white/70 animate-pulse'
                                : 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.9)] ring-1 sm:ring-2 ring-emerald-600/40'
                            }
                          />
                        )}
                      </div>
                    )}

                    {/* Shaxmat Donasi */}
                    {piece && (
                      <div
                        key={isCurrentlyAnimating ? `${piece.id}-${game.moveHistory.length}` : piece.id}
                        draggable={
                          piece.color === game.currentTurn &&
                          (gameMode !== 'online' || !onlinePlayerColor || piece.color === onlinePlayerColor)
                        }
                        onDragStart={(e) => handleDragStart(e, piece, sq)}
                        onDragEnd={handleDragEnd}
                        style={pieceStyle}
                        className={`relative z-10 w-full h-full flex items-center justify-center touch-none select-none ${
                          isCurrentlyAnimating
                            ? is3D
                              ? 'animate-glide-3d z-30'
                              : 'animate-glide-2d z-30'
                            : ''
                        } ${
                          !is3D && isSelected ? 'scale-110 -translate-y-0.5' : !is3D ? 'hover:scale-105 active:scale-95' : ''
                        }`}
                      >
                        <PieceIcon
                          type={piece.type}
                          color={piece.color}
                          is3D={is3D}
                          isSelected={isSelected}
                          className="w-[92%] h-[92%] pointer-events-none select-none"
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
    </div>
  );
}
