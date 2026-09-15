// =====================================================
// NUR SHAXMAT 100 — Yuqori Sifatli Dosqa Komponenti (10x10)
// =====================================================

import React, { useCallback, useRef, useState } from 'react';
import { BoardTheme, useGame } from '../store/gameStore';
import { FILES, Move, Piece, Square, squaresEqual } from '../engine/types';
import PieceIcon from './PieceIcon';

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
    lightSquare: 'bg-gradient-to-br from-[#f3e3c6] to-[#e4ceaa] text-[#6d4c2b]',
    darkSquare: 'bg-gradient-to-br from-[#b37a4c] to-[#8d5428] text-[#f7e8ce]',
    frameBorder: 'border-[#4a2e18] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_2px_8px_rgba(255,255,255,0.15)]',
    frameBg: 'bg-gradient-to-br from-[#3b2011] via-[#2a160b] to-[#1c0d06]',
    coordText: 'text-[#d4af37]/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]',
    lastMove: 'bg-amber-400/45 ring-2 ring-amber-300/60 inset-0',
    selectedSquare: 'bg-yellow-300/60 ring-4 ring-yellow-400/90 shadow-[inset_0_0_12px_rgba(234,179,8,0.7)]',
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
  const { game, selectedSquare, legalMoves, useNumericNotation, boardTheme, isFlipped, hintMove } = state;
  const boardRef = useRef<HTMLDivElement>(null);

  // Drag & Drop
  const [dragPiece, setDragPiece] = useState<{ piece: Piece; from: Square } | null>(null);

  const themeStyle = THEME_STYLES[boardTheme] || THEME_STYLES.wood;

  // Qonuniy harakatlar xaritasi
  const legalTargetMap = new Map<string, Move>();
  legalMoves.forEach((m) => {
    legalTargetMap.set(`${m.to.file},${m.to.rank}`, m);
  });

  // Kvadratni bosish
  const handleSquareClick = useCallback((sq: Square) => {
    dispatch({ type: 'SELECT_SQUARE', square: sq });
  }, [dispatch]);

  // Drag boshlanishi
  const handleDragStart = useCallback((e: React.DragEvent, piece: Piece, from: Square) => {
    if (piece.color !== game.currentTurn) return;
    if (game.status !== 'playing' && game.status !== 'check') return;
    setDragPiece({ piece, from });
    dispatch({ type: 'SELECT_SQUARE', square: from });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${from.file},${from.rank}`);
  }, [game.currentTurn, game.status, dispatch]);

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
    <div className="relative select-none flex flex-col items-center">
      {/* Tashqi Zargarona Ramka */}
      <div
        className={`p-3.5 md:p-5 rounded-2xl border-4 ${themeStyle.frameBorder} ${themeStyle.frameBg} transition-all duration-300`}
      >
        {/* Yuqori Ustun Harflari */}
        <div className="flex mb-1.5 px-6">
          {displayedFiles.map((file) => (
            <div
              key={file}
              className={`w-9 h-6 sm:w-12 sm:h-6 md:w-14 md:h-7 lg:w-[60px] flex items-center justify-center text-[11px] sm:text-xs md:text-sm font-black tracking-wider ${themeStyle.coordText}`}
            >
              {file}
            </div>
          ))}
        </div>

        <div className="flex items-center">
          {/* Chap Qator Raqamlari */}
          <div className="flex flex-col py-0 mr-1.5">
            {displayedRanks.map((rankIdx) => (
              <div
                key={rankIdx}
                className={`w-6 h-9 sm:w-6 sm:h-12 md:w-7 md:h-14 lg:h-[60px] flex items-center justify-center text-[11px] sm:text-xs md:text-sm font-black ${themeStyle.coordText}`}
              >
                {rankIdx + 1}
              </div>
            ))}
          </div>

          {/* 10x10 Dosqa Grid */}
          <div
            ref={boardRef}
            className="grid grid-cols-10 border-2 border-black/40 rounded-lg overflow-hidden shadow-[inset_0_3px_12px_rgba(0,0,0,0.65)]"
          >
            {displayedRanks.map((rankIdx) =>
              displayedFiles.map((fileLetter) => {
                const fileIdx = FILES.indexOf(fileLetter);
                const sq: Square = { file: fileIdx, rank: rankIdx };
                const piece = game.board[rankIdx][fileIdx];
                const key = `${fileIdx},${rankIdx}`;

                const isLight = (rankIdx + fileIdx) % 2 === 0;
                const isSelected = selectedSquare !== null && squaresEqual(sq, selectedSquare);
                const legalMove = legalTargetMap.get(key);
                const isLegalTarget = Boolean(legalMove);
                const isLastMoveFrom = game.lastMove !== null && squaresEqual(sq, game.lastMove.from);
                const isLastMoveTo = game.lastMove !== null && squaresEqual(sq, game.lastMove.to);
                const isCheck = checkSquare !== null && squaresEqual(sq, checkSquare);
                const isHintFrom = hintMove !== null && squaresEqual(sq, hintMove.from);
                const isHintTo = hintMove !== null && squaresEqual(sq, hintMove.to);

                // Kvadrat foni
                let squareBgClass = isLight ? themeStyle.lightSquare : themeStyle.darkSquare;

                // 1-100 Raqamli notatsiya belgisi
                const numericLabel = rankIdx * 10 + fileIdx + 1;

                return (
                  <div
                    key={key}
                    onClick={() => handleSquareClick(sq)}
                    onDrop={(e) => handleDrop(e, sq)}
                    onDragOver={handleDragOver}
                    className={`relative w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-[60px] lg:h-[60px] flex items-center justify-center cursor-pointer transition-colors duration-150 ${squareBgClass}`}
                  >
                    {/* So'nggi Harakat Izlari */}
                    {(isLastMoveFrom || isLastMoveTo) && (
                      <div className={`absolute inset-0 pointer-events-none ${themeStyle.lastMove} z-[1]`} />
                    )}

                    {/* Maslahat harakati yoritgichi */}
                    {(isHintFrom || isHintTo) && (
                      <div className="absolute inset-0 pointer-events-none z-[4] bg-cyan-400/40 ring-4 ring-cyan-300 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                    )}

                    {/* Tanlangan kvadrat auralari */}
                    {isSelected && (
                      <div className={`absolute inset-0 pointer-events-none z-[5] ${themeStyle.selectedSquare}`} />
                    )}

                    {/* Shoh shahda bo'lgandagi xavf aulasi */}
                    {isCheck && (
                      <div className="absolute inset-0 pointer-events-none z-[6] bg-red-600/60 ring-4 ring-red-500 animate-pulse shadow-[inset_0_0_20px_rgba(239,68,68,0.9)]" />
                    )}

                    {/* 1-100 Raqamli Notatsiya suv belgisi */}
                    {useNumericNotation && (
                      <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-extrabold opacity-40 pointer-events-none z-[2]">
                        {numericLabel}
                      </span>
                    )}

                    {/* Qonuniy harakat nuqtasi / yeyish nishoni */}
                    {isLegalTarget && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        {piece ? (
                          // Yeyish nishoni: Xavf halqasi
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-[3.5px] border-emerald-400 bg-emerald-500/25 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
                        ) : (
                          // Bo'sh kvadratga harakat nuqtasi
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.9)] ring-2 ring-emerald-600/40" />
                        )}
                      </div>
                    )}

                    {/* Shaxmat Donasi */}
                    {piece && (
                      <div
                        draggable={piece.color === game.currentTurn}
                        onDragStart={(e) => handleDragStart(e, piece, sq)}
                        onDragEnd={handleDragEnd}
                        className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-150 ${
                          isSelected ? 'scale-110 -translate-y-1' : 'hover:scale-105'
                        }`}
                      >
                        <PieceIcon
                          type={piece.type}
                          color={piece.color}
                          size={46}
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* O'ng Qator Raqamlari */}
          <div className="flex flex-col py-0 ml-1.5">
            {displayedRanks.map((rankIdx) => (
              <div
                key={rankIdx}
                className={`w-6 h-9 sm:w-6 sm:h-12 md:w-7 md:h-14 lg:h-[60px] flex items-center justify-center text-[11px] sm:text-xs md:text-sm font-black ${themeStyle.coordText}`}
              >
                {rankIdx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Quyi Ustun Harflari */}
        <div className="flex mt-1.5 px-6">
          {displayedFiles.map((file) => (
            <div
              key={file}
              className={`w-9 h-6 sm:w-12 sm:h-6 md:w-14 md:h-7 lg:w-[60px] flex items-center justify-center text-[11px] sm:text-xs md:text-sm font-black tracking-wider ${themeStyle.coordText}`}
            >
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
