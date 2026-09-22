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
  size = '100%',
  className = '',
  isSelected = false,
}: GLBQueenProps) {
  const imgSrc = color === 'white' ? '/pieces/3d_queen_white.png' : '/pieces/3d_queen_black.png';

  const containerStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
  };

  return (
    <div
      style={containerStyle}
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      title={`3D Farzin (Queen) — ${color === 'white' ? 'Oq' : 'Qora'}`}
    >
      <img
        src={imgSrc}
        alt={`3D ${color} Queen`}
        className={`w-full h-full object-contain pointer-events-none select-none transition-transform duration-150 ${
          isSelected
            ? 'scale-110 -translate-y-1 drop-shadow-[0_12px_14px_rgba(245,158,11,0.65)]'
            : 'drop-shadow-[0_8px_10px_rgba(0,0,0,0.6)]'
        }`}
        draggable={false}
      />
    </div>
  );
}
