// =====================================================
// NUR CHESS 100 — Rasmiy Dumaloq Logotip (Official Emblem)
// Muallif Nurfyllo Nurmatov qo'llanmasi (4-bet) asosida
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
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${
        showGlow ? 'drop-shadow-[0_0_20px_rgba(245,158,11,0.45)]' : ''
      } ${className}`}
      title="Nur Chess 100 — O'zbek Shaxmati Rasmiy Logotipi"
    >
      <svg
        viewBox="0 0 240 240"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Tashqi Oltin Hoshiya Gradienti */}
          <linearGradient id="logo-gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="75%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Ichki Shaxmat Dosqasi Gradienti */}
          <radialGradient id="logo-board-glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#451A03" />
            <stop offset="60%" stopColor="#1C1917" />
            <stop offset="100%" stopColor="#0C0A09" />
          </radialGradient>

          {/* Oq Nur Donasi Gradienti */}
          <linearGradient id="logo-white-nur" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FFFBEB" />
            <stop offset="70%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Qora Nur Donasi Gradienti */}
          <linearGradient id="logo-black-nur" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#4B5563" />
            <stop offset="35%" stopColor="#1F2937" />
            <stop offset="75%" stopColor="#111827" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          {/* Oltin Lentochka Gradienti */}
          <linearGradient id="logo-banner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>

          {/* Soyalar */}
          <filter id="logo-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
          </filter>

          {/* Meandr / Sharqona Geometrik Naqsh Elementi */}
          <pattern id="logo-meander-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <path
              d="M0 0 H16 V16 H0 Z M2 2 V14 H14 V2 Z M4 4 H12 V12 H6 V6 H10 V10 H8 V8"
              fill="none"
              stroke="#78350F"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>

        {/* ── 1. TASHQI HOSHIYA (GOLD MEANDER BORDER) ─────────────── */}
        {/* Asosiy Qalin Oltin Halqa */}
        <circle cx="120" cy="120" r="114" fill="url(#logo-gold-ring)" stroke="#78350F" strokeWidth="2.5" />

        {/* Naqshli Ichki Halqa (Meander doirasi) */}
        <circle cx="120" cy="120" r="102" fill="#FBBF24" stroke="#92400E" strokeWidth="1.5" />
        <circle cx="120" cy="120" r="102" fill="url(#logo-meander-pattern)" opacity="0.35" />

        {/* Oltin halqa bo'ylab 16 ta geometrik spiral meandr bloklari */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i * 360) / 20;
          return (
            <g key={i} transform={`rotate(${angle} 120 120)`}>
              <path
                d="M120 7 L125 10 L125 18 L115 18 L115 12 L122 12 L122 15"
                fill="none"
                stroke="#451A03"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </g>
          );
        })}

        {/* Ichki Yupqa Oltin Devor */}
        <circle cx="120" cy="120" r="88" fill="none" stroke="#78350F" strokeWidth="3" />

        {/* ── 2. ICHKI 3D SHAXMAT DOSQASI ARENASI ─────────────────── */}
        <g clipPath="url(#logo-inner-clip)">
          <clipPath id="logo-inner-clip">
            <circle cx="120" cy="120" r="86" />
          </clipPath>

          {/* Orqa fon qorong'i yog'och */}
          <rect x="30" y="30" width="180" height="180" fill="url(#logo-board-glow)" />

          {/* 3D Perspektiva Shaxmat Kvadratlari */}
          <g transform="translate(120, 130) scale(1, 0.65) rotate(24) translate(-120, -120)">
            {/* Shaxmat doskasi kataklari */}
            {[-3, -2, -1, 0, 1, 2, 3].map((row) =>
              [-3, -2, -1, 0, 1, 2, 3].map((col) => {
                const isLight = (row + col) % 2 === 0;
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={120 + col * 26}
                    y={120 + row * 26}
                    width="26"
                    height="26"
                    fill={isLight ? '#F5E6CA' : '#78350F'}
                    stroke="#451A03"
                    strokeWidth="0.8"
                    opacity="0.85"
                  />
                );
              })
            )}
          </g>

          {/* ── 3. SHAXMAT DONALARI (MOCKUP VA KITOB 4-BETIDAGI KABI) ─ */}

          {/* Orqa fondagi Qora Ot (Knight) */}
          <g transform="translate(108, 68) scale(0.68)" filter="url(#logo-drop-shadow)">
            <path
              d="M20 55 C15 45 18 30 25 22 C30 16 38 12 45 8 C44 14 48 18 52 20 C56 16 62 16 66 18 C72 22 75 30 72 38 C68 40 60 36 56 38 C54 44 58 50 62 55 Z"
              fill="#1F2937"
              stroke="#030712"
              strokeWidth="2"
            />
            {/* Ot ko'zi */}
            <circle cx="58" cy="24" r="2.5" fill="#FBBF24" />
          </g>

          {/* Chapdagi Oq Nur Donasi (Oltin va oq minora/chiroq) */}
          <g transform="translate(68, 88) scale(0.88)" filter="url(#logo-drop-shadow)">
            {/* Stepped Pedestal (Poydevor) */}
            <ellipse cx="40" cy="78" rx="22" ry="7" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
            <path d="M22 76 C22 70 30 68 40 68 C50 68 58 70 58 76 Z" fill="url(#logo-white-nur)" />

            {/* Markaziy Tanasi (Slender Column) */}
            <path
              d="M29 68 C31 52 33 38 35 28 L45 28 C47 38 49 52 51 68 Z"
              fill="url(#logo-white-nur)"
              stroke="#78350F"
              strokeWidth="1.2"
            />

            {/* Minora Bo'yinturug'i */}
            <ellipse cx="40" cy="28" rx="13" ry="4" fill="#FEF3C7" stroke="#92400E" strokeWidth="1" />

            {/* Chiroq / Minora Turreti (4 ta tishli bosh qism) */}
            <path
              d="M28 26 L28 14 L32 14 L32 18 L38 18 L38 14 L42 14 L42 18 L48 18 L48 14 L52 14 L52 26 Z"
              fill="url(#logo-white-nur)"
              stroke="#78350F"
              strokeWidth="1.5"
            />

            {/* Nur nurlanish tuynuklari (Light slits) */}
            <line x1="35" y1="21" x2="35" y2="24" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="21" x2="40" y2="24" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="21" x2="45" y2="24" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />

            {/* Yuqori Oltin Cho'qqi (Nur nuri / Star) */}
            <circle cx="40" cy="11" r="3.5" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
          </g>

          {/* O'ngdagi Qora Nur Donasi (Silliq obsidiyan/qora minora) */}
          <g transform="translate(118, 92) scale(0.92)" filter="url(#logo-drop-shadow)">
            {/* Stepped Pedestal */}
            <ellipse cx="40" cy="78" rx="22" ry="7" fill="#030712" stroke="#4B5563" strokeWidth="1.5" />
            <path d="M22 76 C22 70 30 68 40 68 C50 68 58 70 58 76 Z" fill="url(#logo-black-nur)" />

            {/* Markaziy Tanasi */}
            <path
              d="M29 68 C31 52 33 38 35 28 L45 28 C47 38 49 52 51 68 Z"
              fill="url(#logo-black-nur)"
              stroke="#374151"
              strokeWidth="1.2"
            />

            {/* Bo'yinturuq */}
            <ellipse cx="40" cy="28" rx="13" ry="4" fill="#374151" stroke="#1F2937" strokeWidth="1" />

            {/* Minora Turreti */}
            <path
              d="M28 26 L28 14 L32 14 L32 18 L38 18 L38 14 L42 14 L42 18 L48 18 L48 14 L52 14 L52 26 Z"
              fill="url(#logo-black-nur)"
              stroke="#4B5563"
              strokeWidth="1.5"
            />

            {/* Tuynuklar */}
            <line x1="35" y1="21" x2="35" y2="24" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="21" x2="40" y2="24" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="21" x2="45" y2="24" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />

            {/* Cho'qqi */}
            <circle cx="40" cy="11" r="3.5" fill="#D97706" stroke="#000" strokeWidth="1" />
          </g>
        </g>

        {/* ── 4. PASTKI OLTIN LENTOCHKA VA YOZUV (✦ NUR CHESS 100 ✦) ─ */}
        <g filter="url(#logo-drop-shadow)">
          {/* Lentochka foni (egri ark shaklida) */}
          <path
            d="M28 178 C52 216 188 216 212 178 L200 156 C176 190 64 190 40 156 Z"
            fill="url(#logo-banner-grad)"
            stroke="#78350F"
            strokeWidth="2.5"
          />

          {/* Matn yo'li (Text along arc) */}
          <path id="logo-text-arc" d="M36 172 C64 212 176 212 204 172" fill="none" />

          {/* Chapdagi Moviy Yulduzcha (✦) */}
          <g transform="translate(52, 178) scale(0.65)">
            <polygon
              points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3"
              fill="#0284C7"
              stroke="#0369A1"
              strokeWidth="1.5"
            />
            <polygon
              points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3"
              transform="rotate(45)"
              fill="#38BDF8"
            />
          </g>

          {/* O'ngdagi Moviy Yulduzcha (✦) */}
          <g transform="translate(188, 178) scale(0.65)">
            <polygon
              points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3"
              fill="#0284C7"
              stroke="#0369A1"
              strokeWidth="1.5"
            />
            <polygon
              points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3"
              transform="rotate(45)"
              fill="#38BDF8"
            />
          </g>

          {/* Asosiy Sarlavha Matni */}
          <text
            fontSize="17.5"
            fontWeight="900"
            fontFamily="Impact, 'Arial Black', sans-serif"
            letterSpacing="2.5"
            fill="#451A03"
            textAnchor="middle"
          >
            <textPath href="#logo-text-arc" startOffset="50%">
              NUR CHESS 100
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
}
