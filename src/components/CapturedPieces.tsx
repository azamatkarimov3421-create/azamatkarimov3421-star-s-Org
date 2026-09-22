// =====================================================
// NUR SHAXMAT 100 — O'yinchi Profili va Yutib Olingan Donalar
// =====================================================

import React from 'react';
import { Color, Piece, PieceType, PIECE_VALUES } from '../engine/types';
import { useGame } from '../store/gameStore';
import PieceIcon from './PieceIcon';

import { ChessClock } from './ChessClock';

import { getUserProfile } from '../store/userProfileStore';
import { onlineManager } from '../services/onlineService';

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
  customName?: string;
  customRating?: number;
}

export function PlayerCard({ playerColor, position, customName, customRating }: PlayerCardProps) {
  const { state } = useGame();
  const { game, gameMode, aiColor, aiDepth, aiWhiteDepth, aiBlackDepth, aiThinking } = state;
  const { currentTurn, capturedByWhite, capturedByBlack, status } = game;

  const isWhite = playerColor === 'white';
  const isAI = (gameMode === 'vsAI' && aiColor === playerColor) || gameMode === 'aiVsAi';
  const botDepth = isWhite ? aiWhiteDepth : aiBlackDepth;
  const isCurrentTurn = currentTurn === playerColor && (status === 'playing' || status === 'check');

  // Bu o'yinchi yutib olgan donlar (raqib donlari)
  const capturedPieces = isWhite ? capturedByWhite : capturedByBlack;
  const opponentCapturedPieces = isWhite ? capturedByBlack : capturedByWhite;

  const myValue = calcValue(capturedPieces);
  const oppValue = calcValue(opponentCapturedPieces);
  const advantage = Math.max(0, myValue - oppValue);

  const groups = groupPieces(capturedPieces);

  const userProfile = getUserProfile();
  const isOpponent = position === 'top';

  let displayName = customName;
  let displayRating = customRating;

  if (!displayName) {
    if (isAI) {
      const names = ['', 'Bot Sardor', 'Bot Temur', 'Bot Alp Er Toʻnga', 'Bot Al-Xorazmiy'];
      displayName = names[gameMode === 'aiVsAi' ? botDepth : aiDepth] || 'AI Bot';
      displayRating = (gameMode === 'aiVsAi' ? botDepth : aiDepth) * 400 + 800;
    } else if (gameMode === 'online') {
      if (isOpponent) {
        displayName = onlineManager.opponentName || 'Raqib';
        displayRating = onlineManager.opponentRating || 1200;
      } else {
        displayName = userProfile.name || 'Oʻyinchi';
        displayRating = userProfile.rating || 1200;
      }
    } else {
      displayName = isWhite ? 'Oqlar' : 'Qoralar';
      displayRating = isOpponent ? 1500 : userProfile.rating;
    }
  }

  return (
    <div
      className={`w-full flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl backdrop-blur-md transition-all duration-300 border ${
        isCurrentTurn
          ? 'bg-slate-900/95 border-amber-400/80 shadow-[0_0_16px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/40'
          : 'bg-slate-900/75 border-slate-800/80 shadow-md'
      }`}
    >
      {/* Chap: Avatar, Ism, Reyting, Donalar va Status */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-inner ${
              isWhite
                ? 'bg-gradient-to-tr from-amber-100 to-white text-slate-900 border border-slate-300'
                : 'bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 border border-slate-700'
            }`}
          >
            {isAI ? (
              <span className="text-base sm:text-lg">
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
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-slate-900" />
            </span>
          )}
        </div>

        {/* Ism va Donalar */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-extrabold text-xs sm:text-sm text-slate-100 truncate">
              {displayName}
            </span>
            {displayRating && displayRating > 0 ? (
              <span className="text-[10px] font-mono text-amber-400/90 font-bold shrink-0">
                ({displayRating})
              </span>
            ) : null}
            <span
              className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-black uppercase tracking-wider shrink-0 ${
                isWhite
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {isWhite ? 'Oq' : 'Qora'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 overflow-x-auto scrollbar-none">
            {isCurrentTurn ? (
              isAI && aiThinking ? (
                <span className="text-[10px] text-amber-400 font-bold animate-pulse shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping" />
                  <span>Oʻylamoqda...</span>
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>Navbat</span>
                </span>
              )
            ) : (
              <span className="text-[10px] text-slate-500 shrink-0">Kutmoqda</span>
            )}

            {advantage > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-1 rounded shadow-sm shrink-0">
                +{advantage}
              </span>
            )}

            {/* Yutib olingan donalar ikonkalari */}
            <div className="flex items-center gap-0.5 shrink-0 ml-0.5">
              {ORDER.map((type) => {
                const count = groups[type] ?? 0;
                if (count === 0) return null;
                return (
                  <div
                    key={type}
                    className="flex items-center relative group shrink-0"
                    title={`${count} ta ${type}`}
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 -mr-1">
                      <PieceIcon
                        type={type}
                        color={isWhite ? 'black' : 'white'}
                        size={18}
                      />
                    </div>
                    {count > 1 && (
                      <span className="text-[8px] font-black text-amber-300 z-10 -ml-0.5">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* O'ng: Rasmiy Turnir Soati (Alohida, mustaqil va hech narsa bilan ustma-ust tushmaydi!) */}
      <div className="shrink-0 ml-2">
        <ChessClock color={playerColor} />
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
