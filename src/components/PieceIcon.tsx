// =====================================================
// NUR SHAXMAT 100 — Rasmiy Shaxmat Donalari
// 2D (cburnett yuqori aniqlikdagi SVG vektorlari) va 3D (Piece3D volumetrik)
// =====================================================

import React, { useState } from 'react';
import { Color, PieceType } from '../engine/types';
import Piece3D from './Piece3D';

interface PieceIconProps {
  type: PieceType;
  color: Color;
  size?: number | string;
  className?: string;
  is3D?: boolean;
  isSelected?: boolean;
}

const BASE = (import.meta.env.BASE_URL || './').replace(/\/$/, '');

const PIECE_SRC_MAP: Record<PieceType, { white: string; black: string }> = {
  King: { white: `${BASE}/pieces/wK.svg`, black: `${BASE}/pieces/bK.svg` },
  Queen: { white: `${BASE}/pieces/wQ.svg`, black: `${BASE}/pieces/bQ.svg` },
  Rook: { white: `${BASE}/pieces/wR.svg`, black: `${BASE}/pieces/bR.svg` },
  Bishop: { white: `${BASE}/pieces/wB.svg`, black: `${BASE}/pieces/bB.svg` },
  Knight: { white: `${BASE}/pieces/wN.svg`, black: `${BASE}/pieces/bN.svg` },
  Pawn: { white: `${BASE}/pieces/wP.svg`, black: `${BASE}/pieces/bP.svg` },
  Nur: { white: `${BASE}/pieces/wNur.svg`, black: `${BASE}/pieces/bNur.svg` },
};

const UNICODE_PIECES: Record<PieceType, { white: string; black: string }> = {
  King: { white: '♔', black: '♚' },
  Queen: { white: '♕', black: '♛' },
  Rook: { white: '♖', black: '♜' },
  Bishop: { white: '♗', black: '♝' },
  Knight: { white: '♘', black: '♞' },
  Pawn: { white: '♙', black: '♟' },
  Nur: { white: '✦', black: '✦' },
};

function PieceIconComponent({
  type,
  color,
  size,
  className = '',
  is3D = false,
  isSelected = false,
}: PieceIconProps) {
  const [imgError, setImgError] = useState(false);

  // Agar 3D rejim bo'lsa — to'liq 3D SVG/GLB figurasi ishlatiladi
  if (is3D) {
    return (
      <Piece3D
        type={type}
        color={color}
        size={size}
        className={className}
        isSelected={isSelected}
      />
    );
  }

  // 2D rejim — 100% tiniq vektorli SVG donalar + kontur kontrast soyasi
  const isWhite = color === 'white';
  const src = PIECE_SRC_MAP[type][color];

  const style = size !== undefined
    ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }
    : undefined;

  // Oq va Qora donalar har qanday katak ustida keskin va tiniq ajralib turishi uchun maxsus kontur soya
  const crispFilter = isWhite
    ? 'drop-shadow(0 1.5px 2px rgba(0, 0, 0, 0.52))'
    : 'drop-shadow(0 0.6px 0.9px rgba(255, 250, 235, 0.42)) drop-shadow(0 2px 2.5px rgba(0, 0, 0, 0.48))';

  return (
    <div
      style={style}
      className={`relative flex items-center justify-center select-none pointer-events-none transition-transform duration-100 ${className}`}
      title={`${type} (${isWhite ? 'Oq' : 'Qora'})`}
    >
      {!imgError ? (
        <img
          src={src}
          alt={`${color} ${type}`}
          onError={() => setImgError(true)}
          style={{ filter: crispFilter }}
          className="w-[90%] h-[90%] object-contain pointer-events-none select-none"
          draggable={false}
        />
      ) : (
        <span
          className={`text-2xl font-black select-none pointer-events-none ${
            isWhite ? 'text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]' : 'text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.45)]'
          }`}
        >
          {UNICODE_PIECES[type]?.[color] || type[0]}
        </span>
      )}
    </div>
  );
}

const PieceIcon = React.memo(PieceIconComponent);
export default PieceIcon;
