// =====================================================
// NUR SHAXMAT 100 — 3D GLB Farzin (Queen) Modeli
// Tripo 3D-dan kiritilgan real 3D model tasviri
// =====================================================

import React from 'react';
import { Color } from '../engine/types';

interface GLBQueenProps {
  color: Color;
  size?: number | string;
  className?: string;
  isSelected?: boolean;
}

export default function GLBQueen({
  color,
  size,
  className = '',
  isSelected = false,
}: GLBQueenProps) {
  const imgSrc = color === 'white' ? '/pieces/3d_queen_white.png' : '/pieces/3d_queen_black.png';

  const containerStyle: React.CSSProperties | undefined = size !== undefined
    ? {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }
    : undefined;

  return (
    <div
      style={containerStyle}
      className={`relative w-full h-full flex items-end justify-center pointer-events-none select-none ${className}`}
      title={`3D Farzin (Queen) — ${color === 'white' ? 'Oq' : 'Qora'}`}
    >
      <img
        src={imgSrc}
        alt={`3D ${color} Queen`}
        className={`w-full h-full object-contain object-bottom pointer-events-none select-none transition-transform duration-150 ${
          isSelected
            ? 'scale-110 -translate-y-2.5 drop-shadow-[0_14px_18px_rgba(245,158,11,0.85)]'
            : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]'
        }`}
        draggable={false}
      />
    </div>
  );
}
