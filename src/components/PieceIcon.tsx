// =====================================================
// NUR SHAXMAT 100 — Professional 3D Staunton Vector Donalar
// =====================================================

import React from 'react';
import { Color, PieceType } from '../engine/types';

interface PieceIconProps {
  type: PieceType;
  color: Color;
  size?: number | string;
  className?: string;
}

export default function PieceIcon({ type, color, size, className = '' }: PieceIconProps) {
  const isWhite = color === 'white';
  const prefix = `p-${color}-${type}`;

  // Id'lar
  const bodyGradId = `${prefix}-body-grad`;
  const ringGradId = `${prefix}-ring-grad`;
  const goldGradId = `${prefix}-gold-grad`;
  const filterShadowId = `${prefix}-shadow`;

  const style = size !== undefined
    ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }
    : undefined;

  return (
    <div
      style={style}
      className={`relative flex items-center justify-center select-none transition-transform duration-150 ${className}`}
      title={`${type} (${isWhite ? 'Oq' : 'Qora'})`}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* 3D Tana Gradienti */}
          <linearGradient id={bodyGradId} x1="20%" y1="10%" x2="80%" y2="90%">
            {isWhite ? (
              <>
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#FAF4E8" />
                <stop offset="85%" stopColor="#E5D3B8" />
                <stop offset="100%" stopColor="#C9B496" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#4F5666" />
                <stop offset="35%" stopColor="#2D323C" />
                <stop offset="80%" stopColor="#171A21" />
                <stop offset="100%" stopColor="#0B0D12" />
              </>
            )}
          </linearGradient>

          {/* Halo / Halqa Gradienti */}
          <linearGradient id={ringGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {isWhite ? (
              <>
                <stop offset="0%" stopColor="#FFF3D6" />
                <stop offset="100%" stopColor="#D4B688" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#636E82" />
                <stop offset="100%" stopColor="#1E232D" />
              </>
            )}
          </linearGradient>

          {/* Oltin / Nur Gradienti */}
          <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {isWhite ? (
              <>
                <stop offset="0%" stopColor="#FFF59D" />
                <stop offset="40%" stopColor="#FBC02D" />
                <stop offset="80%" stopColor="#F57F17" />
                <stop offset="100%" stopColor="#B76E00" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="40%" stopColor="#AA7C11" />
                <stop offset="80%" stopColor="#6C4E05" />
                <stop offset="100%" stopColor="#3B2800" />
              </>
            )}
          </linearGradient>

          {/* Nur Donasi Uchun Nurlanish Filteri */}
          <filter id={filterShadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* ========================================================================= */}
        {/* DON SHAKLLARI */}
        {/* ========================================================================= */}

        {/* ── 1. SHOH (KING) ──────────────────────────────────────────────────────── */}
        {type === 'King' && (
          <g stroke={isWhite ? '#2C221E' : '#07080A'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Shoh Xochi */}
            <path
              d="M50 8 L50 20 M44 14 L56 14"
              stroke={isWhite ? '#C8963E' : '#F5C045'}
              strokeWidth="3.5"
            />
            <circle cx="50" cy="14" r="2.5" fill="#FFF" stroke="none" />

            {/* Toj Barmoqlari va Gumbaz */}
            <path
              d="M26 36 C24 26, 36 22, 50 22 C64 22, 76 26, 74 36 C74 44, 68 50, 68 56 L32 56 C32 50, 26 44, 26 36 Z"
              fill={`url(#${bodyGradId})`}
            />

            {/* Toj naqshlari va baxmal qatlamlar */}
            <path
              d="M32 30 Q50 25 68 30 M30 38 Q50 33 70 38 M28 46 Q50 41 72 46"
              stroke={isWhite ? '#D4B892' : '#454C5A'}
              strokeWidth="1.8"
              fill="none"
            />

            {/* Markaziy zumrad/yoqut tosh */}
            <circle cx="50" cy="36" r="4" fill={isWhite ? '#E53E3E' : '#D69E2E'} stroke="#FFF" strokeWidth="1" />

            {/* Bo'yin Halqalari */}
            <rect x="28" y="56" width="44" height="6" rx="3" fill={`url(#${ringGradId})`} />
            <rect x="24" y="62" width="52" height="7" rx="3.5" fill={`url(#${bodyGradId})`} />

            {/* Gavda va Poydevor */}
            <path
              d="M24 69 Q20 78 20 84 L80 84 Q80 78 76 69 Z"
              fill={`url(#${bodyGradId})`}
            />

            {/* Taglik Rishtalari */}
            <rect x="18" y="84" width="64" height="8" rx="4" fill={`url(#${ringGradId})`} />
          </g>
        )}

        {/* ── 2. VAZIR (QUEEN) ────────────────────────────────────────────────────── */}
        {type === 'Queen' && (
          <g stroke={isWhite ? '#2C221E' : '#07080A'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Vazir Marvaridlari (7 ta marvarid) */}
            {[24, 32, 41, 50, 59, 68, 76].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={i === 3 ? 16 : i === 2 || i === 4 ? 18 : i === 1 || i === 5 ? 21 : 25}
                r={i === 3 ? 3.5 : 2.8}
                fill={isWhite ? '#F6AD55' : '#F6AD55'}
                stroke="#FFF"
                strokeWidth="0.8"
              />
            ))}

            {/* Toj Tishlari */}
            <path
              d="M24 26 L30 42 L50 20 L70 42 L76 26 L64 34 L50 42 L36 34 Z"
              fill={`url(#${bodyGradId})`}
            />

            {/* Korset va Bo'yin */}
            <path
              d="M30 42 C30 42, 36 50, 50 50 C64 50, 70 42, 70 42 C70 54, 64 60, 64 64 L36 64 C36 60, 30 54, 30 42 Z"
              fill={`url(#${bodyGradId})`}
            />

            {/* Bo'yinga taqilgan javohir */}
            <circle cx="50" cy="48" r="3.5" fill="#3182CE" stroke="#FFF" strokeWidth="0.8" />

            {/* Halqalar */}
            <rect x="28" y="64" width="44" height="6" rx="3" fill={`url(#${ringGradId})`} />

            {/* Gavda va Poydevor */}
            <path
              d="M26 70 Q20 78 20 84 L80 84 Q80 78 74 70 Z"
              fill={`url(#${bodyGradId})`}
            />

            <rect x="18" y="84" width="64" height="8" rx="4" fill={`url(#${ringGradId})`} />
          </g>
        )}

        {/* ── 3. NUR (NUR - 100 KATAKLI SHAXMATNING NOYOB DONASI) ───────────────── */}
        {/* Muallif Nurfyllo Nurmatov chizmalari (33-bet) asosida: Minora/Mayak shakli, 4 tishli toji, nur tuynuklari va poydevori */}
        {type === 'Nur' && (
          <g stroke={isWhite ? '#6A4300' : '#111827'} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
            {/* 1. Atrofga taralayotgan 12 ta nur nurlari */}
            <g transform="translate(50, 30)">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = i * 30;
                const isLong = i % 2 === 0;
                const r1 = 19;
                const r2 = isLong ? 29 : 23;
                const rad = (angle * Math.PI) / 180;
                const x1 = Math.cos(rad) * r1;
                const y1 = Math.sin(rad) * r1;
                const x2 = Math.cos(rad) * r2;
                const y2 = Math.sin(rad) * r2;
                return (
                  <line
                    key={angle}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={`url(#${goldGradId})`}
                    strokeWidth={isLong ? '3.5' : '2'}
                    strokeLinecap="round"
                    opacity={isWhite ? 0.95 : 0.85}
                  />
                );
              })}
            </g>

            {/* 2. Minora Chiroq Turreti (Kitob 33-betidagi 4 tishli chiroq minorasi) */}
            <path
              d="M34 26 L34 14 L39 14 L39 19 L46 19 L46 14 L54 14 L54 19 L61 19 L61 14 L66 14 L66 26 Z"
              fill={`url(#${goldGradId})`}
              stroke={isWhite ? '#78350F' : '#FFD700'}
              strokeWidth="2.2"
            />

            {/* Nur nurlanish tuynuklari (Light slits) */}
            <line x1="42" y1="21" x2="42" y2="25" stroke={isWhite ? '#78350F' : '#030712'} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="21" x2="50" y2="25" stroke={isWhite ? '#78350F' : '#030712'} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="58" y1="21" x2="58" y2="25" stroke={isWhite ? '#78350F' : '#030712'} strokeWidth="2.5" strokeLinecap="round" />

            {/* 3. Minora Cho'qqisi (Oltin Nur nuri) */}
            <circle cx="50" cy="9" r="4.5" fill="#FBBF24" stroke={isWhite ? '#78350F' : '#FFD700'} strokeWidth="1.5" />

            {/* 4. Minora Bo'yinturug'i (Turret Collar) */}
            <rect x="32" y="26" width="36" height="5" rx="2" fill={`url(#${ringGradId})`} stroke={isWhite ? '#78350F' : '#F59E0B'} strokeWidth="1.5" />

            {/* 5. Tana Ustuni (Slender Minaret Column - 33-betdagi 14mm-22mm ustun) */}
            <path
              d="M36 31 C38 45 38 58 35 68 L65 68 C62 58 62 45 64 31 Z"
              fill={`url(#${bodyGradId})`}
              stroke={isWhite ? '#78350F' : '#4B5563'}
              strokeWidth="2"
            />

            {/* Ustundagi Zargarona Oltin Kamar */}
            <line x1="38" y1="48" x2="62" y2="48" stroke={`url(#${goldGradId})`} strokeWidth="3" strokeLinecap="round" />

            {/* 6. Pog'onali Keng Poydevor (34mm Stepped Base) */}
            <path
              d="M26 68 Q22 75 22 82 L78 82 Q78 75 74 68 Z"
              fill={`url(#${bodyGradId})`}
              stroke={isWhite ? '#78350F' : '#374151'}
              strokeWidth="2"
            />

            {/* "Nr" Rasmiy Belgisi Plitkasi */}
            <rect x="37" y="70" width="26" height="11" rx="3.5" fill={isWhite ? '#451A03' : '#030712'} stroke="#FBBF24" strokeWidth="1.5" />
            <text x="50" y="78.5" textAnchor="middle" fontSize="8.5" fontStyle="italic" fontWeight="900" fill="#FBBF24" stroke="none">
              Nr
            </text>

            {/* Eng Pastki Qalin Halqa Poydevor */}
            <rect x="18" y="82" width="64" height="8" rx="4" fill={`url(#${ringGradId})`} stroke={isWhite ? '#78350F' : '#F59E0B'} strokeWidth="1.5" />
          </g>
        )}

        {/* ── 4. TURA (ROOK) ──────────────────────────────────────────────────────── */}
        {type === 'Rook' && (
          <g stroke={isWhite ? '#2C221E' : '#07080A'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Qal'a Tishlari (Crenellations) */}
            <path
              d="M24 20 L24 30 L32 30 L32 25 L42 25 L42 30 L58 30 L58 25 L68 25 L68 30 L76 30 L76 20 Z"
              fill={`url(#${bodyGradId})`}
            />

            {/* Qal'a Minorasi */}
            <path
              d="M28 30 L32 62 L68 62 L72 30 Z"
              fill={`url(#${bodyGradId})`}
            />

            {/* G'isht va Kamon O'qlari Slitlari */}
            <rect x="46" y="38" width="8" height="10" rx="4" fill={isWhite ? '#C9B496' : '#0B0D12'} stroke="none" />
            <line x1="30" y1="46" x2="70" y2="46" stroke={isWhite ? '#D4B892' : '#454C5A'} strokeWidth="1.5" />

            {/* Halqalar va Poydevor */}
            <rect x="28" y="62" width="44" height="7" rx="3.5" fill={`url(#${ringGradId})`} />

            <path
              d="M26 69 Q20 78 20 84 L80 84 Q80 78 74 69 Z"
              fill={`url(#${bodyGradId})`}
            />

            <rect x="18" y="84" width="64" height="8" rx="4" fill={`url(#${ringGradId})`} />
          </g>
        )}

        {/* ── 5. FIL (BISHOP) ─────────────────────────────────────────────────────── */}
        {type === 'Bishop' && (
          <g stroke={isWhite ? '#2C221E' : '#07080A'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Mitre Tepasidagi Shar */}
            <circle cx="50" cy="14" r="3.5" fill={isWhite ? '#F5C045' : '#F5C045'} stroke="#FFF" strokeWidth="0.8" />

            {/* Mitre Gumbazi */}
            <path
              d="M50 18 C34 18, 30 30, 32 44 C34 52, 40 58, 40 62 L60 62 C60 58, 66 52, 68 44 C70 30, 66 18, 50 18 Z"
              fill={`url(#${bodyGradId})`}
            />

            {/* Diagonal Slash / Kesik */}
            <path
              d="M55 26 L42 42"
              stroke={isWhite ? '#2C221E' : '#F5C045'}
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Xoch Bezak */}
            <path
              d="M50 32 L50 42 M45 36 L55 36"
              stroke={isWhite ? '#A38F74' : '#5C6577'}
              strokeWidth="1.8"
            />

            {/* Halqalar */}
            <rect x="34" y="62" width="32" height="6" rx="3" fill={`url(#${ringGradId})`} />

            <path
              d="M28 68 Q22 78 22 84 L78 84 Q78 78 72 68 Z"
              fill={`url(#${bodyGradId})`}
            />

            <rect x="18" y="84" width="64" height="8" rx="4" fill={`url(#${ringGradId})`} />
          </g>
        )}

        {/* ── 6. OT (KNIGHT) ──────────────────────────────────────────────────────── */}
        {type === 'Knight' && (
          <g stroke={isWhite ? '#2C221E' : '#07080A'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            {/* O'zbek Tulpori Silueti */}
            <path
              d="M44 18 C44 18, 38 14, 30 18 C22 22, 20 28, 22 34 C24 38, 28 40, 30 40 C22 44, 18 52, 20 60 C22 66, 28 68, 34 65 C32 70, 35 74, 40 76 L68 76 C68 76, 72 64, 70 50 C68 36, 58 22, 44 18 Z"
              fill={`url(#${bodyGradId})`}
            />

            {/* Tulpor Yoli (Flowing Mane) */}
            <path
              d="M46 18 C52 22, 58 30, 60 40 M50 20 C56 26, 62 34, 64 46 M55 24 C62 32, 66 42, 68 56"
              stroke={isWhite ? '#C4B097' : '#5C6577'}
              strokeWidth="2"
              fill="none"
            />

            {/* Ko'z */}
            <circle cx="30" cy="27" r="2.8" fill={isWhite ? '#2C221E' : '#F5C045'} stroke="none" />
            <circle cx="29" cy="26" r="0.8" fill="#FFF" stroke="none" />

            {/* Quloq & Og'iz */}
            <path d="M42 18 L44 10 L48 18" fill={`url(#${bodyGradId})`} />
            <path d="M22 32 C24 34, 26 34, 28 33" stroke={isWhite ? '#2C221E' : '#5C6577'} strokeWidth="1.5" />

            {/* Poydevor */}
            <path
              d="M24 76 Q20 80 20 84 L80 84 Q80 80 76 76 Z"
              fill={`url(#${bodyGradId})`}
            />

            <rect x="18" y="84" width="64" height="8" rx="4" fill={`url(#${ringGradId})`} />
          </g>
        )}

        {/* ── 7. PIYODA (PAWN) ────────────────────────────────────────────────────── */}
        {(type === 'Pawn' || !type) && (
          <g stroke={isWhite ? '#2C221E' : '#07080A'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Piyoda Boshi (Sfera) */}
            <circle
              cx="50"
              cy="28"
              r="14"
              fill={`url(#${bodyGradId})`}
            />
            {/* Yorug'lik nuri (Highlight Arc) */}
            {isWhite && (
              <ellipse cx="44" cy="22" rx="4" ry="2.5" fill="#FFFFFF" opacity="0.8" stroke="none" />
            )}

            {/* Yoqa va Bo'yin Halqalari */}
            <rect x="36" y="42" width="28" height="6" rx="3" fill={`url(#${ringGradId})`} />

            {/* Gavdasi */}
            <path
              d="M38 48 C38 56, 32 64, 30 72 L70 72 C68 64, 62 56, 62 48 Z"
              fill={`url(#${bodyGradId})`}
            />

            {/* Poydevor */}
            <path
              d="M26 72 Q20 78 20 84 L80 84 Q80 78 74 72 Z"
              fill={`url(#${bodyGradId})`}
            />

            <rect x="18" y="84" width="64" height="8" rx="4" fill={`url(#${ringGradId})`} />
          </g>
        )}
      </svg>
    </div>
  );
}
