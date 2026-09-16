// =====================================================
// NUR CHESS 100 — 1. Splash (Kirish) Ekrani
// =====================================================

import React from 'react';

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#05080f] text-slate-100 flex flex-col justify-between items-center px-6 py-10 overflow-hidden font-sans select-none">
      {/* Orqa fon nur va spotlight effektlari */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-amber-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[450px] h-[250px] rounded-full bg-yellow-600/10 blur-[100px] pointer-events-none" />

      {/* Yuqori qism: Brend va Shior */}
      <div className="flex flex-col items-center text-center mt-6 z-10 animate-fadeIn">
        {/* Oltin Toj Logotipi */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-[0_0_35px_rgba(245,158,11,0.5)]">
            <div className="w-full h-full bg-[#090d16] rounded-[22px] flex items-center justify-center">
              <span className="text-3xl drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]">👑</span>
            </div>
          </div>
        </div>

        {/* Sarlavha */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 drop-shadow-sm">
          Nur Chess 100
        </h1>
        <p className="text-amber-200/80 text-sm font-medium tracking-wide mt-1">
          Aql, Sabr va Gʻalaba
        </p>
      </div>

      {/* Markaziy qism: 3D Hashamatli Oltin Shaxmat Donasi */}
      <div className="relative flex-1 flex items-center justify-center w-full my-4 z-10">
        <div className="relative w-64 h-72 flex items-center justify-center">
          {/* Oltin halqa nuri */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-500/20 to-transparent blur-2xl animate-pulse" />

          {/* Shoh Vektor SVG Tasviri */}
          <svg
            viewBox="0 0 200 240"
            className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] drop-shadow-[0_0_30px_rgba(245,158,11,0.35)]"
          >
            <defs>
              <linearGradient id="splashGold" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stop-color="#fff8db" />
                <stop offset="25%" stop-color="#fcd34d" />
                <stop offset="55%" stop-color="#f59e0b" />
                <stop offset="85%" stop-color="#b45309" />
                <stop offset="100%" stop-color="#78350f" />
              </linearGradient>
              <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
                <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
              </linearGradient>
              <radialGradient id="baseShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#000000" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0" />
              </radialGradient>
            </defs>

            {/* Soya */}
            <ellipse cx="100" cy="225" rx="75" ry="12" fill="url(#baseShadow)" />

            {/* Poydevor (Base) */}
            <path
              d="M40,215 Q100,225 160,215 L155,200 Q100,208 45,200 Z"
              fill="url(#splashGold)"
            />
            <path
              d="M45,200 Q100,208 155,200 L150,188 Q100,195 50,188 Z"
              fill="url(#splashGold)"
            />

            {/* Pastki Tana halqasi */}
            <path
              d="M50,188 Q100,195 150,188 L145,170 Q100,176 55,170 Z"
              fill="url(#splashGold)"
            />

            {/* Markaziy Tana (Body Column) */}
            <path
              d="M58,170 C65,130 75,100 78,85 L122,85 C125,100 135,130 142,170 Q100,178 58,170 Z"
              fill="url(#splashGold)"
            />

            {/* Tana yorug'lik chizig'i */}
            <path
              d="M68,165 C74,130 81,100 84,88 L92,88 C88,100 80,130 76,165 Z"
              fill="url(#goldHighlight)"
              opacity="0.5"
            />

            {/* Bo'yin halqasi */}
            <ellipse cx="100" cy="85" rx="26" ry="7" fill="url(#splashGold)" />
            <ellipse cx="100" cy="80" rx="22" ry="6" fill="url(#splashGold)" />

            {/* Shoh Bosh qismi (Head) */}
            <path
              d="M74,80 C70,62 82,48 100,48 C118,48 130,62 126,80 Q100,86 74,80 Z"
              fill="url(#splashGold)"
            />

            {/* Oltin Toj (Crown) */}
            <path
              d="M72,55 L82,40 L100,50 L118,40 L128,55 Q100,59 72,55 Z"
              fill="url(#splashGold)"
            />

            {/* Shoh Kresti (Cross on top) */}
            <rect x="96" y="24" width="8" height="24" rx="2" fill="url(#splashGold)" />
            <rect x="88" y="30" width="24" height="8" rx="2" fill="url(#splashGold)" />
            <circle cx="100" cy="23" r="3" fill="#fef08a" />
          </svg>
        </div>
      </div>

      {/* Pastki qism: Boshlash tugmasi & Izoh */}
      <div className="w-full max-w-sm flex flex-col items-center gap-4 z-10 pb-4">
        <button
          onClick={onStart}
          className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 transition-all text-slate-950 font-black text-base shadow-[0_12px_30px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Boshlash</span>
          <span className="transition-transform group-hover:translate-x-1 font-mono text-lg">→</span>
        </button>

        <p className="text-slate-500 text-xs text-center font-medium tracking-wide">
          Oʻzbek shaxmati — yangi imkoniyatlar
        </p>
      </div>
    </div>
  );
}
