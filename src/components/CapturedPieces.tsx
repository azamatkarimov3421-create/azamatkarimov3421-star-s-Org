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
  const { game, gameMode, aiColor, aiDepth, aiThinking } = state;
  const { currentTurn, capturedByWhite, capturedByBlack, status } = game;

  const isWhite = playerColor === 'white';
  const isAI = gameMode === 'vsAI' && aiColor === playerColor;
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
      className={`w-full max-w-[700px] flex items-center justify-between px-4 py-2.5 rounded-2xl backdrop-blur-md transition-all duration-300 border ${
        isCurrentTurn
          ? 'bg-slate-900/90 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/40'
          : 'bg-slate-900/60 border-slate-800/80 shadow-md'
      }`}
    >
      {/* Chap: O'yinchi ma'lumoti & Taymer */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${
              isWhite
                ? 'bg-gradient-to-tr from-amber-100 to-white text-slate-900 border border-slate-300'
                : 'bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 border border-slate-700'
            }`}
          >
            {isAI ? (
              <span className="text-xl">🤖</span>
            ) : isWhite ? (
              <span>♔</span>
            ) : (
              <span>♚</span>
            )}
          </div>
          {/* Navbat indikatori nuqtasi */}
          {isCurrentTurn && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-slate-900" />
            </span>
          )}
        </div>

        {/* Ism va unvon */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">
              {isAI
                ? `AI (${aiLabels[aiDepth]})`
                : isWhite
                ? "Oq Donalar"
                : "Qora Donalar"}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isWhite
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {isWhite ? 'Oq' : 'Qora'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            {isCurrentTurn ? (
              isAI && aiThinking ? (
                <span className="text-amber-400 font-semibold animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping" />
                  Harakatni hisoblamoqda...
                </span>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Yurish navbati
                </span>
              )
            ) : (
              <span>Kutmoqda</span>
            )}
          </div>
        </div>

        {/* Shaxmat Taymeri */}
        <ChessClock color={playerColor} />
      </div>

      {/* O'ng: Yutib olingan donalar va afzallik */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-[50%]">
        {advantage > 0 && (
          <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black px-2 py-0.5 rounded-md shadow-sm">
            +{advantage}
          </div>
        )}

        <div className="flex items-center gap-0.5 flex-wrap justify-end">
          {capturedPieces.length === 0 ? (
            <span className="text-[11px] text-slate-600 italic">Yutib olingan donlar yo'q</span>
          ) : (
            ORDER.map((type) => {
              const count = groups[type] ?? 0;
              if (count === 0) return null;
              return (
                <div
                  key={type}
                  className="flex items-center relative group"
                  title={`${count} ta ${type}`}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 -mr-1.5 hover:scale-125 hover:z-30 transition-transform">
                    {/* Yutib olingan donlar raqib rangida bo'ladi */}
                    <PieceIcon
                      type={type}
                      color={isWhite ? 'black' : 'white'}
                      size={26}
                    />
                  </div>
                  {count > 1 && (
                    <span className="text-[9px] font-black bg-slate-950/90 text-amber-300 px-1 rounded-full border border-slate-700 z-20 -ml-1">
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
