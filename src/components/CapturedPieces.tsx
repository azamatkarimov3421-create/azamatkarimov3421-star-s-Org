// =====================================================
// NUR SHAXMAT 100 — O'yinchi Profili va Yutib Olingan Donalar
// =====================================================

import React from 'react';
import { Color, Piece, PieceType, PIECE_VALUES } from '../engine/types';
import { useGame } from '../store/gameStore';
import PieceIcon from './PieceIcon';

import { ChessClock } from './ChessClock';

const ORDER: PieceType[] = ['Queen', 'Nur', 'Rook', 'Bishop', 'Knight', 'Pawn'];

function groupPieces(pieces: Piece[]): Partial<Record<PieceType, number>> {
  const groups: Partial<Record<PieceType, number>> = {};
  for (const p of pieces) {
    groups[p.type] = (groups[p.type] ?? 0) + 1;
  }
  return groups;
}

function calcValue(pieces: Piece[]): number {
  return pieces.reduce(
    (sum, p) => sum + (PIECE_VALUES[p.type] === 9999 ? 0 : PIECE_VALUES[p.type]),
    0
  );
}

interface PlayerCardProps {
  playerColor: Color;
  position: 'top' | 'bottom';
}

export function PlayerCard({ playerColor, position }: PlayerCardProps) {
  const { state } = useGame();
  const { game, gameMode, aiColor, aiDepth, aiWhiteDepth, aiBlackDepth, aiThinking } = state;
  const { currentTurn, capturedByWhite, capturedByBlack, status } = game;

  const isWhite = playerColor === 'white';
  const isAI = (gameMode === 'vsAI' && aiColor === playerColor) || gameMode === 'aiVsAi';
  const botDepth = isWhite ? aiWhiteDepth : aiBlackDepth;
  const isCurrentTurn = currentTurn === playerColor && status === 'playing';

  // Bu o'yinchi yutib olgan donlar (raqib donlari)
  const capturedPieces = isWhite ? capturedByWhite : capturedByBlack;
  const opponentCapturedPieces = isWhite ? capturedByBlack : capturedByWhite;

  const myValue = calcValue(capturedPieces);
  const oppValue = calcValue(opponentCapturedPieces);
  const advantage = Math.max(0, myValue - oppValue);

  const groups = groupPieces(capturedPieces);

  const aiLabels = ['', 'Oson', "O'rta", 'Kuchli'];

  return (
    <div
      className={`w-full max-w-[700px] flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl backdrop-blur-md transition-all duration-300 border ${
        isCurrentTurn
          ? 'bg-slate-900/95 border-amber-400/80 shadow-[0_0_16px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/40'
          : 'bg-slate-900/60 border-slate-800/80 shadow-md'
      }`}
    >
      {/* Chap: O'yinchi ma'lumoti & Taymer */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shadow-inner ${
              isWhite
                ? 'bg-gradient-to-tr from-amber-100 to-white text-slate-900 border border-slate-300'
                : 'bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 border border-slate-700'
            }`}
          >
            {isAI ? (
              <span className="text-base sm:text-xl">
                {['', '🤖', '⚡', '👑', '💎'][gameMode === 'aiVsAi' ? botDepth : aiDepth] || '🤖'}
              </span>
            ) : isWhite ? (
              <span>♔</span>
            ) : (
              <span>♚</span>
            )}
          </div>
          {/* Navbat indikatori nuqtasi */}
          {isCurrentTurn && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-amber-500 border-2 border-slate-900" />
            </span>
          )}
        </div>

        {/* Ism va unvon */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[110px] sm:max-w-none">
              {isAI
                ? (['', 'Bot Sardor', 'Bot Temur', 'Bot Alp Er Toʻnga', 'Bot Al-Xorazmiy'][gameMode === 'aiVsAi' ? botDepth : aiDepth] || 'AI Bot')
                : isWhite
                ? "Oqlar"
                : "Qoralar"}
            </span>
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 sm:py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isWhite
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {isWhite ? 'Oq' : 'Qora'}
            </span>
          </div>

          <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            {isCurrentTurn ? (
              isAI && aiThinking ? (
                <span className="text-amber-400 font-semibold animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping" />
                  <span className="hidden sm:inline">Harakatni hisoblamoqda...</span>
                  <span className="sm:hidden">Oʻylamoqda...</span>
                </span>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Navbat
                </span>
              )
            ) : (
              <span className="text-slate-500">Kutmoqda</span>
            )}
          </div>
        </div>

        {/* Shaxmat Taymeri */}
        <ChessClock color={playerColor} />
      </div>

      {/* O'ng: Yutib olingan donalar va afzallik */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[45%] flex-shrink-0 justify-end">
        {advantage > 0 && (
          <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded shadow-sm">
            +{advantage}
          </div>
        )}

        <div className="flex items-center gap-0.5 flex-nowrap justify-end">
          {capturedPieces.length === 0 ? (
            <span className="text-[10px] text-slate-600 italic hidden sm:inline">Yutib olingan donlar yo'q</span>
          ) : (
            ORDER.map((type) => {
              const count = groups[type] ?? 0;
              if (count === 0) return null;
              return (
                <div
                  key={type}
                  className="flex items-center relative group flex-shrink-0"
                  title={`${count} ta ${type}`}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 -mr-1 hover:scale-125 transition-transform">
                    {/* Yutib olingan donlar raqib rangida bo'ladi */}
                    <PieceIcon
                      type={type}
                      color={isWhite ? 'black' : 'white'}
                      size={22}
                    />
                  </div>
                  {count > 1 && (
                    <span className="text-[8px] sm:text-[9px] font-black bg-slate-950/90 text-amber-300 px-1 rounded-full border border-slate-700 z-20 -ml-1">
                      {count}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function CapturedPieces() {
  const { state } = useGame();
  const { isFlipped } = state;

  return (
    <div className="w-full flex flex-col gap-2 items-center">
      {/* Tepada joylashgan o'yinchi */}
      <PlayerCard
        playerColor={isFlipped ? 'white' : 'black'}
        position="top"
      />
    </div>
  );
}
