// =====================================================
// NUR SHAXMAT 100 — 3D Shaxmat Donalari (Piece3D)
// Professional Volumetrik SVG 3D Shaxmat Figuralari
// Oq (Fil suyagi / Marvarid) va Qora (Obsidian / Qora yog'och)
// =====================================================

import React from 'react';
import { Color, PieceType } from '../engine/types';

interface Piece3DProps {
  type: PieceType;
  color: Color;
  size?: number | string;
  className?: string;
  isSelected?: boolean;
}

export default function Piece3D({
  type,
  color,
  size = '100%',
  className = '',
  isSelected = false,
}: Piece3DProps) {
  const isWhite = color === 'white';
  const prefix = isWhite ? 'w3d' : 'b3d';

  // O'lcham stili
  const containerStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
  };

  return (
    <div
      style={containerStyle}
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      title={`${type} (${isWhite ? 'Oq' : 'Qora'}) 3D`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full object-contain overflow-visible drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 1. Yerga tushuvchi kontakt soya (Ground Contact Shadow) */}
          <radialGradient id={`${prefix}-ground-shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.7)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0.35)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* 2. Oq dona material gradientlari (Fil suyagi / Oq marmar) */}
          <linearGradient id="w3d-base-grad" x1="15%" y1="20%" x2="85%" y2="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fdfbf5" />
            <stop offset="55%" stopColor="#ebe4cf" />
            <stop offset="85%" stopColor="#c5baa0" />
            <stop offset="100%" stopColor="#968c72" />
          </linearGradient>

          <linearGradient id="w3d-cyl-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2d9bf" />
            <stop offset="22%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f8f4e6" />
            <stop offset="80%" stopColor="#d5caa8" />
            <stop offset="100%" stopColor="#8f8469" />
          </linearGradient>

          <radialGradient id="w3d-sphere-grad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fbf9f0" />
            <stop offset="70%" stopColor="#dcd3b8" />
            <stop offset="95%" stopColor="#9a9075" />
            <stop offset="100%" stopColor="#696048" />
          </radialGradient>

          <linearGradient id="w3d-rim-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff7d6" />
            <stop offset="50%" stopColor="#e5c879" />
            <stop offset="100%" stopColor="#9c782b" />
          </linearGradient>

          {/* 3. Qora dona material gradientlari (Obsidian / Sayqallangan Qora Yong'oq) */}
          <linearGradient id="b3d-base-grad" x1="15%" y1="20%" x2="85%" y2="80%">
            <stop offset="0%" stopColor="#5a5752" />
            <stop offset="25%" stopColor="#3c3a37" />
            <stop offset="60%" stopColor="#22201e" />
            <stop offset="85%" stopColor="#141312" />
            <stop offset="100%" stopColor="#080707" />
          </linearGradient>

          <linearGradient id="b3d-cyl-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2b2926" />
            <stop offset="20%" stopColor="#68645e" />
            <stop offset="45%" stopColor="#3f3d38" />
            <stop offset="80%" stopColor="#1a1917" />
            <stop offset="100%" stopColor="#0a0a09" />
          </linearGradient>

          <radialGradient id="b3d-sphere-grad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#7a766f" />
            <stop offset="30%" stopColor="#45423d" />
            <stop offset="65%" stopColor="#242220" />
            <stop offset="90%" stopColor="#11100f" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>

          <linearGradient id="b3d-rim-silver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9c9891" />
            <stop offset="50%" stopColor="#55524c" />
            <stop offset="100%" stopColor="#292724" />
          </linearGradient>

          {/* Yorqin nur urishi filtri (Glossy Specular) */}
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── A. YERGA TUSHUVCHI KONTAKT SOYA ───────────────── */}
        <ellipse
          cx="50"
          cy="91"
          rx={isSelected ? 28 : 24}
          ry={isSelected ? 8 : 6}
          fill={`url(#${prefix}-ground-shadow)`}
          opacity={isSelected ? 0.45 : 0.85}
        />

        {/* ── B. 3D FIGURA SHAKLI ─────────────────────────────── */}
        {renderPieceBody(type, isWhite, prefix)}
      </svg>
    </div>
  );
}

/**
 * 7 ta shaxmat figurasining 3D geometriyasini chizuvchi funksiya
 */
function renderPieceBody(type: PieceType, isWhite: boolean, prefix: string) {
  const baseGrad = `url(#${prefix}-base-grad)`;
  const cylGrad = `url(#${prefix}-cyl-grad)`;
  const sphereGrad = `url(#${prefix}-sphere-grad)`;
  const strokeColor = isWhite ? '#786e58' : '#141311';
  const highlightColor = isWhite ? '#ffffff' : '#88847c';
  const innerGold = isWhite ? '#e8c977' : '#9c9891';

  // 1. Umumiy 3D Poydevor (Base Pedestal)
  const renderBase = (yStart = 76, width = 72) => {
    const half = width / 2;
    return (
      <g id="base-pedestal">
        {/* Pastki taglik ellipsi */}
        <ellipse
          cx="50"
          cy={yStart + 10}
          rx={half}
          ry="7.5"
          fill={baseGrad}
          stroke={strokeColor}
          strokeWidth="1.2"
        />
        {/* Taglik silindr korpusi */}
        <path
          d={`M ${50 - half} ${yStart + 5} 
              Q 50 ${yStart + 12} ${50 + half} ${yStart + 5} 
              L ${50 + half - 4} ${yStart} 
              Q 50 ${yStart + 6} ${50 - half + 4} ${yStart} Z`}
          fill={cylGrad}
          stroke={strokeColor}
          strokeWidth="0.8"
        />
        {/* O'rta dekorativ bel halqasi */}
        <ellipse
          cx="50"
          cy={yStart + 1}
          rx={half - 5}
          ry="5"
          fill={baseGrad}
          stroke={strokeColor}
          strokeWidth="1"
        />
        <path
          d={`M ${50 - half + 8} ${yStart - 5} 
              Q 50 ${yStart} ${50 + half - 8} ${yStart - 5} 
              L ${50 + half - 10} ${yStart - 7} 
              Q 50 ${yStart - 2} ${50 - half + 10} ${yStart - 7} Z`}
          fill={cylGrad}
        />
        {/* Yuqori halqa */}
        <ellipse
          cx="50"
          cy={yStart - 6}
          rx={half - 12}
          ry="3.8"
          fill={baseGrad}
          stroke={strokeColor}
          strokeWidth="0.8"
        />
      </g>
    );
  };

  switch (type) {
    // ─────────────────────────────────────────────────────────────
    // 1. PIYODA (PAWN 3D)
    // ─────────────────────────────────────────────────────────────
    case 'Pawn':
      return (
        <g id="pawn-3d">
          {renderBase(75, 64)}

          {/* Konusimon tana */}
          <path
            d="M 33 70 
               Q 44 48 40 40 
               Q 50 42 60 40 
               Q 56 48 67 70 
               Q 50 75 33 70 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Bo'yin halqasi */}
          <ellipse cx="50" cy="39" rx="14" ry="4" fill={baseGrad} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="37" rx="12" ry="3.2" fill={cylGrad} />

          {/* Sferik 3D bosh */}
          <circle cx="50" cy="27" r="13" fill={sphereGrad} stroke={strokeColor} strokeWidth="1.2" />

          {/* Boshdagi nur jilosi (Specular glint) */}
          <ellipse cx="44" cy="22" rx="4.5" ry="3" fill={highlightColor} opacity={isWhite ? 0.75 : 0.45} />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 2. OT (KNIGHT 3D)
    // ─────────────────────────────────────────────────────────────
    case 'Knight':
      return (
        <g id="knight-3d">
          {renderBase(76, 68)}

          {/* Otning asosi va ko'kragi */}
          <path
            d="M 32 72 
               C 30 60 25 50 30 40 
               C 33 34 38 30 42 20 
               C 44 14 46 11 48 10 
               C 49 14 53 14 55 18 
               C 58 14 62 15 63 20 
               C 65 24 67 22 70 28 
               C 74 36 75 48 71 58 
               C 69 66 69 70 68 72 
               Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.4"
          />

          {/* Ot tumshug'i va jag' qismi (Front profile) */}
          <path
            d="M 42 20 
               C 37 23 27 28 22 34 
               C 18 39 19 44 24 46 
               C 30 48 37 44 42 41 
               C 44 49 41 58 35 68 
               C 46 72 58 72 68 72 
               C 66 62 68 50 63 42 
               C 56 32 50 24 42 20 Z"
            fill={baseGrad}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Ot yoli (Mane 3D tishlari) */}
          <path
            d="M 49 11 Q 54 13 54 18 Q 58 16 62 20 Q 66 19 69 26 Q 73 28 73 36 Q 77 40 74 48 Q 76 54 71 62"
            fill="none"
            stroke={highlightColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity={0.8}
          />

          {/* Quloq (Ear) */}
          <polygon points="46,18 49,10 52,17" fill={sphereGrad} stroke={strokeColor} strokeWidth="1" />

          {/* Ko'z (Eye 3D relyefi) */}
          <ellipse cx="36" cy="31" rx="2.5" ry="3.5" fill={strokeColor} />
          <circle cx="35" cy="30" r="1" fill="#ffffff" />

          {/* Burun teshigi (Nostril) */}
          <ellipse cx="24" cy="40" rx="1.5" ry="2.2" fill={strokeColor} opacity={0.8} />

          {/* Jag' mushagi relyefi */}
          <path
            d="M 33 38 Q 39 42 44 38 Q 42 46 35 48"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1"
            opacity={0.5}
          />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 3. FIL (BISHOP 3D)
    // ─────────────────────────────────────────────────────────────
    case 'Bishop':
      return (
        <g id="bishop-3d">
          {renderBase(76, 68)}

          {/* Tana konusi */}
          <path
            d="M 34 71 
               Q 44 48 41 38 
               Q 50 40 59 38 
               Q 56 48 66 71 
               Q 50 76 34 71 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Bo'yin halqalari */}
          <ellipse cx="50" cy="38" rx="14" ry="4" fill={baseGrad} stroke={strokeColor} strokeWidth="1" />

          {/* Mitre (Fil bosh kiyimi) */}
          <path
            d="M 36 36 
               C 32 26 36 14 50 9 
               C 64 14 68 26 64 36 
               C 58 40 42 40 36 36 Z"
            fill={sphereGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Filning o'ziga xos qirqim tirqishi (Slit) */}
          <path
            d="M 45 17 L 54 27 M 47 16 L 56 26"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Mitre ustidagi kichik 3D shar (Finial) */}
          <circle cx="50" cy="8" r="3.5" fill={baseGrad} stroke={strokeColor} strokeWidth="1" />
          <circle cx="49" cy="7" r="1.2" fill={highlightColor} />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 4. RUX (ROOK 3D)
    // ─────────────────────────────────────────────────────────────
    case 'Rook':
      return (
        <g id="rook-3d">
          {renderBase(76, 70)}

          {/* Qal'a silindr minorasi */}
          <path
            d="M 35 71 
               Q 39 46 38 34 
               L 62 34 
               Q 61 46 65 71 
               Q 50 76 35 71 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Minora frizi va karnizi */}
          <ellipse cx="50" cy="34" rx="16" ry="4.5" fill={baseGrad} stroke={strokeColor} strokeWidth="1" />
          <path
            d="M 32 34 L 30 22 Q 50 25 70 22 L 68 34 Q 50 37 32 34 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Qal'a tishlari (Crenellations 3D) */}
          {/* Chap tish */}
          <rect x="30" y="14" width="7.5" height="9" rx="1" fill={baseGrad} stroke={strokeColor} strokeWidth="1" />
          {/* O'rta tish */}
          <rect x="46" y="15" width="8" height="9" rx="1" fill={cylGrad} stroke={strokeColor} strokeWidth="1" />
          {/* O'ng tish */}
          <rect x="62.5" y="14" width="7.5" height="9" rx="1" fill={cylGrad} stroke={strokeColor} strokeWidth="1" />

          {/* Tishlar orasidagi ichki qorong'ulik */}
          <rect x="37.5" y="18" width="8.5" height="5" fill={strokeColor} opacity={0.65} />
          <rect x="54" y="18" width="8.5" height="5" fill={strokeColor} opacity={0.65} />

          {/* Devor toshlari teksturasi (Nafis chiziqlar) */}
          <path
            d="M 40 44 H 60 M 39 56 H 61"
            stroke={strokeColor}
            strokeWidth="0.8"
            opacity={0.4}
            strokeDasharray="4 3"
          />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 5. FARZIN (QUEEN 3D)
    // ─────────────────────────────────────────────────────────────
    case 'Queen':
      return (
        <g id="queen-3d">
          {renderBase(76, 72)}

          {/* Nozik nafis bel va tana */}
          <path
            d="M 33 71 
               Q 44 48 40 32 
               Q 50 34 60 32 
               Q 56 48 67 71 
               Q 50 76 33 71 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Bo'yin halqasi */}
          <ellipse cx="50" cy="32" rx="15" ry="4" fill={baseGrad} stroke={strokeColor} strokeWidth="1" />

          {/* Toj asos korpusi */}
          <path
            d="M 32 30 
               L 26 15 
               L 36 21 
               L 43 12 
               L 50 20 
               L 57 12 
               L 64 21 
               L 74 15 
               L 68 30 
               Q 50 35 32 30 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.4"
          />

          {/* Toj uchlaridagi 3D marvaridlar */}
          <circle cx="26" cy="14" r="2.8" fill={sphereGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="43" cy="11" r="3.2" fill={sphereGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="57" cy="11" r="3.2" fill={sphereGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="74" cy="14" r="2.8" fill={sphereGrad} stroke={strokeColor} strokeWidth="0.8" />

          {/* Markaziy asosiy marvarid/orb */}
          <circle cx="50" cy="9" r="4.2" fill={sphereGrad} stroke={innerGold} strokeWidth="1.2" />
          <circle cx="48.5" cy="7.5" r="1.5" fill={highlightColor} />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 6. SHOH (KING 3D)
    // ─────────────────────────────────────────────────────────────
    case 'King':
      return (
        <g id="king-3d">
          {renderBase(76, 74)}

          {/* Keng qudratli tana */}
          <path
            d="M 31 71 
               Q 43 46 39 30 
               Q 50 32 61 30 
               Q 57 46 69 71 
               Q 50 77 31 71 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.4"
          />

          {/* Bo'yin halqasi */}
          <ellipse cx="50" cy="30" rx="16" ry="4.2" fill={baseGrad} stroke={strokeColor} strokeWidth="1" />

          {/* Shoh toji (Arched Crown) */}
          <path
            d="M 31 29 
               C 28 17 38 14 50 14 
               C 62 14 72 17 69 29 
               Q 50 34 31 29 Z"
            fill={sphereGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Toj kamari va qovurg'alari */}
          <path
            d="M 40 28 C 39 18 45 15 50 14 C 55 15 61 18 60 28"
            fill="none"
            stroke={innerGold}
            strokeWidth="1.8"
          />

          {/* Shohning Xochi (3D Cross) */}
          <path
            d="M 47 13 H 53 V 4 H 47 Z"
            fill={baseGrad}
            stroke={strokeColor}
            strokeWidth="1"
          />
          <path
            d="M 44 7 H 56 V 10 H 44 Z"
            fill={baseGrad}
            stroke={strokeColor}
            strokeWidth="1"
          />
          {/* Xoch markazidagi zumrad/oltin nuqta */}
          <circle cx="50" cy="8.5" r="1.5" fill={innerGold} />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 7. NUR DONASI (NUR 3D) — Rasmiy O'zbek Shaxmati Donasi
    // Sharqona muhtasham minora, gumbaz va mayoq qal'asi
    // ─────────────────────────────────────────────────────────────
    case 'Nur':
      return (
        <g id="nur-3d">
          {renderBase(76, 74)}

          {/* Quyi qasr devori va poydevori */}
          <path
            d="M 32 71 
               L 36 50 
               Q 50 54 64 50 
               L 68 71 
               Q 50 76 32 71 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Sharqona arka o'ymakorligi (Niche portal) */}
          <path
            d="M 44 68 
               L 44 58 
               C 44 54 56 54 56 58 
               L 56 68 Z"
            fill={strokeColor}
            opacity={0.7}
          />
          {/* Arkadagi nur jilosi */}
          <path
            d="M 46 68 L 46 59 C 46 56 54 56 54 59 L 54 68"
            stroke={innerGold}
            strokeWidth="1.2"
            fill="none"
          />

          {/* O'rta aylanma maydoncha (Balcony / Muqarnas karnizi) */}
          <ellipse cx="50" cy="50" rx="16" ry="4" fill={baseGrad} stroke={strokeColor} strokeWidth="1.1" />
          <ellipse cx="50" cy="48" rx="14" ry="3.5" fill={cylGrad} />

          {/* Yuqori Minora ustuni (Upper Fluted Tower) */}
          <path
            d="M 39 48 
               L 41 24 
               Q 50 26 59 24 
               L 61 48 
               Q 50 51 39 48 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Minora bo'ylama qovurg'alari */}
          <line x1="45" y1="48" x2="46" y2="25" stroke={strokeColor} strokeWidth="0.8" opacity={0.5} />
          <line x1="50" y1="49" x2="50" y2="25" stroke={highlightColor} strokeWidth="1" opacity={0.6} />
          <line x1="55" y1="48" x2="54" y2="25" stroke={strokeColor} strokeWidth="0.8" opacity={0.5} />

          {/* Yuqori gumbaz karnizi */}
          <ellipse cx="50" cy="24" rx="12" ry="3.2" fill={baseGrad} stroke={strokeColor} strokeWidth="1" />

          {/* Sharqona Minora Tishlari va Gumbazi (Crenellated Cupola Dome) */}
          <path
            d="M 40 24 
               C 40 14 47 11 50 8 
               C 53 11 60 14 60 24 
               Z"
            fill={sphereGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Minora gumbazidagi qovurg'a naqshlari */}
          <path
            d="M 44 23 Q 48 14 50 8 Q 52 14 56 23"
            fill="none"
            stroke={innerGold}
            strokeWidth="1.4"
          />

          {/* NUR Chirog'i / Zargarona Spire uchligi */}
          <circle cx="50" cy="7" r="2.8" fill={innerGold} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="49.2" cy="6" r="1" fill="#ffffff" />
          <line x1="50" y1="4" x2="50" y2="1.5" stroke={innerGold} strokeWidth="1.4" strokeLinecap="round" />

          {/* Nur taralishi (Subtle Ray Glow) */}
          <circle cx="50" cy="6" r="5" fill="none" stroke={innerGold} strokeWidth="0.5" opacity={0.6} strokeDasharray="1 1.5" />
        </g>
      );

    default:
      return null;
  }
}
