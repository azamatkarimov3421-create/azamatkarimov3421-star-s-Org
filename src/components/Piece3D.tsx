// =====================================================
// NUR SHAXMAT 100 — Ultra 3D Shaxmat Donalari (Piece3D)
// Chuqur relyefli, bo'rtib chiqqan qalinlik (3D Extrusion),
// zargarona silindrik yorug'lik va fizik kontakt soyalar bilan
// =====================================================

import React from 'react';
import { Color, PieceType } from '../engine/types';
import GLBKnight from './GLBKnight';
import GLBRook from './GLBRook';
import GLBQueen from './GLBQueen';

interface Piece3DProps {
  type: PieceType;
  color: Color;
  size?: number | string;
  className?: string;
  isSelected?: boolean;
}

function Piece3DComponent({
  type,
  color,
  size = '100%',
  className = '',
  isSelected = false,
}: Piece3DProps) {
  // Haqiqiy 3D GLB Farzin (Queen) modeli
  if (type === 'Queen') {
    return (
      <GLBQueen
        color={color}
        size={size}
        className={className}
        isSelected={isSelected}
      />
    );
  }

  // Haqiqiy 3D GLB Ot (Knight) modeli
  if (type === 'Knight') {
    return (
      <GLBKnight
        color={color}
        size={size}
        className={className}
        isSelected={isSelected}
      />
    );
  }

  // Haqiqiy 3D GLB Rux (Rook) modeli
  if (type === 'Rook') {
    return (
      <GLBRook
        color={color}
        size={size}
        className={className}
        isSelected={isSelected}
      />
    );
  }

  const isWhite = color === 'white';
  const p = isWhite ? 'w3d' : 'b3d';

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
        className="w-full h-full object-contain overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 1. Apparat tezlashuvli fizik kontakt soyasi (feGaussianBlur o'rniga toza GPU gradient, 0ms render) */}
          <radialGradient id={`p3d-sh-amb-${p}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#000000" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`p3d-sh-cnt-${p}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* 2. OQ DONALAR MATERIALI (Fil suyagi / Sayqallangan Oq Marmar) */}
          {/* Asosiy old yuzasi (Front Body) */}
          <linearGradient id="w3d-front" x1="10%" y1="15%" x2="90%" y2="85%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="28%" stopColor="#fbf9f2" />
            <stop offset="60%" stopColor="#ede6d2" />
            <stop offset="85%" stopColor="#cfc4a6" />
            <stop offset="100%" stopColor="#9e9171" />
          </linearGradient>

          {/* Silindrik 3D hajm nuri (Cylinder highlight & core shadow) */}
          <linearGradient id="w3d-cyl" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ded5bb" />
            <stop offset="18%" stopColor="#ffffff" />
            <stop offset="42%" stopColor="#f7f3e4" />
            <stop offset="75%" stopColor="#d3c7a3" />
            <stop offset="100%" stopColor="#7a6e50" />
          </linearGradient>

          {/* 3D Bo'rtma qalinlik qatlami (Side Extrusion / Bevel Depth) */}
          <linearGradient id="w3d-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8a7e63" />
            <stop offset="50%" stopColor="#665b43" />
            <stop offset="100%" stopColor="#473f2c" />
          </linearGradient>

          {/* Sharsimon boshlar uchun sferik nur (Spherical Head) */}
          <radialGradient id="w3d-sphere" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fdfbf5" />
            <stop offset="65%" stopColor="#ded5bb" />
            <stop offset="90%" stopColor="#9e9171" />
            <stop offset="100%" stopColor="#5c533c" />
          </radialGradient>

          {/* Oltin poydevor va toj halqasi (Gold inlay) */}
          <linearGradient id="w3d-gold" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fff9db" />
            <stop offset="35%" stopColor="#f3d077" />
            <stop offset="70%" stopColor="#cf9f32" />
            <stop offset="100%" stopColor="#78550f" />
          </linearGradient>

          {/* 3. QORA DONALAR MATERIALI (Obsidian / Sayqallangan Qora Yog'och) */}
          {/* Asosiy old yuzasi (Front Body) */}
          <linearGradient id="b3d-front" x1="10%" y1="15%" x2="90%" y2="85%">
            <stop offset="0%" stopColor="#585550" />
            <stop offset="25%" stopColor="#3d3b37" />
            <stop offset="55%" stopColor="#242220" />
            <stop offset="85%" stopColor="#141312" />
            <stop offset="100%" stopColor="#080707" />
          </linearGradient>

          {/* Silindrik 3D hajm nuri (Cylinder highlight & core shadow) */}
          <linearGradient id="b3d-cyl" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2c2a27" />
            <stop offset="22%" stopColor="#706c64" />
            <stop offset="45%" stopColor="#43403a" />
            <stop offset="78%" stopColor="#1b1a18" />
            <stop offset="100%" stopColor="#090808" />
          </linearGradient>

          {/* 3D Bo'rtma qalinlik qatlami (Side Extrusion / Bevel Depth) */}
          <linearGradient id="b3d-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#262523" />
            <stop offset="50%" stopColor="#121110" />
            <stop offset="100%" stopColor="#020202" />
          </linearGradient>

          {/* Sharsimon boshlar uchun sferik nur (Spherical Head) */}
          <radialGradient id="b3d-sphere" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#7e7a72" />
            <stop offset="35%" stopColor="#4a4742" />
            <stop offset="65%" stopColor="#262422" />
            <stop offset="90%" stopColor="#121110" />
            <stop offset="100%" stopColor="#030303" />
          </radialGradient>

          {/* Kumush/platina poydevor va toj halqasi (Silver inlay) */}
          <linearGradient id="b3d-silver" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#c5c2bb" />
            <stop offset="40%" stopColor="#87837b" />
            <stop offset="75%" stopColor="#4c4a45" />
            <stop offset="100%" stopColor="#201f1d" />
          </linearGradient>
        </defs>

        {/* ── A. YERGA TUSHUVCHI FIZIK SOYALAR (REALISTIK STATIK KONTAKT SOYA, GPU TEZLASHUVI BILAN) ── */}
        <g id="ground-shadows">
          {/* Katta tarqoq ambient soya */}
          <ellipse
            cx="50"
            cy="92"
            rx="30"
            ry="7"
            fill={`url(#p3d-sh-amb-${p})`}
          />
          {/* Zich asos kontakt soyasi */}
          <ellipse
            cx="50"
            cy="91"
            rx="22"
            ry="4.5"
            fill={`url(#p3d-sh-cnt-${p})`}
          />
        </g>

        {/* ── B. 3D BO'RTMA QALINLIK VA FIGURA GABARITI ──────── */}
        <g id="piece-3d-geometry">
          {renderSculptedPiece(type, isWhite, p, isSelected)}
        </g>
      </svg>
    </div>
  );
}

/**
 * 7 ta figurani to'liq 3D qalinlik va bo'rtma bilan render qilish
 */
function renderSculptedPiece(type: PieceType, isWhite: boolean, p: string, isSelected: boolean) {
  const frontGrad = `url(#${p}-front)`;
  const cylGrad = `url(#${p}-cyl)`;
  const sphereGrad = `url(#${p}-sphere)`;
  const bevelGrad = `url(#${p}-bevel)`;
  const metalTrim = `url(#${p}-${isWhite ? 'gold' : 'silver'})`;
  const strokeColor = isWhite ? '#6e6349' : '#0a0a09';
  const specular = isWhite ? '#ffffff' : '#8c8880';

  // 1. Zargarona Stepped 3D Poydevor (Base Pedestal)
  const renderBase = (yStart = 75, width = 74) => {
    const half = width / 2;
    return (
      <g id="base-pedestal-3d">
        {/* Orqa 3D bo'rtma qalinligi (Extrusion rim) */}
        <path
          d={`M ${50 - half - 1} ${yStart + 6} 
              Q 50 ${yStart + 15} ${50 + half + 2} ${yStart + 6} 
              L ${50 + half + 2} ${yStart + 11} 
              Q 50 ${yStart + 17} ${50 - half - 1} ${yStart + 11} Z`}
          fill={bevelGrad}
        />

        {/* Pastki asosiy silindr */}
        <ellipse cx="50" cy={yStart + 8.5} rx={half} ry="7" fill={frontGrad} stroke={strokeColor} strokeWidth="1.2" />
        <path
          d={`M ${50 - half} ${yStart + 3} 
              Q 50 ${yStart + 10} ${50 + half} ${yStart + 3} 
              L ${50 + half - 3} ${yStart - 2} 
              Q 50 ${yStart + 4} ${50 - half + 3} ${yStart - 2} Z`}
          fill={cylGrad}
          stroke={strokeColor}
          strokeWidth="0.8"
        />

        {/* Metallik qirra halqasi (Gold / Silver inlay) */}
        <ellipse cx="50" cy={yStart - 1.5} rx={half - 4} ry="5" fill={metalTrim} stroke={strokeColor} strokeWidth="0.8" />
        <ellipse cx="50" cy={yStart - 2.5} rx={half - 6} ry="4.2" fill={frontGrad} />

        {/* Yuqori qatlam halqasi */}
        <path
          d={`M ${50 - half + 9} ${yStart - 6} 
              Q 50 ${yStart - 1} ${50 + half - 9} ${yStart - 6} 
              L ${50 + half - 12} ${yStart - 9} 
              Q 50 ${yStart - 4} ${50 - half + 12} ${yStart - 9} Z`}
          fill={cylGrad}
        />
        <ellipse cx="50" cy={yStart - 8.5} rx={half - 12} ry="3.5" fill={frontGrad} stroke={strokeColor} strokeWidth="0.8" />

        {/* Poydevordagi yorqin nur urishi (Specular highlight) */}
        <path
          d={`M ${50 - half + 6} ${yStart + 4} Q 50 ${yStart + 9} ${50 + half - 10} ${yStart + 5}`}
          fill="none"
          stroke={specular}
          strokeWidth="1.2"
          opacity={isWhite ? 0.75 : 0.45}
        />
      </g>
    );
  };

  switch (type) {
    // ─────────────────────────────────────────────────────────────
    // 1. PIYODA (PAWN 3D) — Bo'rtma silindrik korpus va yorqin shar
    // ─────────────────────────────────────────────────────────────
    case 'Pawn':
      return (
        <g id="pawn-3d-sculpted">
          {renderBase(75, 64)}

          {/* 3D Orqa bo'rtma qalinligi (Extrusion shadow) */}
          <path
            d="M 34 71 Q 45 49 41 41 Q 50 43 61 41 Q 57 49 68 71 Z"
            fill={bevelGrad}
            transform="translate(1.5, 2)"
          />

          {/* Tana konusi */}
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

          {/* Tanadagi vertikal yorqin nur chizig'i (Specular vertical line) */}
          <path
            d="M 42 68 Q 46 54 44 42"
            fill="none"
            stroke={specular}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={isWhite ? 0.8 : 0.5}
          />

          {/* Bo'yin halqasi (Torus) */}
          <ellipse cx="50" cy="39" rx="14" ry="4" fill={frontGrad} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="38" rx="12" ry="3" fill={metalTrim} />

          {/* 3D Sferik Bosh (Orqa qalinligi va sharsimon yuzasi) */}
          <circle cx="51.5" cy="28" r="13" fill={bevelGrad} />
          <circle cx="50" cy="27" r="13" fill={sphereGrad} stroke={strokeColor} strokeWidth="1.2" />

          {/* Boshdagi radial porlash nuqtasi (Specular glint) */}
          <ellipse cx="44" cy="21" rx="5" ry="3.5" fill={specular} opacity={isWhite ? 0.9 : 0.55} />
          <circle cx="42" cy="19.5" r="1.5" fill="#ffffff" opacity={0.95} />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 2. OT (KNIGHT 3D) — Bo'rtib chiqqan yoli, mushaklari va baquvvat tumshug'i
    // ─────────────────────────────────────────────────────────────
    case 'Knight':
      return (
        <g id="knight-3d-sculpted">
          {renderBase(76, 68)}

          {/* Otning 3D orqa qalinligi (Extrusion shadow) */}
          <path
            d="M 32 72 C 30 60 25 50 30 40 C 33 34 38 30 42 20 C 44 14 46 11 48 10 C 49 14 53 14 55 18 C 58 14 62 15 63 20 C 65 24 67 22 70 28 C 74 36 75 48 71 58 C 69 66 69 70 68 72 Z"
            fill={bevelGrad}
            transform="translate(2, 2.5)"
          />

          {/* Asosiy bo'yin va ko'krak korpusi */}
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
            strokeWidth="1.3"
          />

          {/* Otning bosh qismi va tumshug'i (Volumetric front) */}
          <path
            d="M 42 20 
               C 37 23 26 28 21 34 
               C 17 39 18 44 23 46 
               C 29 48 37 44 42 41 
               C 44 49 41 58 35 68 
               C 46 72 58 72 68 72 
               C 66 62 68 50 63 42 
               C 56 32 50 24 42 20 Z"
            fill={frontGrad}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* 3D Bo'rtma Yol Tishlari (Layered 3D Mane) */}
          <path
            d="M 48 11 Q 54 13 54 18 Q 58 16 63 20 Q 67 19 70 26 Q 74 28 74 36 Q 78 40 75 48 Q 77 54 72 62"
            fill="none"
            stroke={bevelGrad}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 48 11 Q 54 13 54 18 Q 58 16 63 20 Q 67 19 70 26 Q 74 28 74 36 Q 78 40 75 48 Q 77 54 72 62"
            fill="none"
            stroke={metalTrim}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Ot Qulog'i (3D Ear) */}
          <polygon points="46,18 49,9 53,16" fill={sphereGrad} stroke={strokeColor} strokeWidth="1" />
          <polygon points="48,16 49,11 51,15" fill={specular} opacity={0.6} />

          {/* Ot Ko'zi (Expressive 3D Eye & Ridge) */}
          <path d="M 33 28 Q 37 26 40 29" stroke={strokeColor} strokeWidth="1.5" fill="none" />
          <ellipse cx="36" cy="31" rx="3" ry="4" fill={strokeColor} />
          <circle cx="35" cy="30" r="1.3" fill="#ffffff" />
          <circle cx="37" cy="32" r="0.6" fill={specular} />

          {/* Burun va tumshuq relyefi (Nostril & muzzle) */}
          <ellipse cx="23" cy="41" rx="2" ry="2.8" fill={strokeColor} />
          <path d="M 20 38 Q 23 34 29 36" stroke={specular} strokeWidth="1.5" fill="none" opacity={0.7} />

          {/* Jag' mushagi relyefi */}
          <path
            d="M 32 39 Q 39 44 44 40 Q 42 48 35 50"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.2"
            opacity={0.55}
          />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 3. FIL (BISHOP 3D) — Bo'rtma bosh kiyim, diagonal tirqish va finial
    // ─────────────────────────────────────────────────────────────
    case 'Bishop':
      return (
        <g id="bishop-3d-sculpted">
          {renderBase(76, 68)}

          {/* Orqa 3D qalinligi */}
          <path
            d="M 36 36 C 32 26 36 14 50 9 C 64 14 68 26 64 36 C 58 40 42 40 36 36 Z"
            fill={bevelGrad}
            transform="translate(2, 2.5)"
          />

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

          {/* Bo'yin halqasi */}
          <ellipse cx="50" cy="38" rx="14" ry="4" fill={frontGrad} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="37" rx="12" ry="3" fill={metalTrim} />

          {/* Mitre (Bosh kiyim) */}
          <path
            d="M 36 36 
               C 32 26 36 14 50 9 
               C 64 14 68 26 64 36 
               C 58 40 42 40 36 36 Z"
            fill={sphereGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Bo'rtma yorqin qirralar */}
          <path
            d="M 37 32 C 35 24 38 16 48 11"
            fill="none"
            stroke={specular}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity={isWhite ? 0.85 : 0.5}
          />

          {/* Filning o'ziga xos diagonal qirqimi (Slit with deep inner shadow) */}
          <path d="M 43 18 L 54 28" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity={0.8} />
          <path d="M 44 17 L 55 27" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 46 16 L 57 26" stroke={specular} strokeWidth="1" strokeLinecap="round" opacity={0.8} />

          {/* Mitre ustidagi 3D Finial sharcha */}
          <circle cx="51" cy="9" r="3.5" fill={bevelGrad} />
          <circle cx="50" cy="8" r="3.5" fill={metalTrim} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="49" cy="7" r="1.2" fill="#ffffff" />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 4. RUX (ROOK 3D) — Qal'a devorlari, qalin tishlari va tosh bloklari
    // ─────────────────────────────────────────────────────────────
    case 'Rook':
      return (
        <g id="rook-3d-sculpted">
          {renderBase(76, 70)}

          {/* Qal'a 3D orqa qalinligi */}
          <path
            d="M 32 34 L 30 22 Q 50 25 70 22 L 68 34 Q 50 37 32 34 Z"
            fill={bevelGrad}
            transform="translate(2, 2.5)"
          />

          {/* Silindrik minora tanasi */}
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
          <ellipse cx="50" cy="34" rx="16" ry="4.5" fill={frontGrad} stroke={strokeColor} strokeWidth="1" />
          <path
            d="M 32 34 L 30 22 Q 50 25 70 22 L 68 34 Q 50 37 32 34 Z"
            fill={cylGrad}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* 3D Qal'a tishlari (Crenellations with deep 3D recesses) */}
          {/* Chap tish */}
          <rect x="30" y="13" width="8" height="10" rx="1" fill={frontGrad} stroke={strokeColor} strokeWidth="1" />
          {/* O'rta tish */}
          <rect x="46" y="14" width="8" height="10" rx="1" fill={cylGrad} stroke={strokeColor} strokeWidth="1" />
          {/* O'ng tish */}
          <rect x="62" y="13" width="8" height="10" rx="1" fill={cylGrad} stroke={strokeColor} strokeWidth="1" />

          {/* Tishlar orasidagi chuqur 3D bo'shliqlar (Deep Embrasures) */}
          <rect x="38" y="17" width="8" height="6" fill="#000000" opacity={0.7} />
          <rect x="54" y="17" width="8" height="6" fill="#000000" opacity={0.7} />

          {/* Minora tanasidagi yorug'lik refleksi */}
          <path d="M 41 68 L 40 36" stroke={specular} strokeWidth="2" opacity={isWhite ? 0.8 : 0.45} />

          {/* Qal'a devoridagi tosh relyeflar */}
          <path d="M 40 46 H 60 M 39 58 H 61" stroke={strokeColor} strokeWidth="0.8" opacity={0.4} strokeDasharray="5 3" />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 5. FARZIN (QUEEN 3D) — Nafis bel, 5 ta 3D marvaridli toj va oltin orb
    // ─────────────────────────────────────────────────────────────
    case 'Queen':
      return (
        <g id="queen-3d-sculpted">
          {renderBase(76, 72)}

          {/* Tojning 3D orqa qalinligi */}
          <path
            d="M 32 30 L 26 15 L 36 21 L 43 12 L 50 20 L 57 12 L 64 21 L 74 15 L 68 30 Q 50 35 32 30 Z"
            fill={bevelGrad}
            transform="translate(2, 2.5)"
          />

          {/* Nozik tana korpusi */}
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
          <ellipse cx="50" cy="32" rx="15" ry="4" fill={metalTrim} stroke={strokeColor} strokeWidth="1" />

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
            strokeWidth="1.3"
          />

          {/* Tojning yorug'lik refleksi */}
          <path d="M 33 28 L 29 18" stroke={specular} strokeWidth="1.8" opacity={0.8} />

          {/* Toj uchlaridagi 3D marvaridlar (3D Pearls with glints) */}
          <circle cx="26" cy="14" r="3.2" fill={sphereGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="25" cy="13" r="1" fill="#ffffff" />

          <circle cx="43" cy="11" r="3.5" fill={sphereGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="42" cy="10" r="1" fill="#ffffff" />

          <circle cx="57" cy="11" r="3.5" fill={sphereGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="56" cy="10" r="1" fill="#ffffff" />

          <circle cx="74" cy="14" r="3.2" fill={sphereGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="73" cy="13" r="1" fill="#ffffff" />

          {/* Markaziy podsholik marvaridi / oltin orb */}
          <circle cx="51" cy="9.5" r="4.5" fill={bevelGrad} />
          <circle cx="50" cy="8.5" r="4.5" fill={metalTrim} stroke={strokeColor} strokeWidth="1" />
          <circle cx="48.5" cy="7" r="1.5" fill="#ffffff" />
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 6. SHOH (KING 3D) — Qudratli toj, bo'rtma 3D Xoch va shohona yelka
    // ─────────────────────────────────────────────────────────────
    case 'King':
      return (
        <g id="king-3d-sculpted">
          {renderBase(76, 74)}

          {/* Shoh toji va xochining 3D orqa qalinligi */}
          <path
            d="M 31 29 C 28 17 38 14 50 14 C 62 14 72 17 69 29 Q 50 34 31 29 Z"
            fill={bevelGrad}
            transform="translate(2, 2.5)"
          />

          {/* Keng shohona tana */}
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
          <ellipse cx="50" cy="30" rx="16" ry="4.2" fill={metalTrim} stroke={strokeColor} strokeWidth="1" />

          {/* Shoh Toji (Arched Imperial Crown) */}
          <path
            d="M 31 29 
               C 28 17 38 14 50 14 
               C 62 14 72 17 69 29 
               Q 50 34 31 29 Z"
            fill={sphereGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Tojning qovurg'alari va zar kamar */}
          <path d="M 40 28 C 39 18 45 15 50 14 C 55 15 61 18 60 28" fill="none" stroke={metalTrim} strokeWidth="2" />
          <path d="M 34 26 C 34 20 40 16 45 15" fill="none" stroke={specular} strokeWidth="1.8" opacity={0.8} />

          {/* 3D Xoch (Maltese / Latin beveled Cross with depth) */}
          <g id="king-cross-3d">
            {/* Xoch orqa soyasi */}
            <path d="M 47 13 H 53 V 4 H 47 Z M 44 7 H 56 V 10 H 44 Z" fill={bevelGrad} transform="translate(1.5, 1.5)" />
            {/* Xoch korpusi */}
            <path d="M 47 13 H 53 V 4 H 47 Z" fill={frontGrad} stroke={strokeColor} strokeWidth="1" />
            <path d="M 44 7 H 56 V 10 H 44 Z" fill={frontGrad} stroke={strokeColor} strokeWidth="1" />
            {/* Markaziy zumrad/oltin gavhar */}
            <circle cx="50" cy="8.5" r="2" fill={metalTrim} stroke={strokeColor} strokeWidth="0.6" />
            <circle cx="49.3" cy="7.8" r="0.8" fill="#ffffff" />
          </g>
        </g>
      );

    // ─────────────────────────────────────────────────────────────
    // 7. NUR DONASI (NUR 3D) — Rasmiy O'zbek Shaxmati Donasi
    // Sharqona minora, bo'rtma peshtoq arka, balkon va mayoq gumbazi
    // ─────────────────────────────────────────────────────────────
    case 'Nur':
      return (
        <g id="nur-3d-sculpted">
          {renderBase(76, 74)}

          {/* Minora devorining 3D orqa qalinligi */}
          <path
            d="M 32 71 L 36 50 Q 50 54 64 50 L 68 71 Q 50 76 32 71 Z"
            fill={bevelGrad}
            transform="translate(2, 2)"
          />

          {/* Quyi qasr devori */}
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

          {/* Sharqona Arka Peshtoq o'ymakorligi (Deep Portal Niche) */}
          <path
            d="M 43 69 L 43 57 C 43 52 57 52 57 57 L 57 69 Z"
            fill="#000000"
            opacity={0.75}
          />
          {/* Arkadagi zargarona ramka */}
          <path
            d="M 44 69 L 44 58 C 44 53.5 56 53.5 56 58 L 56 69"
            stroke={metalTrim}
            strokeWidth="1.6"
            fill="none"
          />

          {/* Aylanma Muqarnas Balkon maydonchasi (Balcony) */}
          <ellipse cx="50" cy="50" rx="16" ry="4" fill={frontGrad} stroke={strokeColor} strokeWidth="1.1" />
          <ellipse cx="50" cy="48" rx="14.5" ry="3.5" fill={metalTrim} />

          {/* Minora ustunining 3D orqa qalinligi */}
          <path d="M 39 48 L 41 24 Q 50 26 59 24 L 61 48 Z" fill={bevelGrad} transform="translate(1.5, 2)" />

          {/* Yuqori Minora Ustuni (Fluted Tower) */}
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

          {/* Minora bo'ylama qovurg'alari va yorug'lik aksi */}
          <line x1="45" y1="48" x2="46" y2="25" stroke={strokeColor} strokeWidth="0.8" opacity={0.5} />
          <line x1="49" y1="49" x2="49" y2="25" stroke={specular} strokeWidth="1.8" opacity={0.8} />
          <line x1="54" y1="48" x2="53" y2="25" stroke={strokeColor} strokeWidth="0.8" opacity={0.5} />

          {/* Minora gumbazi osti karnizi */}
          <ellipse cx="50" cy="24" rx="12" ry="3.2" fill={metalTrim} stroke={strokeColor} strokeWidth="1" />

          {/* Sharqona Minora Gumbazi (Ribbed Cupola Dome) */}
          <path
            d="M 40 24 
               C 40 13 47 10 50 7 
               C 53 10 60 13 60 24 
               Z"
            fill={sphereGrad}
            stroke={strokeColor}
            strokeWidth="1.3"
          />

          {/* Gumbazdagi sharqona naqshlar */}
          <path d="M 44 23 Q 48 13 50 7 Q 52 13 56 23" fill="none" stroke={metalTrim} strokeWidth="1.6" />
          <path d="M 42 22 Q 46 14 48 8" fill="none" stroke={specular} strokeWidth="1.4" opacity={0.8} />

          {/* NUR Chirog'i / Zargarona Spire uchligi */}
          <circle cx="51" cy="7.5" r="3" fill={bevelGrad} />
          <circle cx="50" cy="6.5" r="3" fill={metalTrim} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="49" cy="5.5" r="1.2" fill="#ffffff" />
          <line x1="50" y1="3.5" x2="50" y2="1" stroke={metalTrim} strokeWidth="1.8" strokeLinecap="round" />

          {/* Taraluvchi Nur halqasi */}
          <circle cx="50" cy="6" r="5.5" fill="none" stroke={metalTrim} strokeWidth="0.8" opacity={0.7} strokeDasharray="1.5 2" />
        </g>
      );

    default:
      return null;
  }
}

const Piece3D = React.memo(Piece3DComponent);
export default Piece3D;
