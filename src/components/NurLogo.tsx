// =====================================================
// NUR CHESS 100 — Rasmiy Dumaloq Logotip (Official Emblem)
// Muallif: Nurfullo Nurmatov
// Foydalanuvchi taqdim etgan rasmiy logotip asosida
// =====================================================

import React from 'react';

interface NurLogoProps {
  size?: number | string;
  className?: string;
  showGlow?: boolean;
}

export default function NurLogo({ size = 72, className = '', showGlow = true }: NurLogoProps) {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 pointer-events-none ${
        showGlow ? 'drop-shadow-[0_0_20px_rgba(245,158,11,0.45)]' : ''
      } ${className}`}
      title="NUR CHESS 100 — Rasmiy Logotip (Muallif: Nurfullo Nurmatov)"
    >
      <img
        src="/nur-chess-logo.png"
        alt="NUR CHESS 100 Rasmiy Logotipi"
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
