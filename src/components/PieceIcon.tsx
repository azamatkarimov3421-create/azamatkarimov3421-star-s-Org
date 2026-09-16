// =====================================================
// NUR SHAXMAT 100 — Rasmiy Shaxmat Donalari
// Foydalanuvchi taqdim etgan cburnett klassik to'plami va
// rasmiy Nur donalari (Muallif: Nurfullo Nurmatov) asosida
// =====================================================

import React from 'react';
import { Color, PieceType } from '../engine/types';

interface PieceIconProps {
  type: PieceType;
  color: Color;
  size?: number | string;
  className?: string;
}

const PIECE_SRC_MAP: Record<PieceType, { white: string; black: string }> = {
  King: { white: '/pieces/wK.svg', black: '/pieces/bK.svg' },
  Queen: { white: '/pieces/wQ.svg', black: '/pieces/bQ.svg' },
  Rook: { white: '/pieces/wR.svg', black: '/pieces/bR.svg' },
  Bishop: { white: '/pieces/wB.svg', black: '/pieces/bB.svg' },
  Knight: { white: '/pieces/wN.svg', black: '/pieces/bN.svg' },
  Pawn: { white: '/pieces/wP.svg', black: '/pieces/bP.svg' },
  Nur: { white: '/pieces/wNur.png', black: '/pieces/bNur.png' },
};

export default function PieceIcon({ type, color, size, className = '' }: PieceIconProps) {
  const isWhite = color === 'white';
  const src = PIECE_SRC_MAP[type][color];

  const style = size !== undefined
    ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }
    : undefined;

  return (
    <div
      style={style}
      className={`relative flex items-center justify-center select-none pointer-events-none transition-transform duration-100 ${className}`}
      title={`${type} (${isWhite ? 'Oq' : 'Qora'})`}
    >
      <img
        src={src}
        alt={`${color} ${type}`}
        className="w-[88%] h-[88%] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
